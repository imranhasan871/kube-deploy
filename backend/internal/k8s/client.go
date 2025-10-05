package k8s

import (
	"context"
	"fmt"
	"io"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type Client struct {
	clientset *kubernetes.Clientset
}

// NewClient creates a new Kubernetes client
func NewClient(kubeconfigPath string) (*Client, error) {
	var config *rest.Config
	var err error

	// Try in-cluster config first
	config, err = rest.InClusterConfig()
	if err != nil {
		// Fall back to kubeconfig file
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfigPath)
		if err != nil {
			return nil, fmt.Errorf("failed to build config: %w", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create clientset: %w", err)
	}

	return &Client{clientset: clientset}, nil
}

// GetClientset returns the underlying Kubernetes clientset
func (c *Client) GetClientset() *kubernetes.Clientset {
	return c.clientset
}

// TestConnection tests the connection to the Kubernetes cluster
func (c *Client) TestConnection(ctx context.Context) error {
	_, err := c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{Limit: 1})
	return err
}

// GetNamespaces returns all namespaces
func (c *Client) GetNamespaces(ctx context.Context) (*corev1.NamespaceList, error) {
	return c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
}

// CreatePod creates a new pod
func (c *Client) CreatePod(ctx context.Context, namespace string, pod *corev1.Pod) (*corev1.Pod, error) {
	return c.clientset.CoreV1().Pods(namespace).Create(ctx, pod, metav1.CreateOptions{})
}

// GetPod gets a pod by name and namespace
func (c *Client) GetPod(ctx context.Context, namespace, name string) (*corev1.Pod, error) {
	return c.clientset.CoreV1().Pods(namespace).Get(ctx, name, metav1.GetOptions{})
}

// ListPods lists all pods in a namespace (or all namespaces if namespace is empty)
func (c *Client) ListPods(ctx context.Context, namespace string) (*corev1.PodList, error) {
	return c.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
}

// DeletePod deletes a pod
func (c *Client) DeletePod(ctx context.Context, namespace, name string) error {
	return c.clientset.CoreV1().Pods(namespace).Delete(ctx, name, metav1.DeleteOptions{})
}

// GetPodLogs gets logs from a pod
func (c *Client) GetPodLogs(ctx context.Context, namespace, name string, tailLines int64) (string, error) {
	podLogOpts := corev1.PodLogOptions{}
	if tailLines > 0 {
		podLogOpts.TailLines = &tailLines
	}

	req := c.clientset.CoreV1().Pods(namespace).GetLogs(name, &podLogOpts)
	podLogs, err := req.Stream(ctx)
	if err != nil {
		return "", fmt.Errorf("error opening log stream: %w", err)
	}
	defer podLogs.Close()

	buf := new(io.Reader)
	*buf = podLogs
	logs, err := io.ReadAll(*buf)
	if err != nil {
		return "", fmt.Errorf("error reading logs: %w", err)
	}

	return string(logs), nil
}
