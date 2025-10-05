#!/bin/bash

echo "============================================"
echo " KubeDeploy - Easy Setup Script"
echo "============================================"
echo ""

echo "[1/3] Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created backend/.env"
fi
echo "Installing Go dependencies..."
go mod download
cd ..
echo "Backend setup complete!"
echo ""

echo "[2/3] Setting up Frontend..."
cd frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created frontend/.env"
fi
echo "Installing Node dependencies (this may take a minute)..."
npm install
cd ..
echo "Frontend setup complete!"
echo ""

echo "[3/3] Checking Kubernetes..."
if kubectl cluster-info &> /dev/null; then
    echo "✓ Kubernetes is running!"
else
    echo "⚠ WARNING: Kubernetes not detected!"
    echo "Please enable Kubernetes:"
    echo "  Docker Desktop: Settings → Kubernetes → Enable"
    echo "  Or run: minikube start"
fi
echo ""

echo "============================================"
echo " Setup Complete!"
echo "============================================"
echo ""
echo "To start the application:"
echo "  1. Open TWO terminals"
echo "  2. In first: cd backend && go run cmd/server/main.go"
echo "  3. In second: cd frontend && npm run dev"
echo "  4. Open http://localhost:5173 in your browser"
echo ""
echo "Or use Docker: docker-compose up"
echo ""
