const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const { TOKEN } = require("../config.json")
const { loadEverything } = require("./util/register");

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.commands = new Collection()
	client.models = new Map()
	client.cachedb = new Map()
	loadEverything(client)
});

client.login(TOKEN);
module.exports = client