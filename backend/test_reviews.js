const { scrapeReviews } = require('./scraper/reviewScraper');

async function test() {
    // A sample real product URL (Flipkart) to test scraping
    // Using a popular item that likely has reviews
    const testUrl = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac648551528c?pid=MOBGTAGPTB3VS24W';

    console.log(`Testing scraper on: ${testUrl}`);
    const start = Date.now();

    try {
        const text = await scrapeReviews(testUrl);
        console.log(`\n--- Scrape Result (${(Date.now() - start) / 1000}s) ---`);
        console.log(`Length: ${text.length} chars`);
        console.log(`Preview: ${text.slice(0, 500)}...`);

        if (text.length < 100) {
            console.log("FAILURE: Retrieved text is too short. Scraper likely blocked or selectors mismatched.");
        } else {
            console.log("SUCCESS: Retrieved sufficient text.");
        }
    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}

test();
