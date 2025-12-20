const supabase = require('./config/supabaseClient');

async function check() {
    console.log("Checking Database Connection...");

    // Check Products Table
    const { data, error } = await supabase.from('products').select('*').limit(1);

    if (error) {
        console.error("❌ ERROR: Database check failed!");
        console.error("Error Code:", error.code);
        console.error("Message:", error.message);

        if (error.code === 'PGRST205') {
            console.error("\n[CRITICAL]: THE 'products' TABLE DOES NOT EXIST.");
            console.error("YOU MUST RUN THE SQL SCRIPT IN SUPABASE DASHBOARD.");
        }
    } else {
        console.log("✅ SUCCESS: Database is connected and 'products' table exists.");
        console.log("Products found:", data.length);
    }
}

check();
