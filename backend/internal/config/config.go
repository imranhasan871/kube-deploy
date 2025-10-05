package config

import (
	"os"
	"path/filepath"
)

type Config struct {
	KubeConfigPath string
	Port           string
}

func Load() *Config {
	kubeconfig := os.Getenv("KUBECONFIG")
	if kubeconfig == "" {
		// Default to ~/.kube/config
		home, err := os.UserHomeDir()
		if err != nil {
			kubeconfig = ""
		} else {
			kubeconfig = filepath.Join(home, ".kube", "config")
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		KubeConfigPath: kubeconfig,
		Port:           port,
	}
}
