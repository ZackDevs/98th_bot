const pupper = require("puppeteer")
async function upload(text) {
    let browser = await pupper.launch({ headless: "new" });
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.goto('https://sourceb.in/',
        { waitUntil: 'networkidle0', }
    );
    await page.keyboard.type(text)
    const [button] = await page.$x("//button[contains(., 'Save')]")
    await button.click();
    await page.waitForNavigation()
    const url = page.url()
    await browser.close();
    return url
}
module.exports = upload

