# Todo AI Chatbot - Helm Deployment Guide

**Chart Version**: 0.1.0
**App Version**: 1.0.0
**Target Platform**: Minikube (Local Kubernetes)

## Overview

This Helm chart deploys the Todo AI Chatbot application to a local Kubernetes cluster running on Minikube. The application consists of two main components:

- **Frontend**: Next.js 16+ application with OpenAI ChatKit
- **Backend**: FastAPI application with OpenAI Agents SDK and MCP server

## Prerequisites

Before deploying, ensure you have:

1. **Minikube** running with adequate resources:
   ```bash
   minikube start --cpus=4 --memory=8192 --driver=docker
   ```

2. **Docker environment** configured for Minikube:
   ```bash
   eval $(minikube docker-env)
   ```

3. **kubectl** configured to use Minikube context:
   ```bash
   kubectl config current-context
   # Should output: minikube
   ```

4. **Helm 3.12+** installed:
   ```bash
   helm version
   ```

5. **Docker images** built in Minikube's Docker daemon (see Building Images section)

6. **Kubernetes Secrets** created with required credentials (see Secrets Management section)

## Quick Start

For first-time deployment:

```bash
# 1. Verify environment
./scripts/verify-environment.sh

# 2. Configure Docker to use Minikube
eval $(minikube docker-env)

# 3. Build Docker images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# 4. Create namespace
kubectl create namespace todo-app

# 5. Create secrets
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET='your-jwt-secret-here' \
  --from-literal=OPENAI_API_KEY='sk-your-openai-key' \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:5432/db' \
  --namespace=todo-app

# 6. Install with Helm
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml

# 7. Access the application
minikube service todo-app-frontend -n todo-app
```

## Building Docker Images

### Important: Use Minikube's Docker Daemon

To avoid pushing images to a registry, build images directly in Minikube's Docker daemon:

```bash
# Configure shell to use Minikube's Docker
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker ps | grep kube
# Should show Kubernetes system containers
```

### Build Frontend Image

```bash
cd frontend

# Build image
docker build -t todo-frontend:latest .

# Verify image exists
docker images | grep todo-frontend
# Expected: todo-frontend   latest   <image-id>   <time>   ~200MB
```

**Build time**: 3-5 minutes (first build), 1-2 minutes (subsequent builds)

### Build Backend Image

```bash
cd backend

# Build image
docker build -t todo-backend:latest .

# Verify image exists
docker images | grep todo-backend
# Expected: todo-backend   latest   <image-id>   <time>   ~250MB
```

**Build time**: 2-4 minutes (first build), 30-60 seconds (subsequent builds)

### Troubleshooting Image Builds

**Issue**: `ImagePullBackOff` error when deploying

**Solution**: Ensure `imagePullPolicy: Never` is set in `values-dev.yaml` and images were built in Minikube's Docker daemon.

## Secrets Management

### Required Secrets

The application requires three secrets:

1. **JWT_SECRET**: Secret key for JWT token signing (min 32 characters)
2. **OPENAI_API_KEY**: OpenAI API key for AI agent functionality
3. **DATABASE_URL**: PostgreSQL connection string for Neon database

### Creating Secrets

#### Method 1: Single Command (Recommended for Development)

```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET='your-super-secret-jwt-key-change-this-in-production' \
  --from-literal=OPENAI_API_KEY='sk-your-openai-api-key-here' \
  --from-literal=DATABASE_URL='postgresql://user:password@host.neon.tech:5432/database?sslmode=require' \
  --namespace=todo-app
```

#### Method 2: From Environment Variables

```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --namespace=todo-app
```

#### Method 3: From File (Most Secure)

```bash
# Create a file with secrets (DO NOT commit to git)
cat > secrets.env <<EOF
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://user:password@host:5432/db
EOF

# Create secret from file
kubectl create secret generic todo-app-secrets \
  --from-env-file=secrets.env \
  --namespace=todo-app

# Delete the file immediately
rm secrets.env
```

### Updating Secrets

To update existing secrets:

