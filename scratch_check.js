const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  await page.goto('http://localhost:8090', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 1000));
  
  const teamMembers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.team__member')).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const isVisible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      return {
        id: el.querySelector('.team__member-id')?.innerText,
        rect: {top: rect.top, height: rect.height, width: rect.width},
        isVisible: isVisible,
        opacity: style.opacity
      };
    });
  });
  console.log(JSON.stringify(teamMembers, null, 2));
  await browser.close();
})();
