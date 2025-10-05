@echo off
echo ============================================
echo  KubeDeploy - Easy Setup Script
echo ============================================
echo.

echo [1/3] Setting up Backend...
cd backend
if not exist .env (
    copy .env.example .env
    echo Created backend/.env
)
echo Installing Go dependencies...
go mod download
cd ..
echo Backend setup complete!
echo.

echo [2/3] Setting up Frontend...
cd frontend
if not exist .env (
    copy .env.example .env
    echo Created frontend/.env
)
echo Installing Node dependencies (this may take a minute)...
call npm install
cd ..
echo Frontend setup complete!
echo.

echo [3/3] Checking Kubernetes...
kubectl cluster-info >nul 2>&1
if %errorlevel% == 0 (
    echo Kubernetes is running!
) else (
    echo WARNING: Kubernetes not detected!
    echo Please enable Kubernetes in Docker Desktop:
    echo   1. Open Docker Desktop
    echo   2. Go to Settings - Kubernetes
    echo   3. Check "Enable Kubernetes"
    echo   4. Click "Apply & Restart"
)
echo.

echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo To start the application:
echo   1. Open TWO command prompts
echo   2. In first: cd backend ^&^& go run cmd/server/main.go
echo   3. In second: cd frontend ^&^& npm run dev
echo   4. Open http://localhost:5173 in your browser
echo.
echo Or use Docker: docker-compose up
echo.
pause
