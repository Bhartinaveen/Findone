const express = require('express');
const router = express.Router();
const { scrapeOffers } = require('../scraper/offerScraper');

// Simple In-Memory Cache
let cachedOffers = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 Minutes

// Background Refresh Logic
const refreshOffers = async () => {
    console.log("Starting background offer refresh...");
    try {
        const offers = await scrapeOffers();
        if (offers && offers.length > 0) {
            cachedOffers = offers;
            lastFetchTime = Date.now();
            console.log(`Offers updated in background: ${offers.length} offers.`);
        } else {
            console.log("Offer refresh yielded no data, keeping old cache.");
        }
    } catch (err) {
        console.error("Background offer refresh failed:", err);
    }
};

// Initial Fetch (Non-blocking)
refreshOffers();

// Set Interval (e.g., every 15 minutes)
setInterval(refreshOffers, 1000 * 60 * 15);

router.get('/', async (req, res) => {
    // Always serve from cache if available
    if (cachedOffers) {
        return res.json({ success: true, from_cache: true, data: cachedOffers });
    }

    // If first hit and no cache, wait for it (fallback)
    if (!cachedOffers) {
        // Just send empty or wait? Let's wait for the first one for better UX
        // But for really fast response we could send empty.
        // Let's try to wait a bit but not hang.
        // For now, let's just trigger one if not running and wait.
        try {
            const offers = await scrapeOffers();
            cachedOffers = offers;
            lastFetchTime = Date.now();
            return res.json({ success: true, from_cache: false, data: offers });
        } catch (error) {
            console.error("Force fetch failed:", error);
            return res.status(500).json({ error: "Failed to fetch offers", data: [] });
        }
    }
});

module.exports = router;
