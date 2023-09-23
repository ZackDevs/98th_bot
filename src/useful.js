const { password, username } = require("../config.json");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");

const func = (async () => {
    let browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.goto('https://roblox.com/login',
        { waitUntil: 'networkidle0', }
    );        
    await page.type('input[id="login-username"]', username, {delay: 100})
    await page.type('input[id="login-password"]', password, {delay: 100})
    await page.keyboard.press("Enter")
    await page.waitForNetworkIdle()
    const client = await page.target().createCDPSession();
    const cookie = (await client.send('Network.getAllCookies')).cookies.find(({name}) => name === ".ROBLOSECURITY")
    fs.writeFile(path.join(process.cwd(), 'test.json'), `{"cookie": "${cookie}"}`)
    return cookie
})
module.exports = func


