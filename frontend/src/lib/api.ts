import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const podAPI = {
  list: (namespace?: string) =>
    api.get('/pods', { params: { namespace } }),

  get: (namespace: string, name: string) =>
    api.get(`/pods/${namespace}/${name}`),

  create: (data: any) =>
    api.post('/pods', data),

  delete: (namespace: string, name: string) =>
    api.delete(`/pods/${namespace}/${name}`),

  getLogs: (namespace: string, name: string, tail?: number) =>
    api.get(`/pods/${namespace}/${name}/logs`, { params: { tail } }),
};

export const namespaceAPI = {
  list: () => api.get('/namespaces'),
};

// Deployment API
export const deploymentAPI = {
  list: (namespace?: string) =>
    api.get("/deployments", { params: { namespace } }),

  get: (namespace: string, name: string) =>
    api.get(`/deployments/${namespace}/${name}`),

  create: (data: any) =>
    api.post("/deployments", data),

  delete: (namespace: string, name: string) =>
    api.delete(`/deployments/${namespace}/${name}`),

  scale: (namespace: string, name: string, replicas: number) =>
    api.put(`/deployments/${namespace}/${name}/scale`, { replicas }),
};

// Service API
export const serviceAPI = {
  list: (namespace?: string) =>
    api.get("/services", { params: { namespace } }),

  get: (namespace: string, name: string) =>
    api.get(`/services/${namespace}/${name}`),

  create: (data: any) =>
    api.post("/services", data),

  delete: (namespace: string, name: string) =>
    api.delete(`/services/${namespace}/${name}`),
};

// Auth API
export const authAPI = {
  signup: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post("/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  me: () =>
    api.get("/auth/me"),
};
