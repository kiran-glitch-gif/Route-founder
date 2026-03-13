@echo off
echo 🚌 Setting up Bus Schedule Agent...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Setup database
echo 🗄️ Setting up database...
echo Please ensure PostgreSQL is running and you have created a database named 'busdb'
echo Run these commands manually:
echo   createdb busdb
echo   psql -d busdb -f backend/db/schema.sql
echo   psql -d busdb -f backend/db/seed.sql

REM Setup environment
echo ⚙️ Setting up environment...
if not exist backend\.env (
    echo 📝 Please create backend/.env file with your configuration:
    echo   ANTHROPIC_API_KEY=sk-ant-your-api-key-here
    echo   DATABASE_URL=postgresql://user:password@localhost:5432/busdb
    echo   PORT=3001
    echo   NODE_ENV=development
)

echo 🎉 Setup complete! Run 'npm run dev' to start the application.
pause