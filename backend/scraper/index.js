const puppeteer = require('puppeteer');
const { getMockProducts } = require('./mockData');

async function scrapeProducts(query = 't-shirt') {
   console.log(`--- SCRAPER UPDATED V2 Loaded ---`);
   console.log(`Starting real scrape for: ${query}`);

   try {
      const browser = await puppeteer.launch({
         headless: "new",
         args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled']
      });

      // Scrape all sites concurrently
      const results = await Promise.all([
         // Working
         scrapeSite(browser, `https://www.meesho.com/search?q=${encodeURIComponent(query)}`, 'Meesho', 'div[class*="ProductCard"], div[class*="NewProductCard"]', query),
         // Amazon: Added 's-card-container' and generic 'sg-col-inner' wrapper fallbacks
         scrapeSite(browser, `https://www.amazon.in/s?k=${encodeURIComponent(query)}`, 'Amazon', 'div.s-result-item[data-component-type="s-search-result"], div.s-card-container, div.sg-col-4-of-12', query),

         // Failing - Updated Selectors & Sorts
         scrapeSite(browser, `https://www.myntra.com/${query.trim().replace(/\s+/g, '-')}`, 'Myntra', 'li.product-base, div.product-card', query),
         // Flipkart: Added new Common class 'cPHDOP' and 'slAVV4'
         // Flipkart: Added generic 'div[data-id]' which is very consistent
         scrapeSite(browser, `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&sort=popularity`, 'Flipkart', 'div._1AtVbE, div._13oc-S, div.cPHDOP, div.slAVV4, div[data-id]', query),
         scrapeSite(browser, `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`, 'Ajio', 'div.item, div.rilrtl-products-list__item', query),
         scrapeSite(browser, `https://www.nykaa.com/search/result/?q=${encodeURIComponent(query)}&sort=popularity`, 'Nykaa', 'div.product-wrapper, div.css-d5z3ro', query),

         // Failures: Broadened Selectors
         scrapeSite(browser, `https://www.croma.com/searchB?q=${encodeURIComponent(query)}&sort=plow`, 'Croma', 'div.product-item, div.cp-product, div.product-card, div.plp-card', query),
         scrapeSite(browser, `https://www.decathlon.in/search?query=${encodeURIComponent(query)}`, 'Decathlon', 'div.product-card-container, div.card, div.product-card-desc, div.product-card-body', query),
         scrapeSite(browser, `https://www.jiomart.com/search/${encodeURIComponent(query)}`, 'JioMart', 'div.jm-col-3, div.ais-InfiniteHits-item, div.plp-card-wrapper, div.product-card, div.card-container', query)
      ]);

      await browser.close();

      const allProducts = results.flat();
      console.log(`Total scraped items: ${allProducts.length}`);

      if (allProducts.length === 0) {
         console.log('No products found via scraping. Returning empty list.');
         return [];
      }

      return allProducts;

   } catch (error) {
      console.warn('Scraping error:', error.message);
      return [];
   }
}

