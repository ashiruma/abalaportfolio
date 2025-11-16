// server.js - Main Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(__dirname));

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ==================== PORTFOLIO ROUTES ====================

// Get all images grouped by category
app.get('/api/portfolio', async (req, res) => {
  try {
    const [images] = await pool.query(
      'SELECT id, category, url, title, created_at FROM images ORDER BY created_at DESC'
    );

    // Group images by category
    const portfolioData = {
      shortfilms: [],
      photography: [],
      behind: [],
      commercials: [],
      documentaries: [],
      music: []
    };

    images.forEach(img => {
      if (portfolioData[img.category]) {
        portfolioData[img.category].push({
          id: img.id,
          url: img.url,
          title: img.title,
          created_at: img.created_at
        });
      }
    });

    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Add a new image
app.post('/api/portfolio/images', authenticateToken, async (req, res) => {
  try {
    const { category, url, title } = req.body;

    // Validation
    if (!category || !url) {
      return res.status(400).json({ error: 'Category and URL are required' });
    }

    const validCategories = ['shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // URL validation
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const [result] = await pool.query(
      'INSERT INTO images (category, url, title) VALUES (?, ?, ?)',
      [category, url, title || '']
    );

    res.status(201).json({
      id: result.insertId,
      category,
      url,
      title: title || '',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Delete a single image
app.delete('/api/portfolio/images/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM images WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Clear all images
app.delete('/api/portfolio/images', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM images');
    res.json({ message: 'All images cleared successfully' });
  } catch (error) {
    console.error('Error clearing images:', error);
    res.status(500).json({ error: 'Failed to clear images' });
  }
});

// Get category counts
app.get('/api/portfolio/counts', async (req, res) => {
  try {
    const [counts] = await pool.query(
      'SELECT category, COUNT(*) as count FROM images GROUP BY category'
    );

    const countsObj = {
      shortfilms: 0,
      photography: 0,
      behind: 0,
      commercials: 0,
      documentaries: 0,
      music: 0
    };

    counts.forEach(item => {
      countsObj[item.category] = item.count;
    });

    res.json(countsObj);
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/verify');
  console.log('  GET  /api/portfolio');
  console.log('  POST /api/portfolio/images');
  console.log('  DELETE /api/portfolio/images/:id');
  console.log('  DELETE /api/portfolio/images');
});