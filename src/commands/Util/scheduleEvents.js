const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const { HC_rank, Staff_role, trello_api_token, trello_api_key } = require("../../../config.json");
let choices = []
let trello_res
const axios = require("axios").default
const { errEmbed } = new (require("../../util/easyEmbed"))()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('events')
		.setDescription('Schedules / Cancels events on the public scheduling trello')
        .addSubcommand(subcmd => 
            subcmd.setName("schedule").setDescription("Schedules an event").addStringOption(option =>
                    option.setName("event").setDescription("Type of event to schedule").setAutocomplete(true).setRequired(true)
                ).addStringOption(option => 
                    option.setName("date").setDescription("Date of the event - Format DD-MM-YYYY").setRequired(true)
                ).addStringOption(option => 
                    option.setName("time").setDescription("Time of the event - Format HH:MM AM/PM EST").setRequired(true)
        )).addSubcommand(subcmd =>
            subcmd.setName("cancel").setDescription("Cancels an event").addStringOption(option => 
                    option.setName("event").setDescription("Type of event to schedule").setAutocomplete(true).setRequired(true)
                ).addStringOption(option => 
                    option.setName("date").setDescription("Date of the event - Format DD-MM-YYYY").setRequired(true)
                ).addStringOption(option => 
                    option.setName("time").setDescription("Time of the event - Format HH:MM AM/PM EST").setRequired(true)
                )
        ).addSubcommand(subcmd => 
            subcmd.setName("end").setDescription("Ends an event").addStringOption(option => 
                option.setName("event").setDescription("Type of event to schedule").setAutocomplete(true).setRequired(true)
            ).addStringOption(option => 
                option.setName("date").setDescription("Date of the event - Format DD-MM-YYYY").setRequired(true)
            ).addStringOption(option => 
                option.setName("time").setDescription("Time of the event - Format HH:MM AM/PM EST").setRequired(true)
            )            
        ).setDMPermission(false),
    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        if (!choices.length) {
            trello_res = await axios.get(`https://api.trello.com/1/boards/hpZgmMOY/cards?token=${trello_api_token}&key=${trello_api_key}`)
            
            choices = trello_res.data[1].labels.map(e => {return { name: e.name, value: e.id }}).filter(e => !e.name.toLowerCase().includes("cancel"))
        }
		const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
		await interaction.respond(
			filtered.map(({name, value}) => ({ name, value })),
		);
    },
    /**
     * @param {Object} obj
     * @param {ChatInputCommandInteraction} obj.interaction 
     * @param {Date} obj.date
     */
	async execute({ interaction, date, options: {event, date: dt_e, time} }) {
        if (!choices.length) {
            trello_res = await axios.get(`https://api.trello.com/1/boards/hpZgmMOY/cards?token=${trello_api_token}&key=${trello_api_key}`)
        }
        time = time.split(" ").slice(0, 2).join(" ")
        const res = await interaction.client.cachedb.get("verification").find(e => e.userId === interaction.user.id)
        if (!res?.username) {
            return interaction.reply({ embeds: [errEmbed({ description: `You need to verify yourself before running this command.`, title: "Couldn't finish executing command" })], ephemeral: true})
        }
        const roles = interaction.member.roles.cache
        if (![HC_rank, Staff_role].some(s => roles.has(s))) return interaction.reply({ embeds: [errEmbed({ description: "You don't have permission to run this command", title: "Couldn't finish executing command"})], ephemeral: true })
        
        if (!/^(0[1-9]|1\d|2[0-8]|29(?=-\d\d-(?!1[01345789]00|2[1235679]00)\d\d(?:[02468][048]|[13579][26]))|30(?!-02)|31(?=-0[13578]|-1[02]))-(0[1-9]|1[0-2])-([12]\d{3})$/gm.test(dt_e)) {
            return interaction.reply({ embeds: [errEmbed({ description: `You need to use a valid date.`, title: "Couldn't finish executing command" })], ephemeral: true})
        }
        if (!/(0[0-9]|1[0-2]):([0-5]{2}|5[0-9]) (PM|AM)/gm.test(time)) {
            return interaction.reply({ embeds: [errEmbed({ description: `You need to use a valid time.\nDon't add the EST, just make sure it's scheduled on the EST timezone.`, title: "Couldn't finish executing command" })], ephemeral: true})
        }
        const username = res.username
        const { id: cancelledId } = trello_res.data[1].labels.find(e => e.name === "Event Cancelled")
        const test = trello_res.data.filter(({name, idLabels}) => name === dt_e + " - " + time + " EST - " + username && !idLabels.includes(cancelledId))[0]
        switch (interaction.options._subcommand) {
            case 'schedule':
                if (test) {
                    return interaction.reply({ embeds: [errEmbed({ description: `You already have a ${test?.labels[0]?.name} scheduled for that moment`, title: "Couldn't finish executing command" })], ephemeral: true})
                } 
                const listId = trello_res.data.filter(e => e.idLabels.includes(event))[1].idList
                try {
                    const { data: {shortUrl, labels} } = await axios.post(`https://api.trello.com/1/cards?idList=${listId}&token=${trello_api_token}&key=${trello_api_key}&name=${encodeURI(dt_e + " - " + time + " EST - " + username)}&idLabels=${[event]}`)
                    const sucessEmbed = new EmbedBuilder()
                    .setTitle("Scheduled an event for you")
                    .setURL(shortUrl)
                    .addFields({
                        name: "Scheduled event type", value: labels[0].name, inline: true
                    }, {
                        name: "Date hosted", value: dt_e, inline: true
                    }, {
                        name: "Time hosted", value: time, inline: true
                    }).setTimestamp()
                    .setColor("Random")
                    .setThumbnail("https://i.imgur.com/BFtBia8.png")
                    interaction.reply({embeds: [sucessEmbed]})
                } catch(err) {
                    console.error(err)
                    return interaction.reply({ embeds: [errEmbed({ description: "There was an error while scheduliing your event. If the error persists contact JDLRGamer.", title: "Couldn't schedule your event." })] })
                }
            break;
            case "cancel":
                if (!test) {
                    return interaction.reply({ embeds: [errEmbed({ description: `There is no event hosted by you, scheduled at ${time} EST on day ${dt_e}`, title: "Couldn't cancel a non existant event" })] })
                }
                try {
                    const lists = (await axios.get("https://api.trello.com/1/boards/hpZgmMOY/lists?key=8a3a4e91e7ab71e6127d4547fec44dfa")).data
                    const { id } = lists.find(({ name }) => name === "Cancelled Events")
                    const { id: cancelledId } = trello_res.data[1].labels.find(e => e.name === "Event Cancelled")
                    const {data: { shortUrl }} = await axios.put(`https://api.trello.com/1/cards/${test.id}?key=${trello_api_key}&token=${trello_api_token}&idList${id}&idLabels=${[event, cancelledId]}`)
                    const sucessEmbedCancel = new EmbedBuilder()
                    .setTitle("Successfully cancelled your event!")
                    .setURL(shortUrl)
                    .setDescription(`Cancelled your event scheduled for ${time} EST on ${dt_e}`)
                    .setColor("Random")
                    .setTimestamp()
                    .setThumbnail("https://i.imgur.com/BFtBia8.png")                
                    interaction.reply({ embeds: [sucessEmbedCancel]})
                }
                catch(err) {
                    console.error(err)
                    return interaction.reply({ embeds: [errEmbed({ description: "There was an error while scheduliing your event. If the error persists contact JDLRGamer.", title: "Couldn't schedule your event." })] })
                }
                break;
            case "end": 
                if (!test) {
                    return interaction.reply({ embeds: [errEmbed({ description: `There is no event hosted by you, scheduled at ${time} EST on day ${dt_e}`, title: "Couldn't end a non existant event" })] })
                }
                try {
                    const { data } = await axios.delete(`https://api.trello.com/1/cards/${test.id}?key=${trello_api_key}&token=${trello_api_token}`)
                    const sucessEmbedEnd = new EmbedBuilder()
                    .setTitle("Successfully ended your event!")
                    .setDescription(`Ended your event scheduled for ${time} EST on ${dt_e}`)
                    .setColor("Random")
                    .setTimestamp()
                    .setThumbnail("https://i.imgur.com/BFtBia8.png")                
                    interaction.reply({ embeds: [sucessEmbedEnd]})
                }
                catch(err) {
                    console.error(err)
                    return interaction.reply({ embeds: [errEmbed({ description: "There was an error while scheduliing your event. If the error persists contact JDLRGamer.", title: "Couldn't schedule your event." })] })
                }
            }
            
        choices = []
        trello_res = []
    }, 
};