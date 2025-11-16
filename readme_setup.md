# Chrispine Abala Portfolio - Full Stack

A full-stack portfolio application with backend API, MySQL database, and authentication.

## 📁 Project Structure

```
portfolio-fullstack/
├── frontend/
│   ├── index.html              # Main portfolio page
│   ├── login.html              # Admin login page
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   └── js/
│       ├── api.js              # API client module
│       ├── auth.js             # Authentication module
│       ├── gallery.js          # Gallery rendering module
│       ├── lightbox.js         # Lightbox/modal module
│       └── main.js             # Main application entry point
├── backend/
│   ├── server.js               # Express server
│   ├── config/
│   │   └── db.js               # Database configuration (optional)
│   ├── routes/
│   │   ├── portfolio.js        # Portfolio routes (optional)
│   │   └── auth.js             # Auth routes (optional)
│   └── scripts/
│       ├── init-db.js          # Database initialization
│       └── seed-db.js          # Sample data seeding
├── database/
│   └── schema.sql              # Database schema
├── package.json                # Dependencies
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** package manager

### Step 1: Clone or Setup Project

Create your project directory and add all the files:

```bash
mkdir portfolio-fullstack
cd portfolio-fullstack
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `mysql2` - MySQL client
- `cors` - Cross-origin resource sharing
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables

### Step 3: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your database credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=portfolio_db
   JWT_SECRET=your_secret_key_change_in_production
   ```

### Step 4: Setup MySQL Database

**Option A: Using the initialization script (Recommended)**

```bash
npm run init-db
```

This will:
- Create the database
- Create tables (users, images)
- Create an admin user (username: `admin`, password: `admin123`)

**Option B: Manual setup**

1. Login to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Run the schema:
   ```sql
   source database/schema.sql
   ```

### Step 5: (Optional) Seed Sample Data

```bash
npm run seed-db
```

This adds sample placeholder images to test the gallery.

### Step 6: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Step 7: Access the Application

1. **Portfolio page**: http://localhost:3000/index.html
2. **Admin login**: http://localhost:3000/login.html

**Default credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the default password after first login!

## 📖 Usage

### Public View
- Anyone can view the portfolio at `index.html`
- Gallery organized by categories
- Click images to open lightbox
- Navigate with arrow keys or buttons

### Admin Functions
1. **Login** at `/login.html`
2. Click **"+ Add Images"** button
3. Select category, paste image URL, add title
4. Click **"Add Image"** to save
5. Use **"Clear All Images"** to reset gallery

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/verify` - Verify token

#### Portfolio
- `GET /api/portfolio` - Get all images grouped by category
- `POST /api/portfolio/images` - Add new image (requires auth)
- `DELETE /api/portfolio/images/:id` - Delete image (requires auth)
- `DELETE /api/portfolio/images` - Clear all images (requires auth)
- `GET /api/portfolio/counts` - Get image counts by category

## 🗄️ Database Schema

### Users Table
```sql
id INT PRIMARY KEY AUTO_INCREMENT
username VARCHAR(50) UNIQUE
password VARCHAR(255)  -- bcrypt hashed
email VARCHAR(100)
created_at TIMESTAMP
```

### Images Table
```sql
id INT PRIMARY KEY AUTO_INCREMENT
category ENUM('shortfilms', 'photography', 'behind', 'commercials', 'documentaries', 'music')
url VARCHAR(500)
title VARCHAR(255)
created_at TIMESTAMP
updated_at TIMESTAMP
```

## 🔒 Security Features

- **JWT Authentication** - Token-based auth for admin operations
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configurable origin restrictions
- **SQL Injection Prevention** - Parameterized queries
- **Input Validation** - Client and server-side validation
- **Token Expiration** - 24-hour token lifetime

## 🎨 Frontend Features

- **Modular Architecture** - Separate concerns (API, Auth, Gallery, Lightbox)
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages
- **Responsive Design** - Mobile-friendly layout
- **Smooth Animations** - Fade-ins, slide-downs, lightbox transitions
- **Keyboard Navigation** - ESC to close, arrows to navigate

## 🚢 Deployment

### Deploy to Production Server

1. **Setup Production Environment**
   ```bash
   # On your server
   git clone <your-repo>
   cd portfolio-fullstack
   npm install --production
   ```

2. **Configure Production Environment**
   ```bash
   # Create .env file with production settings
   NODE_ENV=production
   PORT=3000
   DB_HOST=your_production_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_secure_password
   DB_NAME=portfolio_db
   JWT_SECRET=your_very_secure_random_key
   ```

3. **Run Database Initialization**
   ```bash
   npm run init-db
   ```

4. **Use Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name portfolio
   pm2 save
   pm2 startup
   ```

### Deploy Frontend to Netlify/Vercel

1. Copy the `frontend` folder contents
2. Update `js/api.js` - Change `API_URL` to your backend URL
3. Deploy static files

### Deploy Backend to Heroku/Railway

1. Add `Procfile`:
   ```
   web: node server.js
   ```

2. Set environment variables in dashboard

3. Connect MySQL database (JawsDB, ClearDB, or PlanetScale)

### Using Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t portfolio-backend .
docker run -p 3000:3000 --env-file .env portfolio-backend
```

## 🛠️ Development

### File Structure Explained

- **server.js**: Main Express server with all routes
- **js/api.js**: Centralizes all API calls
- **js/auth.js**: Handles authentication state
- **js/gallery.js**: Renders portfolio categories
- **js/lightbox.js**: Image viewing modal
- **js/main.js**: Initializes app and handles forms

### Adding New Categories

1. Update `categoryNames` and `categoryClasses` in `gallery.js`
2. Update ENUM in `schema.sql`
3. Add color in `styles.css` (`.newcategory h2 { border-color: ... }`)

### Customization

**Change Colors:**
Edit CSS variables in `styles.css`:
```css
:root {
  --green: #2ba84a;
  --yellow: #ffcc00;
  --red: #d32f2f;
}
```

**Add Logo:**
Replace placeholder URL in HTML:
```html
<img src="your-logo.png" alt="Your Logo" />
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running: `mysql.server status` (Mac) or `systemctl status mysql` (Linux)
- Verify credentials in `.env`
- Ensure database exists: `npm run init-db`

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### CORS Errors
- Update CORS_ORIGIN in `.env`
- Or allow all origins in development (server.js):
  ```javascript
  app.use(cors({ origin: '*' }))
  ```

### Token Expired
- Tokens last 24 hours
- Logout and login again

## 📝 License

MIT License - Feel free to use for personal and commercial projects

## 👤 Author

**Chrispine Abala**
- Portfolio: [Your website]
- Email: [Your email]

## 🙏 Credits

Built with Express.js, MySQL, and vanilla JavaScript