require('dotenv').config();
const mysql = require('mysql2/promise');

async function addImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const images = [
    // ADD YOUR IMAGES HERE - Format: [category, url, title]
    ['shortfilms', 'https://drive.google.com/uc?export=view&id=1z4YI28GKmrNby4KzimQSBmckKMtJqfSx', 'Film Title 1'],
    ['photography', 'https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_2', 'Photo Title 1'],
    // Add more images here...
  ];

  for (const [category, url, title] of images) {
    await connection.query(
      'INSERT INTO images (category, url, title) VALUES (?, ?, ?)',
      [category, url, title]
    );
    console.log(`✅ Added: ${title}`);
  }

  await connection.end();
  console.log('Done!');
}

addImages();