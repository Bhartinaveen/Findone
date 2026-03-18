const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const SITES = [
    {
        name: 'Amazon',
        url: 'https://www.amazon.in/deals',
        color: '#f97316',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
        // Amazon deals page has hero cards with images and discount text
        scrape: async (page) => {
            console.log(`[V3] Scrapping Amazon Deals...`);
            await page.goto('https://www.amazon.in/deals', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 4000));
            return page.evaluate(() => {
                const offers = [];
                // Deal cards on Amazon deals page
                const selectors = [
                    '[data-testid="grid-deal-card"]',
                    '[data-testid="deal-card"]',
                    '.a-carousel-card',
                    '.DealCard-module__cardWrapper___1i97D',
                    '.DealCard',
                    'div[id*="deal-"]',
                    'div[class*="dealCard"]'
                ];
                
                selectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(card => {
                        const img = card.querySelector('img');
                        const title = card.querySelector('.DealTitle, [class*="DealTitle"], .a-truncate-full, .deal-title, [data-testid="deal-card-title"], h3');
                        const link = card.querySelector('a');
                        if (img && img.src && !img.src.includes('data:') && img.width > 50) {
                            const scrapedTitle = title?.innerText?.trim() || img.alt || 'Amazon Deal';
                            // Filter out generic titles
                            if (!scrapedTitle.toLowerCase().includes('placeholder') && scrapedTitle.length > 2) {
                                offers.push({
                                    title: scrapedTitle,
                                    description: 'Exclusive deal – limited time offer',
                                    image: img.src,
                                    link: link?.href || 'https://www.amazon.in/deals',
                                });
                            }
                        }
                    });
                });
                return offers.slice(0, 4);
            });
        }
    },
    {
        name: 'Flipkart',
        url: 'https://www.flipkart.com',
        color: '#2563eb',
        logo: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-255e8e.svg',
        scrape: async (page) => {
            await page.goto('https://www.flipkart.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 3000));
            return page.evaluate(() => {
                const offers = [];
                // Flipkart homepage hero banners / sale banners
                const selectors = [
                    '._1YokD2 img', // Homepage banner images
                    '[class*="Banner"] img',
                    '[class*="DealCard"] img',
                    'img[alt*="Sale"]', 'img[alt*="Offer"]', 'img[alt*="Deal"]', 'img[alt*="Off"]',
                    '.CXW8mj img',
                    'div[data-id] img',
                    'img[src*="flap"]'
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(img => {
                        if (offers.length >= 4) return;
                        if (!img.src || img.src.includes('data:') || img.width < 100) return;
                        // Avoid duplicates
                        if (offers.some(o => o.image === img.src)) return;
                        
                        const link = img.closest('a');
                        offers.push({
                            title: img.alt || 'Flipkart Offer',
                            description: 'Exclusive deal on Flipkart – shop now!',
                            image: img.src,
                            link: link?.href ? (link.href.startsWith('/') ? 'https://www.flipkart.com' + link.href : link.href) : 'https://www.flipkart.com',
                        });
                    });
                });
                return offers.slice(0, 4);
            });
        }
    },
    {
        name: 'Myntra',
        url: 'https://www.myntra.com',
        color: '#ec4899',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png',
        scrape: async (page) => {
            await page.goto('https://www.myntra.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2500));
            return page.evaluate(() => {
                const offers = [];
                // Myntra uses lazy-loaded images, look for banners/sliders
                const selectors = [
                    '.desktop-bannersrv img',
                    '.slick-slide img',
                    '[class*="banner"] img',
                    '[class*="Banner"] img',
                    'img[alt*="Sale"]', 'img[alt*="Offer"]', 'img[alt*="Off"]',
                    'img[alt*="New"]', 'img[alt*="Launch"]',
                    '.homepage-section img',
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(img => {
                        if (offers.length >= 4) return;
                        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
                        if (!src || src.includes('data:') || img.width < 150) return;
                        const link = img.closest('a');
                        offers.push({
                            title: img.alt || 'Myntra Style Sale',
                            description: 'Fashion deals on Myntra – explore now',
                            image: src,
                            link: link?.href || 'https://www.myntra.com',
                        });
                    });
                });
                return offers.slice(0, 4);
            });
        }
    },
    {
        name: 'Ajio',
        url: 'https://www.ajio.com',
        color: '#6366f1',
        logo: 'https://assets.ajio.com/static/img/Ajio-Logo.svg',
        scrape: async (page) => {
            await page.goto('https://www.ajio.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 3000));
            return page.evaluate(() => {
                const offers = [];
                const selectors = [
                    '.promo img', '.banner img',
                    '[class*="banner"] img', '[class*="Banner"] img',
                    '[class*="HeroBanner"] img', '[class*="promo"] img',
                    'img[alt*="Sale"]', 'img[alt*="Off"]', 'img[alt*="Deal"]',
                    '.dynamic-slider img', '.rilrtl-lazy-img',
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(img => {
                        if (offers.length >= 4) return;
                        const src = img.src || img.getAttribute('data-src') || '';
                        if (!src || src.includes('data:') || src.includes('transparent') || img.width < 150) return;
                        const link = img.closest('a');
                        offers.push({
                            title: img.alt || 'Ajio Style Sale',
                            description: 'Exclusive fashion deals at Ajio',
                            image: src,
                            link: link?.href || 'https://www.ajio.com',
                        });
                    });
                });
                return offers.slice(0, 4);
            });
        }
    },
    {
        name: 'Meesho',
        url: 'https://www.meesho.com',
        color: '#a855f7',
        logo: 'https://images.meesho.com/images/marketing/1598498696_512.webp',
        scrape: async (page) => {
            await page.goto('https://www.meesho.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2500));
            return page.evaluate(() => {
                const offers = [];
                const selectors = [
                    'img[alt*="Banner"]', 'img[alt*="banner"]',
                    'img[alt*="Sale"]', 'img[alt*="Deal"]', 'img[alt*="Off"]',
                    '[class*="Banner"] img', '[class*="banner"] img',
                    '[class*="carousel"] img', '[class*="Carousel"] img',
                    '.swiper-slide img',
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(img => {
                        if (offers.length >= 4) return;
                        const src = img.src || img.getAttribute('data-src') || '';
                        if (!src || src.includes('data:') || img.width < 100) return;
                        const link = img.closest('a');
                        offers.push({
                            title: img.alt || 'Meesho Special Offer',
                            description: 'Amazing deals at the lowest prices on Meesho',
                            image: src,
                            link: link?.href || 'https://www.meesho.com',
                        });
                    });
                });
                return offers.slice(0, 4);
            });
        }
    },
    {
        name: 'Nykaa',
        url: 'https://www.nykaa.com',
        color: '#fc2779',
        logo: 'https://acsb.nykaa.com/media/wysiwyg/2023/nykaa-app-icons/Nykaa_app.png',
        scrape: async (page) => {
            await page.goto('https://www.nykaa.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 3000));
            return page.evaluate(() => {
                const offers = [];
                const selectors = [
                    '.css-19r3kcv img', '.css-1dh5fay img',
                    '[class*="banner"] img', '[class*="Banner"] img',
                    '[class*="carousel"] img', '[class*="slider"] img',
                    'img[alt*="sale"]', 'img[alt*="Sale"]', 'img[alt*="Off"]',
                    'img[alt*="new"]', 'img[alt*="offer"]',
                ];
                selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(img => {
                        if (offers.length >= 4) return;
                        const src = img.src || img.getAttribute('data-src') || '';
                        if (!src || src.includes('data:') || img.width < 100) return;
                        
                        let title = img.alt || '';
                        // Filter out numeric IDs often found in Nykaa alt tags
                        if (!title || /^\d+$/.test(title) || title.length < 3) {
                            title = 'Nykaa Beauty Sale';
                        }

                        const link = img.closest('a');
                        offers.push({
                            title: title,
                            description: 'Top beauty & wellness deals on Nykaa',
                            image: src,
                            link: link?.href ? (link.href.startsWith('/') ? 'https://www.nykaa.com' + link.href : link.href) : 'https://www.nykaa.com',
                        });
                    });
                });
                return offers.slice(0, 4);
            });
        }
    }
];

