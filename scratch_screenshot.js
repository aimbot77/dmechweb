const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});
    await page.goto('http://localhost:8090/#team', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({path: 'screenshot_team.jpg', fullPage: true});
    await browser.close();
    console.log("Screenshot taken");
  } catch (e) {
    console.error(e);
  }
})();
