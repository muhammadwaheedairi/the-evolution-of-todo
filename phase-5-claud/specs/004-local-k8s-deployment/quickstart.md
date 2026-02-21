# Quickstart Guide: Local Kubernetes Deployment

**Feature**: Phase IV Local Kubernetes Deployment
**Date**: 2026-02-09
**Audience**: Developers deploying Todo AI Chatbot to local Minikube cluster

## Overview

This guide walks you through deploying the Todo AI Chatbot application to a local Kubernetes cluster using Minikube and Helm. The entire process takes approximately 10-15 minutes on a properly configured machine.

**What you'll deploy**:
- Frontend (Next.js with ChatKit)
- Backend (FastAPI with OpenAI Agents SDK + MCP)
- Configuration via ConfigMaps and Secrets
- External Neon PostgreSQL database connection

## Prerequisites

### Required Tools

Verify you have the following tools installed:

```bash
# Docker
docker --version
# Expected: Docker version 24.0.0 or higher

# Minikube
minikube version
# Expected: minikube version: v1.32.0 or higher

# Helm
helm version
# Expected: version.BuildInfo{Version:"v3.12.0" or higher}

# kubectl
kubectl version --client
# Expected: Client Version: v1.28.0 or higher
```

### System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **CPU**: 4 cores minimum
- **Disk**: 20GB free space
- **OS**: Linux, macOS, or Windows with WSL2

### Installation Instructions

If any tools are missing, install them:

**Docker**:
- Linux: https://docs.docker.com/engine/install/
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/

**Minikube**:
```bash
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# macOS
brew install minikube

# Windows (PowerShell as Administrator)
choco install minikube
```

**Helm**:
```bash
# Linux/macOS
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows (PowerShell as Administrator)
choco install kubernetes-helm
```

**kubectl**:
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# macOS
brew install kubectl

# Windows (PowerShell as Administrator)
choco install kubernetes-cli
```

## Step 1: Start Minikube

Start Minikube with appropriate resources:

```bash
# Start Minikube with 4 CPUs and 8GB RAM
minikube start --cpus=4 --memory=8192 --driver=docker

# Expected output:
# 😄  minikube v1.32.0 on Ubuntu 22.04
# ✨  Using the docker driver based on user configuration
# 👍  Starting control plane node minikube in cluster minikube
# 🚜  Pulling base image ...
# 🔥  Creating docker container (CPUs=4, Memory=8192MB) ...
# 🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
# 🔗  Configuring bridge CNI (Container Networking Interface) ...
# 🔎  Verifying Kubernetes components...
# 🌟  Enabled addons: storage-provisioner, default-storageclass
# 🏄  Done! kubectl is now configured to use "minikube" cluster
```

**Verify Minikube is running**:
```bash
minikube status

# Expected output:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured
```

**Enable useful addons**:
```bash
# Enable metrics-server for resource monitoring
minikube addons enable metrics-server

# Enable ingress (optional, for future enhancements)
minikube addons enable ingress

# Verify addons
minikube addons list | grep enabled
```

## Step 2: Configure Docker to Use Minikube

Configure your shell to use Minikube's Docker daemon (this avoids pushing images to a registry):

```bash
# Set Docker environment variables
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker ps | grep kube

# Expected: You should see Kubernetes system containers
```

**Important**: Run `eval $(minikube docker-env)` in every new terminal session where you build images.

## Step 3: Create Kubernetes Namespace

Create a dedicated namespace for the application:

```bash
kubectl create namespace todo-app

# Verify namespace
kubectl get namespaces | grep todo-app
```

## Step 4: Create Kubernetes Secrets

Create Secrets for sensitive data. **Never commit these values to Git.**

### Required Secrets

1. **JWT Secret** (for authentication):
```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET='your-super-secret-jwt-key-change-this-in-production' \
  --namespace=todo-app
```

2. **OpenAI API Key**:
```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=OPENAI_API_KEY='sk-your-openai-api-key-here' \
  --namespace=todo-app \
  --dry-run=client -o yaml | kubectl apply -f -
```

3. **Database Connection String**:
```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:password@host.neon.tech:5432/database?sslmode=require' \
  --namespace=todo-app \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Note**: The `--dry-run=client -o yaml | kubectl apply -f -` pattern allows updating existing secrets.

### Verify Secrets

```bash
kubectl get secrets -n todo-app

# Expected output:
# NAME                TYPE     DATA   AGE
# todo-app-secrets    Opaque   3      10s

# View secret keys (not values)
kubectl describe secret todo-app-secrets -n todo-app
```

## Step 5: Build Docker Images

Build frontend and backend Docker images using Minikube's Docker daemon.

### Build Frontend Image

```bash
cd frontend

# Build image
docker build -t todo-frontend:latest .

# Verify image
docker images | grep todo-frontend

# Expected: todo-frontend   latest   <image-id>   <time>   <size>
```

