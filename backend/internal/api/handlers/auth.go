package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kube-deploy/backend/internal/database"
	"github.com/kube-deploy/backend/internal/models"
	"github.com/kube-deploy/backend/internal/utils"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// Signup godoc
// @Summary Register a new user
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.SignupRequest true "Signup request"
// @Success 201 {object} models.APIResponse{data=models.LoginResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /auth/signup [post]
func (h *AuthHandler) Signup(c *gin.Context) {
	var req models.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, models.APIResponse{
			Success: false,
			Error:   "Database not available. Authentication is disabled.",
		})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := db.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "User with this email or username already exists",
		})
		return
	}

	// Create new user
	user := models.User{
		Email:    req.Email,
		Username: req.Username,
		FullName: req.FullName,
		Role:     "user",
		Active:   true,
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to hash password",
		})
		return
	}

	// Save user to database
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create user",
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data: models.LoginResponse{
			Token: token,
			User:  user,
		},
	})
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login request"
// @Success 200 {object} models.APIResponse{data=models.LoginResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, models.APIResponse{
			Success: false,
			Error:   "Database not available. Authentication is disabled.",
		})
		return
	}

	// Find user by email
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "Invalid email or password",
		})
		return
	}

	// Check if user is active
	if !user.Active {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "Account is disabled",
		})
		return
	}

	// Verify password
	if err := user.CheckPassword(req.Password); err != nil {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "Invalid email or password",
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: models.LoginResponse{
			Token: token,
			User:  user,
		},
	})
}

// Me godoc
// @Summary Get current user
// @Description Get the currently authenticated user's information
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.APIResponse{data=models.User}
// @Failure 401 {object} models.APIResponse
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, models.APIResponse{
			Success: false,
			Error:   "Database not available",
		})
		return
	}

	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    user,
	})
}
