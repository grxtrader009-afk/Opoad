/*
# Create global_news_cache table for the Global Network intelligence module

1. New Tables
- `global_news_cache`
  - `id` (uuid, primary key)
  - `title` (text, not null) — news headline
  - `link` (text, not null) — source URL
  - `source` (text, not null) — publisher name
  - `category` (text, not null) — news category (business, technology, ai, crypto, economy, geopolitics, etc.)
  - `summary` (text) — short description
  - `image_url` (text) — topic-matched image URL
  - `sentiment` (text) — positive / negative / neutral
  - `market_impact` (integer) — AI-assigned impact score 1-10
  - `ranking` (text) — breaking / high / trending
  - `published_at` (timestamptz) — original publish time
  - `fetched_at` (timestamptz) — when this record was ingested
  - `analysis_json` (jsonb) — cached AI deep-research analysis (optional)

2. Indexes
- Index on `category` for filtered queries
- Index on `published_at` desc for latest-first ordering
- Index on `ranking` for breaking/high/trending filters

3. Security
- Enable RLS on `global_news_cache`.
- This is a single-tenant shared intelligence feed (no user-scoped data).
- Allow anon + authenticated full CRUD because the news cache is intentionally public/shared.
*/

CREATE TABLE IF NOT EXISTS global_news_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  link text NOT NULL,
  source text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  summary text,
  image_url text,
  sentiment text DEFAULT 'neutral',
  market_impact integer DEFAULT 5,
  ranking text DEFAULT 'trending',
  published_at timestamptz DEFAULT now(),
  fetched_at timestamptz DEFAULT now(),
  analysis_json jsonb
);

CREATE INDEX IF NOT EXISTS idx_gnc_category ON global_news_cache (category);
CREATE INDEX IF NOT EXISTS idx_gnc_published ON global_news_cache (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_gnc_ranking ON global_news_cache (ranking);

ALTER TABLE global_news_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_news" ON global_news_cache;
CREATE POLICY "anon_select_news" ON global_news_cache FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_news" ON global_news_cache;
CREATE POLICY "anon_insert_news" ON global_news_cache FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_news" ON global_news_cache;
CREATE POLICY "anon_update_news" ON global_news_cache FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_news" ON global_news_cache;
CREATE POLICY "anon_delete_news" ON global_news_cache FOR DELETE
  TO anon, authenticated USING (true);
