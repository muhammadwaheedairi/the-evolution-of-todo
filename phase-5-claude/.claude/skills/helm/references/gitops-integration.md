# GitOps Integration

ArgoCD, Flux, ApplicationSet, and Helm source patterns.

---

## ArgoCD + Helm

### Application CRD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default

  source:
    # From OCI registry
    chart: myapp
    repoURL: ghcr.io/myorg/charts
    targetRevision: 0.1.0  # Chart version

    # OR from Git repo
    # repoURL: https://github.com/myorg/myapp
    # path: charts/myapp
    # targetRevision: main

    helm:
      # Values inline
      values: |
        replicaCount: 3
        image:
          tag: v1.2.3

      # OR values from files in repo
      valueFiles:
        - values/prod.yaml

      # OR external values file
      # valueFiles:
      #   - $values/myapp/values.yaml

      # Parameters (highest priority)
      parameters:
        - name: image.tag
          value: $ARGOCD_APP_REVISION

  destination:
    server: https://kubernetes.default.svc
    namespace: myapp

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - ServerSideApply=true  # Helm 4 alignment
```

### Helm 4 SSA Alignment

```yaml
# ArgoCD with Server-Side Apply
spec:
  syncPolicy:
    syncOptions:
      - ServerSideApply=true
      - Validate=false  # Skip client-side validation

# Field ownership coordination
# Let ArgoCD manage replicas, Helm manages everything else
# Remove replicas from Helm values
```

### Multiple Value Sources

```yaml
spec:
  sources:
    # Helm chart
    - chart: myapp
      repoURL: ghcr.io/myorg/charts
      targetRevision: 0.1.0
      helm:
        valueFiles:
          - $values/envs/prod.yaml

    # Values from separate repo
    - repoURL: https://github.com/myorg/config
      targetRevision: main
      ref: values
```

---

## ArgoCD ApplicationSet

### Generator Patterns

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-environments
  namespace: argocd
spec:
  generators:
    # List generator - explicit environments
    - list:
        elements:
          - env: dev
            namespace: dev
            values: values/dev.yaml
          - env: staging
            namespace: staging
            values: values/staging.yaml
          - env: prod
            namespace: prod
            values: values/prod.yaml

  template:
    metadata:
      name: 'myapp-{{env}}'
    spec:
      project: default
      source:
        chart: myapp
        repoURL: ghcr.io/myorg/charts
        targetRevision: 0.1.0
        helm:
          valueFiles:
            - '{{values}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
```

### Cluster Generator

```yaml
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            env: production

  template:
    spec:
      destination:
        server: '{{server}}'
        namespace: myapp
```

### Git Generator

```yaml
spec:
  generators:
    # Generate from directories
    - git:
        repoURL: https://github.com/myorg/config
        revision: main
        directories:
          - path: 'apps/*'

  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      source:
        path: '{{path}}'
```

---

## Flux + Helm

### HelmRepository (OCI)

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: myorg-charts
  namespace: flux-system
spec:
  type: oci
  url: oci://ghcr.io/myorg/charts
  interval: 10m
  secretRef:
    name: ghcr-auth  # OCI registry credentials
```

### HelmRelease

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta2
kind: HelmRelease
metadata:
  name: myapp
  namespace: myapp
spec:
  interval: 10m

  chart:
    spec:
      chart: myapp
      version: "0.1.*"  # SemVer range
      sourceRef:
        kind: HelmRepository
        name: myorg-charts
        namespace: flux-system

  values:
    replicaCount: 3
    image:
      tag: v1.2.3

  # OR values from ConfigMap/Secret
  valuesFrom:
    - kind: ConfigMap
      name: myapp-values
      valuesKey: values.yaml

  # Upgrade settings
  upgrade:
    remediation:
      retries: 3

  # Rollback on failure
  rollback:
    timeout: 5m
    cleanupOnFail: true
```

