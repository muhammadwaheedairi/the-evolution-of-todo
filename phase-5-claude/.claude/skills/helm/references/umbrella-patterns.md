# Umbrella Chart Patterns

Multi-service deployments, subchart dependencies, and Kustomize hybrid approaches.

---

## Umbrella Chart Types

| Pattern | When to Use | Complexity |
|---------|-------------|------------|
| **Subchart Dependencies** | Tightly coupled services | Medium |
| **Kustomize + Helm** | Environment overlays needed | Medium |
| **ArgoCD ApplicationSet** | Loosely coupled, GitOps-first | Low |

---

## Subchart Dependencies

### Parent Chart Structure

```
myplatform/
├── Chart.yaml
├── values.yaml
├── charts/                      # Subcharts here
│   ├── api/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   ├── worker/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── frontend/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
└── templates/
    ├── _helpers.tpl
    └── NOTES.txt
```

### Parent Chart.yaml

```yaml
apiVersion: v2
name: myplatform
version: 1.0.0
appVersion: "2.0.0"
type: application
description: Complete platform deployment

dependencies:
  # Local subcharts
  - name: api
    version: "0.1.0"
    repository: "file://charts/api"

  - name: worker
    version: "0.1.0"
    repository: "file://charts/worker"
    condition: worker.enabled

  - name: frontend
    version: "0.1.0"
    repository: "file://charts/frontend"
    condition: frontend.enabled

  # External dependencies
  - name: postgresql
    version: "12.x.x"
    repository: "oci://registry-1.docker.io/bitnamicharts"
    condition: postgresql.enabled

  - name: redis
    version: "17.x.x"
    repository: "oci://registry-1.docker.io/bitnamicharts"
    condition: redis.enabled
```

### Parent values.yaml

```yaml
# Global values available to all subcharts
global:
  imageRegistry: "ghcr.io/myorg"
  imagePullSecrets:
    - name: ghcr-auth
  environment: production

# Subchart toggles
api:
  enabled: true
  replicaCount: 3

worker:
  enabled: true
  replicaCount: 2

frontend:
  enabled: true
  replicaCount: 2

# External dependencies
postgresql:
  enabled: true
  auth:
    username: myplatform
    database: myplatform

redis:
  enabled: true
  architecture: standalone
```

### Build and Deploy

```bash
# Update dependencies
helm dependency update ./myplatform

# Deploy entire platform
helm upgrade --install myplatform ./myplatform \
  -f values/prod.yaml \
  --atomic

# Deploy without certain components
helm upgrade --install myplatform ./myplatform \
  --set worker.enabled=false \
  --set redis.enabled=false
```

---

## Subchart Communication

### Global Values Pattern

```yaml
# Parent values.yaml
global:
  apiUrl: "http://api:8080"
  redisHost: "redis-master"
  postgresHost: "postgresql"

# Subchart template accesses global
# In api/templates/deployment.yaml
env:
  - name: REDIS_HOST
    value: {{ .Values.global.redisHost }}
```

### Service Discovery

```yaml
# worker/templates/deployment.yaml
env:
  - name: API_URL
    value: "http://{{ .Release.Name }}-api:8080"
  - name: REDIS_URL
    value: "redis://{{ .Release.Name }}-redis-master:6379"
```

### Conditional Dependencies

```yaml
# worker/templates/deployment.yaml
env:
  {{- if .Values.global.redis.enabled }}
  - name: REDIS_URL
    value: "redis://{{ .Release.Name }}-redis-master:6379"
  {{- else }}
  - name: REDIS_URL
    valueFrom:
      secretKeyRef:
        name: external-redis
        key: url
  {{- end }}
```

---

## Kustomize + Helm Hybrid

### Structure

```
myplatform/
├── base/
│   ├── kustomization.yaml
│   └── helm/
│       └── myplatform/           # Helm chart
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── values.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── values.yaml
    └── prod/
        ├── kustomization.yaml
        ├── values.yaml
        └── patches/
            └── hpa-patch.yaml
```

### Base kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

helmCharts:
  - name: myplatform
    releaseName: myplatform
    namespace: myplatform
    version: 1.0.0
    repo: file://./helm/myplatform
    valuesFile: ./helm/myplatform/values.yaml
```

### Overlay kustomization.yaml

```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: myplatform-prod

