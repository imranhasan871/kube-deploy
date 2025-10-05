package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kube-deploy/backend/internal/k8s"
	"github.com/kube-deploy/backend/internal/models"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type PodHandler struct {
	k8sClient *k8s.Client
}

func NewPodHandler(k8sClient *k8s.Client) *PodHandler {
	return &PodHandler{k8sClient: k8sClient}
}

// CreatePod handles pod creation
// @Summary Create a new pod
// @Description Deploy a new pod to the Kubernetes cluster
// @Tags pods
// @Accept json
// @Produce json
// @Param pod body models.PodCreateRequest true "Pod configuration"
// @Success 201 {object} models.APIResponse{data=models.PodResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pods [post]
func (h *PodHandler) CreatePod(c *gin.Context) {
	var req models.PodCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Invalid request: %v", err),
		})
		return
	}

	// Build pod spec
	pod := h.buildPodSpec(&req)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Create pod
	createdPod, err := h.k8sClient.CreatePod(ctx, req.Namespace, pod)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to create pod: %v", err),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Pod created successfully",
		Data:    h.podToResponse(createdPod),
	})
}

// ListPods handles listing pods
// @Summary List all pods
// @Description Get a list of all pods in the cluster or a specific namespace
// @Tags pods
// @Accept json
// @Produce json
// @Param namespace query string false "Namespace filter"
// @Success 200 {object} models.APIResponse{data=[]models.PodResponse}
// @Failure 500 {object} models.APIResponse
// @Router /pods [get]
func (h *PodHandler) ListPods(c *gin.Context) {
	namespace := c.Query("namespace")
	if namespace == "" {
		namespace = corev1.NamespaceAll
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	podList, err := h.k8sClient.ListPods(ctx, namespace)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to list pods: %v", err),
		})
		return
	}

	pods := make([]models.PodResponse, 0, len(podList.Items))
	for _, pod := range podList.Items {
		pods = append(pods, h.podToResponse(&pod))
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    pods,
	})
}

// GetPod handles getting a specific pod
// @Summary Get pod details
// @Description Get detailed information about a specific pod
// @Tags pods
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Pod name"
// @Success 200 {object} models.APIResponse{data=models.PodResponse}
// @Failure 404 {object} models.APIResponse
// @Router /pods/{namespace}/{name} [get]
func (h *PodHandler) GetPod(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pod, err := h.k8sClient.GetPod(ctx, namespace, name)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Pod not found: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    h.podToResponse(pod),
	})
}

// DeletePod handles pod deletion
// @Summary Delete a pod
// @Description Delete a specific pod from the cluster
// @Tags pods
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Pod name"
// @Success 200 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pods/{namespace}/{name} [delete]
func (h *PodHandler) DeletePod(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := h.k8sClient.DeletePod(ctx, namespace, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to delete pod: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pod deleted successfully",
	})
}

// GetPodLogs handles getting pod logs
// @Summary Get pod logs
// @Description Retrieve logs from a specific pod
// @Tags pods
// @Accept json
// @Produce json
// @Param namespace path string true "Namespace"
// @Param name path string true "Pod name"
// @Param tail query int false "Number of lines to tail" default(100)
// @Success 200 {object} models.APIResponse{data=object{logs=string}}
// @Failure 500 {object} models.APIResponse
// @Router /pods/{namespace}/{name}/logs [get]
func (h *PodHandler) GetPodLogs(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("name")
	tailLines := int64(100) // default

	if tail := c.Query("tail"); tail != "" {
		if t, err := strconv.ParseInt(tail, 10, 64); err == nil {
			tailLines = t
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	logs, err := h.k8sClient.GetPodLogs(ctx, namespace, name, tailLines)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to get pod logs: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: map[string]string{
			"logs": logs,
		},
	})
}

// buildPodSpec builds a Kubernetes pod spec from the request
func (h *PodHandler) buildPodSpec(req *models.PodCreateRequest) *corev1.Pod {
	// Build container ports
	containerPorts := make([]corev1.ContainerPort, 0, len(req.Ports))
	for _, port := range req.Ports {
		containerPorts = append(containerPorts, corev1.ContainerPort{
			ContainerPort: port,
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

	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      req.Name,
			Namespace: req.Namespace,
			Labels: map[string]string{
				"app":         req.Name,
				"managed-by":  "kube-deploy",
				"deployed-at": time.Now().Format("2006-01-02"),
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:      req.Name,
					Image:     req.Image,
					Ports:     containerPorts,
					Env:       envVars,
					Resources: resources,
				},
			},
			RestartPolicy: corev1.RestartPolicyAlways,
		},
	}

	return pod
}

// podToResponse converts a Kubernetes pod to a response model
func (h *PodHandler) podToResponse(pod *corev1.Pod) models.PodResponse {
	restarts := int32(0)
	image := ""

	if len(pod.Status.ContainerStatuses) > 0 {
		restarts = pod.Status.ContainerStatuses[0].RestartCount
	}

	if len(pod.Spec.Containers) > 0 {
		image = pod.Spec.Containers[0].Image
	}

	return models.PodResponse{
		Name:      pod.Name,
		Namespace: pod.Namespace,
		Status:    string(pod.Status.Phase),
		Phase:     string(pod.Status.Phase),
		CreatedAt: pod.CreationTimestamp.Format(time.RFC3339),
		Image:     image,
		Restarts:  restarts,
		Labels:    pod.Labels,
	}
}
