-- Enable vector extension
create extension if not exists vector;

-- Clean up
drop table if exists product_embeddings;
drop table if exists products;

-- Create Products table with UNIQUE title
create table products (
  id bigint primary key generated always as identity,
  title text not null unique,  -- <--- ADDED UNIQUE CONSTRAINT
  description text,
  price numeric,
  image_url text,
  category text,
  features jsonb,
  source text,
  product_url text,
  rating numeric default 0,
  rating_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Embeddings table
create table product_embeddings (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete cascade,
  embedding vector(768)
);

-- Search function
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

-- Create a table to track price history
create table if not exists price_history (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete cascade,
  price numeric not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast retrieval
create index if not exists idx_price_history_product_id on price_history(product_id);
create index if not exists idx_price_history_recorded_at on price_history(recorded_at);

-- Users Table for Authentication
create table if not exists users (
  id bigint primary key generated always as identity,
  email text not null unique,
  password_hash text not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications Table
create table if not exists notifications (
  id bigint primary key generated always as identity,
  user_id bigint references users(id) on delete cascade,
  message text not null,
  type text check (type in ('price_drop', 'system_alert', 'offer_alert')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast user retrieval
create index if not exists idx_notifications_user_id on notifications(user_id);
