const { WebhookClient, EmbedBuilder} = require("discord.js");
const { ErrorWebhook } = require("../../config.json")

module.exports = (err, command=null) => {
    const error = new Error(err)
    const webhook = new WebhookClient({ url: ErrorWebhook })
    const embed = new EmbedBuilder()
        .setTitle(command ? "Error while running the command " + command : "Error on 98th Bot")
        .setDescription(`\`\`\`js\n${error.stack}\n\`\`\``)
        .setColor("Red")
        .setTimestamp()
    webhook.send({ embeds: [embed] })

}