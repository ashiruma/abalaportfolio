-- schema.sql - Database Schema for Portfolio

-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Images table for portfolio
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music') NOT NULL,
  url VARCHAR(500) NOT NULL,
  title VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: 'admin123' (hashed with bcrypt)
-- You should change this password after first login!
INSERT INTO users (username, password, email) VALUES
('admin', '$2a$10$YQs8qN5X.5zJjZ5X5Z5X5OeKCQQxZ5X5X5X5X5X5X5X5X5X5X5X5a', 'admin@portfolio.com')
ON DUPLICATE KEY UPDATE username=username;

-- Insert some sample data (optional)
INSERT INTO images (category, url, title) VALUES
('shortfilms', 'https://via.placeholder.com/300x200?text=Short+Film+1', 'Short Film 1'),
('shortfilms', 'https://via.placeholder.com/300x200?text=Short+Film+2', 'Short Film 2'),
('photography', 'https://via.placeholder.com/300x200?text=Photo+1', 'Photo 1'),
('photography', 'https://via.placeholder.com/300x200?text=Photo+2', 'Photo 2'),
('photography', 'https://via.placeholder.com/300x200?text=Photo+3', 'Photo 3'),
('behind', 'https://via.placeholder.com/300x200?text=BTS+1', 'Behind the Scenes 1'),
('commercials', 'https://via.placeholder.com/300x200?text=Commercial+1', 'Commercial 1'),
('documentaries', 'https://via.placeholder.com/300x200?text=Documentary+1', 'Documentary 1'),
('music', 'https://via.placeholder.com/300x200?text=Music+Video+1', 'Music Video 1');

-- Create a stored procedure to get category statistics
DELIMITER //
CREATE PROCEDURE GetCategoryStats()
BEGIN
  SELECT 
    category,
    COUNT(*) as image_count,
    MAX(created_at) as last_updated
  FROM images
  GROUP BY category
  ORDER BY category;
END //
DELIMITER ;

-- Create a view for portfolio overview
CREATE OR REPLACE VIEW portfolio_overview AS
SELECT 
  category,
  COUNT(*) as total_images,
  MAX(created_at) as last_added
FROM images
GROUP BY category;

-- Show table structures
SHOW TABLES;
DESCRIBE users;
DESCRIBE images;