# Application Lifecycle Management

**Purpose**: Guide for managing the Todo AI Chatbot deployment lifecycle on Kubernetes
**Target Audience**: Developers managing local Minikube deployments
**Covers**: Upgrade, rollback, and uninstall procedures

## Overview

This guide covers the complete lifecycle management of the Todo AI Chatbot application deployed on Kubernetes using Helm. You'll learn how to:

- **Upgrade** the application with new code or configuration changes
- **Rollback** to previous versions when issues occur
- **Uninstall** the application cleanly

## Prerequisites

Before performing lifecycle operations:

1. **Helm release installed**: Verify with `helm list -n todo-app`
2. **kubectl configured**: Ensure you're connected to the correct cluster
3. **Minikube running**: Check with `minikube status`
4. **Docker environment set** (for image rebuilds): `eval $(minikube docker-env)`

## Upgrade Procedures

### When to Upgrade

Upgrade the deployment when:
- Application code has changed (frontend or backend)
- Configuration values need to be updated
- Resource limits need adjustment
- New features are added
- Bug fixes are deployed

### Upgrade Types

#### 1. Configuration-Only Upgrade

When only Helm values or configuration changes (no code changes):

```bash
# Edit values file
vim helm/values-dev.yaml

# Upgrade release
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml

# Verify upgrade
helm list -n todo-app
kubectl get pods -n todo-app
```

**Example: Increase Backend Memory**

```bash
# Update values-dev.yaml
# Change backend.resources.limits.memory from "1Gi" to "2Gi"

# Apply upgrade
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml

# Watch pods restart
kubectl get pods -n todo-app --watch
```

**Upgrade time**: 10-30 seconds (pods restart with new configuration)

#### 2. Code Upgrade (New Images)

When application code has changed:

```bash
# Step 1: Configure Docker environment
eval $(minikube docker-env)

# Step 2: Rebuild images
cd frontend
docker build -t todo-frontend:latest .

cd ../backend
docker build -t todo-backend:latest .

# Step 3: Restart deployments to use new images
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Step 4: Watch rollout status
kubectl rollout status deployment/todo-app-frontend -n todo-app
kubectl rollout status deployment/todo-app-backend -n todo-app

# Step 5: Verify new pods are running
kubectl get pods -n todo-app
```

**Upgrade time**: 2-5 minutes (image build + pod restart)

**Important**: Since we use `imagePullPolicy: Never` and `tag: latest`, Kubernetes won't automatically detect new images. You must manually restart deployments after rebuilding images.

#### 3. Combined Upgrade (Code + Configuration)

When both code and configuration change:

```bash
# Step 1: Rebuild images
eval $(minikube docker-env)
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Step 2: Update Helm values
vim helm/values-dev.yaml

# Step 3: Upgrade Helm release
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml

# Step 4: Verify upgrade
kubectl get pods -n todo-app --watch
```

#### 4. Upgrade with Override Values

Override specific values without editing files:

```bash
# Upgrade with command-line overrides
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml \
  --set frontend.replicaCount=2 \
  --set backend.resources.limits.memory=2Gi

# Verify changes
kubectl get deployments -n todo-app
```

### Upgrade Best Practices

1. **Test Before Upgrading**:
   ```bash
   # Dry-run to preview changes
   helm upgrade todo-app ./helm \
     --namespace=todo-app \
     --values=helm/values-dev.yaml \
     --dry-run --debug
   ```

2. **Check Diff Before Applying**:
   ```bash
   # Install helm-diff plugin
   helm plugin install https://github.com/databus23/helm-diff

   # View differences
   helm diff upgrade todo-app ./helm \
     --namespace=todo-app \
     --values=helm/values-dev.yaml
   ```

3. **Monitor During Upgrade**:
   ```bash
   # Watch pods in real-time
   kubectl get pods -n todo-app --watch

   # Check events
   kubectl get events -n todo-app --sort-by='.lastTimestamp'

   # View logs
   kubectl logs -n todo-app deployment/todo-app-frontend --tail=50 -f
   ```

4. **Verify After Upgrade**:
   ```bash
   # Check pod status
   kubectl get pods -n todo-app

   # Test health endpoints
   kubectl exec -n todo-app deployment/todo-app-backend -- curl -s http://localhost:8000/health
   kubectl exec -n todo-app deployment/todo-app-frontend -- curl -s http://localhost:3000/health

   # Access application
   minikube service todo-app-frontend -n todo-app
   ```

### Upgrade Troubleshooting

#### Issue: Pods Not Starting After Upgrade

**Symptoms**: Pods stuck in `CrashLoopBackOff` or `Error` state

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app --previous
```

**Solution**: Rollback to previous version (see Rollback section)

#### Issue: New Images Not Being Used

**Symptoms**: Application still shows old behavior after rebuild

**Cause**: Kubernetes doesn't detect image changes when using `imagePullPolicy: Never` with `tag: latest`

**Solution**:
```bash
# Force restart deployments
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

