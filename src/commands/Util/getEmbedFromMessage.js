const { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, EmbedBuilder, ApplicationCommandType, AttachmentBuilder } = require("discord.js")
const { HC_rank } = require("./../../../config.json")
module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName("getembed")
        .setType(ApplicationCommandType.Message).setDMPermission(false),
    /**
     * @param {Object} obj
     * @param {MessageContextMenuCommandInteraction} obj.interaction 
     * @param {Date} obj.date
     */
	async execute({ interaction, date, errEmbed }) {
        const roles = interaction.member.roles.cache
        if (!roles.has(HC_rank)) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        const message = interaction.targetMessage
        if (!message.embeds.length) {
            return interaction.reply({embeds: [errEmbed({ description: "There is no embed in this message.", title: "Couldn't continue running this command" })]})
        }
        let embedJSON = []
        for (let i = 0; i < message.embeds.length; i++) {
            let json = message.embeds[i].toJSON()
            if (json.footer) {
                delete json.footer.proxy_icon_url
            }
            if (json.thumbnail) {
                delete json.thumbnail.height
                delete json.thumbnail.width
                delete json.thumbnail.proxy_url
            }
            if (json.image) {
                delete json.image.height
                delete json.image.proxy_url
                delete json.image.width
            }
            if (json.timestamp) {
                delete json.timestamp
            }
            delete json.type
            embedJSON.push(json)
        }
        const atch = new AttachmentBuilder()
        .setFile(Buffer.from(JSON.stringify(embedJSON), "utf-8"))
        .setName("text.txt")
        return interaction.reply({ files: [atch], ephemeral: true })
    }, 
};