# OCI Workflows

Push, pull, registry authentication, and digest pinning.

---

## Charts vs Images (CRITICAL Distinction)

**Helm does NOT manage container images.** Helm manages CHARTS (packages of K8s manifests).

| Artifact | Contains | Content Type | Example |
|----------|----------|--------------|---------|
| Container Image | Filesystem layers, binaries | `application/vnd.docker.image.*` | `ghcr.io/org/myapp:v1.0.0` |
| Helm Chart | YAML templates, values | `application/vnd.cncf.helm.chart.v1.tar+gzip` | `oci://ghcr.io/org/charts/myapp:0.1.0` |

**Why same registry?** OCI (Open Container Initiative) is a general artifact standard. Originally for images, now stores anything: charts, SBOMs, signatures.

```
# Two separate workflows:

# 1. Build & push IMAGE (Docker)
docker build -t ghcr.io/org/myapp:v1.0.0 .
docker push ghcr.io/org/myapp:v1.0.0

# 2. Package & push CHART (Helm)
helm package ./myapp
helm push myapp-0.1.0.tgz oci://ghcr.io/org/charts
```

Charts REFERENCE images but don't contain them:
```yaml
# templates/deployment.yaml
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
#       ↑ Just a string reference, not the actual image bytes
```

---

## OCI Basics

### Helm 4 OCI Support

- Native `oci://` protocol
- No `helm repo add` required for OCI
- Direct push/pull to same registries as container images
- Digest pinning for immutability
- Unified authentication (`~/.docker/config.json`)

### Supported Registries

| Registry | URL Format |
|----------|------------|
| GitHub Container Registry | `oci://ghcr.io/owner/charts` |
| Docker Hub | `oci://registry-1.docker.io/username` |
| Amazon ECR | `oci://123456789.dkr.ecr.region.amazonaws.com` |
| Azure ACR | `oci://myregistry.azurecr.io/helm` |
| Google Artifact Registry | `oci://region-docker.pkg.dev/project/repo` |
| Harbor | `oci://harbor.example.com/project` |

---

## Authentication

### Login Commands

```bash
# Generic login
helm registry login <registry> -u <username>

# With password from stdin
echo $TOKEN | helm registry login ghcr.io -u $USER --password-stdin

# GitHub Container Registry
echo $GITHUB_TOKEN | helm registry login ghcr.io -u $GITHUB_USER --password-stdin

# Docker Hub
helm registry login registry-1.docker.io -u $DOCKER_USER

# AWS ECR (use aws cli)
aws ecr get-login-password --region us-east-1 | \
  helm registry login 123456789.dkr.ecr.us-east-1.amazonaws.com \
  -u AWS --password-stdin

# Azure ACR
az acr login --name myregistry
# Or with token
helm registry login myregistry.azurecr.io -u $SP_ID -p $SP_SECRET

# GCP Artifact Registry
gcloud auth print-access-token | \
  helm registry login us-docker.pkg.dev \
  -u oauth2accesstoken --password-stdin
```

### Logout

```bash
helm registry logout <registry>
```

### Credential Storage

Credentials stored in Docker config:

```bash
# Location
~/.docker/config.json

# Or with custom config
DOCKER_CONFIG=/custom/path helm registry login ...
```

---

## Push Charts

### Package and Push

```bash
# 1. Package chart
helm package ./myapp
# Creates: myapp-0.1.0.tgz

# 2. Push to registry
helm push myapp-0.1.0.tgz oci://ghcr.io/myorg/charts

# Output:
# Pushed: ghcr.io/myorg/charts/myapp:0.1.0
# Digest: sha256:abc123...
```

### Push Options

```bash
# Push with plain HTTP (testing only)
helm push myapp-0.1.0.tgz oci://localhost:5000 --plain-http

# Push with insecure TLS (not recommended)
helm push myapp-0.1.0.tgz oci://registry.local --insecure-skip-tls-verify
```

### Versioning Strategy

```yaml
# Chart.yaml - version is the tag
version: 0.1.0    # → oci://registry/myapp:0.1.0
appVersion: 1.2.3 # Application version (metadata)
```

```bash
# Push creates tag from Chart.yaml version
helm push myapp-0.1.0.tgz oci://ghcr.io/myorg/charts
# Result: ghcr.io/myorg/charts/myapp:0.1.0

# Multiple versions coexist
# :0.1.0, :0.1.1, :0.2.0, etc.
```

---

## Pull Charts

### Pull Commands

```bash
# Pull specific version
helm pull oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# Pull and untar
helm pull oci://ghcr.io/myorg/charts/myapp --version 0.1.0 --untar

# Pull to specific directory
helm pull oci://ghcr.io/myorg/charts/myapp --version 0.1.0 --destination ./charts

# Pull by digest (immutable)
helm pull oci://ghcr.io/myorg/charts/myapp@sha256:abc123...
```

