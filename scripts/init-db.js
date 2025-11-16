// scripts/init-db.js - Initialize Database with Admin User
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'portfolio_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);

    // Switch to the database
    await connection.query(`USE ${dbName}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Users table created');

    // Create images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category ENUM('shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music') NOT NULL,
        url VARCHAR(500) NOT NULL,
        title VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Images table created');

    // Create admin user
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [adminUsername]
    );

    if (existingUser.length === 0) {
      await connection.query(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [adminUsername, hashedPassword, 'admin@portfolio.com']
      );
      console.log(`Admin user '${adminUsername}' created successfully`);
      console.log(`Default password: ${adminPassword}`);
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log(`Admin user '${adminUsername}' already exists`);
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run "npm start" to start the server');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log(`3. Login with username: ${adminUsername}`);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();