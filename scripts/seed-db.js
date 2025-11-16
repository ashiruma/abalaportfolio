// scripts/seed-db.js - Seed Database with Sample Data
require('dotenv').config();
const mysql = require('mysql2/promise');

const sampleImages = [
  { category: 'shortfilms', url: 'https://via.placeholder.com/300x200?text=Short+Film+1', title: 'Short Film 1' },
  { category: 'shortfilms', url: 'https://via.placeholder.com/300x200?text=Short+Film+2', title: 'Short Film 2' },
  { category: 'shortfilms', url: 'https://via.placeholder.com/300x200?text=Short+Film+3', title: 'Short Film 3' },
  { category: 'photography', url: 'https://via.placeholder.com/300x200?text=Photo+1', title: 'Portrait Session' },
  { category: 'photography', url: 'https://via.placeholder.com/300x200?text=Photo+2', title: 'Landscape Beauty' },
  { category: 'photography', url: 'https://via.placeholder.com/300x200?text=Photo+3', title: 'Urban Exploration' },
  { category: 'photography', url: 'https://via.placeholder.com/300x200?text=Photo+4', title: 'Studio Work' },
  { category: 'behind', url: 'https://via.placeholder.com/300x200?text=BTS+1', title: 'Film Set' },
  { category: 'behind', url: 'https://via.placeholder.com/300x200?text=BTS+2', title: 'Production Day' },
  { category: 'commercials', url: 'https://via.placeholder.com/300x200?text=Commercial+1', title: 'Brand Campaign' },
  { category: 'commercials', url: 'https://via.placeholder.com/300x200?text=Commercial+2', title: 'Product Launch' },
  { category: 'documentaries', url: 'https://via.placeholder.com/300x200?text=Doc+1', title: 'Documentary Project' },
  { category: 'music', url: 'https://via.placeholder.com/300x200?text=Music+1', title: 'Music Video' },
  { category: 'music', url: 'https://via.placeholder.com/300x200?text=Music+2', title: 'Live Performance' }
];

async function seedDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db'
    });

    console.log('Connected to database');

    // Check if images already exist
    const [existingImages] = await connection.query('SELECT COUNT(*) as count FROM images');
    
    if (existingImages[0].count > 0) {
      console.log(`Database already contains ${existingImages[0].count} images`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to clear existing images and reseed? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          await connection.query('DELETE FROM images');
          console.log('Existing images cleared');
          await insertSampleData(connection);
        } else {
          console.log('Seeding cancelled');
        }
        readline.close();
        await connection.end();
      });
    } else {
      await insertSampleData(connection);
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

async function insertSampleData(connection) {
  console.log('Inserting sample images...');

  for (const image of sampleImages) {
    await connection.query(
      'INSERT INTO images (category, url, title) VALUES (?, ?, ?)',
      [image.category, image.url, image.title]
    );
  }

  console.log(`✅ Successfully inserted ${sampleImages.length} sample images`);
  
  // Show summary
  const [summary] = await connection.query(`
    SELECT category, COUNT(*) as count 
    FROM images 
    GROUP BY category 
    ORDER BY category
  `);

  console.log('\nCategory Summary:');
  summary.forEach(row => {
    console.log(`  ${row.category}: ${row.count} images`);
  });
}

seedDatabase();