const { EmbedBuilder, WebhookClient } = require("discord.js")
const { "admin-logs-webhook": adminwebhook } = require("../../config.json")

let toBeSent = false
let embed = null
function sendLog() {
    const webhook = new WebhookClient({ url: adminwebhook })
    webhook.send({ embeds: [embed] })
    toBeSent = false
    embed = null
}


module.exports = (type, info) => {
    // type
    /**
     * 
     * 0 - addition
     * 1 - removal
     * 2 - removalAll
     * 3 - removeSpecific
     * 
     */

    switch (type) {
        case 0:
            if (!embed) {
                embed = new EmbedBuilder()
                .setTitle("Reaction Event Triggered")
                .setDescription(`${info.user} added reaction ${info.reaction} to ${info.message}\n`)
            }
            else {
                embed = new EmbedBuilder(embed)
                .setDescription(embed.data.description + `${info.user} added reaction ${info.reaction} to ${info.message}\n`)
            }
        break
        case 1: 
            if (!embed) {
                embed = new EmbedBuilder()
                .setTitle("Reaction Event Triggered")
                .setDescription(`${info.user} removed reaction ${info.reaction} to ${info.message}\n`)
            }
            else {
                embed = new EmbedBuilder(embed)
                .setDescription(embed.data.description + `${info.user} removed reaction ${info.reaction} to ${info.message}\n`)
            }
        break
        case 2:
            if (!embed) {
                embed = new EmbedBuilder()
                .setTitle("Reaction Event Triggered")
                .setDescription(`${info.reactionsnum} [reactions](${info.url}) were removed from ${info.message} - Took ${Math.round((Date.now() + 5000 - info.date) / 1000)} seconds\n`)
            }
            else {
                embed = new EmbedBuilder(embed)
                .setDescription(embed.data.description + `${info.reactionsnum} [reactions](${info.url}) were removed from ${info.message} - Took ${Math.round((Date.now() + 5000 - info.date) / 1000)} seconds\n`)
            }
        break
        case 3:
            if (!embed) {
                embed = new EmbedBuilder()
                .setTitle("Reaction Event Triggered")
                .setDescription(`The reaction ${info.reaction} with [${info.usersnum}](${info.url}) user${info.usersnum > 1 ? "s" : ""} has been removed from ${info.message} - Took ${Math.round((Date.now() + 5000 - info.date) / 1000)} seconds\n`)
            }
            else {
                embed = new EmbedBuilder(embed)
                .setDescription(embed.data.description + `The reaction ${info.reaction} with [${info.usersnum}](${info.url}) user${info.usersnum > 1 ? "s" : ""} has been removed from ${info.message} - Took ${Math.round((Date.now() + 5000 - info.date) / 1000)} seconds\n`)
            }
        break;
        
    }
    if (!toBeSent) {
        toBeSent = true
        setTimeout(() => {
            sendLog()
        }, 5000)
    }
}