### Build Backend Image

```bash
cd ../backend

# Build image
docker build -t todo-backend:latest .

# Verify image
docker images | grep todo-backend

# Expected: todo-backend   latest   <image-id>   <time>   <size>
```

**Troubleshooting**:
- If builds fail, ensure you're in the correct directory
- Check that Dockerfiles exist in frontend/ and backend/
- Verify `eval $(minikube docker-env)` was run in this terminal

## Step 6: Deploy with Helm

Deploy the application using Helm with development values.

### Lint Helm Chart

```bash
cd ../helm

# Lint chart for errors
helm lint .

# Expected output:
# ==> Linting .
# [INFO] Chart.yaml: icon is recommended
# 1 chart(s) linted, 0 chart(s) failed
```

### Dry-Run Deployment

```bash
# Validate templates without deploying
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml \
  --dry-run --debug

# Review output for any errors
```

### Install Application

```bash
# Install the application
helm install todo-app . \
  --namespace=todo-app \
  --values=values-dev.yaml

# Expected output:
# NAME: todo-app
# LAST DEPLOYED: <timestamp>
# NAMESPACE: todo-app
# STATUS: deployed
# REVISION: 1
# NOTES:
# [Post-install instructions from NOTES.txt]
```

## Step 7: Verify Deployment

### Check Pod Status

```bash
# Watch pods start up
kubectl get pods -n todo-app --watch

# Expected output (after ~60 seconds):
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-<hash>              1/1     Running   0          45s
# frontend-<hash>             1/1     Running   0          45s

# Press Ctrl+C to stop watching
```

**Pod Status Meanings**:
- `Pending`: Waiting for resources or image pull
- `ContainerCreating`: Container is being created
- `Running`: Pod is running successfully
- `CrashLoopBackOff`: Pod is failing to start (see troubleshooting)

### Check Services

```bash
kubectl get services -n todo-app

# Expected output:
# NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
# backend-service    ClusterIP   10.96.x.x       <none>        8000/TCP         1m
# frontend-service   NodePort    10.96.x.x       <none>        3000:30000/TCP   1m
```

### Verify Health Checks

```bash
# Check backend health
kubectl exec -n todo-app deployment/backend -- curl -s http://localhost:8000/health

# Expected: {"status":"healthy"}

# Check backend readiness
kubectl exec -n todo-app deployment/backend -- curl -s http://localhost:8000/ready

# Expected: {"status":"ready","database":"connected"}

# Check frontend health
kubectl exec -n todo-app deployment/frontend -- curl -s http://localhost:3000/health

# Expected: {"status":"healthy"}
```

## Step 8: Access the Application

### Get Minikube IP

```bash
minikube ip

# Expected output: 192.168.49.2 (or similar)
```

### Get Frontend NodePort

```bash
kubectl get service frontend-service -n todo-app -o jsonpath='{.spec.ports[0].nodePort}'

# Expected output: 30000
```

### Access Application

Open your browser and navigate to:
```
http://<minikube-ip>:<nodeport>
```

Example: `http://192.168.49.2:30000`

**Alternative: Port Forwarding**

If NodePort doesn't work, use port forwarding:
```bash
kubectl port-forward -n todo-app service/frontend-service 3000:3000

# Access at: http://localhost:3000
```

## Step 9: Test Application Functionality

### Test User Registration

1. Navigate to the application URL
2. Click "Register" or "Sign Up"
3. Create a new account
4. Verify you're redirected to the chat interface

### Test Chat Functionality

1. Send a message: "add task buy groceries"
2. Verify the AI agent responds and creates the task
3. Send a message: "show me all tasks"
4. Verify the task appears in the list

### Test Phase III Parity

Verify all Phase III features work:
- ✅ User registration and login
- ✅ Task creation via chat
- ✅ Task listing via chat
- ✅ Task completion via chat
- ✅ Task deletion via chat
- ✅ Conversation history persistence

## Step 10: Monitor Resources

### Check Resource Usage

```bash
# View pod resource usage
kubectl top pods -n todo-app

# Expected output:
# NAME                        CPU(cores)   MEMORY(bytes)
# backend-<hash>              50m          400Mi
# frontend-<hash>             30m          300Mi
```

### View Logs

```bash
# Backend logs
kubectl logs -n todo-app deployment/backend --tail=50

# Frontend logs
kubectl logs -n todo-app deployment/frontend --tail=50

# Follow logs in real-time
kubectl logs -n todo-app deployment/backend -f
```

## Updating the Deployment

### Update Configuration

```bash
# Edit values-dev.yaml with new configuration
vim helm/values-dev.yaml

# Upgrade deployment
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml
```

### Update Images

