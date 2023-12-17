const { Events, MessageReaction, Message } = require("discord.js")
const emojiLogHandle = require("../util/emojiLogHandle")
const uploadTo = require("../util/uploadSourceb")
const { serverID } = require("../../config.json")
module.exports = {
    name: Events.MessageReactionRemoveAll,
    /**
     * 
     * @param {Message} message 
     * @param {Map<String, MessageReaction>} reactions 
     */
    async run(message, reactions) {
        if (message.guildId !== serverID) return
        const date = Date.now()
        let post_reactions = []
        reactions.forEach((value) => {
            post_reactions.push(`${value._emoji.id ? value._emoji.animated ? `${value._emoji.name} - (https://cdn.discordapp.com/emojis/${value._emoji.id}.gif` : `${value._emoji.name} - (https://cdn.discordapp.com/emojis/${value._emoji.id}.webp)` : value._emoji.name} reacted by ${value.users.cache.map(user => user.tag).join(", ")}`)
        })
        const url = await uploadTo(post_reactions.join("\n"))
        const msg = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
        emojiLogHandle(2, { url, reactionsnum: post_reactions.length, message: msg, date })
    }

}