const supabase = require('../config/supabaseClient');

/**
 * Checks if updated products match any user wishlist criteria and triggers notifications.
 * @param {Array} products - List of products that were just updated/inserted
 */
async function checkPriceAlerts(products) {
    if (!products || products.length === 0) return;

    try {
        console.log(`Checking price alerts for ${products.length} products...`);

        for (const product of products) {
            // Find users who wishlisted this product
            // Query Supabase instead of Local JSON
            const { data: wishlists, error } = await supabase
                .from('wishlist_items')
                .select('user_id, desired_max_price, product_id')
                .eq('product_id', product.id);

            if (error) {
                console.error("Error fetching wishlist items:", error);
                continue;
            }

            if (!wishlists || wishlists.length === 0) continue;

            for (const item of wishlists) {
                // Condition A: Price Drop (if max price set)
                // Ensure prices are numbers
                const currentPrice = parseFloat(product.price);
                const targetPrice = parseFloat(item.desired_max_price);

                if (targetPrice && currentPrice <= targetPrice) {
                    const message = `Price Drop Alert! ${product.title} is now ₹${currentPrice} (Target: ₹${targetPrice})`;

                    // Send Notification to DB
                    await sendNotification(item.user_id, message, 'price_drop');
                }
            }
        }
    } catch (err) {
        console.error("Error in checkPriceAlerts:", err);
    }
}

async function sendNotification(userId, message, type) {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                message,
                type,
                is_read: false
            }]);

        if (error) throw error;
        console.log(`Notification sent to User ${userId}: ${message}`);
    } catch (err) {
        console.error("Failed to send notification:", err);
    }
}

module.exports = { checkPriceAlerts };
