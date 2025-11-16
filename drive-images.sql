// convert-drive-links.js - Convert Google Drive Links to Direct URLs
require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');

// Google Drive link converter
function convertDriveLink(link) {
  // Extract file ID from various Google Drive URL formats
  let fileId = null;
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view
  if (link.includes('/file/d/')) {
    fileId = link.split('/file/d/')[1].split('/')[0];
  }
  
  // Format 2: https://drive.google.com/open?id=FILE_ID
  else if (link.includes('open?id=')) {
    fileId = link.split('open?id=')[1].split('&')[0];
  }
  
  // Format 3: Already in uc format
  else if (link.includes('uc?')) {
    fileId = link.split('id=')[1].split('&')[0].split('?')[0];
  }
  
  if (fileId) {
    // Clean up any trailing parameters
    fileId = fileId.split('?')[0].split('&')[0];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return null;
}

// Main function
async function addGoogleDriveImages() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('╔═══════════════════════════════════════╗');
  console.log('║  Google Drive Image Importer         ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const images = [];
  
  console.log('Paste your Google Drive links one by one.');
  console.log('Format: category|link|title');
  console.log('Example: photography|https://drive.google.com/file/d/abc123/view|My Photo\n');
  console.log('Categories: shortfilms, photography, behind, commercials, documentaries, music');
  console.log('Type "done" when finished.\n');

  const askForInput = () => {
    return new Promise((resolve) => {
      rl.question('Enter (category|link|title) or "done": ', (answer) => {
        resolve(answer);
      });
    });
  };

  // Collect images
  while (true) {
    const input = await askForInput();
    
    if (input.toLowerCase() === 'done') break;
    
    const parts = input.split('|');
    if (parts.length !== 3) {
      console.log('❌ Invalid format! Use: category|link|title');
      continue;
    }

    const [category, link, title] = parts.map(p => p.trim());
    
    // Validate category
    const validCategories = ['shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music'];
    if (!validCategories.includes(category)) {
      console.log(`❌ Invalid category: ${category}`);
      continue;
    }

    // Convert link
    const convertedLink = convertDriveLink(link);
    if (!convertedLink) {
      console.log(`❌ Could not extract file ID from: ${link}`);
      continue;
    }

    images.push({ category, url: convertedLink, title });
    console.log(`✅ Added: ${title} (${category})`);
  }

  rl.close();

  if (images.length === 0) {
    console.log('\n⚠️  No images to add!');
    process.exit(0);
  }

  console.log(`\n📊 Total images to add: ${images.length}`);
  console.log('\n🔄 Connecting to database...');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db'
    });

    console.log('✅ Connected to database\n');

    for (const img of images) {
      await connection.query(
        'INSERT INTO images (category, url, title) VALUES (?, ?, ?)',
        [img.category, img.url, img.title]
      );
      console.log(`✅ Inserted: ${img.title}`);
    }

    await connection.end();

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║  ✅ All images added successfully!   ║');
    console.log('╚═══════════════════════════════════════╝\n');
    console.log('Refresh your portfolio to see the changes!');
    console.log('http://localhost:3000/index.html\n');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

// Run the script
addGoogleDriveImages();