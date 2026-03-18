const { scrapeRatingDistribution } = require('./scraper/reviewScraper');
const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4'; // test url
(async () => {
    console.log("Testing Flipkart iPhone 15");
    const ratings = await scrapeRatingDistribution(url);
    console.log("Result:", ratings);
    process.exit(0);
})();
