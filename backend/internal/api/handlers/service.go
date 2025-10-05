package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kube-deploy/backend/internal/k8s"
	"github.com/kube-deploy/backend/internal/models"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

type ServiceHandler struct {
	k8sClient *k8s.Client
}

func NewServiceHandler(k8sClient *k8s.Client) *ServiceHandler {
	return &ServiceHandler{k8sClient: k8sClient}
}

// CreateService handles service creation
// @Summary Create a new service
// @Description Create a Kubernetes service to expose an application
// @Tags services
// @Accept json
// @Produce json
// @Param service body models.ServiceCreateRequest true "Service configuration"
// @Success 201 {object} models.APIResponse{data=models.ServiceResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /services [post]
func (h *ServiceHandler) CreateService(c *gin.Context) {
	var req models.ServiceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Invalid request: %v", err),
		})
		return
	}

	service := h.buildServiceSpec(&req)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	createdService, err := h.k8sClient.CreateService(ctx, req.Namespace, service)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to create service: %v", err),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Service created successfully",
		Data:    h.serviceToResponse(createdService),
	})
}

// ListServices handles listing services
// @Summary List all services
// @Description Get a list of all services in the cluster or a specific namespace
// @Tags services
// @Accept json
// @Produce json
// @Param namespace query string false "Namespace filter"
// @Success 200 {object} models.APIResponse{data=[]models.ServiceResponse}
// @Failure 500 {object} models.APIResponse
// @Router /services [get]
func (h *ServiceHandler) ListServices(c *gin.Context) {
	namespace := c.Query("namespace")
	if namespace == "" {
		namespace = corev1.NamespaceAll
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	serviceList, err := h.k8sClient.ListServices(ctx, namespace)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to list services: %v", err),
		})
		return
	}

	services := make([]models.ServiceResponse, 0, len(serviceList.Items))
	for _, service := range serviceList.Items {
		services = append(services, h.serviceToResponse(&service))
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    services,
	})
}

// GetService handles getting a specific service
// @Summary Get service details
// @Description Get detailed information about a specific service
// @Tags services
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Service name"
// @Success 200 {object} models.APIResponse{data=models.ServiceResponse}
// @Failure 404 {object} models.APIResponse
// @Router /services/{namespace}/{name} [get]
func (h *ServiceHandler) GetService(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	service, err := h.k8sClient.GetService(ctx, namespace, name)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Service not found: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    h.serviceToResponse(service),
	})
}

// DeleteService handles service deletion
// @Summary Delete a service
// @Description Delete a specific service from the cluster
// @Tags services
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Service name"
// @Success 200 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /services/{namespace}/{name} [delete]
func (h *ServiceHandler) DeleteService(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := h.k8sClient.DeleteService(ctx, namespace, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to delete service: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Service deleted successfully",
	})
}

func (h *ServiceHandler) buildServiceSpec(req *models.ServiceCreateRequest) *corev1.Service {
	// Build service ports
	servicePorts := make([]corev1.ServicePort, 0, len(req.Ports))
	for _, port := range req.Ports {
		protocol := corev1.ProtocolTCP
		if port.Protocol != "" {
			protocol = corev1.Protocol(port.Protocol)
		}

		servicePort := corev1.ServicePort{
			Name:       port.Name,
			Port:       port.Port,
			TargetPort: intstr.FromInt(int(port.TargetPort)),
			Protocol:   protocol,
		}

		// Add NodePort only for NodePort type services
		if req.Type == "NodePort" && port.NodePort > 0 {
			servicePort.NodePort = port.NodePort
		}

		servicePorts = append(servicePorts, servicePort)
	}

	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      req.Name,
			Namespace: req.Namespace,
			Labels: map[string]string{
				"managed-by":  "kube-deploy",
				"created-at": time.Now().Format("2006-01-02"),
			},
		},
		Spec: corev1.ServiceSpec{
			Type:     corev1.ServiceType(req.Type),
			Selector: req.Selector,
			Ports:    servicePorts,
		},
	}

	return service
}

func (h *ServiceHandler) serviceToResponse(service *corev1.Service) models.ServiceResponse {
	ports := make([]models.ServicePort, 0, len(service.Spec.Ports))
	for _, port := range service.Spec.Ports {
		ports = append(ports, models.ServicePort{
			Name:       port.Name,
			Port:       port.Port,
			TargetPort: port.TargetPort.IntVal,
			NodePort:   port.NodePort,
			Protocol:   string(port.Protocol),
		})
	}

	externalIP := ""
	if len(service.Status.LoadBalancer.Ingress) > 0 {
		if service.Status.LoadBalancer.Ingress[0].IP != "" {
			externalIP = service.Status.LoadBalancer.Ingress[0].IP
		} else if service.Status.LoadBalancer.Ingress[0].Hostname != "" {
			externalIP = service.Status.LoadBalancer.Ingress[0].Hostname
		}
	}

	return models.ServiceResponse{
		Name:       service.Name,
		Namespace:  service.Namespace,
		Type:       string(service.Spec.Type),
		ClusterIP:  service.Spec.ClusterIP,
		ExternalIP: externalIP,
		Ports:      ports,
		CreatedAt:  service.CreationTimestamp.Format(time.RFC3339),
		Labels:     service.Labels,
	}
}
