@echo off
echo ========================================
echo Portfolio Setup Script for Windows
echo ========================================
echo.

:: Create directories
echo Creating project structure...
if not exist "database" mkdir database
if not exist "scripts" mkdir scripts
if not exist "docs" mkdir docs
echo [OK] Folders created
echo.

:: Create package.json
echo Creating package.json...
(
echo {
echo   "name": "portfolio-backend",
echo   "version": "1.0.0",
echo   "description": "Full-stack portfolio application",
echo   "main": "server.js",
echo   "scripts": {
echo     "start": "node server.js",
echo     "init-db": "node scripts/init-db.js",
echo     "seed-db": "node scripts/seed-db.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "mysql2": "^3.6.5",
echo     "bcryptjs": "^2.4.3",
echo     "jsonwebtoken": "^9.0.2",
echo     "dotenv": "^16.3.1"
echo   }
echo }
) > package.json
echo [OK] package.json created
echo.

:: Create .env file
echo Creating .env file...
(
echo PORT=3000
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=portfolio_db
echo JWT_SECRET=change_this_to_random_secret_key
) > .env
echo [OK] .env created
echo.

:: Create .gitignore
echo Creating .gitignore...
(
echo node_modules/
echo .env
echo *.log
) > .gitignore
echo [OK] .gitignore created
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Copy all the code files from the artifacts into this folder
echo 2. Make sure MySQL is installed and running
echo 3. Edit .env file with your MySQL password
echo 4. Run: npm install
echo 5. Run: npm run init-db
echo 6. Run: npm start
echo.
echo Press any key to start npm install...
pause > nul

npm install

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Now you need to:
echo 1. Make sure MySQL is running
echo 2. Run: npm run init-db
echo 3. Run: npm start
echo.
pause