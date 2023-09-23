const noblox = require("noblox.js")
const { cookie } = require("../../test.json")
const refresh = require("../useful")

const func = async () => {
    try {
        await noblox.setCookie(cookie)
        console.log("[INFO] Logged in Roblox's account")
    }
    catch(err) {
        func(await refresh())
    }
}

module.exports = func