```bash
# Delete old secret
kubectl delete secret todo-app-secrets -n todo-app

# Create new secret with updated values
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET='new-value' \
  --from-literal=OPENAI_API_KEY='new-value' \
  --from-literal=DATABASE_URL='new-value' \
  --namespace=todo-app

# Restart pods to use new secrets
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

### Verifying Secrets

```bash
# List secrets
kubectl get secrets -n todo-app

# View secret keys (not values)
kubectl describe secret todo-app-secrets -n todo-app

# Decode secret value (for debugging only)
kubectl get secret todo-app-secrets -n todo-app -o jsonpath='{.data.JWT_SECRET}' | base64 --decode
```

## Installation

### Install Chart

```bash
# Install with development values
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml

# Or install with custom values
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml \
  --set frontend.replicaCount=2
```

### Verify Installation

```bash
# Check Helm release
helm list -n todo-app

# Check pod status
kubectl get pods -n todo-app

# Expected output (after 30-60 seconds):
# NAME                                READY   STATUS    RESTARTS   AGE
# todo-app-backend-xxxxx              1/1     Running   0          45s
# todo-app-frontend-xxxxx             1/1     Running   0          45s
```

### Dry Run (Test Before Installing)

```bash
# Validate templates without installing
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml \
  --dry-run --debug
```

### Lint Chart

```bash
# Check for errors in templates
helm lint .

# Expected output:
# ==> Linting .
# [INFO] Chart.yaml: icon is recommended
# 1 chart(s) linted, 0 chart(s) failed
```

## Accessing the Application

### Method 1: Minikube Service (Recommended)

```bash
# Open application in browser automatically
minikube service todo-app-frontend -n todo-app

# Or get the URL manually
minikube service todo-app-frontend -n todo-app --url
# Example output: http://192.168.49.2:30000
```

### Method 2: Port Forwarding

```bash
# Forward local port to frontend service
kubectl port-forward -n todo-app service/todo-app-frontend 3000:3000

# Access at: http://localhost:3000
```

### Method 3: NodePort (Manual)

```bash
# Get Minikube IP
export MINIKUBE_IP=$(minikube ip)

# Get NodePort
export NODE_PORT=$(kubectl get service todo-app-frontend -n todo-app -o jsonpath='{.spec.ports[0].nodePort}')

# Access application
echo "Application URL: http://$MINIKUBE_IP:$NODE_PORT"
```

## Upgrading

### Upgrade Release

```bash
# After making changes to templates or values
helm upgrade todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml

# Watch rollout status
kubectl rollout status deployment/todo-app-frontend -n todo-app
kubectl rollout status deployment/todo-app-backend -n todo-app
```

### Upgrade with New Images

```bash
# Rebuild images
eval $(minikube docker-env)
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Restart deployments to use new images
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Watch rollout
kubectl get pods -n todo-app --watch
```

## Rollback

### Rollback to Previous Version

```bash
# View release history
helm history todo-app -n todo-app

# Rollback to previous revision
helm rollback todo-app -n todo-app

# Or rollback to specific revision
helm rollback todo-app 2 -n todo-app
```

## Uninstalling

### Uninstall Release

```bash
# Uninstall Helm release
helm uninstall todo-app -n todo-app

# Verify pods are terminated
kubectl get pods -n todo-app
```

### Delete Namespace (Optional)

```bash
# Delete namespace and all resources
kubectl delete namespace todo-app

# This removes:
# - All pods
# - All services
# - All secrets
# - All configmaps
```

## Monitoring and Debugging

### View Logs

```bash
# Frontend logs
kubectl logs -n todo-app deployment/todo-app-frontend --tail=50 -f

# Backend logs
kubectl logs -n todo-app deployment/todo-app-backend --tail=50 -f

# Logs from specific pod
kubectl logs -n todo-app <pod-name> --tail=100
```

### Check Pod Status

```bash
# List all pods
kubectl get pods -n todo-app

# Describe pod (shows events and errors)
kubectl describe pod <pod-name> -n todo-app

# Get pod events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

### Check Resource Usage

```bash
# View resource usage (requires metrics-server addon)
kubectl top pods -n todo-app

# Expected output:
# NAME                                CPU(cores)   MEMORY(bytes)
# todo-app-backend-xxxxx              50m          400Mi
# todo-app-frontend-xxxxx             30m          300Mi
```

