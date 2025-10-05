package k8s

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// CreateDeployment creates a new deployment
func (c *Client) CreateDeployment(ctx context.Context, namespace string, deployment *appsv1.Deployment) (*appsv1.Deployment, error) {
	return c.clientset.AppsV1().Deployments(namespace).Create(ctx, deployment, metav1.CreateOptions{})
}

// GetDeployment gets a deployment by name and namespace
func (c *Client) GetDeployment(ctx context.Context, namespace, name string) (*appsv1.Deployment, error) {
	return c.clientset.AppsV1().Deployments(namespace).Get(ctx, name, metav1.GetOptions{})
}

// ListDeployments lists all deployments in a namespace
func (c *Client) ListDeployments(ctx context.Context, namespace string) (*appsv1.DeploymentList, error) {
	return c.clientset.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
}

// DeleteDeployment deletes a deployment
func (c *Client) DeleteDeployment(ctx context.Context, namespace, name string) error {
	return c.clientset.AppsV1().Deployments(namespace).Delete(ctx, name, metav1.DeleteOptions{})
}

// ScaleDeployment scales a deployment to the specified number of replicas
func (c *Client) ScaleDeployment(ctx context.Context, namespace, name string, replicas int32) error {
	deployment, err := c.GetDeployment(ctx, namespace, name)
	if err != nil {
		return fmt.Errorf("failed to get deployment: %w", err)
	}

	deployment.Spec.Replicas = &replicas
	_, err = c.clientset.AppsV1().Deployments(namespace).Update(ctx, deployment, metav1.UpdateOptions{})
	return err
}

// CreateService creates a new service
func (c *Client) CreateService(ctx context.Context, namespace string, service *corev1.Service) (*corev1.Service, error) {
	return c.clientset.CoreV1().Services(namespace).Create(ctx, service, metav1.CreateOptions{})
}

// GetService gets a service by name and namespace
func (c *Client) GetService(ctx context.Context, namespace, name string) (*corev1.Service, error) {
	return c.clientset.CoreV1().Services(namespace).Get(ctx, name, metav1.GetOptions{})
}

// ListServices lists all services in a namespace
func (c *Client) ListServices(ctx context.Context, namespace string) (*corev1.ServiceList, error) {
	return c.clientset.CoreV1().Services(namespace).List(ctx, metav1.ListOptions{})
}

// DeleteService deletes a service
func (c *Client) DeleteService(ctx context.Context, namespace, name string) error {
	return c.clientset.CoreV1().Services(namespace).Delete(ctx, name, metav1.DeleteOptions{})
}
