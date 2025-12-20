const { scrapeProducts } = require('./scraper/index');
const puppeteer = require('puppeteer');

async function testAmazon() {
    console.log("Testing scraper with 'samsung mobile' on Amazon only...");

    // Minimal scraper logic reproduction for debugging
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = `https://www.amazon.in/s?k=${encodeURIComponent('samsung mobile')}&s=review-rank`;
    console.log(`Navigating to: ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Check if we hit a captcha
    const title = await page.title();
    console.log(`Page Title: ${title}`);

    // Check for selectors
    const selector = 'div[data-component-type="s-search-result"]';
    const items = await page.evaluate((sel) => {
        const nodes = document.querySelectorAll(sel);
        const data = [];
        nodes.forEach((node, index) => {
            if (index > 2) return; // Only check first 3
            const title = node.querySelector('h2')?.innerText;
            const priceEl = node.querySelector('.a-price-whole');
            const price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
            const images = Array.from(node.querySelectorAll('img')).map(img => ({
                src: img.src,
                srcset: img.getAttribute('srcset'),
                cw: img.clientWidth,
                nw: img.naturalWidth
            }));

            data.push({ title, price, images });
        });
        return data;
    }, selector);

    console.log("Extracted Items:", JSON.stringify(items, null, 2));

    await browser.close();
}

testAmazon();
