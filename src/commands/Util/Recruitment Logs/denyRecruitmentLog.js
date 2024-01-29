const { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, EmbedBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")
const { rankNeeded, "recruitment-logs-channel": rsid } = require("../../../../config.json");
const errHandle = require("../../../util/errHandle")
const { errEmbed } = new (require("../../../util/easyEmbed"))()

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName("deny-recruit-log")
        .setType(ApplicationCommandType.Message),
    /**
     * @param {Object} obj
     * @param {MessageContextMenuCommandInteraction} obj.interaction 
     * @param {Date} obj.date
     */
	async execute({ interaction }) {
        const message = interaction.targetMessage
        const fields = message?.embeds[0]?.fields.find(e => e.name === "Recruitees")?.value
        const reactions = message.reactions.cache
        if (interaction.channelId !== rsid || !interaction.targetMessage.embeds.length || !fields) return interaction.reply({ embeds: [errEmbed({ description: "Can't accept this because it isn't a recruitment log", title: "Couldn't accept this log" })], ephemeral: true })
        if (!rankNeeded.some(s => interaction.member.roles.cache.has(s))) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        if (reactions.has("❌")) return interaction.reply({ embeds: [errEmbed({ description: "This recruitment log has been denied already", title: "Couldn't finish executing command"})], ephemeral: true })
        const recruitLogModal = new ModalBuilder()
        .setTitle("Denied Recruitment Log")
        .setCustomId("modaldenialok")
        const reasonForDenial = new TextInputBuilder()
			.setCustomId('denialreason')
			.setLabel("Why are you denying this?")
			.setStyle(TextInputStyle.Short);
        const reasonRowBuilder = new ActionRowBuilder().addComponents(reasonForDenial)
        recruitLogModal.addComponents(reasonRowBuilder)
        await interaction.showModal(recruitLogModal)
        const collectorFilter = i => {
            i.deferUpdate()
            return i.user.id === interaction.user.id;
        };
        interaction.awaitModalSubmit({ time: 30_000, filter: collectorFilter })
        .then(async i => {
            const reason = i.fields.fields.get("denialreason").value
            const oldEmbed = message.embeds[0]
            const newEmbed = new EmbedBuilder(oldEmbed)
            .addFields({
                value: `<@${i.user.id}>`,
                name: "Denied by"
            }, {
                value: reason,
                name: "Reason for denial",
                inline: true
            })
            message.edit({ embeds: [newEmbed] })
            message.react("❌")
        }).catch((err) => {
            if (new Error(err).message.includes("Collector received no interactions before ending with reason: time")) {
                console.log("meow")
                return
            } 
            errHandle(err, "deny-recruitment-log")})

    }, 
};