const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Collection } = require("discord.js")
const noblox = require("noblox.js");
const { groupID, rankNeeded } = require("../../../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exile')
		.setDescription('Exiles the user provided')
        .addStringOption(option => 
            option.setName("username").setDescription("Username of the member to exile.").setRequired(true)
        ),
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction
     * @param {Date} obj.date
     * @param {Object<String | Number>} obj.option
     * @param {Function} obj.errEmbed
     */
	async execute({ interaction, date, options: { username }, errEmbed }) {
        const res = await interaction.client.models.get("verification").findOne({ userId: interaction.user.id })
        if (!res?.username) {
            return interaction.reply({ embeds: [errEmbed({ description: `You need to verify yourself before running this command.`, title: "Couldn't finish executing command" })], ephemeral: true})
        }
        /**
         * @type {Collection}
         */
        const roles = interaction.member.roles.cache
        if (!rankNeeded.some(s => roles.has(s))) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        const nickname = res.username
        const [ownRobloxUserID, theirUserID] = await noblox.getIdFromUsername([nickname, username])
        if (!theirUserID) {
            return interaction.reply({ embeds: [errEmbed({ description: "That user doesn't exist within Roblox", title: "Couldn't finish executing command" })], ephemeral: true})
        }
        const botID = await noblox.getCurrentUser("UserID")
        const ownRank = await noblox.getRankInGroup(groupID, ownRobloxUserID)
        const botRank = await noblox.getRankInGroup(groupID, botID)
        const theirRank = await noblox.getRankInGroup(groupID, theirUserID)
        if (!theirRank) {
            return interaction.reply({ embeds: [errEmbed({ description: "User isn't member of group ;-;", title: "Couldn't finish executing command"})], ephemeral: true })
        }
        if(ownRank < theirRank || botRank < theirRank) {
            return interaction.reply({ embeds: [errEmbed({ description: ownRank < theirRank ? "You can't exile people that are higher ranked than you :(" : "I cannot exile that person >:(", title: "Couldn't finish executing command"})], ephemeral: true })
        }
        try {
            await noblox.exile(groupID, theirUserID)
            const sucefullEmbed = new EmbedBuilder()
            .setTitle("Successfully exiled user!")
            .setColor("Green")
            .setTimestamp()
            return interaction.reply({ embeds:[sucefullEmbed] })
        }
        catch {
            return interaction.reply({ embeds: [errEmbed({ description: "Failed while exiling user.", title: "There was an error"})], ephemeral: true })
        }
	}, 
};