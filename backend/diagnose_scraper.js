const puppeteer = require('puppeteer');

async function debugScraper() {
    console.log("Starting Debug Scraper...");
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });

    // Test Amazon and Meesho specifically as they were failing
    await debugSite(browser, `https://www.amazon.in/s?k=samsung+mobile`, 'Amazon', 'div[data-component-type="s-search-result"]');
    await debugSite(browser, `https://www.meesho.com/search?q=samsung+mobile&sort=rating`, 'Meesho', 'div[class*="Product"]');

    await browser.close();
}

async function debugSite(browser, url, source, selector) {
    console.log(`\n\n--- DEBUGGING ${source} ---`);
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Count Raw Selectors
    const totalFound = await page.evaluate((sel) => document.querySelectorAll(sel).length, selector);
    console.log(`Raw Selectors Found: ${totalFound}`);

    if (totalFound > 0) {
        const debugData = await page.evaluate((sel, src) => {
            const nodes = Array.from(document.querySelectorAll(sel)).slice(0, 3);
            return nodes.map(node => {
                const title = node.innerText.split('\n')[0] || node.querySelector('h2')?.innerText || "No Title";
                const imgs = Array.from(node.querySelectorAll('img')).map(i => i.src);
                return { title: title.slice(0, 50), imgs };
            });
        }, selector, source);
        console.log("First 3 Items Preview:", JSON.stringify(debugData, null, 2));
    }
    await page.close();
}

debugScraper();
