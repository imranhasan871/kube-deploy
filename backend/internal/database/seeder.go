package database

import (
	"log"

	"github.com/kube-deploy/backend/internal/models"
)

// SeedDemoUsers creates demo users for testing if they don't already exist
func SeedDemoUsers() error {
	if DB == nil {
		log.Println("Database not available, skipping demo user seeding")
		return nil
	}

	demoUsers := []struct {
		email    string
		username string
		password string
		fullName string
		role     string
	}{
		{
			email:    "demo@kubedeploy.io",
			username: "demo",
			password: "demo123",
			fullName: "Demo User",
			role:     "user",
		},
		{
			email:    "admin@kubedeploy.io",
			username: "admin",
			password: "admin123",
			fullName: "Admin User",
			role:     "admin",
		},
		{
			email:    "developer@kubedeploy.io",
			username: "developer",
			password: "dev123",
			fullName: "Developer User",
			role:     "user",
		},
	}

	for _, demoUser := range demoUsers {
		// Check if user already exists
		var existingUser models.User
		err := DB.Where("email = ?", demoUser.email).First(&existingUser).Error

		if err == nil {
			log.Printf("Demo user %s already exists, skipping", demoUser.username)
			continue
		}

		// Create new user
		user := models.User{
			Email:    demoUser.email,
			Username: demoUser.username,
			FullName: demoUser.fullName,
			Role:     demoUser.role,
			Active:   true,
		}

		// Hash password
		if err := user.HashPassword(demoUser.password); err != nil {
			log.Printf("Failed to hash password for %s: %v", demoUser.username, err)
			continue
		}

		// Save to database
		if err := DB.Create(&user).Error; err != nil {
			log.Printf("Failed to create demo user %s: %v", demoUser.username, err)
			continue
		}

		log.Printf("✅ Created demo user: %s (email: %s, password: %s)",
			demoUser.username, demoUser.email, demoUser.password)
	}

	log.Println("Demo user seeding completed")
	return nil
}
