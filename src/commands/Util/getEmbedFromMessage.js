const { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, EmbedBuilder, ApplicationCommandType, AttachmentBuilder, Embed } = require("discord.js")
const { HC_rank } = require("./../../../config.json");
const errHandle = require("../../util/errHandle");
const { errEmbed } = new (require("../../util/easyEmbed"))()

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName("getembed")
        .setType(ApplicationCommandType.Message).setDMPermission(false),
    /**
     * @param {Object} obj
     * @param {MessageContextMenuCommandInteraction} obj.interaction 
     * @param {Date} obj.date
     */
	async execute({ interaction, date }) {
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
            if (json.author) {
                delete json.author.proxy_icon_url
            }
            delete json.type
            embedJSON.push(json)
        }
        const payload = {
            "content": null,
            "embeds": embedJSON,
            "attachments": []
          }
        const atch = new AttachmentBuilder()
        .setFile(Buffer.from(JSON.stringify(payload), "utf-8"))
        .setName("text.txt")
        const msg = await interaction.user.send({ files: [atch] }).catch(e => [new Error(e)])
        if (Array.isArray(msg)) {
            const err = msg[0]
            if (err.message.includes("Cannot send messages to this user")) {
                return interaction.reply({ embeds: [errEmbed({ "description": "I can't send you a direct message.\nPlease allow users to send you DMs to run this command." , "title": "There was an error while exucting this command"})], ephemeral: true })
            }
            else {
                errHandle(err, interaction.command.name)
                return interaction.reply({ embeds: [errEmbed({ "description": "There was an unknown error, please inform JDLR about it." , "title": "There was an error while exucting this command"})], ephemeral: true })
            }
        }
        else {
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle("Sent you the informations in dms").setDescription(`I've sent this [message](${msg.url}) to your dms.`).setColor("Green").setTimestamp()], ephemeral: true })
        }

        
    }, 
};