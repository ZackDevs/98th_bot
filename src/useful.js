let names = `12s231
2015pro
AGCK80
AMistakeIsMe
Araxon
AsyskerALT
AviaNeso
Ayan_GAMES2020 
benben7878
Berzikov
carletiss
D31m05G
Daxxxia
dewbacktewelve
henk280
herobalintka
hype034
IloveOwOlol
kanadjani1114
LucaAlpennau
MiLovers104
minerobloxer1
NebulaGrimes
NekoTamoGde
NeoAnnexer
NicolasBest1990
NoobinatorN500
Poloj8567
quanhoang2333
seagba12g
Serbian_Player123
silkxn
SkyLinerRO
Speedstterr
stardvloper
teudost
thiagogoe
Vertigo0206
VIBE_Inosuke
Wolfy_wyatt
wujunhandu
xErix52
XGStudio
Yo_BI0
Yomxster
zombie_official890`.split("\n")
const noblox = require("noblox.js");

(async () => {
    let userId = await noblox.getIdFromUsername(names)
    for (let index = 0; index < userId.length; index++) {
        console.log(await noblox.getRankNameInGroup(10421203, userId[index]))
    }
})()