### Show Chart Info

```bash
# Show chart metadata
helm show chart oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# Show default values
helm show values oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# Show README
helm show readme oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# Show all
helm show all oci://ghcr.io/myorg/charts/myapp --version 0.1.0
```

---

## Install from OCI

### Direct Install

```bash
# Install from OCI
helm install myapp oci://ghcr.io/myorg/charts/myapp --version 0.1.0

# With values
helm install myapp oci://ghcr.io/myorg/charts/myapp \
  --version 0.1.0 \
  -f values.yaml

# Upgrade from OCI
helm upgrade myapp oci://ghcr.io/myorg/charts/myapp \
  --version 0.2.0 \
  --atomic
```

### Template from OCI

```bash
# Render templates from OCI chart
helm template myapp oci://ghcr.io/myorg/charts/myapp --version 0.1.0
```

---

## Digest Pinning

### Why Use Digests

| Tag | Digest |
|-----|--------|
| Mutable (can be overwritten) | Immutable (content-addressed) |
| `myapp:0.1.0` might change | `myapp@sha256:abc...` never changes |
| Good for development | Required for production |

### Get Digest

```bash
# Digest shown after push
helm push myapp-0.1.0.tgz oci://ghcr.io/myorg/charts
# Digest: sha256:abc123def456...

# Get digest for existing chart
helm show chart oci://ghcr.io/myorg/charts/myapp --version 0.1.0
# Look for digest in output

# Or use registry API
# (varies by registry)
```

### Use Digest

```bash
# Install with digest
helm install myapp oci://ghcr.io/myorg/charts/myapp@sha256:abc123...

# Pull with digest
helm pull oci://ghcr.io/myorg/charts/myapp@sha256:abc123...
```

### Lock File Digests

```yaml
# Chart.lock includes digests
dependencies:
  - name: postgresql
    repository: oci://registry-1.docker.io/bitnamicharts
    version: 12.5.0
    digest: sha256:abc123def456...
```

---

## OCI Dependencies

### Declare OCI Dependencies

```yaml
# Chart.yaml
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "oci://registry-1.docker.io/bitnamicharts"

  - name: redis
    version: "17.x.x"
    repository: "oci://ghcr.io/myorg/charts"
    condition: redis.enabled
```

### Update Dependencies

```bash
# Download OCI dependencies
helm dependency update ./myapp

# Creates/updates Chart.lock with digests
# Downloads to charts/ directory
```

---

## CI/CD Patterns

### GitHub Actions

```yaml
- name: Login to GHCR
  run: echo "${{ secrets.GITHUB_TOKEN }}" | helm registry login ghcr.io -u ${{ github.actor }} --password-stdin

- name: Package and Push
  run: |
    helm package ./charts/myapp
    helm push myapp-*.tgz oci://ghcr.io/${{ github.repository_owner }}/charts
```

### GitLab CI

```yaml
push_chart:
  script:
    - helm registry login $CI_REGISTRY -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD
    - helm package ./charts/myapp
    - helm push myapp-*.tgz oci://$CI_REGISTRY/charts
```

### AWS ECR

```yaml
- name: Login to ECR
  run: |
    aws ecr get-login-password --region $AWS_REGION | \
      helm registry login $ECR_REGISTRY -u AWS --password-stdin

- name: Push Chart
  run: |
    helm package ./charts/myapp
    helm push myapp-*.tgz oci://$ECR_REGISTRY/charts
```

---

## Migration from HTTP Repos

### Migrate Charts

```bash
# 1. Pull from old repo
helm repo add old-repo https://charts.example.com
helm pull old-repo/myapp --version 0.1.0

# 2. Push to OCI
helm push myapp-0.1.0.tgz oci://ghcr.io/myorg/charts

# 3. Update Chart.yaml dependencies
# Old:
# repository: "https://charts.example.com"
# New:
# repository: "oci://ghcr.io/myorg/charts"
```

### Update Consumers

```bash
# Old usage
helm repo add myrepo https://charts.example.com
helm install myapp myrepo/myapp

# New usage (no repo add needed)
helm install myapp oci://ghcr.io/myorg/charts/myapp --version 0.1.0
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `unauthorized: authentication required` | Not logged in | `helm registry login` |
| `manifest unknown` | Chart/version doesn't exist | Check version, push chart |
| `denied: requested access denied` | No push permission | Check registry permissions |
| `name invalid` | Bad chart name | Use lowercase, no special chars |
| `plain HTTP` | HTTPS required | Use `--plain-http` for local testing |