// Hardcoded real offer fallbacks so UI always has beautiful cards
const FALLBACK_OFFERS = [
    {
        source: 'Amazon',
        color: '#f97316',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
        title: 'Today\'s Great Indian Festival Sale',
        description: 'Up to 80% off on electronics, fashion & more',
        link: 'https://www.amazon.in/deals',
        image: 'https://m.media-amazon.com/images/G/31/img21/Deals/XCM_Manual_1465523_5028456_ap_IN_deals_sl_gw_1500x300._CB628337556_.jpg',
    },
    {
        source: 'Flipkart',
        color: '#2563eb',
        logo: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-255e8e.svg',
        title: 'Big Billion Days – Biggest Sale of the Year',
        description: 'Massive discounts on all categories',
        link: 'https://www.flipkart.com',
        image: 'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/e8b96893de7b22e3.jpg',
    },
    {
        source: 'Myntra',
        color: '#ec4899',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png',
        title: 'End of Reason Sale – Fashion at Best Prices',
        description: 'Flat 30–80% off on top fashion brands',
        link: 'https://www.myntra.com',
        image: 'https://assets.myntrassets.com/assets/images/2024/FEBRUARY/16/Q2dDu50t_45c43b6c01494baa807649e3ca5f66c7.jpg',
    },
    {
        source: 'Ajio',
        color: '#6366f1',
        logo: 'https://assets.ajio.com/static/img/Ajio-Logo.svg',
        title: 'AJIO Big Bold Sale – Up to 70% Off',
        description: 'Premium fashion at unbeatable prices',
        link: 'https://www.ajio.com/sale',
        image: 'https://assets.ajio.com/medias/sys_master/root/20240305/Rq0m/65e70ab4ddf77915193e5c6b/-561Wx480H-466467506-multi-MODEL.jpg',
    },
    {
        source: 'Meesho',
        color: '#a855f7',
        logo: 'https://images.meesho.com/images/marketing/1598498696_512.webp',
        title: 'Meesho Mega Blockbuster Sale',
        description: 'Lowest prices guaranteed – shop fresh arrivals',
        link: 'https://www.meesho.com',
        image: 'https://images.meesho.com/images/marketing/1709099657131_512.webp',
    },
    {
        source: 'Nykaa',
        color: '#fc2779',
        logo: 'https://acsb.nykaa.com/media/wysiwyg/2023/nykaa-app-icons/Nykaa_app.png',
        title: 'Nykaa Pink Friday Sale – Beauty & Wellness',
        description: 'Exclusive discounts on skincare, makeup & more',
        link: 'https://www.nykaa.com/sale',
        image: 'https://acsb.nykaa.com/media/wysiwyg/2024/HOMEPAGE/EOS/june24-desktop-eossale.jpg',
    },
];

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

        for (const site of SITES) {
            try {
                console.log(`[V3] Checking deals on ${site.name}...`);
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

                const siteOffers = await site.scrape(page);

                if (siteOffers && siteOffers.length > 0) {
                    siteOffers.forEach(o => {
                        // Deduplicate by image URL
                        if (!offers.some(ex => ex.image === o.image)) {
                            offers.push({
                                ...o,
                                source: site.name,
                                logo: site.logo,
                                color: site.color,
                                is_live: true,
                                is_fallback: false,  // real scraped offer
                            });
                        }
                    });
                    console.log(`  → ${site.name}: got ${siteOffers.length} offers`);
                } else {
                    console.log(`  → ${site.name}: no offers scraped, [V3] injecting fallback`);
                    // Inject fallback for this site
                    const fallback = FALLBACK_OFFERS.find(f => f.source === site.name);
                    if (fallback) {
                        offers.push({
                            ...fallback,
                            is_live: true,
                            is_fallback: true
                        });
                    }
                }

                await page.close();

            } catch (err) {
                console.error(`[V3] Error scraping ${site.name}:`, err.message);
                const fallback = FALLBACK_OFFERS.find(f => f.source === site.name);
                if (fallback) {
                    offers.push({
                        ...fallback,
                        is_live: true,
                        is_fallback: true
                    });
                }
            }
        }

    } catch (error) {
        console.error("Global Offer Scrape Error:", error.message);
    } finally {
        if (browser) await browser.close();
    }

    console.log(`[Offers] [V3] Total offers (scraped + fallback): ${offers.length}`);

    // Shuffle and return
    return offers.sort(() => Math.random() - 0.5);
}

module.exports = { scrapeOffers };
