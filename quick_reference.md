# Quick Reference Guide

Fast reference for common commands and operations.

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Initialize database
npm run init-db

# Seed sample data
npm run seed-db
```

## 🗄️ Database Commands

```bash
# Login to MySQL
mysql -u root -p

# Use database
USE portfolio_db;

# Show tables
SHOW TABLES;

# View all images
SELECT * FROM images;

# Count images by category
SELECT category, COUNT(*) FROM images GROUP BY category;

# Clear all images
DELETE FROM images;

# Show users
SELECT id, username, email, created_at FROM users;

# Create backup
mysqldump -u root -p portfolio_db > backup.sql

# Restore from backup
mysql -u root -p portfolio_db < backup.sql
```

## 🔐 User Management

```bash
# Create new admin user (in MySQL)
INSERT INTO users (username, password, email) 
VALUES ('newadmin', '$2a$10$...hashed_password...', 'email@example.com');

# Generate password hash (Node.js)
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('password', 10))"

# Update password
UPDATE users SET password = '$2a$10$...new_hash...' WHERE username = 'admin';

# Delete user
DELETE FROM users WHERE username = 'olduser';
```

## 🌐 Server Management (PM2)

```bash
# Start application
pm2 start server.js --name portfolio

# Stop application
pm2 stop portfolio

# Restart application
pm2 restart portfolio

# Delete from PM2
pm2 delete portfolio

# View logs
pm2 logs portfolio

# Real-time monitoring
pm2 monit

# Show process details
pm2 describe portfolio

# List all processes
pm2 list

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
```

## 🔧 Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

## 🔍 Debugging

```bash
# Check if port is in use
lsof -ti:3000

# Kill process on port
lsof -ti:3000 | xargs kill

# Check server processes
ps aux | grep node

# View system resources
htop  # or top

# Check disk space
df -h

# Check memory usage
free -h

# Test API endpoint
curl http://localhost:3000/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/portfolio
```

## 🔐 SSL/HTTPS (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Renew certificate
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run

# Check certificate expiry
sudo certbot certificates
```

## 📦 Git Commands

```bash
# Clone repository
git clone <repo-url>

# Pull latest changes
git pull origin main

# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push changes
git push origin main

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main
```

## 🐳 Docker Commands

```bash
# Build image
docker build -t portfolio-backend .

# Run container
docker run -p 3000:3000 --env-file .env portfolio-backend

# Using docker-compose
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend npm run init-db

# Rebuild containers
docker-compose up -d --build
```

## 📊 MySQL Performance

```bash
# Check table sizes
SELECT 
  table_name AS "Table",
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = "portfolio_db"
ORDER BY (data_length + index_length) DESC;

# Show slow queries
SHOW FULL PROCESSLIST;

# Optimize table
OPTIMIZE TABLE images;

# Analyze table
ANALYZE TABLE images;

# Show indexes
SHOW INDEX FROM images;
```

## 🔄 Common Workflows

### Adding New Category

1. **Update Database**
   ```sql
   ALTER TABLE images MODIFY COLUMN category 
   ENUM('shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music', 'newcategory');
   ```

2. **Update Frontend** (`js/gallery.js`)
   ```javascript
   categoryNames: {
     // ...existing...
     newcategory: 'New Category'
   }
   ```

3. **Update Styles** (`css/styles.css`)
   ```css
   .newcategory h2 { border-color: #your-color; }
   ```

### Resetting Portfolio

```bash
# 1. Clear all images
mysql -u root -p -e "DELETE FROM portfolio_db.images;"

# 2. Reseed database
npm run seed-db

# 3. Restart server
pm2 restart portfolio
```

### Changing Admin Password

```bash
# 1. Generate new hash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10))"

# 2. Update in database
mysql -u root -p
USE portfolio_db;
UPDATE users SET password = 'NEW_HASH_HERE' WHERE username = 'admin';
EXIT;
```

### Full Server Reset

```bash
# Stop server
pm2 stop portfolio

# Drop and recreate database
mysql -u root -p -e "DROP DATABASE portfolio_db;"
npm run init-db

# Clear PM2 logs
pm2 flush portfolio

# Restart
pm2 restart portfolio
```

## 🆘 Emergency Recovery

### Server Down
```bash
# 1. Check if process is running
pm2 list

# 2. Check logs for errors
pm2 logs portfolio --lines 50

# 3. Restart everything
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysql

# 4. Verify
curl http://localhost:3000/api/health
```

### Database Corruption
```bash
# 1. Stop application
pm2 stop portfolio

# 2. Restore from backup
mysql -u root -p portfolio_db < backup.sql

# 3. Restart
pm2 restart portfolio
```

### Out of Disk Space
```bash
# Check space
df -h

# Clear PM2 logs
pm2 flush

# Clear system logs
sudo journalctl --vacuum-time=7d

# Clean MySQL binary logs
mysql -u root -p -e "PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 3 DAY);"

# Clean apt cache
sudo apt clean
```

## 📱 Testing Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get portfolio (public)
curl http://localhost:3000/api/portfolio

# Add image (requires auth)
curl -X POST http://localhost:3000/api/portfolio/images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"category":"photography","url":"https://example.com/image.jpg","title":"Test"}'

# Delete image
curl -X DELETE http://localhost:3000/api/portfolio/images/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔑 Environment Variables

```bash
# View all environment variables
printenv | grep DB

# Set temporary variable
export JWT_SECRET=temporary_secret

# Load from .env file
source .env  # Linux/Mac
# or
set -a; source .env; set +a
```

## 💡 Useful Tips

```bash
# Find large files
find / -type f -size +100M 2>/dev/null

# Monitor logs in real-time
tail -f /var/log/nginx/access.log | grep POST

# Check open ports
sudo netstat -tulpn

# Monitor bandwidth
iftop

# Check DNS propagation
nslookup yourdomain.com

# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

## 📞 Quick Support

**Check First:**
1. Server logs: `pm2 logs portfolio`
2. Nginx logs: `sudo tail /var/log/nginx/error.log`
3. MySQL status: `sudo systemctl status mysql`
4. Process status: `pm2 status`

**Common Fixes:**
- Port in use: `lsof -ti:3000 | xargs kill`
- Nginx won't start: `sudo nginx -t` to check config
- PM2 not saving: `pm2 save` after changes
- Database locked: Restart MySQL service