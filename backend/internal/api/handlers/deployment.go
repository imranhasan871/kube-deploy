package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kube-deploy/backend/internal/k8s"
	"github.com/kube-deploy/backend/internal/models"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type DeploymentHandler struct {
	k8sClient *k8s.Client
}

func NewDeploymentHandler(k8sClient *k8s.Client) *DeploymentHandler {
	return &DeploymentHandler{k8sClient: k8sClient}
}

// CreateDeployment handles deployment creation
// @Summary Create a new deployment
// @Description Deploy a new application to the Kubernetes cluster
// @Tags deployments
// @Accept json
// @Produce json
// @Param deployment body models.DeploymentCreateRequest true "Deployment configuration"
// @Success 201 {object} models.APIResponse{data=models.DeploymentResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /deployments [post]
func (h *DeploymentHandler) CreateDeployment(c *gin.Context) {
	var req models.DeploymentCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Invalid request: %v", err),
		})
		return
	}

	deployment := h.buildDeploymentSpec(&req)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	createdDeployment, err := h.k8sClient.CreateDeployment(ctx, req.Namespace, deployment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to create deployment: %v", err),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Deployment created successfully",
		Data:    h.deploymentToResponse(createdDeployment),
	})
}

// ListDeployments handles listing deployments
// @Summary List all deployments
// @Description Get a list of all deployments in the cluster or a specific namespace
// @Tags deployments
// @Accept json
// @Produce json
// @Param namespace query string false "Namespace filter"
// @Success 200 {object} models.APIResponse{data=[]models.DeploymentResponse}
// @Failure 500 {object} models.APIResponse
// @Router /deployments [get]
func (h *DeploymentHandler) ListDeployments(c *gin.Context) {
	namespace := c.Query("namespace")
	if namespace == "" {
		namespace = corev1.NamespaceAll
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	deploymentList, err := h.k8sClient.ListDeployments(ctx, namespace)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to list deployments: %v", err),
		})
		return
	}

	deployments := make([]models.DeploymentResponse, 0, len(deploymentList.Items))
	for _, deployment := range deploymentList.Items {
		deployments = append(deployments, h.deploymentToResponse(&deployment))
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    deployments,
	})
}

// GetDeployment handles getting a specific deployment
// @Summary Get deployment details
// @Description Get detailed information about a specific deployment
// @Tags deployments
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Deployment name"
// @Success 200 {object} models.APIResponse{data=models.DeploymentResponse}
// @Failure 404 {object} models.APIResponse
// @Router /deployments/{namespace}/{name} [get]
func (h *DeploymentHandler) GetDeployment(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	deployment, err := h.k8sClient.GetDeployment(ctx, namespace, name)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Deployment not found: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    h.deploymentToResponse(deployment),
	})
}

// DeleteDeployment handles deployment deletion
// @Summary Delete a deployment
// @Description Delete a specific deployment from the cluster
// @Tags deployments
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Deployment name"
// @Success 200 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /deployments/{namespace}/{name} [delete]
func (h *DeploymentHandler) DeleteDeployment(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := h.k8sClient.DeleteDeployment(ctx, namespace, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to delete deployment: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Deployment deleted successfully",
	})
}

// ScaleDeployment handles deployment scaling
// @Summary Scale a deployment
// @Description Scale a deployment to a specific number of replicas
// @Tags deployments
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Deployment name"
// @Param replicas query int true "Number of replicas"
// @Success 200 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /deployments/{namespace}/{name}/scale [put]
func (h *DeploymentHandler) ScaleDeployment(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")
	replicas := c.Query("replicas")

	var replicaCount int32
	if _, err := fmt.Sscanf(replicas, "%d", &replicaCount); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid replicas number",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := h.k8sClient.ScaleDeployment(ctx, namespace, name, replicaCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to scale deployment: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: fmt.Sprintf("Deployment scaled to %d replicas", replicaCount),
	})
}

