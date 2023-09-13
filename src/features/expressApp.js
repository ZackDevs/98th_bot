const noblox = require("noblox.js")
const express = require('express')
const { groupID } = require("../../config.json")
module.exports = () => {
    const app = express()
    app.get('/leavenotices', async function (req, res) {
        if(!req.query?.members) {
            return res.send("{ \"error\": \"There is no query for members\" }")
        }
        const members = req.query.members.split(",")
        console.log(members)
        let userids = await noblox.getIdFromUsername(members)
        userids = typeof userids === "number" ? [userids] : userids
        const alreadyGuest = [], exiled = [], failed = []
        for (let i = 0; i < userids.length; i++) {
            console.log(members[i])
            if (await noblox.getRankNameInGroup(groupID, userids[i]) === "Guest") {
                alreadyGuest.push(members[i])
                continue 
            }
            try {
                await noblox.exile(groupID, userids[i])
                exiled.push(members[i])
            }
            catch {
                failed.push(members[i])
            }
        }
        return res.send(JSON.stringify({ alreadyGuest, exiled, failed }))
    })

    app.listen(22325)
}