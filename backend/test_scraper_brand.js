const { scrapeProducts } = require('./scraper/index');

async function test() {
    console.log("Testing scraper with 'samsung mobile'...");
    try {
        const products = await scrapeProducts('samsung mobile');
        console.log(`\n\n=== FINAL RESULTS ===`);
        console.log(`Total Found: ${products.length}`);

        const bySource = {};
        products.forEach(p => {
            bySource[p.source] = (bySource[p.source] || 0) + 1;
        });
        console.log("Counts by Source:", bySource);

        console.log("\nSample Items:");
        products.slice(0, 10).forEach(p => {
            console.log(`[${p.source}] ${p.title.slice(0, 50)}... - ₹${p.price}`);
        });
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