```bash
# Rebuild images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Restart pods to use new images
kubectl rollout restart deployment/frontend -n todo-app
kubectl rollout restart deployment/backend -n todo-app

# Watch rollout status
kubectl rollout status deployment/frontend -n todo-app
kubectl rollout status deployment/backend -n todo-app
```

## Uninstalling the Application

### Remove Helm Release

```bash
# Uninstall application
helm uninstall todo-app --namespace=todo-app

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

### Stop Minikube (Optional)

```bash
# Stop Minikube (preserves cluster state)
minikube stop

# Delete Minikube cluster (removes everything)
minikube delete
```

## Troubleshooting

### Pods Stuck in Pending

**Symptom**: Pods show `Pending` status for more than 2 minutes

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app
```

**Common Causes**:
1. **Insufficient resources**: Minikube doesn't have enough CPU/memory
   - Solution: Restart Minikube with more resources
   ```bash
   minikube delete
   minikube start --cpus=4 --memory=8192
   ```

2. **Image pull issues**: Can't pull image from registry
   - Solution: Ensure `imagePullPolicy: Never` in values-dev.yaml
   - Verify images exist: `docker images | grep todo`

### Pods in CrashLoopBackOff

**Symptom**: Pods repeatedly crash and restart

**Diagnosis**:
```bash
kubectl logs <pod-name> -n todo-app --previous
```

**Common Causes**:
1. **Missing secrets**: Environment variables not set
   - Solution: Verify secrets exist: `kubectl get secrets -n todo-app`
   - Recreate secrets if missing (see Step 4)

2. **Database connection failure**: Can't connect to Neon
   - Solution: Verify DATABASE_URL is correct
   - Test connection from local machine first

3. **Application errors**: Code issues
   - Solution: Check logs for stack traces
   - Verify Phase III application works locally

### Can't Access Application

**Symptom**: Browser can't connect to application URL

**Diagnosis**:
```bash
# Get Minikube IP
minikube ip

# Get NodePort
kubectl get svc frontend-service -n todo-app

# Test from command line
curl http://$(minikube ip):30000
```

**Common Causes**:
1. **Wrong IP or port**: Using incorrect URL
   - Solution: Double-check Minikube IP and NodePort

2. **Pods not ready**: Pods haven't passed readiness checks
   - Solution: Wait for pods to be Ready: `kubectl get pods -n todo-app`

3. **Firewall blocking**: Local firewall blocks connection
   - Solution: Use port-forward instead: `kubectl port-forward -n todo-app service/frontend-service 3000:3000`

### Images Not Found

**Symptom**: `ImagePullBackOff` or `ErrImagePull` errors

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app | grep -A 5 Events
```

**Solution**:
```bash
# Ensure using Minikube Docker daemon
eval $(minikube docker-env)

# Rebuild images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Verify images exist in Minikube
docker images | grep todo

# Ensure imagePullPolicy: Never in values-dev.yaml
```

### Database Connection Errors

**Symptom**: Backend readiness probe fails, logs show database errors

**Diagnosis**:
```bash
kubectl logs deployment/backend -n todo-app | grep -i database
```

**Common Causes**:
1. **Wrong connection string**: DATABASE_URL is incorrect
   - Solution: Verify connection string format
   - Test from local machine: `psql $DATABASE_URL`

2. **Network issues**: Can't reach Neon from Minikube
   - Solution: Verify outbound internet access from pods
   ```bash
   kubectl exec -n todo-app deployment/backend -- curl -I https://neon.tech
   ```

3. **SSL/TLS issues**: Missing `sslmode=require`
   - Solution: Ensure connection string includes `?sslmode=require`

### Helm Install Fails

**Symptom**: `helm install` command returns errors

**Diagnosis**:
```bash
helm lint ./helm
helm install todo-app ./helm --dry-run --debug --namespace=todo-app
```

**Common Causes**:
1. **Template errors**: Invalid Helm templates
   - Solution: Fix template syntax errors shown in output

2. **Missing values**: Required values not provided
   - Solution: Ensure values-dev.yaml has all required fields

3. **Namespace doesn't exist**: Trying to install in non-existent namespace
   - Solution: Create namespace first: `kubectl create namespace todo-app`

## Getting Help

If you encounter issues not covered here:

1. **Check pod logs**: `kubectl logs <pod-name> -n todo-app`
2. **Describe pod**: `kubectl describe pod <pod-name> -n todo-app`
3. **Check events**: `kubectl get events -n todo-app --sort-by='.lastTimestamp'`
4. **Verify secrets**: `kubectl get secrets -n todo-app`
5. **Check resource usage**: `kubectl top pods -n todo-app`

For Phase III application issues, refer to Phase III documentation.

---

**Quickstart Status**: ✅ COMPLETE
**Next Step**: Run `/sp.tasks` to generate implementation tasks
