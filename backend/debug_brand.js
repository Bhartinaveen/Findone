const puppeteer = require('puppeteer');

async function debugFlipkart() {
    console.log("Debugging Flipkart for 'oppo mobile'...");
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Mobile UA
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36');
    await page.setViewport({ width: 375, height: 812 });

    await page.goto('https://www.flipkart.com/search?q=oppo+mobile&sort=popularity', { waitUntil: 'networkidle2' });

    const title = await page.title();
    console.log(`Page Title: ${title}`);

    // Mobile Selectors
    // Flipkart Mobile View often uses different classes
    const nodes = await page.evaluate(() => {
        return document.querySelectorAll('div[data-id], div._1AtVbE, div._13oc-S, div.cPHDOP').length;
    });
    console.log(`Common Selectors found: ${nodes}`);

    await browser.close();
}

debugFlipkart();