func (h *DeploymentHandler) buildDeploymentSpec(req *models.DeploymentCreateRequest) *appsv1.Deployment {
	// Build container ports
	containerPorts := make([]corev1.ContainerPort, 0, len(req.Ports))
	for _, port := range req.Ports {
		protocol := corev1.ProtocolTCP
		if port.Protocol != "" {
			protocol = corev1.Protocol(port.Protocol)
		}
		containerPorts = append(containerPorts, corev1.ContainerPort{
			Name:          port.Name,
			ContainerPort: port.ContainerPort,
			Protocol:      protocol,
		})
	}

	// Build environment variables
	envVars := make([]corev1.EnvVar, 0, len(req.Env))
	for _, env := range req.Env {
		envVars = append(envVars, corev1.EnvVar{
			Name:  env.Name,
			Value: env.Value,
		})
	}

	// Build resource requirements
	resources := corev1.ResourceRequirements{}
	if req.Resources.CPU != "" || req.Resources.Memory != "" {
		resources.Requests = corev1.ResourceList{}
		resources.Limits = corev1.ResourceList{}

		if req.Resources.CPU != "" {
			resources.Requests[corev1.ResourceCPU] = resource.MustParse(req.Resources.CPU)
			resources.Limits[corev1.ResourceCPU] = resource.MustParse(req.Resources.CPU)
		}
		if req.Resources.Memory != "" {
			resources.Requests[corev1.ResourceMemory] = resource.MustParse(req.Resources.Memory)
			resources.Limits[corev1.ResourceMemory] = resource.MustParse(req.Resources.Memory)
		}
	}

	// Build volume mounts
	volumeMounts := make([]corev1.VolumeMount, 0, len(req.Volumes))
	volumes := make([]corev1.Volume, 0, len(req.Volumes))
	for _, vol := range req.Volumes {
		volumeMounts = append(volumeMounts, corev1.VolumeMount{
			Name:      vol.Name,
			MountPath: vol.MountPath,
		})

		volumeSource := corev1.VolumeSource{}
		switch vol.Type {
		case "emptyDir":
			volumeSource.EmptyDir = &corev1.EmptyDirVolumeSource{}
		case "configMap":
			volumeSource.ConfigMap = &corev1.ConfigMapVolumeSource{
				LocalObjectReference: corev1.LocalObjectReference{Name: vol.Source},
			}
		case "secret":
			volumeSource.Secret = &corev1.SecretVolumeSource{
				SecretName: vol.Source,
			}
		case "persistentVolumeClaim":
			volumeSource.PersistentVolumeClaim = &corev1.PersistentVolumeClaimVolumeSource{
				ClaimName: vol.Source,
			}
		}

		volumes = append(volumes, corev1.Volume{
			Name:         vol.Name,
			VolumeSource: volumeSource,
		})
	}

	labels := map[string]string{
		"app":         req.Name,
		"managed-by":  "kube-deploy",
		"deployed-at": time.Now().Format("2006-01-02"),
	}

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      req.Name,
			Namespace: req.Namespace,
			Labels:    labels,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &req.Replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": req.Name,
				},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:         req.Name,
							Image:        req.Image,
							Ports:        containerPorts,
							Env:          envVars,
							Resources:    resources,
							VolumeMounts: volumeMounts,
							Command:      req.Command,
							Args:         req.Args,
						},
					},
					Volumes: volumes,
				},
			},
		},
	}

	return deployment
}

func (h *DeploymentHandler) deploymentToResponse(deployment *appsv1.Deployment) models.DeploymentResponse {
	image := ""
	if len(deployment.Spec.Template.Spec.Containers) > 0 {
		image = deployment.Spec.Template.Spec.Containers[0].Image
	}

	replicas := int32(0)
	if deployment.Spec.Replicas != nil {
		replicas = *deployment.Spec.Replicas
	}

	return models.DeploymentResponse{
		Name:              deployment.Name,
		Namespace:         deployment.Namespace,
		Replicas:          replicas,
		AvailableReplicas: deployment.Status.AvailableReplicas,
		ReadyReplicas:     deployment.Status.ReadyReplicas,
		CreatedAt:         deployment.CreationTimestamp.Format(time.RFC3339),
		Image:             image,
		Labels:            deployment.Labels,
	}
}
