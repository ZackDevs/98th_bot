const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const randomw = require("../../util/randomwords.json")
const noblox = require("noblox.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verifies an user!')
        .addStringOption(option => 
            option.setName("username").setDescription("Username to verify with.").setRequired(true)
        ),
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction
     * @param {import * from "../util/classes/Client.js";} obj.interaction.client
     * @param {Date} obj.date
     * @param {Object<String | Number>} obj.option
     * @param {Function} obj.errEmbed
     */
	async execute({ interaction, date, options: { username }, errEmbed }) {
        const res = await interaction.client.models.get("verification").findOne({userId: interaction.user.id})
        if (res?.username) {
            return await interaction.reply({ embeds: [errEmbed({ description: `You're already verified as ${res.username}.`, title: "Couldn't finish excuting this command."})], ephemeral: true })
        }
        const user = await noblox.getIdFromUsername(username)
        if (!user) {
            return interaction.reply({ embeds: [errEmbed({ description: "That user doesn't exist within Roblox", title: "Couldn't finish executing command" })], ephemeral: true})
        }
        if (!res) {
            const shuffled = randomw.sort(() => 0.5 - Math.random());
            const randomwords = shuffled.slice(0, 5)
            const embed = new EmbedBuilder()
            .setTitle(`Verification of ${username}`)
            .setDescription(`To verify yourself you need to go to your profile. [Click Here](https://www.roblox.com/users/${user}/profile)\nThan please set your About Me with the following words.\n\n**${randomwords.join(" ")}**\n\nThan rerun the command and it should verify.`)
            .setTimestamp()
            .setColor("Random")
            await interaction.reply({ embeds: [embed], ephemeral:true })
            await interaction.client.models.get("verification").findOneAndUpdate({
                userId: interaction.user.id
            }, {
                userId: interaction.user.id,
                awaitingVerification: [user, randomwords.join(" ")]
            }, {
                upsert: true
            })
            return
        }
        const {awaitingVerification: [userid, rdwr]} = res
        const { blurb } = await noblox.getPlayerInfo(userid)
        const usrn = await noblox.getUsernameFromId(userid)
        if (blurb !== rdwr) {
            const embed = new EmbedBuilder()
            .setTitle(`Verification of ${username}`)
            .setDescription(`To verify yourself you need to go to your profile. [Click Here](https://www.roblox.com/users/${userid}/profile)\nThan please set your About Me with the following words.\n\n**${rdwr}**\n\nThan rerun the command and it should verify.`)
            .setTimestamp()
            .setColor("Random")
            return await interaction.reply({ embeds: [embed], ephemeral:true })
        } else {
            const successfull = new EmbedBuilder()
            .setTitle(`Successfully verifed`)
            .setDescription("You're successfully verified! You may set the about me to other thing!")
            .setTimestamp()
            .setColor("Random")
            await interaction.reply({ embeds: [successfull]})
            await interaction.client.models.get("verification").findOneAndReplace({
                userId: interaction.user.id,
            }, {
                userId: interaction.user.id,
                username: usrn
            })
        }
        
        
	}, 
};