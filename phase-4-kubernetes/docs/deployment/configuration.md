# Configuration Management Guide

**Purpose**: Guide for managing application configuration in Kubernetes
**Target Audience**: Developers deploying Todo AI Chatbot to Kubernetes
**Covers**: ConfigMaps, environment variables, and configuration best practices

## Overview

Kubernetes provides two primary mechanisms for managing application configuration:

- **ConfigMaps**: For non-sensitive configuration data
- **Secrets**: For sensitive data (passwords, API keys, tokens)

This guide focuses on ConfigMaps and general configuration management. For sensitive data, see [Secrets Management Guide](./secrets-management.md).

## ConfigMap vs Secret

### When to Use ConfigMap

Use ConfigMaps for:
- Application settings (log level, environment name)
- Feature flags
- API endpoints (non-sensitive)
- Configuration files
- Public URLs
- Resource limits
- Any non-sensitive data

**Examples**:
- `ENVIRONMENT=production`
- `LOG_LEVEL=info`
- `NEXT_PUBLIC_API_URL=http://backend-service:8000`

### When to Use Secret

Use Secrets for:
- Passwords
- API keys
- Database connection strings
- JWT secrets
- TLS certificates
- OAuth tokens
- Any sensitive data

**Examples**:
- `JWT_SECRET=...`
- `OPENAI_API_KEY=sk-...`
- `DATABASE_URL=postgresql://...`

## Application Configuration

### Current ConfigMap

The Todo AI Chatbot uses a ConfigMap for non-sensitive configuration:

**Location**: `helm/templates/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-app-config
data:
  # Frontend configuration
  NEXT_PUBLIC_API_URL: "http://backend-service:8000"

  # Backend configuration
  ENVIRONMENT: "production"
  LOG_LEVEL: "info"
```

### Configuration Sources

The application receives configuration from multiple sources:

1. **ConfigMap** (`todo-app-config`):
   - Non-sensitive application settings
   - Managed by Helm chart

2. **Secrets** (`todo-app-secrets`):
   - Sensitive credentials
   - Created manually before deployment

3. **Helm Values** (`values.yaml`, `values-dev.yaml`):
   - Deployment configuration
   - Resource limits
   - Replica counts

4. **Environment Variables** (hardcoded in Deployment):
   - Container-specific settings
   - Runtime configuration

## Viewing Configuration

### View ConfigMap

```bash
# List ConfigMaps
kubectl get configmaps -n todo-app

# View ConfigMap contents
kubectl get configmap todo-app-config -n todo-app -o yaml

# View specific key
kubectl get configmap todo-app-config -n todo-app -o jsonpath='{.data.LOG_LEVEL}'
```

### View Pod Environment Variables

```bash
# View all environment variables in frontend pod
kubectl exec -n todo-app deployment/todo-app-frontend -- env

# View all environment variables in backend pod
kubectl exec -n todo-app deployment/todo-app-backend -- env

# View specific variable
kubectl exec -n todo-app deployment/todo-app-backend -- env | grep LOG_LEVEL
```

### View Helm Values

```bash
# View values used in current release
helm get values todo-app -n todo-app

# View all values (including defaults)
helm get values todo-app -n todo-app --all
```

## Updating Configuration

### Update ConfigMap via Helm

**Recommended method** for configuration changes:

```bash
# Step 1: Edit values file
vim helm/values-dev.yaml

# Example: Change log level
# backend:
#   env:
#     LOG_LEVEL: "debug"  # Changed from "info"

# Step 2: Upgrade Helm release
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml

# Step 3: Restart pods to pick up changes
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Step 4: Verify changes
kubectl exec -n todo-app deployment/todo-app-backend -- env | grep LOG_LEVEL
```

### Update ConfigMap Directly

**Quick method** for testing (not recommended for production):

```bash
# Edit ConfigMap directly
kubectl edit configmap todo-app-config -n todo-app

# Restart pods to apply changes
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

**Warning**: Direct edits are lost on next Helm upgrade. Always update via Helm values for permanent changes.

### Update Environment Variables

To change environment variables defined in Deployment:

```bash
# Step 1: Edit values file
vim helm/values-dev.yaml

# Step 2: Upgrade release
helm upgrade todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml

# Pods automatically restart with new configuration
```

## Configuration Examples

### Example 1: Change Log Level

**Use Case**: Enable debug logging for troubleshooting

```bash
# Edit values-dev.yaml
backend:
  env:
    LOG_LEVEL: "debug"  # Changed from "info"

# Apply changes
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Verify
kubectl logs -n todo-app deployment/todo-app-backend --tail=20
```

### Example 2: Change Backend URL

**Use Case**: Point frontend to different backend service

```bash
# Edit values-dev.yaml
frontend:
  env:
    NEXT_PUBLIC_API_URL: "http://backend-service-v2:8000"

# Apply changes
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
kubectl rollout restart deployment/todo-app-frontend -n todo-app

# Verify
kubectl exec -n todo-app deployment/todo-app-frontend -- env | grep NEXT_PUBLIC_API_URL
```

### Example 3: Add New Configuration

**Use Case**: Add a new environment variable

```bash
# Step 1: Update ConfigMap template (helm/templates/configmap.yaml)
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "todo-app.fullname" . }}-config
data:
  NEXT_PUBLIC_API_URL: {{ .Values.frontend.env.NEXT_PUBLIC_API_URL | quote }}
  ENVIRONMENT: {{ .Values.backend.env.ENVIRONMENT | quote }}
  LOG_LEVEL: {{ .Values.backend.env.LOG_LEVEL | quote }}
  NEW_FEATURE_FLAG: {{ .Values.backend.env.NEW_FEATURE_FLAG | default "false" | quote }}

