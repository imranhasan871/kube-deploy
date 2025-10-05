package database

import (
	"fmt"
	"log"
	"os"

	"github.com/kube-deploy/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect establishes a connection to the database
func Connect() error {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		// Default to SQLite if DATABASE_URL is not set
		log.Println("DATABASE_URL not set, authentication features will be disabled")
		return nil
	}

	var err error
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Connected to PostgreSQL database")

	// Auto-migrate the schema
	if err := DB.AutoMigrate(&models.User{}); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed")

	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
