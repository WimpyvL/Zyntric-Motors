CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock TEXT NOT NULL CHECK (stock IN ('in_stock', 'low_stock', 'out_of_stock')),
  fits JSONB NOT NULL DEFAULT '[]'::jsonb,
  fitment_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX products_updated_at_idx ON products (updated_at DESC);
CREATE INDEX products_sku_idx ON products (sku);
