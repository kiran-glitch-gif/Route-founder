#!/bin/bash

echo "🚌 Setting up Bus Schedule Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

# Setup database
echo "🗄️ Setting up database..."
echo "Please ensure PostgreSQL is running and you have created a database named 'busdb'"
echo "Run these commands manually:"
echo "  createdb busdb"
echo "  psql -d busdb -f backend/db/schema.sql"
echo "  psql -d busdb -f backend/db/seed.sql"

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f backend/.env ]; then
    echo "📝 Please create backend/.env file with your configuration:"
    echo "  ANTHROPIC_API_KEY=sk-ant-your-api-key-here"
    echo "  DATABASE_URL=postgresql://user:password@localhost:5432/busdb"
    echo "  PORT=3001"
    echo "  NODE_ENV=development"
fi

echo "🎉 Setup complete! Run 'npm run dev' to start the application."