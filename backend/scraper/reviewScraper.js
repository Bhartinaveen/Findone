const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Pool of User Agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
];

async function scrapeReviews(productUrl) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080',
                '--disable-infobars',
                '--excludeSwitches=enable-automation',
                '--use-gl=egl'
            ]
        });

        const page = await browser.newPage();

        // Randomize User Agent
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        await page.setUserAgent(userAgent);

        // Add extra headers to look like a real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        });

        console.log(`Scraping reviews from: ${productUrl} (UA: ${userAgent.slice(0, 20)}...)`);

        // NetworkIdle0 is strict; domcontentloaded is faster/safer for scraping
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

        // Scroll to trigger lazy loading of reviews
        await page.evaluate(async () => {
            // Scroll down to at least 2000px or bottom of page
            const maxScroll = Math.min(document.body.scrollHeight, 5000);
            let current = 0;
            while (current < maxScroll) {
                window.scrollBy(0, 800);
                current += 800;
                await new Promise(r => setTimeout(r, 150));
            }
        });

        // Wait a bit for dynamic content
        await new Promise(r => setTimeout(r, 1500));

        // Site-Specific Scraping Strategies
        const reviewText = await page.evaluate(() => {
            const url = window.location.href;
            let reviews = [];

            // Helper to clean text
            const clean = (txt) => txt ? txt.replace(/\s+/g, ' ').trim() : '';

            // 1. AMAZON
            if (url.includes('amazon')) {
                // Primary: Data hooks
                document.querySelectorAll('div[data-hook="review"]').forEach(el => {
                    const body = el.querySelector('span[data-hook="review-body"]');
                    if (body) reviews.push(clean(body.innerText));
                });

                // Fallback: Class based
                if (reviews.length === 0) {
                    document.querySelectorAll('.review-text-content').forEach(el => {
                        reviews.push(clean(el.innerText));
                    });
                }
            }
            // 2. FLIPKART
            else if (url.includes('flipkart')) {
                // Class _2wzgFH is common for the review row
                const rows = document.querySelectorAll('div.col._2wzgFH');
                if (rows.length > 0) {
                    rows.forEach(row => {
                        // Review text is usually in a div that expands
                        const contentDiv = row.querySelector('div.t-ZTKy > div > div');
                        if (contentDiv) reviews.push(clean(contentDiv.innerText));
                        else reviews.push(clean(row.innerText));
                    });
                } else {
                    // Fallback to searching for specific classes commonly used
                    document.querySelectorAll('div.t-ZTKy').forEach(el => reviews.push(clean(el.innerText)));
                }
            }
            // 3. MEESHO
            else if (url.includes('meesho')) {
                // Look for "Product Reviews" section
                // Helper: Meesho classes are hashed often, look for structural clues
                const cards = document.querySelectorAll('[class*="ReviewCard"]');
                cards.forEach(card => {
                    const textEl = card.querySelector('[class*="Comment"]');
                    if (textEl) reviews.push(clean(textEl.innerText));
                });
            }
            // 4. MYNTRA
            else if (url.includes('myntra')) {
                document.querySelectorAll('.user-review-reviewTextWrapper').forEach(el => {
                    reviews.push(clean(el.innerText));
                });
            }
            // 5. AJIO (New)
            else if (url.includes('ajio')) {
                // Ajio is tricky, often loads reviews in a separate section or not at all on initial load.
                // Attempt to find common review containers
                const reviewBlocks = document.querySelectorAll('.review-section, .customer-reviews, .review-desc');
                reviewBlocks.forEach(el => reviews.push(clean(el.innerText)));

                if (reviews.length === 0) {
                    // Try finding elements with "review" in class name that are likely text
                    const possibleReviews = document.querySelectorAll('div[class*="review"], span[class*="review"]');
                    possibleReviews.forEach(el => {
                        if (el.innerText.length > 20) reviews.push(clean(el.innerText));
                    });
                }
            }

            // GENERIC FALLBACK (If site specific failed or it's another site)
            if (reviews.length === 0) {
                const genericSelectors = [
                    'div.review-text', 'p.review-body', '.review-content', 'blockquote',
                    '[itemprop="reviewBody"]', '.description', '.comment-text',
                    '[data-testid="review-text"]'
                ];
                genericSelectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => reviews.push(clean(el.innerText)));
                });
            }

            // CLEANUP & LIMIT
            // Join first 25 reviews to avoid token limits
            return reviews.slice(0, 25).join('\n\n');
        });

        // 2nd Pass: If still empty, grab raw paragraphs
        if (!reviewText || reviewText.length < 50) {
            console.log("Structured scraping failed, falling back to paragraph grab...");
            const rawText = await page.evaluate(() => {
                let txt = "";
                // Grab paragraphs that look like sentences (length > 30, contains spaces)
                document.querySelectorAll('p, div, span').forEach(p => {
                    // Heuristic: Avoid nav items, footers, etc. by length and content
                    if (p.innerText.length > 40 && p.innerText.length < 500 && p.innerText.includes(' ')) {
                        // Simple check to avoid code/json dumps
                        if (!p.innerText.includes('{') && !p.innerText.includes('function')) {
                            txt += p.innerText + "\n";
                        }
                    }
                });
                return txt;
            });
            // Limit fallback text size
            return rawText.slice(0, 10000);
        }

        return reviewText;

    } catch (e) {
        console.error("Review Scrape Error:", e.message);
        return "";
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeReviews };
