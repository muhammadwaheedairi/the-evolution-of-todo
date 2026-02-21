# Helm 4 Features

Server-Side Apply, Wasm plugins, kstatus, OCI-first, and migration from v3.

---

## Server-Side Apply (SSA)

### What Changed

| Helm 3 | Helm 4 |
|--------|--------|
| Client-side 3-way merge | Server-Side Apply (default) |
| Helm patches entire resource | Field-level ownership |
| Conflicts overwritten silently | Explicit conflict errors |

### Benefits

- **GitOps alignment**: Works better with ArgoCD/Flux
- **Field ownership**: Each manager owns specific fields
- **Conflict detection**: Errors instead of silent overwrites
- **Better diffs**: Accurate change tracking

### SSA in Practice

```bash
# Helm 4 uses SSA by default
helm install myapp ./myapp

# Force conflicts (take ownership of all fields)
helm install myapp ./myapp --force

# Revert to 3-way merge (compatibility mode)
helm install myapp ./myapp --server-side=false
```

### Field Ownership

```yaml
# Field managers visible in metadata
metadata:
  managedFields:
    - manager: helm
      operation: Apply
      fieldsV1:
        f:spec:
          f:replicas: {}
    - manager: kubectl
      operation: Update
      fieldsV1:
        f:spec:
          f:template: {}
```

### Handling Conflicts

```bash
# Error when another manager owns field
Error: cannot patch "myapp": Apply failed with 1 conflict:
  conflict with "argocd" using apps/v1: .spec.replicas

# Resolution options:
# 1. Force ownership (Helm takes over)
helm upgrade myapp ./myapp --force

# 2. Remove from Helm values (let other manager own)
# Remove replicas from values.yaml, let ArgoCD manage

# 3. Coordinate with GitOps tool
# Ensure only one manager per field
```

---

## kstatus Watching

### What Changed

| Helm 3 `--wait` | Helm 4 kstatus |
|-----------------|----------------|
| Checks basic conditions | Understands K8s status patterns |
| Often inaccurate for complex resources | Accurate health for native resources |
| Custom resources poorly supported | Standard conditions for CRDs |

### Improved Wait Behavior

```bash
# Helm 4 --wait uses kstatus
helm install myapp ./myapp --wait --timeout 5m

# Accurately waits for:
# - Deployments: all pods ready, not just created
# - StatefulSets: ordered rollout complete
# - Jobs: completion or failure
# - Services: endpoints ready
```

### Status Conditions

kstatus recognizes standard Kubernetes conditions:

```yaml
# Deployment status understood by kstatus
status:
  conditions:
    - type: Available
      status: "True"
    - type: Progressing
      status: "True"
      reason: NewReplicaSetAvailable
```

### Custom Resource Support

For CRDs to work with kstatus, implement standard conditions:

```yaml
# CRD with standard conditions
status:
  conditions:
    - type: Ready
      status: "True"
      reason: ReconciliationSucceeded
```

---

## Wasm Plugins

### What Changed

| Helm 3 Plugins | Helm 4 Plugins |
|----------------|----------------|
| Native binaries | WebAssembly (sandboxed) |
| Full system access | Explicit capability declarations |
| Security risk | Sandboxed execution |

### Plugin Types

```
CLI plugins        → Still native binaries
Downloader plugins → Now Wasm
Post-renderers     → Now Wasm (BREAKING CHANGE)
```

### Post-Renderer Migration

```bash
# Helm 3 (direct executable)
helm install myapp ./myapp --post-renderer ./my-script.sh

# Helm 4 (must be Wasm plugin)
helm install myapp ./myapp --post-renderer my-wasm-plugin
```

### Creating Wasm Plugin

```yaml
# plugin.yaml
name: my-post-renderer
version: "0.1.0"
usage: "Post-render processing"
command: "$HELM_PLUGIN_DIR/main.wasm"
platformCommand: []
hooks:
  post-renderer: true
capabilities:
  filesystem:
    - "/tmp"
  network:
    - "api.example.com"
```

### Installing Wasm Plugins

