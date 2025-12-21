const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeOffers() {
    let browser = null;
    let offers = [];

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1366,768',
                '--disable-infobars',
            ]
        });

        const sites = [
            {
                name: 'Amazon',
                url: 'https://www.amazon.in/',
                color: '#f97316', // Orange
                logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
                selectors: ['.hero-image', '#desktop-banner', '.a-carousel-card']
            },
            {
                name: 'Flipkart',
                url: 'https://www.flipkart.com/',
                color: '#2563eb', // Blue
                logo: 'https://seeklogo.com/images/F/flipkart-logo-C9E637A758-seeklogo.com.png',
                selectors: ['.items', '.carousel-item', 'img[alt*="Offer"]']
            },
            {
                name: 'Myntra',
                url: 'https://www.myntra.com/',
                color: '#ec4899', // Pink
                logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png',
                selectors: ['.banner-image', 'a[href*="offer"]']
            },
            {
                name: 'Ajio',
                url: 'https://www.ajio.com/',
                color: '#1e293b', // Dark
                logo: 'https://assets.ajio.com/static/img/Ajio-Logo.svg',
                selectors: ['.rilrtl-lazy-img', 'img[class*="banner"]']
            },
            {
                name: 'Meesho',
                url: 'https://www.meesho.com/',
                color: '#a855f7', // Purple
                logo: 'https://t3.ftcdn.net/jpg/04/16/25/14/360_F_416251485_9qX2a6a8b7a6c9d8e7f6g5h4i3j2k1l0.jpg', // Placeholder for Meesho
                selectors: ['img[alt*="Banner"]', 'img[alt*="Sale"]']
            },
            {
                name: 'Nykaa',
                url: 'https://www.nykaa.com/',
                color: '#fc2779', // Pink/Magenta
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Nykaa_New_Logo.svg/1200px-Nykaa_New_Logo.svg.png',
                selectors: ['.css-19r3kcv', 'img[alt*="banner"]', 'img[alt*="sale"]']
            }
        ];

        // Process sites in parallel but limited to avoid crashing
        // For stability, we'll do sequential or small batches. Sequential is safer for detection.
        for (const site of sites) {
            try {
                console.log(`Checking deals on ${site.name}...`);
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                // Fast load
                await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                // Extract Data
                const siteOffers = await page.evaluate((siteName) => {
                    const extracted = [];
                    const keywords = ['sale', 'off', 'deal', 'festival', '%', 'price', 'offer', 'save', 'budget', 'launch', 'new', 'arrival', 'special', 'limited', 'best'];

                    // Helper to check if text is "offer-like"
                    const isOffer = (txt) => {
                        if (!txt || txt.length < 4 || txt.length > 100) return false;
                        const lower = txt.toLowerCase();
                        return keywords.some(k => lower.includes(k));
                    };

                    // 1. Grab Images with ALTs
                    document.querySelectorAll('img').forEach(img => {
                        const alt = img.getAttribute('alt');
                        // Logic to prioritize banner images
                        if (isOffer(alt) && img.width > 200) {
                            extracted.push({
                                title: alt,
                                description: `Exclusive deal on ${siteName}`,
                                link: img.parentElement.tagName === 'A' ? img.parentElement.href : window.location.href,
                                image: img.src
                            });
                        }
                    });

                    // 2. Grab Links with Text
                    // limit to avoid junk
                    let count = 0;
                    document.querySelectorAll('a').forEach(a => {
                        if (count > 10) return;
                        const txt = a.innerText.replace(/\n/g, ' ').trim();
                        // check if parent is heading
                        const isHeading = ['H1', 'H2', 'H3'].includes(a.parentElement.tagName);

                        if ((isOffer(txt) || isHeading) && txt.length > 5 && !extracted.some(e => e.title === txt)) {
                            extracted.push({
                                title: txt,
                                description: `Limited time offer`,
                                link: a.href,
                                image: null // Text only
                            });
                            count++;
                        }
                    });

                    // Return top 5 unique
                    return extracted.slice(0, 5);
                }, site.name);

                if (siteOffers.length > 0) {
                    siteOffers.forEach(o => {
                        offers.push({
                            ...o,
                            source: site.name,
                            logo: site.logo,
                            color: site.color,
                            is_live: true
                        });
                    });
                }

                await page.close();

            } catch (err) {
                console.error(`Error scraping ${site.name}:`, err.message);
                // Push a generic fallback if scraping fails, to keep UI populated
                offers.push({
                    title: `${site.name} Featured Sale`,
                    description: "Check out the latest trending offers directly on the site.",
                    link: site.url,
                    source: site.name,
                    logo: site.logo,
                    color: site.color,
                    is_live: true
                });
            }
        }

    } catch (error) {
        console.error("Global Offer Scrape Error:", error);
    } finally {
        if (browser) await browser.close();
    }

    // Sort random to mix sources
    return offers.sort(() => Math.random() - 0.5);
}

module.exports = { scrapeOffers };
