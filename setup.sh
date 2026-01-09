#!/bin/bash
# 🚀 QUICK START SCRIPT
# Этот скрипт полностью настроит и запустит приложение

echo "════════════════════════════════════════"
echo "  🛍️  E-COMMERCE APP - QUICK START"
echo "════════════════════════════════════════"
echo ""

# Проверка Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install it from nodejs.org"
    exit 1
fi
echo "  ✅ Node.js $(node -v) found"
echo ""

# Проверка npm
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found! Please install Node.js"
    exit 1
fi
echo "  ✅ npm $(npm -v) found"
echo ""

# Установка зависимостей фронтенда
echo "✓ Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "  ✅ Frontend dependencies installed"
else
    echo "  ✅ Frontend dependencies already installed"
fi
echo ""

# Установка зависимостей бекенда
echo "✓ Installing backend dependencies..."
if [ ! -d "back_shop/node_modules" ]; then
    cd back_shop
    npm install
    cd ..
    echo "  ✅ Backend dependencies installed"
else
    echo "  ✅ Backend dependencies already installed"
fi
echo ""

# MongoDB check
echo "✓ Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "  ✅ MongoDB found. Start it manually with: mongod"
else
    echo "  ⚠️  MongoDB not found. Visit: https://www.mongodb.com/try/download/community"
    echo "  Or use MongoDB Atlas (cloud) for free"
fi
echo ""

echo "════════════════════════════════════════"
echo "  📖 READY TO START!"
echo "════════════════════════════════════════"
echo ""
echo "Follow these steps:"
echo ""
echo "1️⃣  Open Terminal 1 and run MongoDB:"
echo "   mongod"
echo ""
echo "2️⃣  Open Terminal 2 and start Backend:"
echo "   npm run backend:dev"
echo ""
echo "3️⃣  Open Terminal 3 and start Frontend:"
echo "   npm run dev"
echo ""
echo "🌐 Frontend will open at: http://localhost:5173"
echo "🔌 Backend API at:        http://localhost:3000/api"
echo ""
echo "Happy coding! 🚀"
echo ""
