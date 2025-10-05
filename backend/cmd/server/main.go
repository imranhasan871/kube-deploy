package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/kube-deploy/backend/internal/api/handlers"
	"github.com/kube-deploy/backend/internal/config"
	"github.com/kube-deploy/backend/internal/database"
	"github.com/kube-deploy/backend/internal/k8s"
	"github.com/kube-deploy/backend/internal/middleware"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/kube-deploy/backend/docs"
)

// @title KubeDeploy API
// @version 1.0
// @description Kubernetes Pod-as-a-Service API for deploying and managing pods
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@kubedeploy.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database (optional - for authentication)
	if err := database.Connect(); err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
		log.Println("Authentication features will be disabled")
	} else {
		// Seed demo users for testing
		if err := database.SeedDemoUsers(); err != nil {
			log.Printf("Warning: Failed to seed demo users: %v", err)
		}
	}

	// Initialize Kubernetes client
	k8sClient, err := k8s.NewClient(cfg.KubeConfigPath)
	if err != nil {
		log.Fatalf("Failed to initialize Kubernetes client: %v", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// Configure CORS - Allow all localhost ports for development
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	podHandler := handlers.NewPodHandler(k8sClient)
	deploymentHandler := handlers.NewDeploymentHandler(k8sClient)
	serviceHandler := handlers.NewServiceHandler(k8sClient)
	namespaceHandler := handlers.NewNamespaceHandler(k8sClient)

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API routes
	api := router.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/signup", authHandler.Signup)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(), authHandler.Me)
		}

		// Protected routes (require authentication if database is available)
		// If no database, routes are accessible without auth
		protected := api.Group("")
		if database.GetDB() != nil {
			protected.Use(middleware.OptionalAuthMiddleware())
		}
		{
			// Pod routes
			protected.POST("/pods", podHandler.CreatePod)
			protected.GET("/pods", podHandler.ListPods)
			protected.GET("/pods/:namespace/:name", podHandler.GetPod)
			protected.DELETE("/pods/:namespace/:name", podHandler.DeletePod)
			protected.GET("/pods/:namespace/:name/logs", podHandler.GetPodLogs)

			// Deployment routes
			protected.POST("/deployments", deploymentHandler.CreateDeployment)
			protected.GET("/deployments", deploymentHandler.ListDeployments)
			protected.GET("/deployments/:namespace/:name", deploymentHandler.GetDeployment)
			protected.DELETE("/deployments/:namespace/:name", deploymentHandler.DeleteDeployment)
			protected.PUT("/deployments/:namespace/:name/scale", deploymentHandler.ScaleDeployment)

			// Service routes
			protected.POST("/services", serviceHandler.CreateService)
			protected.GET("/services", serviceHandler.ListServices)
			protected.GET("/services/:namespace/:name", serviceHandler.GetService)
			protected.DELETE("/services/:namespace/:name", serviceHandler.DeleteService)

			// Namespace routes
			protected.GET("/namespaces", namespaceHandler.ListNamespaces)
		}

		// Health check
		api.GET("/health", func(c *gin.Context) {
			dbStatus := "disabled"
			if database.GetDB() != nil {
				dbStatus = "connected"
			}
			c.JSON(200, gin.H{
				"status":   "healthy",
				"database": dbStatus,
			})
		})
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
