const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const randomw = require("../../util/randomwords.json")
const noblox = require("noblox.js");
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
     * @param {Date} obj.date
     * @param {Object<String | Number>} obj.option
     * @param {Function} obj.errEmbed
     */
	async execute({ interaction, date, options: { username }, errEmbed }) {
        const res = interaction.client.cachedb.get("verification").find(e => e.userId === interaction.user.id )
        const userwithsameusername = interaction.client.cachedb.get("verification").find(e => e.username?.toLowerCase() === username.toLowerCase())
        if (res?.username) {
            return await interaction.reply({ embeds: [errEmbed({ description: `You're already verified as ${res.username}.`, title: "Couldn't finish excuting this command."})], ephemeral: true })
        }
        if (userwithsameusername) {
            return await interaction.reply({ embeds: [errEmbed({ description: `There is someone already verified as ${userwithsameusername.username}`, title: "Couldn't finish excuting this command."})], ephemeral: true })
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
            await interaction.client.cachedb.get("verification").push({ userId: interaction.user.id, awaitingVerification: [user, randomwords], new: true, identifier: {userId: interaction.user.id} })
            interaction.client.emit("db_log", interaction.client)
            return
        }
        const {awaitingVerification: [userid, rdwr]} = res
        if (!Array.isArray(rdwr)) rdwr = rdwr.split(" ")
        const { blurb } = await noblox.getPlayerInfo(userid)
        const usrn = await noblox.getUsernameFromId(userid)
        if (!rdwr.every(e => blurb.includes(e))) {
            const embed = new EmbedBuilder()
            .setTitle(`Verification of ${username}`)
            .setDescription(`To verify yourself you need to go to your profile. [Click Here](https://www.roblox.com/users/${userid}/profile)\nThan please set your About Me with the following words.\n\n**${rdwr.join(" ")}**\n\nThan rerun the command and it should verify.`)
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
            res.username = usrn
            res.new = true
            res.identifier = { userId: interaction.user.id }
            delete res.awaitingVerification
            interaction.client.emit("db_log", interaction.client)
            return
        }
        
        
	}, 
};