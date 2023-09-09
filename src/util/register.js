const fs = require('fs')
const path = require('path')
const commands = []
const { isAsyncFunction } = require('util/types');
function registerCommands(client, dir = '../commands') {
        const filePath = path.join(__dirname, dir);
        const files =  fs.readdirSync(filePath);
        for (const file of files) {
            const stat =  fs.lstatSync(path.join(filePath, file));
            if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
            if (file.endsWith('.js')) {
                const command = require(path.join(filePath, file));
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
          }
        }
function registerEvents(client, dir="../events") {
    const filePath = path.join(__dirname, dir);
    const files =  fs.readdirSync(filePath);
    for (const file of files) {
        const stat =  fs.lstatSync(path.join(filePath, file));
        if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
        if (file.endsWith('.js')) {
            const event = require(path.join(filePath, file));
            if (event.once) {
                client.once(event.name, (...args) => event.run(...args))
            }
            else {
                client.on(event.name, (...args) => event.run(...args))
            }
        }
    }
}
async function loadFeatures(dir="../features") {
    console.log("[INFO] Bot is registering Features!")
    const filePath = path.join(__dirname, dir);
    const files =  fs.readdirSync(filePath);
    for (const file of files) {
        const stat =  fs.lstatSync(path.join(filePath, file));
        if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
        if (file.endsWith('.js')) {
            console.log("[INFO] Registering " + file)
            const fnc = require(path.join(filePath, file));
            if (isAsyncFunction(fnc)) {
                await fnc();
            }
            else {
                fnc()
            }
        }
    }
}
async function loadSlashCommands(client) {
    try {
    console.log('Started refreshing application (/) commands.');

    await client.application.commands.set(commands)

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
    console.error(error);
    }
}
function loadDBModels(client, dir = '../util/models') {
        const filePath = path.join(__dirname, dir);
        const files =  fs.readdirSync(filePath);
        for (const file of files) {
          if (file.endsWith('.js')) {
            const model = require(path.join(filePath, file));
              client.models.set(model.name, model.Model);
            }
          }
}
module.exports = { registerCommands, loadSlashCommands, registerEvents, loadFeatures, loadDBModels}