async function scrapeSite(browser, url, source, selector, query) {
   try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

      console.log(`Navigating to ${source}: ${url}`);

      // OPTIMIZATION: Block Fonts/Media but verify Images
      // await page.setRequestInterception(true);
      // page.on('request', (req) => {
      //    // Allow images to load so we can check dimensions
      //    if (['stylesheet', 'font', 'media'].includes(req.resourceType())) {
      //       req.abort();
      //    } else {
      //       req.continue();
      //    }
      // });

      await page.setViewport({ width: 1366, height: 768 }); // Default Desktop

      // Site-specific Navigation Tweaks
      let waitCond = 'networkidle2';
      if (source === 'Croma' || source === 'JioMart' || source === 'Decathlon') {
         waitCond = 'domcontentloaded'; // These sites have heavy analytics that stall networkidle
      }

      await page.goto(url, { waitUntil: waitCond, timeout: 60000 });

      // Auto-Scroll (FASTER)
      await page.evaluate(async () => {
         await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 800; // Larger jumps
            const timer = setInterval(() => {
               window.scrollBy(0, distance);
               totalHeight += distance;
               // Stop if we've scrolled enough for ~30 items (approx 8-10k pixels)
               if (totalHeight >= document.body.scrollHeight || totalHeight > 10000) {
                  clearInterval(timer);
                  resolve();
               }
            }, 100); // Faster Interval
         });

         // WAIT for images to settle/load after scrolling
         await new Promise(r => setTimeout(r, 2000));
      });

      const items = await page.evaluate((source, selector, query) => {
         const results = [];
         const cards = document.querySelectorAll(selector);

         // Helper to safely extract best image using scoring AND dimensions
         const getBestImage = (card) => {
            const images = Array.from(card.querySelectorAll('img'));
            if (images.length === 0) return '';

            let bestImg = '';
            let bestScore = -Infinity;

            images.forEach(img => {
               let score = 0;
               let url = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('srcset')?.split(' ')[0] || img.src;

               if (!url) return;

               // STRICT IMAGE FILTER: Reject data URIs usually (unless really large, but safer to skip for scraping)
               if (url.startsWith('data:')) return;

               // STRICT DIMENSION CHECK
               // If image is loaded and tiny (icon/pixel), reject it.
               if (img.complete && (img.naturalWidth > 0 && img.naturalWidth < 50)) {
                  return;
               }

               // Scoring Rules
               const lowerUrl = url.toLowerCase();

               // Penalize icons/suspicious names
               if (lowerUrl.includes('icon')) score -= 50;
               if (lowerUrl.includes('logo')) score -= 50;
               if (lowerUrl.includes('star')) score -= 50; // Increased penalty (User reported stars)
               if (lowerUrl.includes('trust')) score -= 50; // User reported "Trust" banner
               if (lowerUrl.includes('badge')) score -= 50;
               if (lowerUrl.includes('rating')) score -= 20;
               if (lowerUrl.includes('svg')) score -= 10;

               // Heavy Penalties for Placeholders
               if (lowerUrl.includes('placeholder')) score -= 100;
               if (lowerUrl.includes('loading')) score -= 100;
               if (lowerUrl.includes('blank')) score -= 100;
               if (lowerUrl.includes('pixel')) score -= 100;
               if (lowerUrl.includes('spinner')) score -= 100;
               if (lowerUrl.includes('transparent')) score -= 100;
               if (lowerUrl.includes('1x1')) score -= 100;

               // Boost "Product" looking URLs
               if (lowerUrl.includes('product') || lowerUrl.includes('images')) score += 10;
               if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) score += 5;

               if (score > bestScore) {
                  bestScore = score;
                  bestImg = url;
               }
            });

            // Final Sanity Check for Best Key
            // If the best image is still "bad" (negative score), reject it.
            if (bestScore < -5) return '';

            if (bestImg && (bestImg.includes('placeholder') || bestImg.includes('loading'))) return '';

            return bestImg;
         };

         cards.forEach(card => {
            if (results.length >= 30) return; // Limit to 30 per site (MAXIMUM)

            try {
               let title = 'Unknown Product';
               let price = 0;
               let image_url = '';
               let product_url = '';
               let rating = 0;
               let rating_count = 0;



               // Helper for Ratings
               const extractRating = (text) => {
                  if (!text) return 0;
                  const match = text.match(/(\d(\.\d)?)/);
                  const val = match ? parseFloat(match[1]) : 0;
                  return (val > 0 && val <= 5) ? val : 0;
               };

               // Site specific heuristics
               if (source === 'Meesho') {
                  title = card.innerText.split('\n')[0];
                  const priceMatch = card.innerText.match(/₹[\d,]+/);
                  price = priceMatch ? parseFloat(priceMatch[0].replace(/[^\d.]/g, '')) : 0;

                  image_url = getBestImage(card);
                  if (!image_url || image_url === '') {
                     const meeshoImg = card.querySelector('img[src*="images.meesho.com"]');
                     if (meeshoImg) image_url = meeshoImg.src;
                  }

                  product_url = card.closest('a')?.href;
                  const ratingEl = card.querySelector('span[class*="Rating"]');
                  if (ratingEl) rating = extractRating(ratingEl.innerText);
               }
               else if (source === 'Myntra') {
                  const brand = card.querySelector('h3.product-brand')?.innerText || '';
                  const name = card.querySelector('h4.product-product')?.innerText || '';
                  title = `${brand} ${name}`.trim();

                  const discounted = card.querySelector('.product-discountedPrice');
                  const original = card.querySelector('.product-price');
                  const priceText = discounted ? discounted.innerText : (original ? original.innerText : '');
                  const priceMatch = priceText.match(/[\d,]+/);
                  price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;

                  // Myntra Rating: "4.2 | 1.2k" or separate span
                  const ratingContainer = card.querySelector('.product-ratingsContainer');
                  if (ratingContainer) {
                     const ratingText = ratingContainer.querySelector('span')?.innerText || ratingContainer.innerText;
                     rating = extractRating(ratingText);
                     const countMatch = ratingContainer.innerText.match(/\|?\s*([\d\.k]+)/);
                     // Logic to parse "1.2k" to 1200 could function here, but simple text is okay for now
                  }
               }
               else if (source === 'Amazon') {
                  title = card.querySelector('h2')?.innerText ||
                     card.querySelector('span.a-size-medium')?.innerText ||
                     card.querySelector('span.a-text-normal')?.innerText;

                  const priceEl = card.querySelector('.a-price-whole') || card.querySelector('.a-color-price');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;

                  image_url = getBestImage(card);
                  if (!image_url || image_url === '') {
                     const img = card.querySelector('.s-image');
                     if (img) image_url = img.src;
                  }

                  product_url = card.querySelector('a.a-link-normal')?.href;

                  const ratingEl = card.querySelector('span.a-icon-alt') || card.querySelector('i.a-icon-star-small');
                  if (ratingEl) rating = extractRating(ratingEl.innerText);
               }
               else if (source === 'Flipkart') {
                  title = card.querySelector('div._4rR01T')?.innerText ||
                     card.querySelector('a.s1Q9rs')?.innerText ||
                     card.querySelector('div.KzDlHZ')?.innerText ||
                     card.querySelector('a.wjcEIp')?.innerText;

                  const priceEl = card.querySelector('div._30jeq3') || card.querySelector('div.Nx9bqj');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;

                  if (product_url && product_url.startsWith('/')) {
                     product_url = 'https://www.flipkart.com' + product_url;
                  }

                  const ratingEl = card.querySelector('div._3LWZlK') || card.querySelector('div.XQDdHH'); // Added new class
                  if (ratingEl) rating = extractRating(ratingEl.innerText);
               }
               else if (source === 'Ajio') {
                  title = card.querySelector('.nameCls')?.innerText || card.querySelector('.name')?.innerText;
                  const priceEl = card.querySelector('.price') || card.querySelector('.sp');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;

                  // Ajio Rating
                  const ratingEl = card.querySelector('._1hCbD') || card.querySelector('.rating'); // Common Ajio class
                  if (ratingEl) rating = extractRating(ratingEl.innerText);
               }
               else if (source === 'Nykaa') {
                  title = card.querySelector('.css-xrzmfa')?.innerText || card.querySelector('div.title-wrapper')?.innerText;
                  const priceEl = card.querySelector('.css-111z9ua') || card.querySelector('.css-1k0r4zh');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;

                  // Nykaa Rating
                  const textContent = card.innerText;
                  // Look for "4.5/5" or "4.5" followed by star
                  const ratingMatch = textContent.match(/(\d\.\d)\/\d/) || textContent.match(/(\d\.\d)\s*★/);
                  if (ratingMatch) rating = parseFloat(ratingMatch[1]);
               }
               else if (source === 'Croma') {
                  title = card.querySelector('h3')?.innerText || card.querySelector('div.product-title')?.innerText;
                  const priceEl = card.querySelector('.amount') || card.querySelector('.product-price');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;
               }
               else if (source === 'Decathlon') {
                  title = card.querySelector('.product-title-text')?.innerText || card.querySelector('h3')?.innerText || card.querySelector('h2.card-title')?.innerText;
                  const priceEl = card.querySelector('.price-text') || card.querySelector('.product-price') || card.querySelector('.card-price');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;
                  const ratingEl = card.querySelector('.rating-value');
                  if (ratingEl) rating = extractRating(ratingEl.innerText);
               }
               else if (source === 'JioMart') {
                  title = card.querySelector('.plp-card-details-name')?.innerText || card.querySelector('.name')?.innerText || card.querySelector('div.product-name')?.innerText;
                  const priceEl = card.querySelector('.plp-card-details-price') || card.querySelector('.price') || card.querySelector('span.price-current');
                  price = priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) : 0;
                  image_url = getBestImage(card);
                  product_url = card.querySelector('a')?.href;
               }

               // STRICT VALIDATION (Relaxed slightly for functionality)
               const isGoodImage = image_url &&
                  image_url.startsWith('http') &&
                  !image_url.toLowerCase().includes('placeholder');

               // Allow shorter titles (sometimes brands are short "Puma Shoe")
               const isGoodTitle = title && title.length > 3 && !title.toLowerCase().includes('undefined');
               const isGoodPrice = price > 0;

               // SMART RELEVANCE FILTER (STRICT MODE)
               const isRelevant = (prodTitle, userQuery) => {
                  const lowerTitle = prodTitle.toLowerCase();
                  const lowerQuery = userQuery.toLowerCase();

                  // 1. Negative Filtering (Accessories - Expanded)
                  // If query is "mobile" (no 'cover'), reject 'cover'.
                  // If query is "mobile cover" (has 'cover'), keep 'cover'.
                  const negativeKeywords = ['cover', 'case', 'glass', 'screen guard', 'protector', 'holder', 'pouch',
                     'skin', 'sticker', 'tempered', 'strap', 'band', 'cable', 'charger',
                     'adapter', 'box', 'compatible', 'replacement', 'dummy'];

                  const queryHasNegative = negativeKeywords.some(kw => lowerQuery.includes(kw));

                  if (!queryHasNegative) {
                     const titleHasNegative = negativeKeywords.some(kw => lowerTitle.includes(kw));
                     if (titleHasNegative) return false;
                  }

                  // 2. Strict Brand Matching (Brand Enforcer)
                  const knownBrands = [
                     'apple', 'samsung', 'oppo', 'vivo', 'realme', 'xiaomi', 'mi', 'redmi', 'sony', 'lg', 'nokia',
                     'oneplus', 'google', 'pixel', 'asus', 'nothing', 'motorola', 'moto', 'hp', 'dell', 'lenovo', 'acer',
                     'nike', 'adidas', 'puma', 'sony', 'poco', 'infinix', 'tecno', 'techno', 'itel', 'lava', 'micromax',
                     'honor', 'huawei', 'zte', 'htc', 'iqoo', 'jio', 'blackberry'
                  ];
                  for (const brand of knownBrands) {
                     // If user searched for "Apple" but title doesn't have "Apple", reject it.
                     // Exception: If query is just "phone", don't enforce brand.
                     if (lowerQuery.includes(brand) && !lowerTitle.includes(brand)) {
                        return false;
                     }
                  }

                  // 3. Token Matching (Relevance)
                  // At least 50% of query words must be in title
                  const queryTokens = lowerQuery.split(/\s+/).filter(t => t.length > 2 && !['for', 'with', 'and', 'the', 'price', 'buy', 'online', 'mobile', 'phone', 'smartphone'].includes(t));
                  if (queryTokens.length === 0) return true;

                  const hitCount = queryTokens.filter(token => lowerTitle.includes(token)).length;
                  return (hitCount / queryTokens.length) >= 0.5;
               };

               if (isGoodTitle && isGoodPrice && isGoodImage && isRelevant(title, query)) {
                  results.push({
                     title: title.slice(0, 100),
                     description: `Found on ${source}`,
                     price,
                     category: 'General',
                     image_url,
                     source,
                     product_url,
                     rating: rating || 0,
                     rating_count: rating_count || 0,
                     features: { source, rating }
                  });
               } else {
                  // DEBUGGING REJECTION
                  // console.log(`[${source}] REJECTED: ${title} | Price: ${price} | Img: ${isGoodImage} | Rel: ${isRelevant(title, query)}`);
               }
            } catch (e) {
               // console.log(e);
            }
         });
         return results;
      }, source, selector, query);

      console.log(`Scraped ${items.length} from ${source}`);
      await page.close();
      return items;
   } catch (e) {
      console.log(`Failed to scrape ${source}: ${e.message}`);
      return [];
   }
}

module.exports = { scrapeProducts };
