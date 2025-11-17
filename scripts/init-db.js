require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        category VARCHAR(20) NOT NULL CHECK (category IN ('shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music')),
        url VARCHAR(500) NOT NULL,
        title VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Images table created');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await client.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin@portfolio.com']
      );
      console.log('Admin user created: username=admin, password=admin123');
    } catch (err) {
      if (err.code === '23505') {
        console.log('Admin user already exists');
      }
    }

    console.log('\n✅ Database ready!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

initDatabase();