const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, WebhookClient } = require("discord.js")
const { authorize } = require("../../util/authorizing")
const { google } = require("googleapis")
const { HC_rank, "admin-logs-webhook": adminwebhook } = require("../../../config.json");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.setDescription('Blacklists an user')
        .addSubcommand(subcmd => 
            subcmd.setName("add").setDescription("Adds a blacklist to the blacklist tracker").addStringOption(option =>
                option.setName("type").setDescription("Type of blacklist you want to make").addChoices({
                    name: "98th Blacklist", value: "wide"
                },{
                    name: "Plane Blacklist", value: "plane"
                }, {
                    name: "Airfield Blacklist", value: "airfield"
                }
                ).setRequired(true)
            )
            .addStringOption(option => 
                option.setName("username").setDescription("Username of the user to blacklist").setRequired(true)    
            ).addStringOption(option =>
                option.setName("reason").setDescription("Reason for the blacklist").setRequired(true)
            ).addBooleanOption(option => 
                option.setName("appealable").setDescription("If the ban is appealable or not").setRequired(true)
            ).addIntegerOption(option =>
                option.setName("months").setDescription("How many months is the blacklist, don't set a value for permanent")
            )
        ).addSubcommand(subcmd =>
            subcmd.setName("remove").setDescription("Removes a user from the blacklist tracker").addStringOption(option =>
                option.setName("type").setDescription("Type of blacklist you want to make").addChoices({
                    name: "98th Blacklist", value: "wide"
                },{
                    name: "Plane Blacklist", value: "plane"
                }, {
                    name: "Airfield Blacklist", value: "airfield"
                }
                ).setRequired(true)
            )
            .addStringOption(option => 
                option.setName("username").setDescription("Username of the user to blacklist").setRequired(true)    
            )    
        ),
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction 
     * @param {Date} obj.date
     */
	async execute({ interaction, date, options: { username, reason, appealable, months, type }, errEmbed }) {
        const roles = interaction.member.roles.cache
        if (!roles.has(HC_rank)) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        const ranges = {
            "wide": [231082353, "Enlistment"],
            "plane": [1295445251,"Plane Usage"],
            "airfield": [1690420844 ,"Airfield Use"]
        }
        authorize().then(async auth => {
            const sheets = google.sheets({version: 'v4', auth});
            switch (interaction.options._subcommand) {
                case 'add':
                    const res = await sheets.spreadsheets.values.get({
                        spreadsheetId: '1nxMdGWYGFJ8Q96Shl89x2ZWKUpgczJJhCUDwpWy7aBQ',
                        range: `${ranges[type][1]}!A1:C`,
                    });
                    let rows = res.data.values;
                    if (!rows || rows.length === 0) {
                        return errEmbed({ description: `The range \`${ranges[type]}!A1:C\` doesn't exist`, title: "Couldn't blacklist the user" })
                    }
                    rows = rows.map(function (arr, index) {
                        if (arr.length === 2 && arr[1].toUpperCase() !== "USERNAME") {
                            return [arr[1], index+1]
                        }
                    }).filter(arr => arr)
                    
                    const sameUsernames = rows.filter(arr => arr[0].toLowerCase() === username.toLowerCase() || (arr[0].includes("/") && arr[0].toLowerCase().includes(username.toLowerCase())))
                    if (sameUsernames.length) {
                        return interaction.reply({embeds: [errEmbed({ description: `The user ${sameUsernames[0][0]} is already on the blaclist tracker`, title: "Couldn't continue excuting this command" })]})
                    }
                    let sortedwithuser = [...rows, [username]].sort((a,b) => a[0].localeCompare(b[0]))
                    let rowNumber
                    const dateE = new Date(date)
                    const copyDate = new Date(date)
                    let months_p_date = months ? new Date(copyDate.setMonth(copyDate.getMonth()+months)) : undefined
                    for (let i = 0; i < sortedwithuser.length -1; i++) {
                        if (sortedwithuser[i+1][0] === username) rowNumber = sortedwithuser[i][1]
                    }
                    await sheets.spreadsheets.batchUpdate({
                            spreadsheetId: "1nxMdGWYGFJ8Q96Shl89x2ZWKUpgczJJhCUDwpWy7aBQ",
                            resource: {
                                "requests": [
                                    {
                                        "insertDimension": {
                                            "inheritFromBefore": true,
                                            "range": {
                                                "dimension": "ROWS",
                                                "startIndex": rowNumber ? rowNumber : rows[0][1]-1,
                                                "endIndex": rowNumber ? rowNumber+1 : rows[0][1],
                                                "sheetId": ranges[type][0]
                                            }
                                        },
                                    },
                                    { "mergeCells": {
                                        mergeType: "MERGE_ROWS",
                                        "range": {
                                            startColumnIndex: 1,
                                            endColumnIndex: 3,
                                            "startRowIndex": rowNumber ? rowNumber : rows[0][1]-1,
                                            "endRowIndex": rowNumber ? rowNumber+1 : rows[0][1],
                                            "sheetId": ranges[type][0]
                                        }
                                    }
                                }
                                ]
                            }
                          })
                    sheets.spreadsheets.values.update({
                        spreadsheetId: "1nxMdGWYGFJ8Q96Shl89x2ZWKUpgczJJhCUDwpWy7aBQ",
                        range: type === "wide" ? ranges[type][1]+`!A${rowNumber ? rowNumber+1 : rows[0][1]}:H${rowNumber ? rowNumber+1 : rows[0][1]}` : ranges[type][1]+`!B${rowNumber ? rowNumber+1 : rows[0][1]}:H${rowNumber ? rowNumber+1 : rows[0][1]}`,
                        valueInputOption: "USER_ENTERED",
                        resource: type === "wide" ? {"values": [[username[0].toUpperCase(), username ,"", reason, months ? `${months} months` : "Permanent", `${dateE.getMonth()+1}/${dateE.getDate()}/${dateE.getFullYear()}`, months_p_date ? `${months_p_date.getMonth()+1}/${months_p_date.getDate()}/${months_p_date.getFullYear()}` : `N/A`, appealable ? "Yes" : "No"]]} : {"values": [[ username, "", reason, months ? `${months} months` : "Permanent", `${dateE.getMonth()+1}/${dateE.getDate()}/${dateE.getFullYear()}`, months_p_date ? `${months_p_date.getMonth()+1}/${months_p_date.getDate()}/${months_p_date.getFullYear()}` : `N/A`, appealable ? "Yes" : "x"]]}
 
                    })
                        // {"values": [[username[0].toUpperCase(), username, reason, months ? `${months} months` : "Permanent", `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`, months_p_date ? `${months_p_date.getMonth()+1}/${months_p_date.getDate()}/${months_p_date.getFullYear()}` : `N/A`, appealable ? "Yes" : "No"]]}
                

                const succefullEmbed = new EmbedBuilder()
                .setTitle(`Succeffully blacklisted user | For ${ranges[type][1]}`)
                .setDescription(`**User:** ${username}\n**Reason:** ${reason}\n**Length of blacklist:** ${months ? `${months} months` : "Permanent"}\n**Appealable:** ${appealable ? "Yes" : "No"}`)
                .setTimestamp()
                .setColor("Green")
                
                logEmbed = new EmbedBuilder()
                .setTitle(`Blacklist addition | For ${ranges[type][1]} blacklist`)
                .addFields({
                    name: "Moderator",
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }, {
                    name: "Blacklisted Username",
                    value: username,
                    inline: true
                }, {
                    name: "Reason",
                    value: reason,
                    inline: true
                })
                
                await interaction.reply({ embeds: [succefullEmbed]})
            break;
            case 'remove': 
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: '1nxMdGWYGFJ8Q96Shl89x2ZWKUpgczJJhCUDwpWy7aBQ',
                    range: `${ranges[type][1]}!A1:D`,
                });
                let rowsD = response.data.values;
                if (!rowsD || rowsD.length === 0) {
                    return errEmbed({ description: `The range \`${ranges[type]}!A1:C\` doesn't exist`, title: "Couldn't blacklist the user" })
                }
                rowsD = rowsD.map(function (arr, index) {
                    if (arr.length === 4 && arr[1].toUpperCase() !== "USERNAME") {
                        return [arr[1], index+1]
                    }
                }).filter(arr => arr)
                const blacklistUsername = rowsD.filter(arr => arr[0].toLowerCase() === username.toLowerCase() || (arr[0].includes("/") && arr[0].toLowerCase().includes(username.toLowerCase())))
                if (!blacklistUsername.length) {
                    return interaction.reply({embeds: [errEmbed({ description: `The user ${username} isn't on the ${ranges[type][1]} blacklist tracker`, title: "Couldn't continue excuting this command" })]})
                }
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: "1nxMdGWYGFJ8Q96Shl89x2ZWKUpgczJJhCUDwpWy7aBQ",
                    resource: {
                        "requests": [
                            {
                                "deleteDimension": {
                                    "range": {
                                        "dimension": "ROWS",
                                        "startIndex": blacklistUsername[0][1]-1,
                                        "endIndex": blacklistUsername[0][1],
                                        "sheetId": ranges[type][0]
                                    }
                                },
                            },
                        ]
                    }
                  })
                const embedSuccessfull = new EmbedBuilder()
                .setColor('Green')
                .setTitle(`Successfully removed blacklist | From ${ranges[type][1]} blacklist tracker`)
                .setDescription(`Username: ${blacklistUsername[0][0]}`)
                .setTimestamp()
                logEmbed = new EmbedBuilder()
                .setTitle(`Blacklist Removal | From ${ranges[type][1]} blacklist`)
                .addFields({
                    name: "Moderator",
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }, {
                    name: "Unblacklisted Username",
                    value: username,
                    inline: true
                }, {

                    name: "Previously blacklisted for",
                    value: response.data.values[blacklistUsername[0][1]-1][3],
                    inline: true
                })
                await interaction.reply({ embeds: [embedSuccessfull] })
            break;
            
            }
            const webhook = new WebhookClient({ url: adminwebhook})
            webhook.send({embeds: [logEmbed]})
        })
	}, 
};