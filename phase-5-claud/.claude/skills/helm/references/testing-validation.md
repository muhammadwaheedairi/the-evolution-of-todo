# Testing & Validation

Complete testing strategy from static analysis to integration tests.

---

## Validation Pipeline

```
1. helm lint          → Structural checks
2. helm template      → Render locally
3. helm-unittest      → Unit test templates
4. helm install --dry-run → Cluster validation
5. Policy validation  → OPA/Kyverno/trivy
6. helm install       → Deploy to test namespace
7. helm test          → Runtime integration tests
```

---

## Phase 1: Static Analysis (helm lint)

```bash
# Basic lint
helm lint ./myapp

# Lint with values
helm lint ./myapp -f values/prod.yaml

# Strict mode (treat warnings as errors)
helm lint ./myapp --strict

# With debug output
helm lint ./myapp --debug
```

### What lint Checks

| Check | Example Error |
|-------|---------------|
| Chart.yaml required fields | `chart metadata is missing` |
| Template syntax | `template: myapp:1: unexpected "}"` |
| Values references | `map has no entry for key "missingKey"` |
| Icon URL validity | `invalid icon URL format` |

---

## Phase 2: Template Rendering (helm template)

```bash
# Render all templates
helm template myapp ./myapp

# Render with specific values
helm template myapp ./myapp -f values/prod.yaml

# Render single template
helm template myapp ./myapp -s templates/deployment.yaml

# Show computed values
helm template myapp ./myapp --debug

# Output to file for inspection
helm template myapp ./myapp > rendered.yaml
```

### Template Debugging

```bash
# Check specific value substitution
helm template myapp ./myapp --set image.tag=v1.2.3 | grep "image:"

# Validate against kubectl
helm template myapp ./myapp | kubectl apply --dry-run=client -f -

# Check for empty files (common mistake)
helm template myapp ./myapp | grep -A1 "^---$"
```

---

## Phase 3: Unit Testing (helm-unittest)

### Installation

```bash
helm plugin install https://github.com/helm-unittest/helm-unittest.git
```

### Test File Structure

```
myapp/
├── Chart.yaml
├── templates/
│   └── deployment.yaml
└── tests/
    └── deployment_test.yaml
```

### Test File Format

```yaml
# tests/deployment_test.yaml
suite: deployment tests
templates:
  - templates/deployment.yaml
tests:
  - it: should set correct replica count
    set:
      replicaCount: 3
    asserts:
      - equal:
          path: spec.replicas
          value: 3

  - it: should use correct image
    set:
      image.repository: myregistry/myapp
      image.tag: v1.0.0
    asserts:
      - equal:
          path: spec.template.spec.containers[0].image
          value: myregistry/myapp:v1.0.0

  - it: should set resource limits
    asserts:
      - isNotNull:
          path: spec.template.spec.containers[0].resources.limits

  - it: should run as non-root
    asserts:
      - equal:
          path: spec.template.spec.securityContext.runAsNonRoot
          value: true
```

### Assertion Types

| Assertion | Description | Example |
|-----------|-------------|---------|
| `equal` | Exact match | `path: spec.replicas, value: 3` |
| `notEqual` | Not equal | `path: spec.replicas, value: 0` |
| `matchRegex` | Regex match | `path: metadata.name, pattern: ^myapp-` |
| `contains` | Array contains | `path: spec.template.spec.containers, content: {name: myapp}` |
| `isNull` | Value is null | `path: spec.template.spec.nodeSelector` |
| `isNotNull` | Value exists | `path: spec.template.spec.containers[0].resources` |
| `isEmpty` | Empty value | `path: metadata.annotations` |
| `isNotEmpty` | Non-empty | `path: spec.selector.matchLabels` |
| `isKind` | Resource kind | `of: Deployment` |
| `hasDocuments` | Document count | `count: 2` |
| `matchSnapshot` | Snapshot test | Compares against stored snapshot |

### Running Tests

```bash
# Run all tests
helm unittest ./myapp

# Run with verbose output
helm unittest ./myapp -v

# Run specific test file
helm unittest ./myapp -f 'tests/deployment_test.yaml'

# Update snapshots
helm unittest ./myapp --update-snapshot

# Output JUnit XML (for CI)
helm unittest ./myapp --output-file results.xml --output-type JUnit
```

### Multi-Template Tests

```yaml
# tests/full_stack_test.yaml
suite: full stack tests
templates:
  - templates/deployment.yaml
  - templates/service.yaml
  - templates/ingress.yaml
tests:
  - it: should create all resources when ingress enabled
    set:
      ingress.enabled: true
    asserts:
      - hasDocuments:
          count: 3
      - isKind:
          of: Deployment
        documentIndex: 0
      - isKind:
          of: Service
        documentIndex: 1
      - isKind:
          of: Ingress
        documentIndex: 2
```

---

## Phase 4: Dry-Run Validation

### Client-Side Dry-Run

```bash
# Validate templates parse correctly
helm install myapp ./myapp --dry-run

# With values
helm install myapp ./myapp --dry-run -f values/prod.yaml
```

### Server-Side Dry-Run (Recommended)

```bash
# Validates against actual cluster (schema, CRDs, webhooks)
helm install myapp ./myapp --dry-run=server

# For upgrades
helm upgrade myapp ./myapp --dry-run=server
```

