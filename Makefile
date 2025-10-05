.PHONY: help backend frontend docker-build k8s-deploy k8s-delete dev-backend dev-frontend

help:
	@echo "Available commands:"
	@echo "  make dev-backend       - Run backend in development mode"
	@echo "  make dev-frontend      - Run frontend in development mode"
	@echo "  make docker-build      - Build Docker images"
	@echo "  make k8s-deploy        - Deploy to Kubernetes"
	@echo "  make k8s-delete        - Delete from Kubernetes"
	@echo "  make clean             - Clean build artifacts"

# Development
dev-backend:
	cd backend && go run cmd/server/main.go

dev-frontend:
	cd frontend && npm run dev

# Docker
docker-build:
	docker build -f docker/backend.Dockerfile -t kube-deploy-backend:latest .
	docker build -f docker/frontend.Dockerfile -t kube-deploy-frontend:latest .

# Kubernetes
k8s-deploy: docker-build
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/rbac.yaml
	kubectl apply -f k8s/backend-deployment.yaml
	kubectl apply -f k8s/frontend-deployment.yaml
	kubectl apply -f k8s/ingress.yaml
	@echo "\nDeployment complete! Access the application at:"
	@echo "  http://localhost:30080 (NodePort)"
	@echo "  http://kube-deploy.local (Ingress - add to /etc/hosts)"

k8s-delete:
	kubectl delete -f k8s/ingress.yaml --ignore-not-found
	kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found
	kubectl delete -f k8s/backend-deployment.yaml --ignore-not-found
	kubectl delete -f k8s/rbac.yaml --ignore-not-found
	kubectl delete -f k8s/namespace.yaml --ignore-not-found

# Clean
clean:
	cd backend && go clean
	cd frontend && rm -rf dist node_modules
