package models

// DeploymentCreateRequest represents a request to create a deployment
type DeploymentCreateRequest struct {
	Name      string            `json:"name" binding:"required"`
	Namespace string            `json:"namespace" binding:"required"`
	Image     string            `json:"image" binding:"required"`
	Replicas  int32             `json:"replicas" binding:"required"`
	Resources ResourceRequests  `json:"resources"`
	Ports     []ContainerPort   `json:"ports"`
	Env       []EnvVar          `json:"env"`
	Volumes   []Volume          `json:"volumes"`
	Command   []string          `json:"command"`
	Args      []string          `json:"args"`
}

// ServiceCreateRequest represents a request to create a service
type ServiceCreateRequest struct {
	Name       string            `json:"name" binding:"required"`
	Namespace  string            `json:"namespace" binding:"required"`
	Type       string            `json:"type" binding:"required"` // ClusterIP, NodePort, LoadBalancer
	Selector   map[string]string `json:"selector" binding:"required"`
	Ports      []ServicePort     `json:"ports" binding:"required"`
}

// ContainerPort represents a container port
type ContainerPort struct {
	Name          string `json:"name"`
	ContainerPort int32  `json:"containerPort" binding:"required"`
	Protocol      string `json:"protocol"` // TCP, UDP
}

// ServicePort represents a service port
type ServicePort struct {
	Name       string `json:"name"`
	Port       int32  `json:"port" binding:"required"`
	TargetPort int32  `json:"targetPort" binding:"required"`
	NodePort   int32  `json:"nodePort"` // Only for NodePort type
	Protocol   string `json:"protocol"` // TCP, UDP
}

// Volume represents a volume mount
type Volume struct {
	Name      string `json:"name" binding:"required"`
	MountPath string `json:"mountPath" binding:"required"`
	Type      string `json:"type"` // emptyDir, configMap, secret, persistentVolumeClaim
	Source    string `json:"source"` // Name of configMap, secret, or PVC
}

// DeploymentResponse represents a deployment in the response
type DeploymentResponse struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	Replicas          int32             `json:"replicas"`
	AvailableReplicas int32             `json:"availableReplicas"`
	ReadyReplicas     int32             `json:"readyReplicas"`
	CreatedAt         string            `json:"created_at"`
	Image             string            `json:"image"`
	Labels            map[string]string `json:"labels,omitempty"`
}

// ServiceResponse represents a service in the response
type ServiceResponse struct {
	Name         string            `json:"name"`
	Namespace    string            `json:"namespace"`
	Type         string            `json:"type"`
	ClusterIP    string            `json:"clusterIP"`
	ExternalIP   string            `json:"externalIP,omitempty"`
	Ports        []ServicePort     `json:"ports"`
	CreatedAt    string            `json:"created_at"`
	Labels       map[string]string `json:"labels,omitempty"`
}
