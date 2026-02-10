# Troubleshooting Guide

**Purpose**: Comprehensive guide for diagnosing and resolving deployment issues
**Target Audience**: Developers deploying Todo AI Chatbot to Kubernetes
**Covers**: Common issues, diagnostic commands, and solutions

## Overview

This guide helps you diagnose and resolve common issues when deploying the Todo AI Chatbot application to Kubernetes. Issues are organized by symptom with step-by-step diagnostic procedures and solutions.

## Quick Diagnostic Commands

### Essential Commands

```bash
# Check pod status
kubectl get pods -n todo-app

# View pod details and events
kubectl describe pod <pod-name> -n todo-app

# View pod logs
kubectl logs <pod-name> -n todo-app --tail=50

# View previous pod logs (if crashed)
kubectl logs <pod-name> -n todo-app --previous

# Check recent events
kubectl get events -n todo-app --sort-by='.lastTimestamp' | tail -20

# Check Helm release status
helm list -n todo-app

# View Helm release history
helm history todo-app -n todo-app
```

### Resource Status Commands

```bash
# Check all resources
kubectl get all -n todo-app

# Check deployments
kubectl get deployments -n todo-app

# Check services
kubectl get services -n todo-app

# Check configmaps
kubectl get configmaps -n todo-app

# Check secrets
kubectl get secrets -n todo-app

# Check resource usage (requires metrics-server)
kubectl top pods -n todo-app
kubectl top nodes
```

## Common Issues

### Issue 1: Pods Stuck in Pending

**Symptoms**:
- Pods show `Pending` status for more than 2 minutes
- Application not accessible
- `kubectl get pods` shows `0/1 Ready`

**Diagnosis**:

```bash
# Check pod status
kubectl get pods -n todo-app

# Describe pod to see events
kubectl describe pod <pod-name> -n todo-app

# Look for these messages in Events section:
# - "Insufficient cpu" or "Insufficient memory"
# - "FailedScheduling"
# - "ImagePullBackOff"
```

**Common Causes & Solutions**:

#### Cause 1: Insufficient Resources

**Symptoms in Events**:
```
Warning  FailedScheduling  pod/todo-app-backend-xxx  0/1 nodes are available: 1 Insufficient memory.
```

**Solution**:
```bash
# Check Minikube resources
minikube status
kubectl top nodes

# Restart Minikube with more resources
minikube delete
minikube start --cpus=4 --memory=8192 --driver=docker

# Or reduce resource requests in values-dev.yaml
backend:
  resources:
    requests:
      memory: "512Mi"  # Reduced from 1Gi
      cpu: "500m"      # Reduced from 1000m
```

#### Cause 2: Image Pull Issues

**Symptoms in Events**:
```
Warning  Failed  pod/todo-app-frontend-xxx  Failed to pull image "todo-frontend:latest"
```

**Solution**:
```bash
# Ensure imagePullPolicy is set to Never
# In values-dev.yaml:
frontend:
  image:
    pullPolicy: Never

# Verify images exist in Minikube
eval $(minikube docker-env)
docker images | grep todo

# If images missing, rebuild
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .
```

#### Cause 3: Node Not Ready

**Symptoms**:
```
Warning  FailedScheduling  pod/todo-app-backend-xxx  0/1 nodes are available: 1 node(s) had taint {node.kubernetes.io/not-ready}
```

**Solution**:
```bash
# Check node status
kubectl get nodes

# If NotReady, restart Minikube
minikube stop
minikube start
```

### Issue 2: Pods in CrashLoopBackOff

**Symptoms**:
- Pods repeatedly crash and restart
- Status shows `CrashLoopBackOff` or `Error`
- Restart count keeps increasing

**Diagnosis**:

```bash
# Check pod status
kubectl get pods -n todo-app

# View current logs
kubectl logs <pod-name> -n todo-app --tail=100

# View previous logs (from crashed container)
kubectl logs <pod-name> -n todo-app --previous

# Describe pod for events
kubectl describe pod <pod-name> -n todo-app
```

