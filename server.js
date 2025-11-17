// server.js - PostgreSQL Backend for Render
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ==================== PORTFOLIO ROUTES ====================

app.get('/api/portfolio', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, category, url, title, created_at FROM images ORDER BY created_at DESC');

    const portfolioData = {
      shortfilms: [],
      photography: [],
      behind: [],
      commercials: [],
      documentaries: [],
      music: []
    };

    result.rows.forEach(img => {
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
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.post('/api/portfolio/images', authenticateToken, async (req, res) => {
  try {
    const { category, url, title } = req.body;

    if (!category || !url) {
      return res.status(400).json({ error: 'Category and URL required' });
    }

    const validCategories = ['shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await pool.query(
      'INSERT INTO images (category, url, title) VALUES ($1, $2, $3) RETURNING *',
      [category, url, title || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

app.delete('/api/portfolio/images/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM images WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

app.delete('/api/portfolio/images', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM images');
    res.json({ message: 'All images cleared' });
  } catch (error) {
    console.error('Error clearing images:', error);
    res.status(500).json({ error: 'Failed to clear images' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});