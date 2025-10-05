package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kube-deploy/backend/internal/k8s"
	"github.com/kube-deploy/backend/internal/models"
)

type NamespaceHandler struct {
	k8sClient *k8s.Client
}

func NewNamespaceHandler(k8sClient *k8s.Client) *NamespaceHandler {
	return &NamespaceHandler{k8sClient: k8sClient}
}

// ListNamespaces handles listing all namespaces
// @Summary List all namespaces
// @Description Get a list of all namespaces in the cluster
// @Tags namespaces
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]string}
// @Failure 500 {object} models.APIResponse
// @Router /namespaces [get]
func (h *NamespaceHandler) ListNamespaces(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	namespaces, err := h.k8sClient.GetNamespaces(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to list namespaces: %v", err),
		})
		return
	}

	nsNames := make([]string, 0, len(namespaces.Items))
	for _, ns := range namespaces.Items {
		nsNames = append(nsNames, ns.Name)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    nsNames,
	})
}