**Common Causes & Solutions**:

#### Cause 1: Missing Secrets

**Symptoms in Logs**:
```
Error: Environment variable JWT_SECRET is not set
KeyError: 'OPENAI_API_KEY'
```

**Solution**:
```bash
# Check if secrets exist
kubectl get secrets -n todo-app

# If missing, create secrets
./scripts/create-secrets.sh --namespace todo-app

# Restart pods
kubectl rollout restart deployment -n todo-app
```

#### Cause 2: Database Connection Failure

**Symptoms in Logs**:
```
sqlalchemy.exc.OperationalError: could not connect to server
psycopg2.OperationalError: connection to server failed
```

**Solution**:
```bash
# Verify DATABASE_URL is correct
kubectl get secret todo-app-secrets -n todo-app -o jsonpath='{.data.DATABASE_URL}' | base64 --decode

# Test connection from local machine
psql "$DATABASE_URL"

# Common issues:
# - Wrong hostname or port
# - Missing sslmode=require
# - Firewall blocking connection
# - Database credentials expired

# Update secret with correct URL
kubectl delete secret todo-app-secrets -n todo-app
./scripts/create-secrets.sh --namespace todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

#### Cause 3: Application Code Errors

**Symptoms in Logs**:
```
ModuleNotFoundError: No module named 'fastapi'
SyntaxError: invalid syntax
TypeError: ...
```

**Solution**:
```bash
# Check if dependencies are installed in image
kubectl exec -n todo-app deployment/todo-app-backend -- pip list

# Rebuild images with correct dependencies
eval $(minikube docker-env)
cd backend && docker build -t todo-backend:latest .

# Restart deployment
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

#### Cause 4: Port Already in Use

**Symptoms in Logs**:
```
Error: listen EADDRINUSE: address already in use :::3000
OSError: [Errno 98] Address already in use
```

**Solution**:
```bash
# This usually indicates multiple containers trying to use same port
# Check Dockerfile EXPOSE directive
# Ensure only one process per container

# Restart pods
kubectl rollout restart deployment -n todo-app
```

### Issue 3: Cannot Access Application

**Symptoms**:
- Pods are Running
- Browser shows "Connection refused" or "Site can't be reached"
- `curl` to application URL fails

**Diagnosis**:

```bash
# Check pod status
kubectl get pods -n todo-app
# All pods should be Running with 1/1 Ready

# Check services
kubectl get services -n todo-app

# Get Minikube IP
minikube ip

# Get NodePort
kubectl get service todo-app-frontend -n todo-app -o jsonpath='{.spec.ports[0].nodePort}'

# Test from command line
curl http://$(minikube ip):30000
```

**Common Causes & Solutions**:

#### Cause 1: Wrong IP or Port

**Solution**:
```bash
# Get correct URL
minikube service todo-app-frontend -n todo-app --url

# Or use minikube service command (opens browser)
minikube service todo-app-frontend -n todo-app
```

#### Cause 2: Pods Not Ready

**Symptoms**:
```
NAME                           READY   STATUS    RESTARTS   AGE
todo-app-frontend-xxx          0/1     Running   0          2m
```

**Solution**:
```bash
# Check readiness probe
kubectl describe pod <pod-name> -n todo-app

# View logs for errors
kubectl logs <pod-name> -n todo-app

# Common issues:
# - Health endpoint not responding
# - Application not fully started
# - Database connection failing (backend)

# Wait for pods to be ready or fix underlying issue
```

#### Cause 3: Service Misconfiguration

**Solution**:
```bash
# Verify service selector matches pod labels
kubectl get service todo-app-frontend -n todo-app -o yaml
kubectl get pods -n todo-app --show-labels

# Verify service endpoints
kubectl get endpoints -n todo-app

# If no endpoints, service selector doesn't match pods
```

#### Cause 4: Firewall or Network Issues

**Solution**:
```bash
# Use port-forward as alternative
kubectl port-forward -n todo-app service/todo-app-frontend 3000:3000

# Access at http://localhost:3000

# Or check firewall rules
# On Linux: sudo iptables -L
# On macOS: Check System Preferences > Security & Privacy > Firewall
```