### Diff Before Upgrade

```bash
# Install helm-diff plugin
helm plugin install https://github.com/databus23/helm-diff

# See what would change
helm diff upgrade myapp ./myapp -f values/prod.yaml
```

---

## Phase 5: Policy Validation

### Trivy (Misconfiguration Scanning)

```bash
# Scan chart directory
trivy config ./myapp

# Scan rendered manifests
helm template myapp ./myapp | trivy config -

# CI mode (exit code on issues)
trivy config ./myapp --exit-code 1 --severity HIGH,CRITICAL
```

### Conftest (OPA Policies)

```bash
# Policy file: policy/deployment.rego
package main

deny[msg] {
  input.kind == "Deployment"
  not input.spec.template.spec.securityContext.runAsNonRoot
  msg := "Containers must not run as root"
}

deny[msg] {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.resources.limits
  msg := sprintf("Container '%s' must have resource limits", [container.name])
}
```

```bash
# Validate
helm template myapp ./myapp | conftest test -
```

### Kyverno (In-Cluster)

```yaml
# Kyverno policy validates at admission time
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: enforce
  rules:
    - name: check-team-label
      match:
        resources:
          kinds:
            - Deployment
      validate:
        message: "label 'team' is required"
        pattern:
          metadata:
            labels:
              team: "?*"
```

---

## Phase 6: Helm Test (Runtime)

### Test Pod Definition

```yaml
# templates/tests/test-connection.yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ include "myapp.fullname" . }}-test
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  restartPolicy: Never
  containers:
    - name: curl
      image: curlimages/curl:latest
      command:
        - /bin/sh
        - -c
        - |
          echo "Testing service connectivity..."
          curl -f http://{{ include "myapp.fullname" . }}:{{ .Values.service.port }}/health
          echo "Testing API endpoint..."
          curl -f http://{{ include "myapp.fullname" . }}:{{ .Values.service.port }}/api/v1/status
```

### Running Tests

```bash
# Run tests after deployment
helm test myapp

# With timeout
helm test myapp --timeout 5m

# Show logs from test pods
helm test myapp --logs

# Filter by name
helm test myapp --filter name=myapp-test
```

### Test Cleanup

| Deletion Policy | Behavior |
|-----------------|----------|
| `before-hook-creation` | Delete old test before new run |
| `hook-succeeded` | Delete on success |
| `hook-failed` | Delete on failure |

---

## Phase 7: Integration Testing

### Full Deployment Test Script

```bash
#!/bin/bash
set -e

RELEASE="myapp-test"
NAMESPACE="test-$(date +%s)"
CHART="./myapp"
VALUES="values/test.yaml"
TIMEOUT="5m"

cleanup() {
  echo "Cleaning up..."
  helm uninstall $RELEASE -n $NAMESPACE --wait 2>/dev/null || true
  kubectl delete namespace $NAMESPACE --wait=false 2>/dev/null || true
}
trap cleanup EXIT

echo "Creating test namespace..."
kubectl create namespace $NAMESPACE

echo "Installing chart..."
helm upgrade --install $RELEASE $CHART \
  -n $NAMESPACE \
  -f $VALUES \
  --wait \
  --timeout $TIMEOUT

echo "Waiting for pods..."
kubectl wait --for=condition=Ready pods \
  -l app.kubernetes.io/instance=$RELEASE \
  -n $NAMESPACE \
  --timeout=120s

echo "Running helm tests..."
helm test $RELEASE -n $NAMESPACE --logs

echo "Verifying health endpoint..."
kubectl run curl-test --rm -i --restart=Never \
  --image=curlimages/curl:latest \
  -n $NAMESPACE \
  -- curl -f http://$RELEASE-myapp/health

echo "All tests passed!"
```

### CI Pipeline Integration

```yaml
# .github/workflows/helm-test.yaml
name: Helm Test

on:
  pull_request:
    paths:
      - 'charts/**'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-helm@v4
      - run: helm lint ./charts/myapp

  unittest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-helm@v4
      - run: helm plugin install https://github.com/helm-unittest/helm-unittest.git
      - run: helm unittest ./charts/myapp

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: './charts/myapp'
          exit-code: '1'
          severity: 'HIGH,CRITICAL'

  integration:
    runs-on: ubuntu-latest
    needs: [lint, unittest, security]
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-helm@v4
      - uses: engineerd/setup-kind@v0.5.0
      - run: |
          helm upgrade --install myapp ./charts/myapp --wait
          helm test myapp --logs
```

---

## Testing Best Practices

| Practice | Rationale |
|----------|-----------|
| Test with production-like values | Catches value-specific issues |
| Test edge cases (enabled/disabled) | Verifies conditionals work |
| Snapshot key outputs | Catches unintended changes |
| Test multi-replica scenarios | Catches PDB, affinity issues |
| Include negative tests | Verify expected failures |
| Run against real cluster | Catches CRD, webhook issues |

---

## Quick Reference

```bash
# Full validation sequence
helm lint ./myapp && \
helm template myapp ./myapp | kubectl apply --dry-run=client -f - && \
helm unittest ./myapp && \
trivy config ./myapp && \
helm upgrade --install myapp ./myapp --dry-run=server

# Post-deploy verification
helm test myapp --logs
```
