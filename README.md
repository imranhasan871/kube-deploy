# 🚀 KubeDeploy - Kubernetes Made Simple

Beautiful, production-ready platform for deploying and managing Kubernetes applications with an intuitive web interface.

![React](https://img.shields.io/badge/React-19-blue) ![Go](https://img.shields.io/badge/Go-1.21+-00ADD8) ![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5)

## ✨ Features

- 🎨 Beautiful Modern UI with gradient design
- 🔐 Secure authentication with JWT
- 📦 Pod Management - Create, list, delete, view logs
- 🚢 Full Deployment management with scaling
- 🌐 Service exposure - LoadBalancer, NodePort, ClusterIP
- 📊 Real-time Dashboard
- 🎯 Advanced deployment with file upload
- 💾 Optional PostgreSQL authentication

---

## 🚀 Quick Start (3 Easy Steps!)

### Step 1: Install Prerequisites

**Required:**
- [Node.js](https://nodejs.org/) v18+ 
- [Go](https://golang.org/dl/) v1.21+
- [Docker Desktop](https://www.docker.com/products/docker-desktop) with Kubernetes enabled

**Optional:**
- PostgreSQL (for login/signup features)

### Step 2: Setup Project

Open terminal and run:

```bash
# Backend setup
cd backend
cp .env.example .env
go mod download

# Frontend setup  
cd ../frontend
cp .env.example .env
npm install
```

### Step 3: Start Everything

**Open 2 terminals:**

Terminal 1 - Start Backend:
```bash
cd backend
go run cmd/server/main.go
```

Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

**Done!** Open http://localhost:5173 in your browser 🎉

---

## 🐳 Even Easier with Docker

```bash
# Start everything with one command
docker-compose up

# Access at http://localhost:3000
```

---

## ⚙️ Enable Kubernetes

**Using Docker Desktop (Recommended):**
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for green light ✅

**Or using Minikube:**
```bash
minikube start
```

---

## 🔐 Enable Login/Signup (Optional)

**Start PostgreSQL:**
```bash
docker run -d --name kubedeploy-postgres \
  -e POSTGRES_USER=kubedeploy \
  -e POSTGRES_PASSWORD=kubedeploy123 \
  -e POSTGRES_DB=kubedeploy \
  -p 5432:5432 \
  postgres:latest
```

**Update backend/.env:**
```bash
DATABASE_URL=postgresql://kubedeploy:kubedeploy123@localhost:5432/kubedeploy?sslmode=disable
```

**Restart backend** - now you have signup/login! 🔒

---

## 📖 How to Use

### Deploy Your First App

1. Open http://localhost:5173
2. Click "Deploy" in navigation
3. Fill in:
   - **Name**: my-app
   - **Namespace**: default  
   - **Image**: nginx:latest
4. Click "Deploy Application"
5. See it running in Dashboard! ✨

### Advanced Features

**Scale Deployments:**
- Go to "Deployments"
- Click +/- to scale replicas

**Expose with LoadBalancer:**
- Use "Advanced Deploy"
- Check "Create Service"
- Select "LoadBalancer"

**View Logs:**
- Go to "Pods"
- Click on any pod
- View real-time logs

---

## 🛠️ Troubleshooting

**Backend won't start?**
```bash
# Make sure Kubernetes is running
kubectl cluster-info
```

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

**CORS error?**
- Make sure backend is on port 8080
- Check frontend/.env has VITE_API_URL=http://localhost:8080/api

---

## 📁 Project Structure

```
kube-deploy/
├── backend/              # Go API server
│   ├── cmd/server/      # Main entry point
│   ├── internal/        # Business logic
│   └── .env.example     # Config template
│
├── frontend/            # React 19 app
│   ├── src/pages/      # UI pages
│   ├── src/components/ # Reusable components
│   └── .env.example    # Config template
│
└── docker-compose.yml  # One-command startup
```

---

## 🌐 Available URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/swagger/index.html
- **Health Check**: http://localhost:8080/api/health

---

## 📝 Configuration

**Backend** (`backend/.env`):
```bash
PORT=8080
JWT_SECRET=change-this-secret
# DATABASE_URL=postgresql://... (optional)
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:8080/api
```

---

## 🎯 Main Features Explained

### Dashboard
- Overview of all resources
- Real-time status updates
- Quick health monitoring

### Deployments
- Create multi-replica applications
- Scale up/down easily
- Auto-healing and rolling updates

### Services  
- Expose apps internally (ClusterIP)
- Access via node IP (NodePort)
- Get public IP (LoadBalancer)

### Advanced Deploy
- Upload project files (zip)
- Set environment variables
- Configure resource limits
- Multi-port configuration

---

## 🔒 Production Tips

1. **Change JWT Secret** in backend/.env
2. **Enable HTTPS** with reverse proxy
3. **Use strong database passwords**
4. **Enable RBAC** in Kubernetes
5. **Use secrets management** for sensitive data

---

## 📚 API Endpoints

**Authentication:**
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

**Pods:**
- GET /api/pods
- POST /api/pods
- DELETE /api/pods/:namespace/:name

**Deployments:**
- GET /api/deployments
- POST /api/deployments
- PUT /api/deployments/:namespace/:name/scale

**Services:**
- GET /api/services
- POST /api/services
- DELETE /api/services/:namespace/:name

[Full API docs at /swagger]

---

## 🤝 Contributing

Pull requests welcome! Feel free to:
- Report bugs
- Suggest features
- Improve documentation

---

## 📧 Need Help?

1. Check troubleshooting section above
2. Open an issue on GitHub
3. Check /swagger for API documentation

---

## 🎉 Tech Stack

- React 19 + Vite
- Go + Gin framework
- Kubernetes client-go
- PostgreSQL + GORM
- Tailwind CSS
- JWT authentication

---

**Happy Deploying! 🚀**

Built with ❤️ for the Kubernetes community
