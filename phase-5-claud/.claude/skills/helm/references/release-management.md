# Release Management

Install, upgrade, rollback, atomic operations, and release lifecycle.

---

## Install

### Basic Install

```bash
# Install from local chart
helm install myapp ./myapp

# Install from OCI registry
helm install myapp oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# Install with namespace (create if needed)
helm install myapp ./myapp -n myapp --create-namespace

# Install with values file
helm install myapp ./myapp -f values/prod.yaml

# Install with overrides
helm install myapp ./myapp --set image.tag=v1.2.3
```

### Atomic Install (RECOMMENDED)

```bash
# Rolls back automatically on failure
helm install myapp ./myapp --atomic --timeout 5m

# Atomic behavior:
# 1. Deploys resources
# 2. Waits for ready (kstatus in Helm 4)
# 3. If timeout/failure → automatic rollback
# 4. If success → release marked deployed
```

### Wait Options

```bash
# Wait for resources to be ready
helm install myapp ./myapp --wait

# Custom timeout (default 5m)
helm install myapp ./myapp --wait --timeout 10m

# Wait for Jobs to complete
helm install myapp ./myapp --wait --wait-for-jobs
```

---

## Upgrade

### Basic Upgrade

```bash
# Upgrade existing release
helm upgrade myapp ./myapp

# Upgrade with new values
helm upgrade myapp ./myapp -f values/staging.yaml

# Upgrade specific values
helm upgrade myapp ./myapp --set image.tag=v1.2.4
```

### Install or Upgrade (Idempotent)

```bash
# Creates if not exists, upgrades if exists
helm upgrade --install myapp ./myapp

# RECOMMENDED for CI/CD pipelines
helm upgrade --install myapp ./myapp \
  --atomic \
  --timeout 5m \
  -f values/prod.yaml
```

### Upgrade Flags

| Flag | Purpose | When to Use |
|------|---------|-------------|
| `--atomic` | Rollback on failure | Always in production |
| `--wait` | Wait for ready | With --atomic |
| `--timeout` | Max wait time | Long-running apps |
| `--reuse-values` | Keep existing values | Partial updates |
| `--reset-values` | Reset to chart defaults | Full redeploy |
| `--force` | Force resource replacement | Schema changes |
| `--cleanup-on-fail` | Delete new resources on fail | Clean failures |

### Reuse vs Reset Values

```bash
# Keep existing values, add new overrides
helm upgrade myapp ./myapp --reuse-values --set newKey=value

# Reset to chart defaults, apply values file
helm upgrade myapp ./myapp --reset-values -f values/prod.yaml

# DANGER: --reuse-values can accumulate stale config
# Prefer explicit values files
```

---

## Rollback

### Basic Rollback

```bash
# Rollback to previous revision
helm rollback myapp

# Rollback to specific revision
helm rollback myapp 3

# View revision history first
helm history myapp
```

### History

```bash
# View release history
helm history myapp

# Output:
# REVISION  STATUS      CHART        APP VERSION  DESCRIPTION
# 1         superseded  myapp-0.1.0  1.0.0        Install complete
# 2         superseded  myapp-0.1.1  1.1.0        Upgrade complete
# 3         deployed    myapp-0.1.2  1.2.0        Upgrade complete
```

### Rollback Behavior

```bash
# Rollback creates NEW revision
helm rollback myapp 1
# Creates revision 4 with config from revision 1

# Atomic rollback
helm rollback myapp 2 --wait --timeout 5m

# Force rollback (recreate resources)
helm rollback myapp 2 --force
```

---

## Uninstall

### Basic Uninstall

```bash
# Uninstall release
helm uninstall myapp

# Uninstall from namespace
helm uninstall myapp -n myapp

# Keep history (allows rollback)
helm uninstall myapp --keep-history

# Dry-run (see what would be deleted)
helm uninstall myapp --dry-run
```

### Resource Preservation

```yaml
# Annotation to keep resource after uninstall
metadata:
  annotations:
    helm.sh/resource-policy: keep
```

---

## Release Status

### Status Commands