### Execute Commands in Pods

```bash
# Shell into frontend pod
kubectl exec -it -n todo-app deployment/todo-app-frontend -- sh

# Shell into backend pod
kubectl exec -it -n todo-app deployment/todo-app-backend -- sh

# Test backend health endpoint
kubectl exec -n todo-app deployment/todo-app-backend -- curl -s http://localhost:8000/health
```

## Configuration

### Values Files

- **values.yaml**: Default values for all environments
- **values-dev.yaml**: Development-specific overrides for Minikube

### Key Configuration Options

```yaml
# Frontend configuration
frontend:
  replicaCount: 1                    # Number of frontend pods
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never                # Use local images
  service:
    type: NodePort                   # Expose via NodePort
    port: 3000
    nodePort: 30000                  # Fixed port for easy access
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "512Mi"
      cpu: "500m"

# Backend configuration
backend:
  replicaCount: 1                    # Number of backend pods
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: Never                # Use local images
  service:
    type: ClusterIP                  # Internal service only
    port: 8000
  resources:
    requests:
      memory: "1Gi"
      cpu: "1000m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
```

### Override Values at Install Time

```bash
# Override specific values
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml \
  --set frontend.replicaCount=2 \
  --set backend.resources.limits.memory=2Gi
```

## Troubleshooting

### Pods Stuck in Pending

**Symptoms**: Pods show `Pending` status for more than 2 minutes

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app
```

**Common Causes**:
1. Insufficient resources → Restart Minikube with more resources
2. Image pull issues → Verify `imagePullPolicy: Never` and images exist

### Pods in CrashLoopBackOff

**Symptoms**: Pods repeatedly crash and restart

**Diagnosis**:
```bash
kubectl logs <pod-name> -n todo-app --previous
```

**Common Causes**:
1. Missing secrets → Verify secrets exist
2. Database connection failure → Check DATABASE_URL
3. Application errors → Check logs for stack traces

### Cannot Access Application

**Symptoms**: Browser can't connect to application URL

**Diagnosis**:
```bash
# Get Minikube IP
minikube ip

# Get NodePort
kubectl get svc todo-app-frontend -n todo-app

# Test from command line
curl http://$(minikube ip):30000
```

**Common Causes**:
1. Wrong IP or port → Double-check Minikube IP and NodePort
2. Pods not ready → Wait for pods to pass readiness checks
3. Firewall blocking → Use port-forward instead

### Images Not Found

**Symptoms**: `ImagePullBackOff` or `ErrImagePull` errors

**Solution**:
```bash
# Ensure using Minikube Docker daemon
eval $(minikube docker-env)

# Rebuild images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Verify images exist in Minikube
docker images | grep todo
```

## Chart Structure

```
helm/
├── Chart.yaml                      # Chart metadata
├── values.yaml                     # Default values
├── values-dev.yaml                 # Development overrides
├── README.md                       # This file
└── templates/
    ├── _helpers.tpl                # Template helpers
    ├── frontend-deployment.yaml    # Frontend Deployment
    ├── frontend-service.yaml       # Frontend Service
    ├── backend-deployment.yaml     # Backend Deployment
    ├── backend-service.yaml        # Backend Service
    ├── configmap.yaml              # ConfigMap for non-sensitive config
    └── NOTES.txt                   # Post-install instructions
```

## Additional Resources

- **Quickstart Guide**: `../specs/004-local-k8s-deployment/quickstart.md`
- **Minikube Setup**: `../docs/deployment/minikube-setup.md`
- **Troubleshooting**: `../docs/deployment/troubleshooting.md`
- **Helm Documentation**: https://helm.sh/docs/
- **Kubernetes Documentation**: https://kubernetes.io/docs/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review pod logs: `kubectl logs <pod-name> -n todo-app`
3. Check pod events: `kubectl describe pod <pod-name> -n todo-app`
4. Verify secrets: `kubectl get secrets -n todo-app`

---

**Chart Maintainer**: Todo App Team
**Last Updated**: 2026-02-09
**Tested On**: Minikube v1.32.0, Kubernetes v1.28.3, Helm v3.12.0