### Issue 4: Images Not Found

**Symptoms**:
- Pods show `ImagePullBackOff` or `ErrImagePull`
- Events show "Failed to pull image"
- Pods never reach Running state

**Diagnosis**:

```bash
# Check pod events
kubectl describe pod <pod-name> -n todo-app

# Look for:
# - "Failed to pull image"
# - "image not found"
# - "manifest unknown"
```

**Common Causes & Solutions**:

#### Cause 1: Docker Environment Not Set

**Solution**:
```bash
# Configure shell to use Minikube's Docker
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker ps | grep kube
# Should show Kubernetes system containers

# Rebuild images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Verify images exist
docker images | grep todo
```

#### Cause 2: Wrong imagePullPolicy

**Solution**:
```bash
# Ensure imagePullPolicy is Never in values-dev.yaml
frontend:
  image:
    pullPolicy: Never  # Must be Never for local images

backend:
  image:
    pullPolicy: Never  # Must be Never for local images

# Upgrade Helm release
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

#### Cause 3: Image Tag Mismatch

**Solution**:
```bash
# Check image tag in values file
cat helm/values-dev.yaml | grep tag

# Ensure it matches built image
docker images | grep todo

# Both should show "latest" tag
```

### Issue 5: Health Check Failures

**Symptoms**:
- Pods restart frequently
- Readiness probe failures in events
- Pods show Running but not Ready (0/1)

**Diagnosis**:

```bash
# Check pod status
kubectl get pods -n todo-app

# Describe pod to see probe failures
kubectl describe pod <pod-name> -n todo-app

# Look for:
# - "Liveness probe failed"
# - "Readiness probe failed"
# - HTTP status codes (non-200)
```

**Common Causes & Solutions**:

#### Cause 1: Health Endpoint Not Responding

**Solution**:
```bash
# Test health endpoint manually
kubectl exec -n todo-app deployment/todo-app-backend -- curl -v http://localhost:8000/health

# Expected: {"status":"healthy"}

# If fails, check:
# - Health router registered in main.py
# - Application started successfully
# - Port is correct (8000 for backend, 3000 for frontend)
```

#### Cause 2: Probe Timing Too Aggressive

**Solution**:
```bash
# Increase probe delays in values-dev.yaml
healthCheck:
  livenessProbe:
    initialDelaySeconds: 60  # Increased from 30
    periodSeconds: 15        # Increased from 10
  readinessProbe:
    initialDelaySeconds: 20  # Increased from 10
    periodSeconds: 10        # Increased from 5

# Upgrade release
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

#### Cause 3: Database Connection Slow (Backend Readiness)

**Solution**:
```bash
# Backend readiness checks database connection
# If database is slow, readiness probe fails

# Check database connectivity
kubectl exec -n todo-app deployment/todo-app-backend -- curl -v http://localhost:8000/ready

# If database connection is slow:
# - Increase readiness probe timeout
# - Check database performance
# - Verify network connectivity to database
```

### Issue 6: Helm Install/Upgrade Failures

**Symptoms**:
- `helm install` or `helm upgrade` command fails
- Error messages about invalid templates
- Release in failed state

**Diagnosis**:

```bash
# Check Helm release status
helm list -n todo-app

# View release history
helm history todo-app -n todo-app

# Lint chart for errors
helm lint ./helm

# Dry-run to see what would be applied
helm install todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml \
  --dry-run --debug
```

**Common Causes & Solutions**:

#### Cause 1: Template Syntax Errors

**Solution**:
```bash
# Lint chart
helm lint ./helm

# Fix errors shown in output
# Common issues:
# - Missing closing braces {{ }}
# - Incorrect indentation in YAML
# - Invalid template functions
```

#### Cause 2: Missing Required Values

**Solution**:
```bash
# Check for undefined values in dry-run
helm install todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml \
  --dry-run --debug 2>&1 | grep -i "nil"

# Add missing values to values-dev.yaml
```

#### Cause 3: Namespace Doesn't Exist

**Solution**:
```bash
# Create namespace
kubectl create namespace todo-app

# Or use --create-namespace flag
helm install todo-app ./helm \
  --namespace=todo-app \
  --create-namespace \
  --values=helm/values-dev.yaml
```

### Issue 7: Configuration Not Applied

**Symptoms**:
- Updated configuration not reflected in pods
- Environment variables show old values
- Application behavior unchanged after config update

**Diagnosis**:

```bash
# Check ConfigMap
kubectl get configmap todo-app-config -n todo-app -o yaml

# Check pod environment variables
kubectl exec -n todo-app deployment/todo-app-backend -- env

# Compare with expected values
helm get values todo-app -n todo-app
```

**Solution**:

```bash
# Pods don't automatically reload ConfigMaps
# Must restart pods after config changes

# Restart deployments
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Watch restart progress
kubectl get pods -n todo-app --watch
```

### Issue 8: High Resource Usage

**Symptoms**:
- Pods using more CPU/memory than expected
- Minikube becomes slow or unresponsive
- Pods getting OOMKilled (Out of Memory)

**Diagnosis**:

```bash
# Check resource usage
kubectl top pods -n todo-app
kubectl top nodes

# Check pod resource limits
kubectl describe pod <pod-name> -n todo-app | grep -A 5 "Limits"

# Check for OOMKilled
kubectl get pods -n todo-app
# Look for STATUS: OOMKilled or high RESTARTS
```

**Solutions**:

#### Solution 1: Increase Resource Limits

```bash
# Edit values-dev.yaml
backend:
  resources:
    limits:
      memory: "2Gi"    # Increased from 1Gi
      cpu: "2000m"     # Increased from 1000m

# Upgrade release
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

#### Solution 2: Increase Minikube Resources

```bash
# Restart Minikube with more resources
minikube delete
minikube start --cpus=6 --memory=12288 --driver=docker
```

#### Solution 3: Investigate Memory Leaks

```bash
# Check logs for memory-related errors
kubectl logs -n todo-app deployment/todo-app-backend --tail=100 | grep -i memory

# Monitor resource usage over time
watch kubectl top pods -n todo-app
```

## Diagnostic Command Reference

### Pod Diagnostics

```bash
# List all pods
kubectl get pods -n todo-app

# List pods with more details
kubectl get pods -n todo-app -o wide

# Describe specific pod
kubectl describe pod <pod-name> -n todo-app

# Get pod YAML
kubectl get pod <pod-name> -n todo-app -o yaml

# Watch pods in real-time
kubectl get pods -n todo-app --watch

# Get pod logs
kubectl logs <pod-name> -n todo-app

# Get logs from previous container (if crashed)
kubectl logs <pod-name> -n todo-app --previous

# Follow logs in real-time
kubectl logs <pod-name> -n todo-app -f

# Get logs from specific container (if multiple)
kubectl logs <pod-name> -n todo-app -c <container-name>

# Execute command in pod
kubectl exec -n todo-app <pod-name> -- <command>

# Get shell in pod
kubectl exec -it -n todo-app <pod-name> -- sh

# Copy files from pod
kubectl cp todo-app/<pod-name>:/path/to/file ./local-file

# Copy files to pod
kubectl cp ./local-file todo-app/<pod-name>:/path/to/file
```

### Service Diagnostics

```bash
# List services
kubectl get services -n todo-app

# Describe service
kubectl describe service <service-name> -n todo-app

# Get service endpoints
kubectl get endpoints -n todo-app

# Test service from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n todo-app -- curl http://backend-service:8000/health
```

### Deployment Diagnostics

```bash
# List deployments
kubectl get deployments -n todo-app

# Describe deployment
kubectl describe deployment <deployment-name> -n todo-app

# Get deployment YAML
kubectl get deployment <deployment-name> -n todo-app -o yaml

# Check rollout status
kubectl rollout status deployment/<deployment-name> -n todo-app

