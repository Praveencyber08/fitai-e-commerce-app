-- Aurora DSQL schema for FitAI
-- Note: no foreign keys, no arrays/JSON, no SERIAL. Lists stored as comma-separated TEXT.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  phone VARCHAR(40),
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(120) NOT NULL,
  description TEXT,
  category VARCHAR(60) NOT NULL,
  sub_category VARCHAR(120),
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  discount_percent INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  image VARCHAR(500) NOT NULL,
  images TEXT,
  sizes TEXT,
  colors TEXT,
  tags TEXT,
  stock INT NOT NULL DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  is_trending BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE TABLE IF NOT EXISTS cart_items (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  size VARCHAR(20),
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'placed',
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  address_name VARCHAR(255),
  address_line VARCHAR(500),
  address_city VARCHAR(120),
  address_state VARCHAR(120),
  address_pincode VARCHAR(20),
  address_phone VARCHAR(40),
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  size VARCHAR(20),
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);
COMMIT;

CREATE TABLE IF NOT EXISTS try_on_history (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  result_image TEXT,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_cart_user ON cart_items(user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_orders_user ON orders(user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_order_items_order ON order_items(order_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_tryon_user ON try_on_history(user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_products_category ON products(category);
COMMIT;
