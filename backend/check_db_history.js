const supabase = require('./config/supabaseClient');

async function checkHistory() {
    console.log("Checking Price History Table...");

    // Check if table exists by trying to select
    const { data, error } = await supabase.from('price_history').select('*').limit(5);

    if (error) {
        console.error("❌ ERROR: Could not access 'price_history'.");
        console.error("Message:", error.message);
        console.error("Hint: You specifically need to run the SQL for the 'price_history' table.");
    } else {
        console.log("✅ SUCCESS: 'price_history' table exists.");
        console.log(`Found ${data.length} history records.`);
        if (data.length > 0) console.log(data);
    }
}

checkHistory();