### Values from Git

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: myapp-config
  namespace: flux-system
spec:
  url: https://github.com/myorg/config
  ref:
    branch: main
  interval: 1m
---
apiVersion: helm.toolkit.fluxcd.io/v2beta2
kind: HelmRelease
metadata:
  name: myapp
spec:
  valuesFrom:
    - kind: GitRepository
      name: myapp-config
      valuesKey: values/prod.yaml
```

---

## Git Repository Structure

### Chart in Git (ArgoCD/Flux)

```
myapp-config/
├── charts/
│   └── myapp/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── envs/
│   ├── dev/
│   │   ├── values.yaml
│   │   └── kustomization.yaml  # Optional
│   ├── staging/
│   │   └── values.yaml
│   └── prod/
│       └── values.yaml
└── apps/
    ├── dev.yaml      # ArgoCD Application
    ├── staging.yaml
    └── prod.yaml
```

### OCI Registry (Preferred)

```
# Charts in OCI registry
ghcr.io/myorg/charts/
├── myapp:0.1.0
├── myapp:0.1.1
└── myapp:0.2.0

# Config in Git
myapp-config/
├── envs/
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
└── apps/
    └── applicationset.yaml
```

---

## Helm 4 + GitOps Best Practices

### Field Ownership Strategy

```yaml
# Option 1: Helm owns everything
# Let GitOps sync Helm releases, don't manage K8s resources directly

# Option 2: Split ownership
# Helm: Core config (image, resources, probes)
# GitOps: Scaling (replicas, HPA)
# Remove replicas from Helm values, let ArgoCD manage
```

### SSA Configuration

```yaml
# ArgoCD
syncOptions:
  - ServerSideApply=true

# Flux
spec:
  upgrade:
    force: false  # Don't force-apply conflicts
```

### Image Update Automation

```yaml
# Flux Image Automation
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: myapp
spec:
  imageRepositoryRef:
    name: myapp
  policy:
    semver:
      range: '>=1.0.0 <2.0.0'
---
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageUpdateAutomation
metadata:
  name: myapp
spec:
  sourceRef:
    kind: GitRepository
    name: myapp-config
  git:
    commit:
      author:
        name: fluxbot
        email: flux@example.com
  update:
    path: ./envs/staging
    strategy: Setters
```

---

## Secrets in GitOps

### SOPS Encrypted Values

```yaml
# Flux with SOPS
apiVersion: helm.toolkit.fluxcd.io/v2beta2
kind: HelmRelease
spec:
  valuesFrom:
    - kind: Secret
      name: myapp-secrets
      valuesKey: secrets.yaml

# Decrypt with SOPS
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
spec:
  decryption:
    provider: sops
    secretRef:
      name: sops-gpg
```

### External Secrets Reference

```yaml
# In Helm values - reference external secret
externalSecrets:
  enabled: true
  secretStore: aws-secrets-manager
  data:
    - key: myapp/database-password
      name: DB_PASSWORD
```

---

## Troubleshooting GitOps

### ArgoCD Sync Issues

```bash
# Check sync status
argocd app get myapp

# Force refresh
argocd app get myapp --refresh

# Sync with prune
argocd app sync myapp --prune

# Debug Helm values
argocd app manifests myapp --source=live
argocd app manifests myapp --source=desired
argocd app diff myapp
```

### Flux Issues

```bash
# Check HelmRelease status
flux get helmreleases -A

# Debug failed release
kubectl describe helmrelease myapp -n myapp

# Check Helm controller logs
kubectl logs -n flux-system deploy/helm-controller

# Force reconcile
flux reconcile helmrelease myapp -n myapp
```

### SSA Conflict Resolution

```bash
# ArgoCD conflict
# Error: Apply failed with conflict on .spec.replicas

# Option 1: Ignore field in ArgoCD
spec:
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas

# Option 2: Remove from Helm values
# Let ArgoCD own replicas
```
