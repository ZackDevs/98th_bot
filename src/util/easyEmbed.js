const { EmbedBuilder } = require("discord.js")
class EasyEmbed {
    constructor() {}
    /**
     * @param {Object} param0 
     * @param {string} param0.description 
     * @param {("There was an error while exucting this command" | "Couldn't execute this command further")} param0.title
     */
    errEmbed({ description, title="There was an error while exucting this command" }) {
        const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTimestamp()
        .setTitle(title)
        .setDescription(description ? description : "No description provided")
        return errorEmbed
    }
}
module.exports = EasyEmbed