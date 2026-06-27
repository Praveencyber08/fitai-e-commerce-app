import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.DSQL_ACCESS_KEY_ID,
  password: process.env.DSQL_SECRET_ACCESS_KEY,
  database: 'postgres',
  port: 5432,
  ssl: true,
});

// Sample products data
const products = [
  { id: 'prod-1', name: 'Essential Cotton Crew T-Shirt', brand: 'Urban Thread', category: 'tshirts', price: 29.99, rating: 4.5, colors: 'black,white,blue,red', sizes: 'xs,s,m,l,xl,xxl', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', is_trending: true, is_new: false },
  { id: 'prod-2', name: 'Premium Denim Jacket', brand: 'Denim Co', category: 'jackets', price: 79.99, rating: 4.8, colors: 'blue,black', sizes: 's,m,l,xl', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500', is_trending: true, is_new: true },
  { id: 'prod-3', name: 'Summer Floral Dress', brand: 'Blossom Fashion', category: 'dresses', price: 49.99, rating: 4.6, colors: 'floral,pink,yellow', sizes: 'xs,s,m,l', image_url: 'https://images.unsplash.com/photo-1595777712802-92d28e7e5d11?w=500', is_trending: false, is_new: true },
  { id: 'prod-4', name: 'Classic White Sneakers', brand: 'Stride Shoes', category: 'footwear', price: 59.99, rating: 4.4, colors: 'white,black,gray', sizes: '6,7,8,9,10,11,12', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', is_trending: true, is_new: false },
  { id: 'prod-5', name: 'Cozy Wool Sweater', brand: 'Knit Studio', category: 'sweaters', price: 69.99, rating: 4.7, colors: 'cream,gray,navy,burgundy', sizes: 'xs,s,m,l,xl', image_url: 'https://images.unsplash.com/photo-1578932750294-708d3249aba5?w=500', is_trending: false, is_new: false },
];

async function seedDatabase() {
  console.log('[v0] Starting database seeding...');

  try {
    // Check if products already exist
    const result = await pool.query('SELECT COUNT(*) FROM products');
    if (result.rows[0].count > 0) {
      console.log('[v0] Database already seeded, skipping...');
      await pool.end();
      return;
    }

    // Insert products
    for (const product of products) {
      await pool.query(
        `INSERT INTO products (id, name, brand, category, price, rating, colors, sizes, image_url, is_trending, is_new)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          product.id,
          product.name,
          product.brand,
          product.category,
          product.price,
          product.rating,
          product.colors,
          product.sizes,
          product.image_url,
          product.is_trending,
          product.is_new,
        ]
      );
      console.log(`[v0] ✓ Seeded: ${product.name}`);
    }

    console.log(`[v0] Successfully seeded ${products.length} products!`);
  } catch (err) {
    console.error('[v0] Seeding error:', err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
