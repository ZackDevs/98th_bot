const { SlashCommandBuilder, BaseInteraction, EmbedBuilder} = require("discord.js")
const axios = require("axios")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Show the latency of the bot.'),
    /**
     * 
     * @param {BaseInteraction} interaction 
     */
	async execute({ interaction, date }) {
        let latency = Date.now()
        let roblox_latency
        try  {
            let res = await axios.get("https://groups.roblox.com/")
            roblox_latency = Date.now()
        }
        catch {
            roblox_latency = null
        }
        const embed = new EmbedBuilder()
        .setTitle("Pong! 🏓")
        .addFields({ name: "Discord Latency", value: `${latency - date} ms of latency`})
        .addFields({ name: "Roblox Latency", "value": roblox_latency ? `${roblox_latency - date} ms of latency` : "Roblox api is down." })
        embed.setTimestamp()
        return await interaction.reply({ embeds: [embed]})
	}, 
};