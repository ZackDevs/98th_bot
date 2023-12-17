const { Events, MessageReaction, User } = require("discord.js")
const emojiLogHandle = require("../util/emojiLogHandle")
const { serverID } = require("../../config.json")
module.exports = {
    name: Events.MessageReactionAdd,
    /**
     * 
     * @param {MessageReaction} messageReaction 
     * @param {User} user 
     */
    async run(messageReaction, user) {
        if (messageReaction.message.guildId !== serverID) return
        const emoji = messageReaction._emoji.id ? messageReaction._emoji.animated ? `<a:${messageReaction._emoji.name}:${messageReaction._emoji.id}>` : `<:${messageReaction._emoji.name}:${messageReaction._emoji.id}>` : messageReaction._emoji.name
        const { guildId, id, channelId } = messageReaction.message
        const msg = `https://discord.com/channels/${guildId}/${channelId}/${id}`
        const mention = `<@${user.id}>`
        emojiLogHandle(0, {reaction: emoji, message: msg, user: mention})
    }

}