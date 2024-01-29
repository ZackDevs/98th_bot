const { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, EmbedBuilder, ApplicationCommandType } = require("discord.js")
const { authorize } = require("../../../util/authorizing")
const { google } = require("googleapis")
const { rankNeeded, "recruitment-logs-channel": rsid } = require("../../../../config.json");
const spreadsheetId = "1I1zeMmoCdog_mM8RongRDSE5Cub5dRMAFeIip2dbjLo"
const sheetId = 836943887
const { errEmbed } = new (require("../../../util/easyEmbed"))()

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName("accept-recruit-log")
        .setType(ApplicationCommandType.Message),
    /**
     * @param {Object} obj
     * @param {MessageContextMenuCommandInteraction} obj.interaction 
     * @param {Date} obj.date
     */
	async execute({ interaction, date }) {
        const message = interaction.targetMessage
        const fields = message?.embeds[0]?.fields.find(e => e.name === "Recruitees")?.value
        const reactions = message.reactions.cache
        if (interaction.channelId !== rsid || !interaction.targetMessage.embeds.length || !fields) return interaction.reply({ embeds: [errEmbed({ description: "Can't accept this because it isn't a recruitment log", title: "Couldn't accept this log" })], ephemeral: true })
        if (!rankNeeded.some(s => interaction.member.roles.cache.has(s))) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        if (reactions.hasAny("❌", "✅")) return interaction.reply({ embeds: [errEmbed({ description: reactions.has("❌") ? "The recruitment log has been denied already." : "The recruitment log has been accepted already.", title: "Couldn't finish executing command"})], ephemeral: true })
        const names = fields.replace(/,/g," ").split(" ").filter(e => e).sort(function(a,b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            if(a == b) return 0;
            return a < b ? -1 : 1;
        })
        const type = interaction.targetMessage?.embeds[0].fields[0].value
        authorize().then(async auth => {
            const sheets = google.sheets({version: 'v4', auth});
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: `Database - Personnel Tracker!B11:D`,
            });
            let originalrows = res.data.values.map(function(values, index) {return [...values, index+11]})
            let rows
            if (type.toLowerCase().includes("tryout")) {
                rows = originalrows.slice(originalrows.find(e => e.includes("RECRUITS"))[1]-9, originalrows.find(e => e.includes("CONSCRIPTS - UNOFFICIAL PERSONNEL"))[1]-12)
            } else {
                rows = originalrows.slice(originalrows.find(e => e.includes("CONSCRIPTS - UNOFFICIAL PERSONNEL"))[1]-9, originalrows.length)
            }

            const requests = []
            const ranges = []
            for (let i=0; i < names.length; i++) {
                let equalName = originalrows.find(e => typeof e[1] !== "number" && e[1]?.toLowerCase() === names[i].toLowerCase())
                if (equalName) {
                    if (equalName[2] === rows[0][2]) continue
                    if (equalName[2] === "Conscript") {
                        const toRemove = {
                            "deleteDimension": {
                                "range": {
                                    "dimension": "ROWS",
                                    "startIndex": equalName[3]-1,
                                    "endIndex": equalName[3],
                                    "sheetId": sheetId
                                }
                            }
                        }
                        requests.push(toRemove)
                    }
                }
                if (rows[0][1].localeCompare(names[i]) > 0) {
                    const addrowObject = {
                        "insertDimension": {
                            "inheritFromBefore": true,
                            "range": {
                                "dimension": "ROWS",
                                "startIndex": rows[0][3]-1+i,
                                "endIndex": rows[0][3]+i,
                                "sheetId": sheetId,
                            }
                        },
                    }
                    requests.push(addrowObject)
                    ranges.push(rows[0][3]+i)
                    continue
                }
                if (rows[rows.length - 1][1].localeCompare(names[i]) < 0) {
                    const addrowObject = {
                        "insertDimension": {
                            "inheritFromBefore": true,
                            "range": {
                                "dimension": "ROWS",
                                "startIndex": rows[rows.length - 1][3]+i,
                                "endIndex": rows[rows.length - 1][3]+1+i,
                                "sheetId": sheetId,
                            }
                        },
                    }
                    requests.push(addrowObject)
                    ranges.push( rows[rows.length - 1][3]+1+i)
                    continue
                }
                const placement = rows.find(e => e[1].localeCompare(names[i]) > 0)
                const addrowObject = {
                    "insertDimension": {
                        "inheritFromBefore": true,
                        "range": {
                            "dimension": "ROWS",
                            "startIndex": placement[3]-1+i,
                            "endIndex": placement[3]+i,
                            "sheetId": sheetId,
                        }
                    },
                }
                requests.push(addrowObject)
                ranges.push(placement[3]+i)
                continue
            }
            if (requests.length) {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: spreadsheetId,
                    resource: {
                        "requests": requests
                    }
                })
            }
            date = new Date(date)
            const rangeRecruit = [
                "13",
                "name",
                "Recruit",
                "",
                `=IF(TEXTJOIN(" / ",TRUE,MAP('Database - Automation'!$F$9:$J$10, LAMBDA(x, IF(IFERROR(SEARCH(CInDeX,x),0) > 0,INDEX('Database - Automation'!$F$9:$J$10,1,COLUMN(x)-5),"")))) = "","N/A", TEXTJOIN(" / ",TRUE,MAP('Database - Automation'!$F$9:$J$10, LAMBDA(x, IF(IFERROR(SEARCH(CInDeX,x),0) > 0,INDEX('Database - Automation'!$F$9:$J$10,1,COLUMN(x)-5),"")))))`,
                `=IF(AND(OR($LInDeX = "Active", $LInDeX > TODAY()), NOT($LInDeX = "EXEMPT")), IF(ISBLANK(CInDeX),"",SUM(COUNTIFS('Database - Event Submissions'!B:B, "X", 'Database - Event Submissions'!D:D, ">"&$C$6, 'Database - Event Submissions'!E:E, "*"&CInDeX&"*"), COUNTIFS('Database - Event Submissions'!B:B, "X", 'Database - Event Submissions'!D:D, ">"&$C$6, 'Database - Event Submissions'!F:F, "*"&CInDeX&"*"), COUNTIFS('Database - Event Submissions'!B:B, "X", 'Database - Event Submissions'!D:D, ">"&$C$6, 'Database - Event Submissions'!G:G, "*"&CInDeX&"*"))), "EXEMPT")`,
                `=SUM($GInDeX)`,
                "",
                0,
                0,
                "Active",
                "Active",
                `=IF(ISTEXT($MInDeX),"N/A",($MInDeX-$LInDeX)*1.5 & " days")`,
                ""
            ]
            const rangeConscript = [
                "14",
                "name",
                "Conscript",
                "",
                `${String(date.getMonth()+1).length === 1 ? `0${date.getMonth()+1}` : date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`,
                "",
                "",
                "",
                0,
                0,
                "Active",
                "Active",
                `=IF(ISTEXT($MInDeX),"N/A",($MInDeX-$LInDeX)*1.5 & " days")`,
                `=IF(LInDeX="Active",IF(ISBLANK(FInDeX),"N/A",$FInDeX+14),"On Notice")`
            ]
            for (let i=0; i < ranges.length; i++) {
                let range
                if (type.toLowerCase().includes("tryout")) {
                    range = rangeRecruit.map(e => {
                        if (typeof e !== "number" && e.includes("=")) return e.split("InDeX").join(ranges[i])
                        if (e === 'name') return names[i]
                        return e
                    })
                }
                else {
                    range = rangeConscript.map(e => {
                        if (typeof e !== "number" && e.includes("=")) return e.split("InDeX").join(ranges[i])
                        if (e === 'name') return names[i]
                        return e
                    })
                }
                sheets.spreadsheets.values.update({
                    spreadsheetId: spreadsheetId,
                    range: `Database - Personnel Tracker!B${ranges[i]}:O${ranges[i]}`,
                    valueInputOption: "USER_ENTERED",
                    resource: {"values": [range]}
                })
            }
            const embed = new EmbedBuilder()
            .setTitle("Accepted Recruitment Log")
            .setDescription(`The members on the log have been added to the database.\nMake sure to ${type.toLowerCase().includes("tryout") ? "accept them to the group.": "add the conscript role to the users."}`)
            .setFooter({ "text": "Don't forget to check the database." })
            .setTimestamp()
            .setColor("Green")
            interaction.reply({ embeds: [embed], ephemeral: true })
            return interaction.targetMessage.react("✅")


        })
    }, 
};