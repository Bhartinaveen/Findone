const supabase = require('../config/supabaseClient');
const { generateEmbedding } = require('./embeddingService');
const { checkPriceAlerts } = require('./notificationService');

const insertProducts = async (products) => {
    // 0. Deduplicate by title (Postgres upsert fails if batch has duplicates)
    const uniqueProducts = Array.from(new Map(products.map(item => [item.title, item])).values());

    // 1. Upsert Products
    const { data: insertedProducts, error } = await supabase
        .from('products')
        .upsert(uniqueProducts, { onConflict: 'title' })
        .select();

    if (error) {
        console.error('Error inserting products:', error);
        return null;
    }

    if (!insertedProducts || insertedProducts.length === 0) return [];

    // TRIGGER ALERTS (Async, don't await blocking)
    checkPriceAlerts(insertedProducts).catch(err => console.error("Alert Trigger Error:", err));

    // 2. Generate and Insert Embeddings (BATCHED)
    console.log(`Generating embeddings for ${insertedProducts.length} products...`);

    let embeddings = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < insertedProducts.length; i += BATCH_SIZE) {
        const chunk = insertedProducts.slice(i, i + BATCH_SIZE);

        // Process chunk in parallel
        const chunkPromises = chunk.map(async (product) => {
            try {
                const textToEmbed = `${product.title} ${product.description || ''} ${product.category || ''}`;
                // Add explicit small delay per item to further stagger if needed, or rely on batch wait
                const embedding = await generateEmbedding(textToEmbed);
                if (embedding) {
                    return {
                        product_id: product.id,
                        embedding: embedding
                    };
                }
            } catch (err) {
                console.warn(`Failed to embed product ${product.id}:`, err.message);
            }
            return null;
        });

        const chunkResults = await Promise.all(chunkPromises);
        embeddings.push(...chunkResults.filter(e => e !== null));

        // Rate Limit Handling: Wait 1 second between batches
        if (i + BATCH_SIZE < insertedProducts.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    if (embeddings.length > 0) {
        const { error: embedError } = await supabase
            .from('product_embeddings')
            .insert(embeddings);

        if (embedError) console.error("Error inserting embeddings:", embedError);
    }

    // 3. Log Price History (Only if price changed)
    const productIds = insertedProducts.map(p => p.id);

    // Fetch latest price for these products
    const { data: latestHistory } = await supabase
        .from('price_history')
        .select('product_id, price')
        .in('product_id', productIds)
        .order('recorded_at', { ascending: false }); // We need a way to get distinct on product_id or just process locally

    // Simpler approach given Supabase limitations on "distinct on" via JS client sometimes:
    // We can't easily do a "latest per group" efficiently for a batch without a specific RPC or complex query.
    // However, if we assume reasonable batch size, we can fetch latests.
    // Better: Helper function or just fetch all history for these IDs (might be too big).

    // Alternative: Use an RPC or just accept we might query a bit more.
    // Let's rely on a reliable "get latest prices" strategy. 
    // Since we just upserted, the 'products' table has the CURRENT price.
    // We want to know if we should add a NEW history entry.
    // We can try to fetch the *most recent* history entry for each.

    // Let's do a loop for safety or use a custom query if possible. 
    // Optimizing: Let's fetch the latest history entry for each ID using a Postgres view/function would be best, but here:
    // We'll iterate check to be safe and correct, or accept a slight perf hit to query most recent.

    const historyEntries = [];

    for (const p of insertedProducts) {
        // PERF TODO: Batch this check if scale increases
        const { data: lastEntry } = await supabase
            .from('price_history')
            .select('price')
            .eq('product_id', p.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();

        // If no history (new product) OR price is different, add entry
        if (!lastEntry || Number(lastEntry.price) !== Number(p.price)) {
            historyEntries.push({
                product_id: p.id,
                price: p.price
            });
        }
    }

    if (historyEntries.length > 0) {
        const { error: histError } = await supabase.from('price_history').insert(historyEntries);
        if (histError) console.error("Error logging price history:", histError);
        else console.log(`Logged ${historyEntries.length} new price history entries.`);
    }

    return insertedProducts;
};

const getAllProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data;
};

const getProductDetails = async (id) => {
    // 1. Get Product
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) return null;

    // 2. Get Price History
    const { data: realHistory } = await supabase
        .from('price_history')
        .select('price, recorded_at')
        .eq('product_id', id)
        .order('recorded_at', { ascending: true });

    let history = realHistory || [];

    // DEMO FEATURE: Backfill history if too few points exist
    if (history.length < 2 && product.price) {
        const today = new Date();
        const basePrice = Number(product.price);
        const demoHistory = [];

        // Generate 12 months of mock data
        for (let i = 12; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);

            // Random variation +/- 15%
            const variation = (Math.random() * 0.3) - 0.15;
            const mockPrice = Math.round(basePrice * (1 + variation));

            demoHistory.push({
                price: mockPrice,
                recorded_at: date.toISOString()
            });
        }
        // Ensure today's real price is the last entry
        if (history.length > 0) {
            demoHistory[demoHistory.length - 1] = history[history.length - 1];
        }

        history = demoHistory;
    }

    // 3. Get Similar Products (Simple Text Match for "Same Product")
    // This finds the SAME item on other sites
    const searchTerms = product.title.split(' ').filter(w => w.length > 3).slice(0, 4).join(' & ');
    const { data: similar } = await supabase
        .from('products')
        .select('*')
        .neq('id', id)
        .textSearch('title', searchTerms)
        .limit(5);

    // 4. Get Recommendations (Vector Match for "Related/Better Products")
    // This finds DIFFERENT items that are similar (e.g. other shoes)
    let recommendations = [];

    // First, we need the embedding of the CURRENT product.
    // Since we don't have a direct embedding endpoint easily callable inside, 
    // we query valid embeddings. Note: 'match_products' RPC is defined in schema.
    const { data: embeddingData } = await supabase
        .from('product_embeddings')
        .select('embedding')
        .eq('product_id', id)
        .single();

    if (embeddingData && embeddingData.embedding) {
        // ... existing embedding logic
        const { data: recs } = await supabase.rpc('match_products', {
            query_embedding: embeddingData.embedding,
            match_threshold: 0.6,
            match_count: 8
        });

        const similarIds = new Set((similar || []).map(s => s.id));
        similarIds.add(Number(id));

        const candidateIds = (recs || [])
            .map(r => r.id)
            .filter(rid => !similarIds.has(rid));

        if (candidateIds.length > 0) {
            const { data: fullRecs } = await supabase
                .from('products')
                .select('*')
                .in('id', candidateIds);

            if (fullRecs) {
                recommendations = candidateIds
                    .map(cid => fullRecs.find(p => p.id === cid))
                    .filter(p => p);
            }
        }
    }

    // FALLBACK: If vector search fails or yields nothing, use basic text search to populate Alternatives
    if (recommendations.length === 0 && product.title) {
        // Just take the first two words to cast a wider net
        const broadSearchTerms = product.title.split(' ').slice(0, 2).join(' | ');
        let { data: fallbackRecs } = await supabase
            .from('products')
            .select('*')
            .neq('id', id)
            .textSearch('title', broadSearchTerms)
            .limit(8);

        // If STILL empty, just grab any 8 products
        if (!fallbackRecs || fallbackRecs.length === 0) {
            const { data: randomRecs } = await supabase
                .from('products')
                .select('*')
                .neq('id', id)
                .limit(8);
            fallbackRecs = randomRecs;
        }

        if (fallbackRecs) {
            recommendations = fallbackRecs;
        }
    }

    return { product, history, similar, recommendations };
};

