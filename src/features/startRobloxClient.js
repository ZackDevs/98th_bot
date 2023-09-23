const noblox = require("noblox.js")
const { COOKIE } = require("../../config.json")

const func = async () => {
    try {
        await noblox.setCookie(COOKIE)
        console.log("[INFO] Logged in Roblox's account")
    }
    catch(err) {
        console.log("[ERROR] Couldn't log in")
    }
}

module.exports = func