#### Issue: Configuration Not Applied

**Symptoms**: Pods running but using old configuration

**Solution**:
```bash
# Verify ConfigMap was updated
kubectl get configmap todo-app-config -n todo-app -o yaml

# Restart pods to pick up new ConfigMap
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

## Rollback Procedures

### When to Rollback

Rollback when:
- New version introduces bugs or errors
- Performance degrades after upgrade
- Application becomes unstable
- Critical functionality breaks
- Need to quickly restore working state

### Rollback Methods

#### 1. Helm Rollback (Recommended)

Helm maintains release history and can rollback to any previous revision:

```bash
# Step 1: View release history
helm history todo-app -n todo-app

# Example output:
# REVISION  UPDATED                   STATUS      CHART           APP VERSION  DESCRIPTION
# 1         Mon Feb 09 10:00:00 2026  superseded  todo-app-0.1.0  1.0.0        Install complete
# 2         Mon Feb 09 11:00:00 2026  superseded  todo-app-0.1.0  1.0.0        Upgrade complete
# 3         Mon Feb 09 12:00:00 2026  deployed    todo-app-0.1.0  1.0.0        Upgrade complete

# Step 2: Rollback to previous revision
helm rollback todo-app -n todo-app

# Or rollback to specific revision
helm rollback todo-app 2 -n todo-app

# Step 3: Verify rollback
helm list -n todo-app
kubectl get pods -n todo-app
```

**Rollback time**: 10-30 seconds

**What gets rolled back**:
- Helm values and configuration
- Kubernetes resource definitions (Deployments, Services, ConfigMaps)
- Resource limits and replica counts

**What does NOT get rolled back**:
- Docker images (you must rebuild old images if needed)
- Kubernetes Secrets (managed separately)
- Database state (external to Kubernetes)

#### 2. Manual Rollback (Kubernetes Native)

Rollback individual deployments without Helm:

```bash
# View deployment rollout history
kubectl rollout history deployment/todo-app-frontend -n todo-app
kubectl rollout history deployment/todo-app-backend -n todo-app

# Rollback frontend deployment
kubectl rollout undo deployment/todo-app-frontend -n todo-app

# Rollback backend deployment
kubectl rollout undo deployment/todo-app-backend -n todo-app

# Or rollback to specific revision
kubectl rollout undo deployment/todo-app-backend -n todo-app --to-revision=2

# Watch rollback progress
kubectl rollout status deployment/todo-app-frontend -n todo-app
```

#### 3. Rollback with Image Rebuild

If you need to rollback to old code:

```bash
# Step 1: Checkout old code
git checkout <previous-commit-or-tag>

# Step 2: Rebuild images
eval $(minikube docker-env)
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Step 3: Restart deployments
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Step 4: Verify rollback
kubectl get pods -n todo-app
```

### Rollback Best Practices

1. **Always Check History First**:
   ```bash
   helm history todo-app -n todo-app
   ```

2. **Test After Rollback**:
   ```bash
   # Verify pods are healthy
   kubectl get pods -n todo-app

   # Test application functionality
   minikube service todo-app-frontend -n todo-app
   ```

3. **Document Rollback Reason**:
   ```bash
   # Add note to rollback
   helm rollback todo-app -n todo-app --description="Rolled back due to memory leak in v2"
   ```

4. **Monitor During Rollback**:
   ```bash
   kubectl get pods -n todo-app --watch
   kubectl logs -n todo-app deployment/todo-app-backend --tail=50 -f
   ```

### Rollback Troubleshooting

#### Issue: Rollback Fails

**Symptoms**: `helm rollback` command fails with error

**Diagnosis**:
```bash
helm history todo-app -n todo-app
kubectl get pods -n todo-app
```

**Solution**:
```bash
# Force rollback
helm rollback todo-app -n todo-app --force

# If still failing, manually delete and reinstall
helm uninstall todo-app -n todo-app
helm install todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

#### Issue: Pods Still Using New Images After Rollback

**Cause**: Helm rollback doesn't change Docker images (they're built locally)

**Solution**: Rebuild old images from previous git commit (see "Rollback with Image Rebuild" above)

## Uninstall Procedures

### When to Uninstall

Uninstall when:
- Switching to different deployment method
- Cleaning up development environment
- Removing application completely
- Starting fresh installation

### Uninstall Methods

#### 1. Helm Uninstall (Recommended)

Remove the Helm release and all associated resources:

```bash
# Step 1: Uninstall Helm release
helm uninstall todo-app -n todo-app

# Step 2: Verify pods are terminated
kubectl get pods -n todo-app

# Expected: No resources found (or pods in Terminating state)

# Step 3: Verify services are removed
kubectl get services -n todo-app
```

