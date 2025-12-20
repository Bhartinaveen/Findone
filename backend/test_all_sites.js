const { scrapeProducts } = require('./scraper/index');

const queries = ['bluetooth speaker', 'running shoes'];

async function testAllSites() {
    for (const query of queries) {
        console.log(`\n\n=== TESTING QUERY: ${query} ===`);
        try {
            const results = await scrapeProducts(query);
            const counts = {};
            const rejected = {}; // Conceptually, but we can't see internal rejection without logging

            results.forEach(r => counts[r.source] = (counts[r.source] || 0) + 1);

            console.log(`PASSING Results for "${query}":`, counts);

            const expectedSites = ['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'Ajio', 'Nykaa', 'Croma', 'Decathlon', 'JioMart'];
            const missing = expectedSites.filter(s => !counts[s]);

            if (missing.length > 0) {
                console.warn(`WARNING: 0 results from: ${missing.join(', ')}`);
            }

        } catch (e) {
            console.error(`Failed to scrape ${query}:`, e.message);
        }
    }
}

testAllSites();
