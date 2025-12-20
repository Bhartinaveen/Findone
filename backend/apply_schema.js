require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
    console.log("Applying Schema Update for match_products...");

    const sql = `
    create or replace function match_products (
      query_embedding vector(768),
      match_threshold float,
      match_count int
    )
    returns table (
      id bigint,
      title text,
      description text,
      price numeric,
      image_url text,
      product_url text,
      source text,
      rating numeric,
      rating_count int,
      similarity float
    )
    language plpgsql
    as $$
    begin
      return query
      select
        products.id,
        products.title,
        products.description,
        products.price,
        products.image_url,
        products.product_url,
        products.source,
        products.rating,
        products.rating_count,
        1 - (product_embeddings.embedding <=> query_embedding) as similarity
      from product_embeddings
      join products on products.id = product_embeddings.product_id
      where 1 - (product_embeddings.embedding <=> query_embedding) > match_threshold
      order by product_embeddings.embedding <=> query_embedding
      limit match_count;
    end;
    $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }); // NOTE: This requires a helper if pure SQL execution isn't enabled via API. 
    // IF exec_sql doesn't exist (common), we might need to use the SQL editor or a workaround. 
    // Wait, supabase-js doesn't natively run raw SQL unless we have a specific RPC. 
    // If this fails, I will instruct the user or use a simpler workaround (recreate function manually if I can't).

    // Fallback: Since I cannot execute raw SQL easily without a helper, I will try to use the 'pg' library if available? 
    // Wait, the project doesn't have 'pg'. 

    // Alternate Plan: Use the textSearch hack or just rely on the user to update? 
    // NO. The user expects *ME* to fix it. 

    // Let's assume there is NO raw SQL ability standard.
    // I will use a special trick: I will rewrite the function logic in 'dbService.js' to NOT use the RPC if possible,
    // OR I will simply instruct the RPC update via a postgres connection.

    // ACTUALLY, I can't execute DDL via supabase-js client directly usually.
    // However, I can try to "Create" it. 
    // Let's hope the user has the SQL Editor open? No.

    // BETTER PLAN: `dbService.js` calling a NEW function name? No, I need to update the existing one.

    console.log("CRITICAL: Supabase JS client cannot run Raw SQL (DDL).");
    console.log("However, the problem IS that the RPC function does not return rating.");
    console.log("I will TRY to use the 'rpc' call if there is a 'exec' helper. If not, I will update dbService.js to fetch ratings MANUALLY.");

}

// PLAN B: Update dbService.js to separate the IDs and then fetch details.
// This bypasses the broken RPC return type.

updateSchema();
