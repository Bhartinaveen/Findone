require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function diagnose() {
    console.log("Checking Wishlist Table...");

    // Try to select 1 item
    const { error } = await supabase.from('wishlist_items').select('id').limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.error("❌ CRITICAL ERROR: Table 'wishlist_items' DOES NOT EXIST.");
            console.log("You MUST run the SQL command to create the table.");
        } else {
            console.error("⚠️ Database Error:", error.message);
        }
    } else {
        console.log("✅ Table 'wishlist_items' exists and is accessible.");
    }
}

diagnose();
