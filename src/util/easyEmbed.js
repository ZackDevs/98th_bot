const { EmbedBuilder } = require("discord.js")
function errEmbed({ description, title="There was an error while exucting this command" }) {
    const errorEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTimestamp()
    .setTitle(title)
    .setDescription(description ? description : "No description provided")
    return errorEmbed
}
module.exports = { errEmbed }