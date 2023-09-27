const { Client } = require("discord.js");
let active = false

/**
 * @param {Client} client 
 */
async function loadEverythingToDatabase(client) {
    let arr = []
    await new Promise((resolve) => {
        resolve(777)
        Array.from(client.cachedb).forEach(([x, y]) => { 
            y.map(e => {
                if (e?.new) arr.push([x,e])
            })
        })
    })
    for (let i=0; i < arr.length; i++) {
        const [modelname, information] = arr[i]
        delete information.new
        const Model = client.models.get(modelname)
        await Model.findOneAndUpdate(information.identifier, information, { upsert: true }).then(() => delete information.identifier)
    }
    active = false
}
module.exports = {
    name: 'db_log',
    /**
     * @param {Client} client 
     */
    async run(client) {
        if(!active) {
            setTimeout(() => {
                loadEverythingToDatabase(client)
            }, 1000 * 30)
            active = true
        }
        return
    }
}