# Step 2: Update values-dev.yaml
backend:
  env:
    ENVIRONMENT: "development"
    LOG_LEVEL: "debug"
    NEW_FEATURE_FLAG: "true"

# Step 3: Update Deployment to use new variable (helm/templates/backend-deployment.yaml)
env:
- name: NEW_FEATURE_FLAG
  valueFrom:
    configMapKeyRef:
      name: {{ include "todo-app.fullname" . }}-config
      key: NEW_FEATURE_FLAG

# Step 4: Apply changes
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

## Environment-Specific Configuration

### Development Configuration

**File**: `helm/values-dev.yaml`

**Characteristics**:
- Debug logging enabled
- Local image pull policy
- NodePort service for easy access
- Lower resource limits
- Development-friendly settings

```yaml
backend:
  env:
    ENVIRONMENT: "development"
    LOG_LEVEL: "debug"
    PYTHONUNBUFFERED: "1"
```

### Production Configuration

**File**: `helm/values.yaml` (or `values-prod.yaml`)

**Characteristics**:
- Info/warning logging only
- Pull images from registry
- LoadBalancer or Ingress
- Production resource limits
- Security-hardened settings

```yaml
backend:
  env:
    ENVIRONMENT: "production"
    LOG_LEVEL: "info"
```

## Configuration Best Practices

### 1. Use Helm Values for Configuration

**Good** ✅:
```yaml
# values-dev.yaml
backend:
  env:
    LOG_LEVEL: "debug"

# Deployment template references values
env:
- name: LOG_LEVEL
  value: {{ .Values.backend.env.LOG_LEVEL | quote }}
```

**Bad** ❌:
```yaml
# Hardcoded in Deployment template
env:
- name: LOG_LEVEL
  value: "debug"
```

### 2. Separate Sensitive from Non-Sensitive

**Good** ✅:
```yaml
# ConfigMap (non-sensitive)
data:
  LOG_LEVEL: "info"
  ENVIRONMENT: "production"

# Secret (sensitive)
data:
  JWT_SECRET: <base64-encoded>
  OPENAI_API_KEY: <base64-encoded>
```

**Bad** ❌:
```yaml
# ConfigMap with sensitive data
data:
  LOG_LEVEL: "info"
  JWT_SECRET: "my-secret"  # Should be in Secret!
```

### 3. Use Defaults with Overrides

```yaml
# values.yaml (defaults)
backend:
  env:
    LOG_LEVEL: "info"

# values-dev.yaml (overrides)
backend:
  env:
    LOG_LEVEL: "debug"
```

### 4. Document Configuration Options

```yaml
# values.yaml
backend:
  env:
    # Log level: debug, info, warning, error
    LOG_LEVEL: "info"

    # Environment: development, staging, production
    ENVIRONMENT: "production"
```

### 5. Validate Configuration

```bash
# Dry-run to validate configuration
helm install todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml \
  --dry-run --debug

# Check for errors in output
```

## Configuration Troubleshooting

### Issue: Configuration Not Applied

**Symptoms**: Pods still use old configuration after update

**Diagnosis**:
```bash
# Check ConfigMap
kubectl get configmap todo-app-config -n todo-app -o yaml

# Check pod environment
kubectl exec -n todo-app deployment/todo-app-backend -- env
```

**Solution**:
```bash
# Restart pods to pick up new ConfigMap
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

### Issue: Missing Environment Variable

**Symptoms**: Application fails with "environment variable not set" error

**Diagnosis**:
```bash
# Check pod logs
kubectl logs -n todo-app deployment/todo-app-backend --tail=50

# Check pod environment
kubectl exec -n todo-app deployment/todo-app-backend -- env | grep VARIABLE_NAME
```

**Solution**:
```bash
# Add missing variable to values file
# Upgrade Helm release
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
```

### Issue: Wrong Configuration Value

**Symptoms**: Application behaves incorrectly

**Diagnosis**:
```bash
# View actual configuration in pod
kubectl exec -n todo-app deployment/todo-app-backend -- env

# Compare with expected values
helm get values todo-app -n todo-app
```

**Solution**:
```bash
# Correct values file
# Upgrade and restart
helm upgrade todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

## Configuration Checklist

Before deploying:

- [ ] All required environment variables are defined
- [ ] Sensitive data is in Secrets, not ConfigMaps
- [ ] Configuration values are appropriate for environment
- [ ] Defaults are set in values.yaml
- [ ] Environment-specific overrides are in values-dev.yaml
- [ ] Configuration is documented
- [ ] Dry-run validation passes
- [ ] No hardcoded values in templates

After configuration changes:

- [ ] Helm upgrade completed successfully
- [ ] Pods restarted to pick up changes
- [ ] Configuration verified in running pods
- [ ] Application functionality tested
- [ ] Logs show expected behavior
- [ ] Changes documented

## Additional Resources

- **Kubernetes ConfigMaps**: https://kubernetes.io/docs/concepts/configuration/configmap/
- **Helm Values**: https://helm.sh/docs/chart_template_guide/values_files/
- **Environment Variables**: https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/
- **Secrets Management**: [secrets-management.md](./secrets-management.md)

---

**Last Updated**: 2026-02-09
**Tested On**: Minikube v1.32.0, Kubernetes v1.28.3, Helm v3.12.0
