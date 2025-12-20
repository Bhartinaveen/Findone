require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function setup() {
    console.log("Setting up Users Table...");

    // Try to check if table exists by selecting 0 rows
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error && error.code === '42P01') { // undefined_table
        console.log("⚠️ Table 'users' does not exist.");
        console.log("Since Supabase-JS cannot create tables directly without an RPC, you must run this SQL in your Supabase Dashboard SQL Editor:");
        console.log(`
====================================================
create table if not exists users (
  id bigint primary key generated always as identity,
  email text not null unique,
  password_hash text not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
====================================================
        `);
    } else if (!error) {
        console.log("✅ Table 'users' already exists.");
    } else {
        console.error("Unknown error checking DB:", error);
    }
}

setup();
