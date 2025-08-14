#!/bin/bash

echo "🚀 Starting SOP Document Manager Plus Demo..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if database exists
if [ ! -f "data/documents.db" ]; then
    echo "🗄️  Initializing database..."
    npm run db:init
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize database"
        exit 1
    fi
    
    echo "🌱 Seeding database with sample data..."
    npm run db:seed
    if [ $? -ne 0 ]; then
        echo "❌ Failed to seed database"
        exit 1
    fi
    echo "✅ Database initialized and seeded"
else
    echo "✅ Database already exists"
fi

echo ""
echo "🎯 Starting the application..."
echo "=============================================="
echo "This will start both the frontend and backend servers."
echo ""

# Start the full-stack application
npm run dev:full

echo ""
echo "🎉 Demo started successfully!"
echo "=============================================="
echo "🌐 Frontend (Development): http://localhost:5173"
echo "🔌 Backend API: http://localhost:3001/api"
echo "🚀 Full Application: http://localhost:3001"
echo ""
echo "👥 Demo Users:"
echo "   • Admin: admin@company.com"
echo "   • Document Owner: ishaq@company.com"
echo "   • Document Controller: sudipto@company.com"
echo "   • Reviewer: arvind@company.com"
echo ""
echo "📚 Check the README.md for detailed instructions"
echo "📊 Visit the Database Status tab in Admin Dashboard to verify integration"
echo ""
echo "Press Ctrl+C to stop the application"
