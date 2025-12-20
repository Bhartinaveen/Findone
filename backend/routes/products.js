const express = require('express');
const router = express.Router();
const { scrapeProducts } = require('../scraper/index');
const { insertProducts, getAllProducts, getProductDetails, deleteAllProducts } = require('../services/dbService');

// DELETE /api/products - Clear all data
router.delete('/', async (req, res) => {
    try {
        const success = await deleteAllProducts();
        if (success) res.json({ message: 'Database cleared' });
        else res.status(500).json({ error: 'Failed to clear database' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/products/scrape - Trigger scraping and storage
router.post('/scrape', async (req, res) => {
    try {
        const { query } = req.body;
        const products = await scrapeProducts(query || 'trending');
        const stored = await insertProducts(products);

        if (!stored) {
            // Even if storage fails (duplicate or DB error), return scraped data for UI
            return res.json({ message: 'Scraped but failed to store', count: products.length, data: products });
        }

        res.json({ message: 'Scraping and storage successful', count: stored.length, data: stored });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/products - List all products
router.get('/', async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Get details with history & comparison
router.get('/:id', async (req, res) => {
    try {
        const details = await getProductDetails(req.params.id);
        if (!details) return res.status(404).json({ error: 'Product not found' });
        res.json(details);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});

module.exports = router;
