const { Events, ChatInputCommandInteraction } = require("discord.js")
const { errEmbed } = require("../util/easyEmbed") 
module.exports = {
    name: Events.InteractionCreate,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns {Promise}
     */
    async run(interaction) {
        if (!interaction.isChatInputCommand()) return;
            const date = Date.now()

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                const options = interaction.options._hoistedOptions.reduce((acc, cur) => ({...acc, [cur.name]: cur.value}), {})
                await command.execute({ interaction, options, date, errEmbed });
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
    }
}