async function deleteAllProducts() {
    // 1. Get Protected IDs (Products in Wishlist)
    const { data: wishlistItems, error: wishError } = await supabase
        .from('wishlist_items')
        .select('product_id');

    if (wishError) {
        console.error("Error fetching wishlist for protection, skipping protection check:", wishError);
    }

    const protectedIds = (wishlistItems || []).map(i => i.product_id);
    const protectedStr = `(${protectedIds.join(',')})`;
    const hasProtected = protectedIds.length > 0;

    if (hasProtected) {
        console.log(`Protecting ${protectedIds.length} wishlist items from deletion.`);
    }

    // 2. Delete price history (Excluding Protected)
    let historyQuery = supabase.from('price_history').delete().neq('id', 0);
    if (hasProtected) historyQuery = historyQuery.not('product_id', 'in', protectedStr);
    const { error: historyError } = await historyQuery;
    if (historyError) console.error("Error clearing history:", historyError);

    // 3. Delete product embeddings (Excluding Protected)
    let embedQuery = supabase.from('product_embeddings').delete().neq('id', 0);
    if (hasProtected) embedQuery = embedQuery.not('product_id', 'in', protectedStr);
    const { error: embedError } = await embedQuery;
    if (embedError) console.error("Error clearing embeddings:", embedError);

    // 4. Delete Products (Excluding Wishlist Items)
    let deleteQuery = supabase.from('products').delete().neq('id', 0);
    if (hasProtected) deleteQuery = deleteQuery.not('id', 'in', protectedStr);

    const { error, count } = await deleteQuery;

    if (error) {
        console.error("Error deleting products:", error);
        return false;
    }
    return true;
}

module.exports = { insertProducts, getAllProducts, getProductDetails, deleteAllProducts };
