const express = require('express');
const router = express.Router();
const { searchProducts, getChatResponse } = require('../services/ragService');

// POST /api/chat
router.post('/', async (req, res) => {
    const { query, mode, history } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        let products = [];
        let wasScraped = false;

        if (!mode || mode === 'search') {
            // 1. First, try to find existing products in DB
            products = await searchProducts(query);

            // 2. If few results, trigger a LIVE SCRAPE
            if (!products || products.length < 3) {
                console.log("Chat: Not enough products, triggering scrape for:", query);
                const { scrapeProducts } = require('../scraper/index');
                const { insertProducts } = require('../services/dbService');

                // Scrape fresh data
                const scrapedItems = await scrapeProducts(query);

                if (scrapedItems.length > 0) {
                    // Save to DB to generate embeddings/ID
                    const savedProducts = await insertProducts(scrapedItems);
                    // Combine or replace (prioritize fresh)
                    products = savedProducts || scrapedItems;
                    wasScraped = true;
                }
            }
        }

        // 3. Generate LLM response with the (possibly new) products
        const answer = await getChatResponse(query, products, mode || 'search', history || []);

        // 4. Return result
        res.json({
            answer: wasScraped ? `(I scraped fresh data for you!) ${answer}` : answer,
            products
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
