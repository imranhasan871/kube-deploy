package models

// PodCreateRequest represents a request to create a pod
type PodCreateRequest struct {
	Name      string            `json:"name" binding:"required"`
	Namespace string            `json:"namespace" binding:"required"`
	Image     string            `json:"image" binding:"required"`
	Replicas  int32             `json:"replicas"`
	Resources ResourceRequests  `json:"resources"`
	Ports     []int32           `json:"ports"`
	Env       []EnvVar          `json:"env"`
}

// ResourceRequests defines CPU and memory requests
type ResourceRequests struct {
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
}

// EnvVar represents an environment variable
type EnvVar struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// PodResponse represents a pod in the response
type PodResponse struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Status    string            `json:"status"`
	Phase     string            `json:"phase"`
	CreatedAt string            `json:"created_at"`
	Image     string            `json:"image"`
	Restarts  int32             `json:"restarts"`
	Labels    map[string]string `json:"labels,omitempty"`
}

// APIResponse represents a generic API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
