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
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        await page.setUserAgent(userAgent);
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
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

        await page.evaluate(async () => {
            const maxScroll = Math.min(document.body.scrollHeight, 5000);
            let current = 0;
            while (current < maxScroll) {
                window.scrollBy(0, 800);
                current += 800;
                await new Promise(r => setTimeout(r, 150));
            }
        });

        await new Promise(r => setTimeout(r, 1500));

        const reviewText = await page.evaluate(() => {
            const url = window.location.href;
            let reviews = [];
            const clean = (txt) => txt ? txt.replace(/\s+/g, ' ').trim() : '';

            if (url.includes('amazon')) {
                document.querySelectorAll('div[data-hook="review"]').forEach(el => {
                    const body = el.querySelector('span[data-hook="review-body"]');
                    if (body) reviews.push(clean(body.innerText));
                });
                if (reviews.length === 0) {
                    document.querySelectorAll('.review-text-content, .a-size-base.review-text').forEach(el => {
                        reviews.push(clean(el.innerText));
                    });
                }
            } else if (url.includes('flipkart')) {
                const containers = document.querySelectorAll('.ZmyHeS, .col._2wzgFH, ._27M-N_, ._2181Yn');
                containers.forEach(row => {
                    const contentDiv = row.querySelector('.t-ZTKy, ._2-NqiM');
                    if (contentDiv) reviews.push(clean(contentDiv.innerText));
                    else reviews.push(clean(row.innerText));
                });
                if (reviews.length === 0) {
                    document.querySelectorAll('div.t-ZTKy > div > div').forEach(el => reviews.push(clean(el.innerText)));
                }
            } else if (url.includes('meesho')) {
                const cards = document.querySelectorAll('[class*="ReviewCard"], .sc-bcPKhP');
                cards.forEach(card => {
                    const textEl = card.querySelector('[class*="Comment"], .sc-hKgILg');
                    if (textEl) reviews.push(clean(textEl.innerText));
                });
            } else if (url.includes('myntra')) {
                document.querySelectorAll('.user-review-reviewTextWrapper, .detailed-reviews-userReviewText').forEach(el => {
                    reviews.push(clean(el.innerText));
                });
            } else if (url.includes('ajio')) {
                document.querySelectorAll('.review-content, .customer-review-text, .review-desc').forEach(el => {
                    reviews.push(clean(el.innerText));
                });
            }

            if (reviews.length === 0) {
                const genericSelectors = ['div.review-text', 'p.review-body', '.review-content', '[itemprop="reviewBody"]', '.comment-text'];
                genericSelectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => reviews.push(clean(el.innerText)));
                });
            }

            return reviews.filter(r => r.length > 10).slice(0, 30).join('\n\n');
        });

        if (!reviewText || reviewText.length < 50) {
            console.log("Structured scraping failed, falling back to paragraph grab...");
            const rawText = await page.evaluate(() => {
                let txt = "";
                document.querySelectorAll('p, div, span').forEach(p => {
                    if (p.innerText.length > 40 && p.innerText.length < 500 && p.innerText.includes(' ')) {
                        if (!p.innerText.includes('{') && !p.innerText.includes('function')) {
                            txt += p.innerText + "\n";
                        }
                    }
                });
                return txt;
            });
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

async function scrapeRatingDistribution(productUrl, fallbackRating = null) {
    // ── URL SANITISATION ──────────────────────────────────────────────────────
    // The scraper sometimes stores concatenated URLs like:
    //   "https://ajio.com/product/p/123?ment-Lightweight/dp/B0.../ref=sr_1_10"
    // (an Ajio URL with an Amazon path appended in the query string).
    // Clean this before ever launching a browser.
    let cleanUrl = productUrl;
    try {
        const parsed = new URL(productUrl);
        const host = parsed.hostname;
        const search = parsed.search || '';
        // Ajio product pages need no query parameters — strip them all
        if (host.includes('ajio.com')) {
            cleanUrl = `${parsed.origin}${parsed.pathname}`;
        }
        // If query string embeds another site's path (concatenation artefact), strip it
        else if (search && (
            search.includes('/dp/') ||          // Amazon product path
            search.includes('/p/') ||           // Flipkart/Ajio pattern
            search.match(/amazon|flipkart|myntra|meesho|nykaa/i)
        )) {
            cleanUrl = `${parsed.origin}${parsed.pathname}`;
        }
        if (cleanUrl !== productUrl) {
            console.log(`[Ratings] URL sanitised → ${cleanUrl}`);
        }
    } catch (e) {
        // Completely un-parseable URL — skip browser, use fallback immediately
        console.warn(`[Ratings] Invalid URL supplied, using fallback rating. URL: ${String(productUrl).slice(0, 80)}`);
        if (fallbackRating && parseFloat(fallbackRating) > 0) {
            const est = estimateDistribution(parseFloat(fallbackRating));
            const fb = {};
            [5,4,3,2,1].forEach(s => fb[s] = { count: 0, percentage: est[s] });
            return fb;
        }
        return { 5:{count:0,percentage:0}, 4:{count:0,percentage:0}, 3:{count:0,percentage:0}, 2:{count:0,percentage:0}, 1:{count:0,percentage:0} };
    }
    // ─────────────────────────────────────────────────────────────────────────
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
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        await page.setUserAgent(userAgent);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        });

        // Intercept XHR/fetch API responses that may contain rating data loaded dynamically
        let interceptedRating = null;
        await page.setRequestInterception(true);
        page.on('request', req => req.continue());
        page.on('response', async (response) => {
            try {
                const url = response.url();
                const ct = response.headers()['content-type'] || '';
                if (!ct.includes('json')) return;
                if (url.includes('rating') || url.includes('review') || url.includes('aggregate')) {
                    const json = await response.json().catch(() => null);
                    if (!json) return;
                    const str = JSON.stringify(json);
                    const distMatch = str.match(/"ratingDistribution"\s*:\s*(\{[^}]+\})/);
                    if (distMatch) {
                        try { interceptedRating = JSON.parse(distMatch[1]); } catch(e) {}
                    }
                    if (!interceptedRating) {
                        const allKeysPresent = [5,4,3,2,1].every(s => json[s] !== undefined || json[`${s}`] !== undefined);
                        if (allKeysPresent) interceptedRating = json;
                    }
                }
            } catch(e) {}
        });

        console.log(`[Ratings] Fetching: ${cleanUrl}`);
        // Small random delay to avoid bot patterns
        await new Promise(r => setTimeout(r, Math.random() * 2000 + 500));
        await page.goto(cleanUrl, { 
            waitUntil: cleanUrl.includes('ajio') ? 'networkidle2' : 'domcontentloaded', 
            timeout: 60000 
        });

        // No hardcoded wait anymore - we will use waitForSelector which is dynamic

        // Wait specifically for rating-related elements to appear on the page
        const siteSelectors = {
            amazon: '.a-histogram-row',
            flipkart: '._2En60Z, ._3EnG0X, ._27M-N_',
            myntra: '[class*="index-ratingBarContainer"]',
            ajio: '[aria-label*="star rating"], [class*="RatingBar"], [class*="ratingBar"], .rating-bar',
            nykaa: '[class*="ratingCount"], [class*="RatingBar"], [class*="ProductRatings-Total"]',
            meesho: '[class*="RatingBar"], [class*="ProgressBar"]',
        };
        const domain = Object.keys(siteSelectors).find(d => cleanUrl.includes(d));
        if (domain) {
            try {
                // Wait up to 10s for Ajio, 6s for others, but return INSTANTLY if found
                const timeout = domain === 'ajio' ? 10000 : 6000;
                await page.waitForSelector(siteSelectors[domain], { timeout });
                console.log(`[Ratings] Found rating selector for ${domain}`);
            } catch(e) {
                console.log(`[Ratings] Selector wait timed out for ${domain}, continuing...`);
            }
        }

        // Scroll down slowly to trigger lazy-loaded rating sections
        // Optimization: Stop if selector is found after a scroll
        await page.evaluate(async (selector) => {
            let current = 0;
            while (current < 8000) {
                // Check if data is already visible
                if (selector && document.querySelector(selector)) break;
                
                window.scrollBy(0, 1000);
                current += 1000;
                await new Promise(r => setTimeout(r, 200));
                if (current > 3000 && current >= document.body.scrollHeight) break;
            }
        }, siteSelectors[domain] || null);

        // Reduced wait after scrolling
        await new Promise(r => setTimeout(r, 1000));

        // STRATEGY 1: Use intercepted API response (most reliable for SPAs)
        if (interceptedRating) {
            console.log(`[Ratings] Got rating from network interception`);
            const result = { 5: { count: 0, percentage: 0 }, 4: { count: 0, percentage: 0 }, 3: { count: 0, percentage: 0 }, 2: { count: 0, percentage: 0 }, 1: { count: 0, percentage: 0 } };
            let total = 0;
            [5,4,3,2,1].forEach(s => {
                const v = interceptedRating[s] || interceptedRating[`${s}`] || 0;
                result[s].count = parseInt(v) || 0;
                total += result[s].count;
            });
            if (total > 0) {
                [5,4,3,2,1].forEach(s => { result[s].percentage = Math.round((result[s].count / total) * 100); });
            }
            if (Object.values(result).some(v => v.count > 0 || v.percentage > 0)) return result;
        }

        // STRATEGY 2: Parse application/ld+json structured data (works on many sites)
        const ldJsonRating = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    const items = Array.isArray(data) ? data : [data];
                    for (const item of items) {
                        const agg = item.aggregateRating ||
                            (item['@graph'] && item['@graph'].find(g => g && g.aggregateRating) || {}).aggregateRating;
                        if (agg) {
                            const score = parseFloat(agg.ratingValue || agg.rating || 0);
                            const count = parseInt(agg.reviewCount || agg.ratingCount || 0);
                            if (score >= 1 && score <= 5) return { score, count };
                        }
                    }
                } catch(e) {}
            }
            return null;
        });

        // STRATEGY 3: DOM-based extraction with site-specific selectors
        const ratings = await page.evaluate(() => {
            const url = window.location.href;
            let result = {
                5: { count: 0, percentage: 0 },
                4: { count: 0, percentage: 0 },
                3: { count: 0, percentage: 0 },
                2: { count: 0, percentage: 0 },
                1: { count: 0, percentage: 0 }
            };

            const convertToPct = (res) => {
                const total = Object.values(res).reduce((a, b) => a + (b.count || 0), 0);
                if (total > 0) {
                    for (let s in res) {
                        res[s].percentage = Math.round(((res[s].count || 0) / total) * 100);
                    }
                }
                return res;
            };

            // AMAZON
            if (url.includes('amazon')) {
                document.querySelectorAll('.a-histogram-row').forEach(row => {
                    const starText = row.innerText.match(/(\d)\s*star/i);
                    const percentText = row.innerText.match(/(\d+)%/);
                    const countText = row.innerText.match(/\((\d+,?\d*)\)/) || row.getAttribute('title')?.match(/(\d+)/);
                    if (starText) {
                        const s = starText[1];
                        if (percentText) result[s].percentage = parseInt(percentText[1]);
                        if (countText) result[s].count = parseInt(countText[1].replace(/,/g, ''));
                    }
                });
            }
            // FLIPKART
            else if (url.includes('flipkart')) {
                // New Flipkart structure often has bars with counts next to them
                const rows = document.querySelectorAll('div._2En60Z, div._3EnG0X, div.pE679W');
                if (rows.length >= 5) {
                    rows.forEach((row, idx) => {
                        const star = 5 - idx;
                        const countEl = row.querySelector('.B6By9N, ._2X0S_Y, span:last-child');
                        if (countEl) {
                            const c = countEl.innerText.replace(/,/g, '').match(/\d+/);
                            if (c) result[star].count = parseInt(c[0]);
                        }
                    });
                    convertToPct(result);
                }
            }
            // MYNTRA
            else if (url.includes('myntra')) {
                const bars = document.querySelectorAll('[class*="index-ratingBarContainer"]');
                bars.forEach((bar, idx) => {
                    const star = 5 - idx;
                    const countEl = bar.querySelector('[class*="index-count"]');
                    if (countEl) {
                        const c = countEl.innerText.replace(/,/g, '').match(/\d+/);
                        if (c) result[star].count = parseInt(c[0]);
                    }
                });
                convertToPct(result);
            }
            // NYKAA
            else if (url.includes('nykaa')) {
                const rows = document.querySelectorAll('[class*="ProductRatings-Total"], [class*="RatingBar"]');
                if (rows.length >= 5) {
                    rows.forEach((row, idx) => {
                        const star = 5 - idx;
                        const countMatch = row.innerText.match(/\d+/);
                        if (countMatch) result[star].count = parseInt(countMatch[0]);
                    });
                    convertToPct(result);
                }
            }
            // AJIO
            else if (url.includes('ajio')) {
                // Method 1: ARIA labels (most reliable if rendered)
                let listItems = document.querySelectorAll('li[aria-labelledby^="ratings"]');
                if (listItems.length === 0) {
                   listItems = Array.from(document.querySelectorAll('li')).filter(li => 
                       li.querySelector('[aria-label*="star ratings"]')
                   );
                }

                listItems.forEach(li => {
                    const starEl = li.querySelector('[aria-label$="star ratings"]');
                    const pctEl = li.querySelector('[id^="ratingspercentage"], span:last-child');
                    if (starEl && pctEl) {
                        const starMatch = starEl.getAttribute('aria-label').match(/(\d)/);
                        const pctMatch = pctEl.innerText.match(/(\d+)%/);
                        if (starMatch && pctMatch) {
                            const star = parseInt(starMatch[1], 10);
                            result[star].percentage = parseInt(pctMatch[1], 10);
                        }
                    }
                });

                // Method 2: Text-based fallback (if labels missing but text exists)
                if (Object.values(result).every(v => v.percentage === 0)) {
                    // Look for divs/spans that might contain star counts and percentages
                    document.querySelectorAll('div, li, span').forEach(el => {
                        if (el.children.length > 5) return; // avoid large containers
                        const txt = el.innerText;
                        const starMatch = txt.match(/^([1-5])\s*(?:★|star|[*])/i) || txt.match(/([1-5])\s*<img/i);
                        const pctMatch = txt.match(/(\d+)%/);
                        if (starMatch && pctMatch) {
                            result[starMatch[1]].percentage = parseInt(pctMatch[1], 10);
                        }
                    });
                }
                
                const countEl = document.querySelector('[aria-label*="star rating by"], ._3AxgC');
                if (countEl) {
                    const txt = countEl.getAttribute('aria-label') || countEl.innerText;
                    const countMatch = txt.match(/(?:by\s+)?([\d,]+)\s+Customer/i);
                    if (countMatch) {
                        const totalCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
                        [5,4,3,2,1].forEach(s => {
                            if (result[s].percentage > 0 && totalCount > 0) {
                                result[s].count = Math.round((result[s].percentage / 100) * totalCount);
                            }
                        });
                    }
                }
            }

            // Fallback for percentages if only bars found
            const hasData = Object.values(result).some(v => v.count > 0 || v.percentage > 0);
            if (!hasData) {
                // Try scanning for "5★ 76%" style patterns
                const bodyText = document.body.innerText;
                [5,4,3,2,1].forEach(s => {
                    const reg = new RegExp(s + '\\s*(?:★|\\*|star)s?\\s*(\\d+)(?:%|\\s*\\()', 'i');
                    const m = bodyText.match(reg);
                    if (m) result[s].percentage = parseInt(m[1]);
                });
            }

            return result;
        });

        // STRATEGY 4: Use ld+json aggregate score to estimate distribution
        const finalTotal = Object.values(ratings).reduce((a, b) => a + (b.percentage || 0), 0);
        if (finalTotal === 0 && ldJsonRating) {
            console.log(`[Ratings] Using ld+json aggregate: ${ldJsonRating.score}`);
            const est = estimateDistribution(ldJsonRating.score);
            const res = {};
            [5,4,3,2,1].forEach(s => res[s] = { count: 0, percentage: est[s] });
            return res;
        }

        // STRATEGY 5: Last resort — scan page text for ANY float rating like "4.2"
        if (finalTotal === 0) {
            const bodyText = await page.evaluate(() => document.body.innerText);
            const patterns = [
                /(\d\.\d)\s*\/\s*5/i,
                /(\d\.\d)\s*out\s*of\s*5/i,
                /rated?\s*[:\s]*(\d\.\d)/i,
                /(\d\.\d)\s*★/,
                /★\s*(\d\.\d)/,
                /average[^0-9]*(\d\.\d)/i,
                /(\d\.\d)\s*(?:stars?|★|\*)/i,
            ];
            for (const pat of patterns) {
                const m = bodyText.match(pat);
                if (m) {
                    const v = parseFloat(m[1]);
                    if (v >= 1 && v <= 5) {
                        console.log(`[Ratings] Estimated from text score: ${v}`);
                        const est = estimateDistribution(v);
                        const res = {};
                        [5,4,3,2,1].forEach(s => res[s] = { count: 0, percentage: est[s] });
                        return res;
                    }
                }
            }
            
            // STRATEGY 6: Guaranteed fallback using passed known rating from database
            if (fallbackRating && parseFloat(fallbackRating) > 0) {
                console.log(`[Ratings] Estimated from DB fallback rating: ${fallbackRating}`);
                const est = estimateDistribution(parseFloat(fallbackRating));
                const res = {};
                [5,4,3,2,1].forEach(s => res[s] = { count: 0, percentage: est[s] });
                return res;
            }
        }

        console.log(`[Ratings] Final for ${productUrl.slice(0,60)}:`, JSON.stringify(ratings));
        return ratings;

    } catch (e) {
        console.error("Rating Distribution Error:", e.message);
        return { 5: {count:0, percentage:0}, 4: {count:0, percentage:0}, 3: {count:0, percentage:0}, 2: {count:0, percentage:0}, 1: {count:0, percentage:0} };
    } finally {
        if (browser) await browser.close();
    }
}

function estimateDistribution(score) {
    if (score >= 4.5) return { 5: 70, 4: 20, 3: 5,  2: 3,  1: 2  };
    if (score >= 4.0) return { 5: 55, 4: 25, 3: 10, 2: 5,  1: 5  };
    if (score >= 3.5) return { 5: 40, 4: 30, 3: 15, 2: 5,  1: 10 };
    if (score >= 3.0) return { 5: 25, 4: 25, 3: 30, 2: 10, 1: 10 };
    if (score >= 2.0) return { 5: 10, 4: 15, 3: 25, 2: 30, 1: 20 };
    return             { 5: 5,  4: 5,  3: 10, 2: 30, 1: 50 };
}

module.exports = { scrapeReviews, scrapeRatingDistribution };
