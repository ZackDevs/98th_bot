const { SlashCommandBuilder, PermissionFlagsBits, BaseInteraction} = require("discord.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('omg')
		.setDescription('Replies with Pong!')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    /**
     * 
     * @param {BaseInteraction} interaction 
     */
	async execute({ interaction }) {
        interaction.send("Hello")
	}, 
};