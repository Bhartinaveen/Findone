const { scrapeRatingDistribution } = require('./backend/scraper/reviewScraper');
const fs = require('fs');

const urls = [
    'https://www.nykaa.com/doodle-collection-morning-glory-notebook/p/449823?productId=449823&pps=5',
    'https://www.myntra.com/clocks/random/random-embossed-foiling-wall-ticking-clock--8inch-/36521345/buy',
    'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4'
];

async function runTest() {
    let resultsLog = "";
    for (const url of urls) {
        console.log(`Testing: ${url}`);
        try {
            const results = await scrapeRatingDistribution(url);
            resultsLog += `\nURL: ${url}\nResults: ${JSON.stringify(results, null, 2)}\n`;
        } catch (e) {
            resultsLog += `\nURL: ${url}\nError: ${e.message}\n`;
        }
    }
    fs.writeFileSync('ratings_test_results.txt', resultsLog);
    console.log("Done. Results in ratings_test_results.txt");
    process.exit(0);
}

runTest();
