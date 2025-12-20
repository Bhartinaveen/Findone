const express = require('express');
const router = express.Router();
const { scrapeReviews } = require('../scraper/reviewScraper');
const { analyzeReviews } = require('../services/sentimentService');

router.post('/reviews', async (req, res) => {
    try {
        const { product_id, product_url } = req.body;

        if (!product_url) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        console.log(`Analyze request for: ${product_url}`);

        // 1. Scrape Reviews
        // scrapeReviews now returns a single string of concatenated reviews/text
        const reviewText = await scrapeReviews(product_url);

        if (!reviewText || reviewText.length < 50) {
            // If scraping fails or finds almost no text
            console.log("Not enough review text found.");
        }

        // 2. Analyze Sentiment
        console.log(`Sending ${reviewText.length} chars to AI. Preview: ${reviewText.slice(0, 100)}...`);
        const sentiment = await analyzeReviews(reviewText);

        console.log("Sentiment Result:", JSON.stringify(sentiment, null, 2));
        res.json(sentiment);

    } catch (error) {
        console.error("Analysis Route Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
