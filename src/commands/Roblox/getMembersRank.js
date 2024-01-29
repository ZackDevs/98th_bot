const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const noblox = require("noblox.js");
const { groupID } = require("../../../config.json")
const { errEmbed } = new (require("../../util/easyEmbed"))()
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('Get\'s the current rank of the member')
        .addStringOption(option => 
            option.setName("username").setDescription("Username of the member to get their rank.").setRequired(true)
        ),
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction
     * @param {Date} obj.date
     * @param {Object<String | Number>} obj.option
     */
	async execute({ interaction, date, options: { username } }) {
        const usernames = username.replace(/,/g," ").split(" ").filter(e => e)
        if (usernames.length > 10) {
            return interaction.reply({ embeds: [errEmbed({ description: `The limit of ranks to check is 10 users.`, title: "Couldn't finish executing command" })], ephemeral: true})
        } 
        let userids = await noblox.getIdFromUsername(usernames)
        userids = typeof userids === "number" ? [userids] : userids
        if (!userids || userids.every(e => !e)) {
            return interaction.reply({ embeds: [errEmbed({ description: `${usernames.length > 1 ? "Those": "That"} user${usernames.length > 1 ? "s": ""} ${usernames.length > 1 ? "don't": "doesn't"} exist within Roblox`, title: "Couldn't finish executing command" })], ephemeral: true})
        }
        const processingEmbed = new EmbedBuilder()
        .setTitle("Processing request")
        .setThumbnail("https://www.wpfaster.org/wp-content/uploads/2013/06/loading-gif.gif")
        .setTimestamp()
        const msg = await interaction.reply({ embeds: [processingEmbed] })
        const ranks = []
        for (let i = 0; i < userids.length; i++) {
            let rank, thumbnail
            if (userids[i]) {
                rank = await noblox.getRankNameInGroup(groupID, userids[i])
                thumbnail = await noblox.getPlayerThumbnail(userids[i], 720, undefined, undefined, "headshot")
            }
            const embed = new EmbedBuilder()
            .setTitle(`${usernames[i]}'s rank`)
            .setDescription(`Current Rank: ` + rank ?? "Doesn't exist")
            .setThumbnail(thumbnail ? thumbnail[0].imageUrl : "https://tr.rbxcdn.com/ea3425c2b657de9af16c629441e0dcb2/720/720/AvatarHeadshot/Png")
            .setColor("Random")
            .setTimestamp()
            ranks.push(embed)
        }
        

        msg.edit({ embeds: ranks })
	}, 
};