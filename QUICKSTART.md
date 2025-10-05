# 🚀 QUICKSTART - Get Running in 5 Minutes!

This guide helps you run KubeDeploy on your local PC.

---

## Step 1: Install Software (10 minutes)

### 1. Node.js
- Go to: https://nodejs.org/
- Download **LTS** version
- Install and verify: `node --version`

### 2. Go
- Go to: https://golang.org/dl/
- Download and install
- Verify: `go version`

### 3. Docker Desktop + Kubernetes
- Download: https://www.docker.com/products/docker-desktop
- Install Docker Desktop
- **Enable Kubernetes:**
  1. Open Docker Desktop
  2. Settings → Kubernetes
  3. Check "Enable Kubernetes"
  4. Apply & Restart
  5. Wait for green light ✅

---

## Step 2: Setup Project (2 minutes)

**Windows:** Double-click `setup.bat`

**Mac/Linux:**
```bash
./setup.sh
```

---

## Step 3: Start Application

Open **2 terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
go run cmd/server/main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 4: Open Browser 🎉

Go to: **http://localhost:5173**

---

## 🎯 Deploy Your First App

1. Click "Deploy"
2. Fill in:
   - Name: my-app
   - Namespace: default
   - Image: nginx:latest
3. Click "Deploy Application"
4. See it in Dashboard!

---

## ❓ Troubleshooting

**Kubernetes not detected?**
- Check Docker Desktop is running
- Kubernetes enabled and green

**Port in use?**
- Close other apps or restart PC

**Backend errors?**
- Wait for Kubernetes to fully start

---

## 🚀 Even Easier

Use Docker Compose:
```bash
docker-compose up
```

---

**Need more help?** See [README.md](README.md)

**Happy Deploying! 🎉**
