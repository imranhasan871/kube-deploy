# KubeDeploy API Documentation

## Overview

The KubeDeploy API provides RESTful endpoints for managing Kubernetes pods through a simple HTTP interface.

**Base URL:** `http://localhost:8080/api`

**Swagger UI:** `http://localhost:8080/swagger/index.html`

---

## Authentication

Currently, the API does not require authentication. In production, you should implement JWT-based authentication or integrate with your existing auth system.

---

## Endpoints

### Health Check

#### GET /api/health
Check if the API server is running.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### Pods

#### POST /api/pods
Create a new pod in the Kubernetes cluster.

**Request Body:**
```json
{
  "name": "nginx-app",
  "namespace": "default",
  "image": "nginx:latest",
  "replicas": 1,
  "resources": {
    "cpu": "500m",
    "memory": "512Mi"
  },
  "ports": [80, 443],
  "env": [
    {
      "name": "ENVIRONMENT",
      "value": "production"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Pod created successfully",
  "data": {
    "name": "nginx-app",
    "namespace": "default",
    "status": "Pending",
    "phase": "Pending",
    "created_at": "2025-10-05T09:30:00Z",
    "image": "nginx:latest",
    "restarts": 0,
    "labels": {
      "app": "nginx-app",
      "managed-by": "kube-deploy"
    }
  }
}
```

---

#### GET /api/pods
List all pods in the cluster or a specific namespace.

**Query Parameters:**
- `namespace` (optional): Filter pods by namespace

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "name": "nginx-app",
      "namespace": "default",
      "status": "Running",
      "phase": "Running",
      "created_at": "2025-10-05T09:30:00Z",
      "image": "nginx:latest",
      "restarts": 0,
      "labels": {
        "app": "nginx-app"
      }
    }
  ]
}
```

---

#### GET /api/pods/:namespace/:name
Get details of a specific pod.

**Path Parameters:**
- `namespace`: The namespace of the pod
- `name`: The name of the pod

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "nginx-app",
    "namespace": "default",
    "status": "Running",
    "phase": "Running",
    "created_at": "2025-10-05T09:30:00Z",
    "image": "nginx:latest",
    "restarts": 0,
    "labels": {
      "app": "nginx-app"
    }
  }
}
```

---

#### DELETE /api/pods/:namespace/:name
Delete a specific pod.

**Path Parameters:**
- `namespace`: The namespace of the pod
- `name`: The name of the pod

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pod deleted successfully"
}
```

---

#### GET /api/pods/:namespace/:name/logs
Get logs from a specific pod.

**Path Parameters:**
- `namespace`: The namespace of the pod
- `name`: The name of the pod

**Query Parameters:**
- `tail` (optional): Number of lines to tail (default: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": "2025/10/05 09:30:00 Starting nginx...\n2025/10/05 09:30:01 Server listening on port 80\n"
  }
}
```

---

### Namespaces

#### GET /api/namespaces
List all namespaces in the cluster.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "default",
    "kube-system",
    "kube-public",
    "kube-node-lease",
    "kube-deploy"
  ]
}
```

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid request: missing required field 'name'"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Pod not found: pod 'nginx-app' not found in namespace 'default'"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to create pod: connection refused"
}
```

---

## Data Models

### PodCreateRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the pod |
| namespace | string | Yes | Namespace for the pod |
| image | string | Yes | Container image to use |
| replicas | int32 | No | Number of replicas (future support) |
| resources | ResourceRequests | No | CPU and memory resources |
| ports | []int32 | No | Container ports to expose |
| env | []EnvVar | No | Environment variables |

### ResourceRequests

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cpu | string | No | CPU request (e.g., "500m") |
| memory | string | No | Memory request (e.g., "512Mi") |

### EnvVar

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Environment variable name |
| value | string | Yes | Environment variable value |

### PodResponse

| Field | Type | Description |
|-------|------|-------------|
| name | string | Pod name |
| namespace | string | Pod namespace |
| status | string | Pod status |
| phase | string | Pod phase (Pending/Running/Failed/Succeeded) |
| created_at | string | Creation timestamp (RFC3339) |
| image | string | Container image |
| restarts | int32 | Number of container restarts |
| labels | map[string]string | Pod labels |

---

## cURL Examples

### Create a Pod
```bash
curl -X POST http://localhost:8080/api/pods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-nginx",
    "namespace": "default",
    "image": "nginx:latest",
    "resources": {
      "cpu": "500m",
      "memory": "512Mi"
    },
    "ports": [80],
    "env": [
      {"name": "ENV", "value": "production"}
    ]
  }'
```

### List All Pods
```bash
curl http://localhost:8080/api/pods
```

### List Pods in Namespace
```bash
curl http://localhost:8080/api/pods?namespace=default
```

### Get Pod Details
```bash
curl http://localhost:8080/api/pods/default/my-nginx
```

### Get Pod Logs
```bash
curl http://localhost:8080/api/pods/default/my-nginx/logs?tail=50
```

### Delete a Pod
```bash
curl -X DELETE http://localhost:8080/api/pods/default/my-nginx
```

### List Namespaces
```bash
curl http://localhost:8080/api/namespaces
```

---

## Interactive API Documentation

For interactive API documentation and testing, visit the Swagger UI:

```
http://localhost:8080/swagger/index.html
```

The Swagger UI provides:
- Complete API documentation
- Request/response schemas
- Try-it-out functionality to test endpoints
- Example requests and responses

---

## Rate Limiting

Currently, there are no rate limits. For production use, implement rate limiting middleware.

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (frontend dev server)
- `http://localhost:3000` (alternative frontend)

Update the CORS configuration in `backend/cmd/server/main.go` for production domains.

---

## WebSocket Support (Future)

Future versions will support WebSocket connections for:
- Real-time pod status updates
- Live log streaming
- Event notifications
