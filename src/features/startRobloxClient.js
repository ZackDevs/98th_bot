const noblox = require("noblox.js")
const { cookie } = require("../../test.json")
const refresh = require("../useful")

const func = async () => {
    try {
        await noblox.setCookie(cookie)
        console.log("[INFO] Logged in Roblox's account")
    }
    catch(err) {
        console.log("[ERROR] Couldn't log in")
    }
}

module.exports = func