# View rollout history
kubectl rollout history deployment/<deployment-name> -n todo-app

# Restart deployment
kubectl rollout restart deployment/<deployment-name> -n todo-app

# Undo rollout
kubectl rollout undo deployment/<deployment-name> -n todo-app
```

### ConfigMap and Secret Diagnostics

```bash
# List ConfigMaps
kubectl get configmaps -n todo-app

# View ConfigMap
kubectl get configmap <configmap-name> -n todo-app -o yaml

# List Secrets
kubectl get secrets -n todo-app

# Describe Secret (shows keys, not values)
kubectl describe secret <secret-name> -n todo-app

# Decode secret value
kubectl get secret <secret-name> -n todo-app -o jsonpath='{.data.KEY_NAME}' | base64 --decode
```

### Event Diagnostics

```bash
# Get all events
kubectl get events -n todo-app

# Get events sorted by time
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Get recent events
kubectl get events -n todo-app --sort-by='.lastTimestamp' | tail -20

# Watch events in real-time
kubectl get events -n todo-app --watch
```

### Resource Usage Diagnostics

```bash
# Get node resource usage
kubectl top nodes

# Get pod resource usage
kubectl top pods -n todo-app

# Get pod resource usage with containers
kubectl top pods -n todo-app --containers
```

### Helm Diagnostics

```bash
# List releases
helm list -n todo-app

# Get release status
helm status todo-app -n todo-app

# Get release history
helm history todo-app -n todo-app

# Get release values
helm get values todo-app -n todo-app

# Get all values (including defaults)
helm get values todo-app -n todo-app --all

# Get release manifest
helm get manifest todo-app -n todo-app

# Lint chart
helm lint ./helm

# Dry-run install
helm install todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml --dry-run --debug
```

### Minikube Diagnostics

```bash
# Get Minikube status
minikube status

# Get Minikube IP
minikube ip

# Get Minikube logs
minikube logs

# SSH into Minikube
minikube ssh

# Get Minikube profile list
minikube profile list

# Open Kubernetes dashboard
minikube dashboard

# Get service URL
minikube service <service-name> -n todo-app --url
```

## Emergency Procedures

### Complete Reset

If all else fails, perform a complete reset:

```bash
# Step 1: Uninstall Helm release
helm uninstall todo-app -n todo-app

# Step 2: Delete namespace
kubectl delete namespace todo-app

# Step 3: Restart Minikube
minikube stop
minikube delete
minikube start --cpus=4 --memory=8192 --driver=docker

# Step 4: Rebuild images
eval $(minikube docker-env)
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Step 5: Recreate namespace and secrets
kubectl create namespace todo-app
./scripts/create-secrets.sh --namespace todo-app

# Step 6: Reinstall application
helm install todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml

# Step 7: Verify deployment
kubectl get pods -n todo-app --watch
```

## Getting Help

If you're still experiencing issues:

1. **Collect diagnostic information**:
   ```bash
   kubectl get all -n todo-app > diagnostics.txt
   kubectl describe pods -n todo-app >> diagnostics.txt
   kubectl logs -n todo-app deployment/todo-app-frontend --tail=100 >> diagnostics.txt
   kubectl logs -n todo-app deployment/todo-app-backend --tail=100 >> diagnostics.txt
   kubectl get events -n todo-app --sort-by='.lastTimestamp' >> diagnostics.txt
   ```

2. **Check documentation**:
   - Deployment guide: `helm/README.md`
   - Quickstart guide: `specs/004-local-k8s-deployment/quickstart.md`
   - Configuration guide: `docs/deployment/configuration.md`

3. **Verify prerequisites**:
   ```bash
   ./scripts/verify-environment.sh
   ```

4. **Review recent changes**:
   - What changed since it last worked?
   - Were any configuration files modified?
   - Were images rebuilt?

---

**Last Updated**: 2026-02-09
**Tested On**: Minikube v1.32.0, Kubernetes v1.28.3, Helm v3.12.0
