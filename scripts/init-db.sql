-- CopikonUSA - Database Init Script
-- Run this on your PostgreSQL database to create all required tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  city TEXT NOT NULL,
  address TEXT DEFAULT '',
  branch TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  base_price REAL NOT NULL,
  weight REAL NOT NULL,
  total_price_usd REAL NOT NULL,
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  rating REAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  badge TEXT DEFAULT '',
  specs JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_manual BOOLEAN DEFAULT false,
  amazon_asin TEXT DEFAULT '',
  old_price REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL,
  subtotal_usd REAL NOT NULL,
  shipping_usd REAL NOT NULL,
  total_usd REAL NOT NULL,
  total_bs REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_proof TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending_payment',
  branch TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  delivery_address TEXT DEFAULT '',
  estimated_delivery TEXT NOT NULL,
  amazon_cart_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  order_id TEXT DEFAULT '',
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
