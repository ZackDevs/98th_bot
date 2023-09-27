const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const { HC_rank, Staff_role, rankNeeded } = require("../../../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recruitment')
		.setDescription('Logs a recruitment log!')
        .addStringOption(option => 
            option.setName("usernames").setDescription("Usernames of the users that were accepted").setRequired(true)
        ).addStringOption(options => 
            options.setName("type").setDescription("Type of recruitment event").addChoices({
                value: "Combat Tryout",
                "name": "Combat Tryout"
            },{
                value: "Aerial Tryout",
                name: "Aerial Tryout"
            }, {
                value: "Recruitment Session",
                name: "Recruitment Session"
            }).setRequired(true)        
        ).addAttachmentOption(option => 
            option.setName("attachment").setDescription("Proof of the event - non url")    
        ).addStringOption(option => 
            option.setName("proof").setDescription("Proof of the event - url")    
        ).setDMPermission(false),
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction
     * @param {Date} obj.date
     * @param {Object<String | Number>} obj.option
     * @param {Function} obj.errEmbed
     */
	async execute({ interaction, date, options: { usernames, type, proof, attachment }, errEmbed }) {
        const roles = interaction.member.roles.cache
        if (![HC_rank, Staff_role].some(s => roles.has(s))) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        if ([proof, attachment].every(s => !s)) return interaction.reply({ embeds: [errEmbed({ description: "You need to attach a proof or to send the url of the proof", title: "Couldn't finish executing command"})], ephemeral: true })
        const prf = attachment?.url ?? proof
        const recruimentEmbed = new EmbedBuilder()
        .setDescription(`### Recruitment event hosted by <@${interaction.user.id}>`)
        .addFields({
            "name": "Event type",
            "value": type,
            inline: true
        }, {
            name: "Recruitees",
            value: usernames,
            inline: true
        })
        .setTimestamp()
        .setColor("Random")
        await interaction.reply({embeds: [recruimentEmbed], allowedMentions: { "roles": [rankNeeded[0]] }, content: `<@&${rankNeeded}>`})
        return interaction.channel.send(prf)
    }, 
};