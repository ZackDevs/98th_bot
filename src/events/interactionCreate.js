const { Events, ChatInputCommandInteraction } = require("discord.js")
const EasyEmbed = require("../util/easyEmbed")
const { errEmbed } = new EasyEmbed()
const errHandle = require("../util/errHandle");
module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async run(interaction) {
        if (interaction.isModalSubmit()) return
        const date = Date.now()
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) {
            try {
                await command.execute({ interaction, date, errEmbed });
                return
            } catch (error) {
                errHandle(error, interaction.commandName)
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return
        }
        if (interaction.isAutocomplete()) {
            try {
                return await command.autocomplete(interaction);
            } catch (error) {
                return errHandle(error, interaction.commandName)
            }
        }
            try {
                const options = interaction.options._hoistedOptions.reduce((acc, cur) => ({...acc, [cur.name]: cur.type === 11 ? cur.attachment : cur.value }), {})
                await command.execute({ interaction, options, date, errEmbed });
                return
            } catch (error) {
                errHandle(error, interaction.commandName)
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
    }
}