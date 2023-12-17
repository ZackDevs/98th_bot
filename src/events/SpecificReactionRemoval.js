const { Events, MessageReaction, Message } = require("discord.js")
const emojiLogHandle = require("../util/emojiLogHandle")
const uploadTo = require("../util/uploadSourceb")
const { serverID } = require("../../config.json")
module.exports = {
    name: Events.MessageReactionRemoveEmoji,
    /**
     * 
     * @param {MessageReaction} reaction
     */
    async run(reaction) {
        if (reaction.message.guildId !== serverID) return
        const date = Date.now()
        const emoji = reaction._emoji.id ? reaction._emoji.animated ? `<a:${reaction._emoji.name}:${reaction._emoji.id}>` : `<:${reaction._emoji.name}:${reaction._emoji.id}>` : reaction._emoji.name
        const users = reaction.users.cache.map(user => user.tag)
        const url = await uploadTo("Users that reacted to the message:\n" + users.join("\n"))
        const msg = `https://discord.com/channels/${reaction.message.guildId}/${reaction.message.channelId}/${reaction.message.id}`
        emojiLogHandle(3, { url, reaction: emoji, message: msg, date, usersnum: users.length })
    }

}