resources:
  - ../../base

helmCharts:
  - name: myplatform
    releaseName: myplatform
    namespace: myplatform-prod
    version: 1.0.0
    repo: file://../../base/helm/myplatform
    valuesFile: values.yaml

patches:
  - path: patches/hpa-patch.yaml
```

### Build with Kustomize

```bash
# Render for environment
kustomize build --enable-helm overlays/prod > rendered.yaml

# Apply
kubectl apply -f rendered.yaml

# Or with kubectl directly
kubectl apply -k overlays/prod --enable-helm
```

---

## ArgoCD ApplicationSet Umbrella

### ApplicationSet for Services

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myplatform
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - service: api
            chart: myplatform-api
            namespace: myplatform
          - service: worker
            chart: myplatform-worker
            namespace: myplatform
          - service: frontend
            chart: myplatform-frontend
            namespace: myplatform

  template:
    metadata:
      name: 'myplatform-{{service}}'
    spec:
      project: default
      source:
        chart: '{{chart}}'
        repoURL: ghcr.io/myorg/charts
        targetRevision: 1.0.0
        helm:
          valueFiles:
            - values/prod.yaml
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

### Multi-Cluster Umbrella

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myplatform-global
spec:
  generators:
    - matrix:
        generators:
          # Clusters
          - clusters:
              selector:
                matchLabels:
                  env: production
          # Services
          - list:
              elements:
                - service: api
                - service: worker

  template:
    metadata:
      name: '{{name}}-{{service}}'
    spec:
      destination:
        server: '{{server}}'
        namespace: myplatform
```

---

## Sync Waves (ArgoCD)

### Ordered Deployment

```yaml
# Database first (wave 0)
# postgresql/templates/deployment.yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "0"

# Migrations (wave 1)
# api/templates/migration-job.yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"

# Backend services (wave 2)
# api/templates/deployment.yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "2"

# Frontend (wave 3)
# frontend/templates/deployment.yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "3"
```

### Sync Wave Helper

```yaml
# _helpers.tpl
{{- define "myapp.syncWave" -}}
{{- $waves := dict
  "database" "0"
  "migrations" "1"
  "backend" "2"
  "frontend" "3"
  "monitoring" "4"
-}}
{{- index $waves .component | default "2" -}}
{{- end }}

# Usage in template
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: {{ include "myapp.syncWave" (dict "component" "backend") | quote }}
```

---

## Shared Resources

### Shared ConfigMap

```yaml
# Parent chart templates/shared-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-shared-config
  labels:
    {{- include "myplatform.labels" . | nindent 4 }}
data:
  API_URL: "http://{{ .Release.Name }}-api:8080"
  FRONTEND_URL: "http://{{ .Release.Name }}-frontend:3000"
  {{- range $key, $value := .Values.global.config }}
  {{ $key }}: {{ $value | quote }}
  {{- end }}
```

### Reference in Subcharts

```yaml
# Subchart deployment
envFrom:
  - configMapRef:
      name: {{ .Release.Name }}-shared-config
```

---

## Testing Umbrella Charts

### Unit Tests (helm-unittest)

```yaml
# tests/platform_test.yaml
suite: platform deployment
templates:
  - charts/api/templates/deployment.yaml
  - charts/worker/templates/deployment.yaml
tests:
  - it: should deploy all enabled services
    asserts:
      - isKind:
          of: Deployment
      - matchRegex:
          path: metadata.name
          pattern: ^myplatform-(api|worker)$
```

### Integration Test

```bash
#!/bin/bash
# Test umbrella deployment

# Deploy to test namespace
helm upgrade --install myplatform ./myplatform \
  -n test --create-namespace \
  --wait --timeout 10m

# Verify all pods running
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=myplatform \
  -n test --timeout=5m

# Run integration tests
kubectl run test --image=curlimages/curl --rm -it --restart=Never \
  -- curl http://myplatform-api:8080/health

# Cleanup
helm uninstall myplatform -n test
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Circular dependencies | Deadlock on deploy | Use async communication |
| Tight coupling | Can't deploy independently | Use feature flags |
| Shared state in volumes | Race conditions | Use database/cache |
| Monolithic values.yaml | Hard to maintain | Split by service |
| No sync waves | Random deploy order | Add ArgoCD sync waves |
