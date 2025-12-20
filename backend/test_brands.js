const { scrapeProducts } = require('./scraper/index');

const brands = ['Oppo mobile', 'Vivo mobile', 'iPhone 15', 'Realme phone'];

async function testBrands() {
    for (const brand of brands) {
        console.log(`\n\n=== TESTING BRAND: ${brand} ===`);
        try {
            const results = await scrapeProducts(brand);
            const counts = {};
            results.forEach(r => counts[r.source] = (counts[r.source] || 0) + 1);
            console.log(`Results for ${brand}:`, counts);
        } catch (e) {
            console.error(`Failed to scrape ${brand}:`, e.message);
        }
    }
}

testBrands();