**What gets removed**:
- All Deployments
- All Services
- All ConfigMaps created by Helm
- All Pods

**What does NOT get removed**:
- Namespace (if you want to keep it)
- Secrets (managed separately for security)
- PersistentVolumeClaims (if any)

**Uninstall time**: 5-15 seconds

#### 2. Complete Cleanup (Namespace Deletion)

Remove everything including namespace:

```bash
# Delete entire namespace
kubectl delete namespace todo-app

# This removes:
# - All pods
# - All services
# - All secrets
# - All configmaps
# - All deployments
# - The namespace itself

# Verify namespace is gone
kubectl get namespaces | grep todo-app
```

**Cleanup time**: 10-30 seconds

**Warning**: This is destructive and removes ALL resources in the namespace, including Secrets.

#### 3. Selective Cleanup

Remove specific resources while keeping others:

```bash
# Uninstall Helm release but keep namespace
helm uninstall todo-app -n todo-app

# Keep secrets for future reinstall
kubectl get secrets -n todo-app
# Secrets remain intact

# Reinstall later without recreating secrets
helm install todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

### Uninstall Best Practices

1. **Backup Important Data First**:
   ```bash
   # Export secrets (if needed for reinstall)
   kubectl get secret todo-app-secrets -n todo-app -o yaml > secrets-backup.yaml

   # Export custom configurations
   kubectl get configmap -n todo-app -o yaml > configmaps-backup.yaml
   ```

2. **Verify Before Deleting**:
   ```bash
   # List all resources in namespace
   kubectl get all -n todo-app

   # Check for PersistentVolumeClaims
   kubectl get pvc -n todo-app
   ```

3. **Clean Up Docker Images** (Optional):
   ```bash
   # Remove local Docker images to free space
   eval $(minikube docker-env)
   docker rmi todo-frontend:latest
   docker rmi todo-backend:latest
   ```

4. **Confirm Deletion**:
   ```bash
   # Verify Helm release is gone
   helm list -n todo-app

   # Verify pods are terminated
   kubectl get pods -n todo-app

   # Verify namespace is empty (if keeping namespace)
   kubectl get all -n todo-app
   ```

### Uninstall Troubleshooting

#### Issue: Pods Stuck in Terminating

**Symptoms**: Pods remain in `Terminating` state for more than 1 minute

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app
```

**Solution**:
```bash
# Force delete pod
kubectl delete pod <pod-name> -n todo-app --force --grace-period=0

# Or force delete all pods
kubectl delete pods --all -n todo-app --force --grace-period=0
```

#### Issue: Namespace Stuck in Terminating

**Symptoms**: Namespace remains in `Terminating` state indefinitely

**Diagnosis**:
```bash
kubectl get namespace todo-app -o yaml
```

**Solution**:
```bash
# Remove finalizers
kubectl get namespace todo-app -o json | \
  jq '.spec.finalizers = []' | \
  kubectl replace --raw "/api/v1/namespaces/todo-app/finalize" -f -
```

## Lifecycle Management Checklist

### Before Upgrade
- [ ] Backup current configuration
- [ ] Test upgrade in dry-run mode
- [ ] Review changes with `helm diff`
- [ ] Ensure Minikube has sufficient resources
- [ ] Verify secrets are up to date

### During Upgrade
- [ ] Monitor pod status
- [ ] Watch application logs
- [ ] Check for errors in events
- [ ] Verify health endpoints respond

### After Upgrade
- [ ] Test application functionality
- [ ] Verify all pods are Running
- [ ] Check resource usage
- [ ] Test critical user flows
- [ ] Document upgrade in release notes

### Before Rollback
- [ ] Identify the issue causing rollback
- [ ] Check release history
- [ ] Determine target revision
- [ ] Notify team of rollback

### After Rollback
- [ ] Verify application is stable
- [ ] Test critical functionality
- [ ] Document rollback reason
- [ ] Plan fix for original issue

### Before Uninstall
- [ ] Backup important data
- [ ] Export secrets if needed
- [ ] Verify no critical data will be lost
- [ ] Confirm with team

### After Uninstall
- [ ] Verify all resources removed
- [ ] Clean up Docker images (optional)
- [ ] Remove local configuration files
- [ ] Document uninstall reason

## Additional Resources

- **Helm Documentation**: https://helm.sh/docs/helm/helm_upgrade/
- **Kubernetes Deployments**: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- **Rollout Management**: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment
- **Helm Rollback**: https://helm.sh/docs/helm/helm_rollback/

---

**Last Updated**: 2026-02-09
**Tested On**: Minikube v1.32.0, Kubernetes v1.28.3, Helm v3.12.0
