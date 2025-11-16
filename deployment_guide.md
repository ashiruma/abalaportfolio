# Deployment Guide

Complete guide for deploying your full-stack portfolio to production.

## 📋 Pre-Deployment Checklist

- [ ] Change default admin password
- [ ] Set secure JWT_SECRET
- [ ] Configure production database
- [ ] Update API_URL in frontend
- [ ] Test all features locally
- [ ] Setup SSL certificate (HTTPS)
- [ ] Configure CORS for production domain

## 🌐 Deployment Options

### Option 1: Single Server (VPS)

**Best for:** Full control, cost-effective for complete stack

**Recommended Providers:**
- DigitalOcean ($5-10/month)
- Linode ($5/month)
- AWS EC2 (t2.micro free tier)
- Vultr ($5/month)

#### Step-by-Step:

1. **Provision Server**
   ```bash
   # SSH into your server
   ssh root@your-server-ip
   ```

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MySQL
   sudo apt install -y mysql-server
   sudo mysql_secure_installation
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Setup MySQL**
   ```bash
   sudo mysql
   ```
   ```sql
   CREATE DATABASE portfolio_db;
   CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   cd /var/www
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   
   # Install dependencies
   npm install --production
   
   # Setup environment
   cp .env.example .env
   nano .env  # Edit with production values
   
   # Initialize database
   npm run init-db
   
   # Start with PM2
   pm2 start server.js --name portfolio
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/portfolio
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Serve static frontend files
       location / {
           root /var/www/portfolio/frontend;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests to backend
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### Option 2: Separate Frontend/Backend

**Best for:** Scalability, using specialized services

#### Frontend on Netlify

1. **Prepare Frontend**
   ```bash
   # Update API URL in js/api.js
   const API_URL = 'https://your-backend-url.com/api';
   ```

2. **Deploy to Netlify**
   - Sign up at [netlify.com](https://netlify.com)
   - Connect GitHub repository
   - Build settings:
     - Base directory: `frontend`
     - Publish directory: `frontend`
   - Deploy

3. **Configure Custom Domain** (optional)
   - Add domain in Netlify settings
   - Update DNS records

#### Backend on Railway

1. **Prepare for Railway**
   ```bash
   # Ensure server.js uses environment PORT
   const PORT = process.env.PORT || 3000;
   ```

2. **Deploy to Railway**
   - Sign up at [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Add MySQL database plugin
   - Set environment variables:
     ```
     DB_HOST=<from Railway MySQL>
     DB_USER=<from Railway MySQL>
     DB_PASSWORD=<from Railway MySQL>
     DB_NAME=portfolio_db
     JWT_SECRET=<generate secure key>
     ```

3. **Initialize Database**
   ```bash
   # Use Railway CLI
   railway run npm run init-db
   ```

#### Backend on Heroku (Alternative)

1. **Prepare**
   ```bash
   # Create Procfile
   echo "web: node server.js" > Procfile
   ```

2. **Deploy**
   ```bash
   heroku login
   heroku create your-portfolio-api
   
   # Add ClearDB MySQL
   heroku addons:create cleardb:ignite
   
   # Get database URL
   heroku config:get CLEARDB_DATABASE_URL
   
   # Set environment variables
   heroku config:set JWT_SECRET=your-secret
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   
   # Initialize database
   heroku run npm run init-db
   ```

### Option 3: Docker Deployment

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     db:
       image: mysql:8
       environment:
         MYSQL_ROOT_PASSWORD: rootpassword
         MYSQL_DATABASE: portfolio_db
         MYSQL_USER: portfolio_user
         MYSQL_PASSWORD: userpassword
       volumes:
         - db_data:/var/lib/mysql
       ports:
         - "3306:3306"
     
     backend:
       build: .
       ports:
         - "3000:3000"
       environment:
         DB_HOST: db
         DB_USER: portfolio_user
         DB_PASSWORD: userpassword
         DB_NAME: portfolio_db
         JWT_SECRET: your-jwt-secret
       depends_on:
         - db
       volumes:
         - ./frontend:/app/frontend
   
   volumes:
     db_data:
   ```

2. **Deploy**
   ```bash
   docker-compose up -d
   docker-compose exec backend npm run init-db
   ```

## 🔐 Security Hardening

### 1. Environment Variables
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. MySQL Security
```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Restrict root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1');

-- Set strong password policy
SET GLOBAL validate_password.policy=STRONG;
```

### 3. Rate Limiting
Add to server.js:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Helmet.js for Security Headers
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 5. HTTPS Only
```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs portfolio

# Monitor resources
pm2 monit

# Web dashboard
pm2 web
```

### MySQL Monitoring
```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check database size
SELECT 
  table_schema AS "Database",
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS "Size (MB)"
FROM information_schema.TABLES
GROUP BY table_schema;
```

## 🔄 Updates and Maintenance

### Update Application
```bash
cd /var/www/portfolio
git pull origin main
npm install
pm2 restart portfolio
```

### Database Backup
```bash
# Backup
mysqldump -u portfolio_user -p portfolio_db > backup_$(date +%Y%m%d).sql

# Restore
mysql -u portfolio_user -p portfolio_db < backup_20240101.sql
```

### Automated Backups (Cron)
```bash
crontab -e
```
Add:
```
0 2 * * * mysqldump -u portfolio_user -p'password' portfolio_db > /backups/portfolio_$(date +\%Y\%m\%d).sql
```

## 🐛 Troubleshooting Production

### Check Server Logs
```bash
pm2 logs portfolio --lines 100
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
# Test connection
mysql -h localhost -u portfolio_user -p portfolio_db

# Check if MySQL is running
sudo systemctl status mysql
```

### Application Won't Start
```bash
# Check port availability
sudo netstat -tulpn | grep :3000

# Check PM2 status
pm2 status
pm2 describe portfolio
```

## 📈 Performance Optimization

1. **Enable Gzip in Nginx**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_category_created ON images(category, created_at);
   ```

3. **Enable MySQL Query Cache**
   ```sql
   SET GLOBAL query_cache_size = 1000000;
   SET GLOBAL query_cache_type = ON;
   ```

4. **CDN for Static Assets**
   - Upload images to Cloudinary/S3
   - Use CDN URLs in database

## ✅ Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] Database backups configured
- [ ] Monitoring setup (PM2, logs)
- [ ] Error tracking (optional: Sentry)
- [ ] Update default passwords
- [ ] Test all features in production
- [ ] Configure domain DNS
- [ ] Setup email notifications (optional)
- [ ] Document server details securely

## 🆘 Support

If you encounter issues:
1. Check logs: `pm2 logs` and `/var/log/nginx/error.log`
2. Verify environment variables
3. Test database connection
4. Check firewall rules
5. Review Nginx configuration

For urgent issues, restart services:
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysql
```