```bash
# From URL
helm plugin install https://example.com/my-plugin

# From local
helm plugin install ./my-plugin

# List plugins
helm plugin list
```

---

## OCI-First Workflows

### What Changed

| Helm 3 | Helm 4 |
|--------|--------|
| HTTP repos default | OCI native |
| `helm repo add` required | Direct OCI URLs |
| No digest pinning | Digest support |

### OCI Commands

```bash
# Login to OCI registry
helm registry login ghcr.io -u USERNAME

# Push chart
helm push myapp-0.1.0.tgz oci://ghcr.io/myorg/charts

# Pull chart
helm pull oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# Install directly from OCI
helm install myapp oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# With digest pinning (immutable)
helm install myapp oci://ghcr.io/myorg/charts/myapp@sha256:abc123...
```

### OCI Dependencies

```yaml
# Chart.yaml with OCI dependencies
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "oci://registry-1.docker.io/bitnamicharts"

  - name: redis
    version: "17.x.x"
    repository: "oci://ghcr.io/myorg/charts"
```

### Digest Pinning

```yaml
# Lock file with digests (Chart.lock)
dependencies:
  - name: postgresql
    repository: oci://registry-1.docker.io/bitnamicharts
    version: 12.5.0
    digest: sha256:abc123def456...
```

```bash
# Update locks with digests
helm dependency update ./myapp
```

---

## Migration from Helm 3

### Pre-Migration Checklist

```bash
# 1. Check current Helm version
helm version

# 2. List existing releases
helm list -A

# 3. Test charts with Helm 4
helm lint ./myapp
helm template ./myapp --debug
```

### Breaking Changes

| Area | Change | Action |
|------|--------|--------|
| SSA default | 3-way merge → SSA | Test field ownership |
| Post-renderers | Binary → Wasm plugin | Convert or remove |
| Registry login | Full URL → Domain only | Update scripts |
| Flags renamed | Various CLI flags | Update CI/CD scripts |
| Plugin format | Native → Wasm | Migrate plugins |

### Step-by-Step Migration

```bash
# 1. Install Helm 4 alongside Helm 3
# (different binary paths)

# 2. Test existing charts
helm4 lint ./myapp
helm4 template ./myapp

# 3. Test in staging
helm4 upgrade --install myapp ./myapp -n staging

# 4. Check for field conflicts
helm4 get manifest myapp -n staging | kubectl apply --dry-run=server -f -

# 5. Migrate production releases
helm4 upgrade myapp ./myapp -n prod

# 6. Update CI/CD pipelines
```

### Compatibility Mode

```bash
# Keep 3-way merge behavior
helm install myapp ./myapp --server-side=false

# Force ownership transfer
helm upgrade myapp ./myapp --force
```

---

## New Helm 4 CLI Flags

### Changed Flags

| Helm 3 | Helm 4 | Notes |
|--------|--------|-------|
| `--post-renderer <exec>` | `--post-renderer <plugin>` | Must be Wasm plugin |
| N/A | `--server-side` | SSA control (default: true) |
| N/A | `--force-adopt` | Take ownership of fields |

### New Commands

```bash
# Chart validation with policies
helm lint ./myapp --strict

# OCI operations (enhanced)
helm push ./myapp.tgz oci://registry --plain-http

# Plugin management
helm plugin package ./my-plugin
helm plugin verify ./my-plugin
```

---

## Best Practices for Helm 4

### GitOps Alignment

```yaml
# Let GitOps tool manage replicas
# Remove from Helm values
# autoscaling:
#   enabled: false
# replicaCount: 3  # REMOVE - let ArgoCD manage

# OR use Helm for all fields
# Disable ArgoCD self-heal on managed resources
```

### Immutable Deployments

```bash
# Use digest pinning in production
helm install myapp oci://ghcr.io/myorg/myapp@sha256:...

# Lock dependencies
helm dependency build ./myapp
git add Chart.lock
```

### CI/CD Updates

```yaml
# GitHub Actions example
- name: Deploy with Helm 4
  run: |
    helm upgrade --install myapp ./myapp \
      --atomic \
      --timeout 5m \
      --wait
    # --wait now uses kstatus for accurate health
```
