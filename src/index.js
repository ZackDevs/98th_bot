const { Client, GatewayIntentBits, Events, Collection, WebhookClient} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const { TOKEN, "admin-logs-webhook":adminwebhook } = require("../config.json")
const { registerCommands, loadSlashCommands, registerEvents, loadFeatures, loadDBModels } = require("./util/register");

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	client.commands = new Collection()
	console.log("[INFO] Bot is registering Commands!")
	registerCommands(client)
	client.models = new Map()
	loadSlashCommands(client)
	console.log("[INFO] Bot is registering Events!")
	registerEvents(client)
	console.log("[INFO] Bot is loading features!")
	await loadFeatures()
	console.log("[INFO] Bot is loading Database Models!")
	loadDBModels(client)
});

client.login(TOKEN);