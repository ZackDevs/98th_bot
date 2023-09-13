const noblox = require("noblox.js");

(async () => {
    const userid = await noblox.getIdFromUsername("SeismicGirthquake")
    const rank = await noblox.getRankNameInGroup(13475897, userid)
    console.log(rank)
})()