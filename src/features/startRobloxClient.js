const noblox = require("noblox.js")
const { COOKIE } = require("../../config.json") 
module.exports = async () => {
    try {
        await noblox.setCookie(COOKIE)
        console.log("[INFO] Logged in Roblox's account")
    }
    catch {
        console.log("[INFO] Error while logging in")
    }
}