```bash
# Current status
helm status myapp

# Status with notes
helm status myapp --show-resources

# JSON output
helm status myapp -o json
```

### Get Commands

```bash
# Get all info
helm get all myapp

# Get computed values
helm get values myapp
helm get values myapp --all  # Include defaults

# Get manifest
helm get manifest myapp

# Get hooks
helm get hooks myapp

# Get notes
helm get notes myapp
```

---

## Atomic Operations Deep Dive

### What --atomic Does

```
1. helm install/upgrade starts
2. Resources created/updated
3. --wait kicks in
4. IF timeout OR error:
   - Rollback to previous state
   - New resources deleted
   - Release marked FAILED
5. IF success:
   - Release marked DEPLOYED
```

### Timeout Tuning

| App Type | Recommended Timeout |
|----------|---------------------|
| Simple web app | 3-5m |
| App with migrations | 5-10m |
| ML/AI with model loading | 10-15m |
| Large StatefulSet | 15-20m |

```bash
# Example for ML app with model download
helm upgrade --install myapp ./myapp \
  --atomic \
  --timeout 15m \
  --set initContainer.timeout=600
```

### When NOT to Use --atomic

- Initial debugging (want to see failure state)
- Jobs that intentionally fail
- CRDs with async reconciliation

---

## Multi-Environment Pattern

### Namespace per Environment

```bash
# Development
helm upgrade --install myapp ./myapp \
  -n dev --create-namespace \
  -f values/dev.yaml

# Staging
helm upgrade --install myapp ./myapp \
  -n staging --create-namespace \
  -f values/staging.yaml

# Production
helm upgrade --install myapp ./myapp \
  -n prod --create-namespace \
  -f values/prod.yaml \
  --atomic --timeout 10m
```

### Release Name per Environment

```bash
# If sharing namespace
helm upgrade --install myapp-dev ./myapp -f values/dev.yaml
helm upgrade --install myapp-staging ./myapp -f values/staging.yaml
helm upgrade --install myapp-prod ./myapp -f values/prod.yaml
```

---

## Diff Before Upgrade

### helm-diff Plugin

```bash
# Install plugin
helm plugin install https://github.com/databus23/helm-diff

# Show diff before upgrade
helm diff upgrade myapp ./myapp -f values/prod.yaml

# Diff with color
helm diff upgrade myapp ./myapp --color
```

### Dry-Run

```bash
# Client-side template render
helm upgrade myapp ./myapp --dry-run

# Server-side validation
helm upgrade myapp ./myapp --dry-run=server
```

---

## Failed Release Recovery

### Stuck in pending-install/pending-upgrade

```bash
# Check release status
helm status myapp

# Force rollback
helm rollback myapp

# If no history, uninstall and reinstall
helm uninstall myapp --no-hooks
helm install myapp ./myapp
```

### Hook Failures Blocking Release

```bash
# Skip hooks on rollback
helm rollback myapp --no-hooks

# Delete failed hook resources manually
kubectl delete job myapp-pre-upgrade -n myapp

# Then rollback
helm rollback myapp
```

### Orphaned Resources

```bash
# List resources owned by Helm
kubectl get all -l app.kubernetes.io/managed-by=Helm

# Check for orphans after failed uninstall
kubectl get all -l app.kubernetes.io/instance=myapp

# Manual cleanup
kubectl delete deployment,service,configmap -l app.kubernetes.io/instance=myapp
```

---

## CI/CD Best Practices

### GitHub Actions Example

```yaml
- name: Deploy
  run: |
    helm upgrade --install myapp ./charts/myapp \
      --atomic \
      --timeout 10m \
      --namespace ${{ env.NAMESPACE }} \
      --create-namespace \
      -f charts/myapp/values/${{ env.ENVIRONMENT }}.yaml \
      --set image.tag=${{ github.sha }}
```

### Retry Logic

```bash
#!/bin/bash
MAX_RETRIES=3
RETRY_DELAY=30

for i in $(seq 1 $MAX_RETRIES); do
  helm upgrade --install myapp ./myapp --atomic --timeout 5m && break
  echo "Attempt $i failed, retrying in ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done
```
