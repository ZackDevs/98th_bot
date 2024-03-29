const { Events, Message, EmbedBuilder } = require("discord.js")
const EasyEmbed = require("../util/easyEmbed")
const { errEmbed } = new EasyEmbed()
const noblox = require("noblox.js")
const {groupID, channelId, webhookId, clanlabsCLAN, clanlabsTOKEN} = require("../../config.json")
const axios = require("axios")
module.exports = {
    name: Events.MessageCreate,
    /**
     * @param {Message} message 
     */
    async run(message) {
        if (message.channelId !== channelId) return
        if (message?.webhookId !== webhookId) return
        if (message.embeds[0].data.description === "N/A") return await message.react("✅")
        const members = message.embeds[0].data.description.split("\n")
        let userids = await noblox.getIdFromUsername(members)
        userids = typeof userids === "number" ? [userids] : userids
        const alreadyGuest = [], exiled = [], failed = []
        for (let i = 0; i < userids.length; i++) {
            if (await noblox.getRankNameInGroup(groupID, userids[i]) === "Guest") {
                alreadyGuest.push(members[i])
                continue 
            }
            try {
                await noblox.exile(groupID, userids[i])
                exiled.push(members[i])
            }
            catch {
                failed.push(members[i])
            }
        }
        await message.react("✅")
        message.reply({ embeds: [new EmbedBuilder().setTitle("Collected Members Handle").setDescription(`Already Guest: ${alreadyGuest.length > 0 ? alreadyGuest.join(", ") : "N/A"}\nExiled: ${exiled.length > 0 ? exiled.join(", ") : "N/A"}\nFailed: ${failed.length > 0 ? failed.join(", ") : "N/A"}`).setTimestamp()] })
    }
}