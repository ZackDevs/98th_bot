const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction} = require("discord.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('omg')
		.setDescription('Replies with Pong!')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction 
     */
	async execute({ interaction }) {
        interaction.reply("Hello")
	}, 
};