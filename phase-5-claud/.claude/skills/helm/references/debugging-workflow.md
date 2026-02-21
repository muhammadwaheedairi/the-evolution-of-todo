# Debugging Workflow

Template errors, failed releases, stuck states, and troubleshooting.

---

## Template Debugging

### Debug Rendering

```bash
# Render templates with debug info
helm template myapp ./myapp --debug

# Show only errors
helm template myapp ./myapp --debug 2>&1 | grep -A5 "Error:"

# Render specific template
helm template myapp ./myapp -s templates/deployment.yaml

# With specific values
helm template myapp ./myapp -f values/dev.yaml --debug
```

### Common Template Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `nil pointer evaluating interface` | Missing nested value | Add `{{ if }}` guard or `default` |
| `can't evaluate field X` | Wrong object type | Check `.Values` path |
| `expected string; found <nil>` | Required value missing | Use `required` function |
| `YAML parse error` | Bad indentation | Check `nindent` usage |
| `template "X" not defined` | Missing helper | Check `_helpers.tpl` for typo |

### Debug Techniques

```yaml
# Print value for debugging (causes error with value)
{{ printf "%#v" .Values.complex | fail }}

# Print to NOTES.txt instead
# In NOTES.txt:
DEBUG: {{ .Values.complex | toYaml }}

# Check if value exists
{{- if .Values.optional }}
# value exists
{{- else }}
# value missing
{{- end }}

# Safe nested access
{{ (.Values.parent).child | default "fallback" }}
# Or
{{ dig "parent" "child" "fallback" .Values }}
```

### Lint for Issues

```bash
# Basic lint
helm lint ./myapp

# Strict mode (warnings as errors)
helm lint ./myapp --strict

# With specific values
helm lint ./myapp -f values/prod.yaml
```

---

## Failed Release Recovery

### Check Release State

```bash
# Current status
helm status myapp

# Possible states:
# - deployed: Success
# - failed: Install/upgrade failed
# - pending-install: Install in progress (stuck)
# - pending-upgrade: Upgrade in progress (stuck)
# - pending-rollback: Rollback in progress (stuck)
# - uninstalling: Uninstall in progress
# - superseded: Previous revision
```

### Stuck in pending-* State

```bash
# Usually caused by:
# 1. Timeout during --wait
# 2. Hook never completed
# 3. Client disconnected

# Solution 1: Rollback
helm rollback myapp

# Solution 2: Force uninstall and reinstall
helm uninstall myapp --no-hooks
helm install myapp ./myapp

# Solution 3: Delete secret and retry (last resort)
kubectl delete secret -l owner=helm,name=myapp -n namespace
```

### Failed Install

```bash
# Check what happened
helm status myapp
helm get manifest myapp  # See what was created

# Check pods
kubectl get pods -l app.kubernetes.io/instance=myapp
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# Uninstall failed release
helm uninstall myapp

# Fix issue and reinstall
helm install myapp ./myapp
```

### Failed Upgrade

```bash
# Check what changed
helm get manifest myapp  # Current state
helm get values myapp    # Current values

# View history
helm history myapp

# Rollback to working version
helm rollback myapp <revision>

# Or rollback to previous
helm rollback myapp
```

---

## Hook Failures

### Diagnose Hook Issues

```bash
# List hooks
helm get hooks myapp

# Check hook jobs/pods
kubectl get jobs -l app.kubernetes.io/instance=myapp
kubectl get pods -l app.kubernetes.io/instance=myapp -l helm.sh/hook

# Get hook logs
kubectl logs job/myapp-pre-upgrade -n namespace
```

### Common Hook Problems

| Problem | Cause | Fix |
|---------|-------|-----|
| Hook never completes | Missing `restartPolicy: Never` | Add to Job spec |
| Hook runs forever | No timeout/deadline | Add `activeDeadlineSeconds` |
| Previous hook blocks | `before-hook-creation` not set | Add deletion policy |
| Hook resources accumulate | No cleanup policy | Add `hook-succeeded/hook-failed` |

### Manual Hook Cleanup

```bash
# Delete stuck hook job
kubectl delete job myapp-pre-upgrade -n namespace

# Skip hooks on rollback
helm rollback myapp --no-hooks

# Skip hooks on uninstall
helm uninstall myapp --no-hooks
```

---

## Resource Issues

### Image Pull Failures

```bash
# Check pod events
kubectl describe pod <pod-name> | grep -A10 Events

# Common causes:
# - Wrong image tag
# - Missing imagePullSecret
# - Registry auth failure

# Fix: Check values
helm get values myapp | grep -A5 image

# Fix: Update and upgrade
helm upgrade myapp ./myapp --set image.tag=correct-tag
```

### CrashLoopBackOff

```bash
# Get logs (including previous crash)
kubectl logs <pod-name> --previous

# Common causes:
# - Missing config/secrets
# - Wrong command/args
# - Permission issues (security context)
# - Health probe failing

# Check rendered manifest
helm get manifest myapp | grep -A50 "kind: Deployment"
```

### Resource Quota Exceeded

```bash
# Check quota
kubectl describe resourcequota -n namespace

# Check requested resources in chart
helm get values myapp | grep -A10 resources

# Fix: Reduce resource requests
helm upgrade myapp ./myapp --set resources.requests.cpu=100m
```

---

## Values Resolution

### Trace Value Precedence

```bash
# Show all values (including defaults)
helm get values myapp --all

# Show only user-supplied values
helm get values myapp

# Compare with chart defaults
helm show values ./myapp > chart-defaults.yaml
diff chart-defaults.yaml <(helm get values myapp --all)
```

### Debug Values Merging

```bash
# Test values merge locally
helm template myapp ./myapp \
  -f values.yaml \
  -f values/dev.yaml \
  --set image.tag=test \
  | grep -A10 "image:"
```

### Common Values Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Wrong precedence | Value not applied | Check -f order, --set last |
| Type mismatch | YAML parse error | Quote strings, no quotes for numbers |
| Subchart override not working | Default used | Use subchart prefix in values |
| --reuse-values accumulation | Old config persists | Use explicit -f instead |

---

## Server-Side Errors (Helm 4)

### SSA Conflict Errors

```bash
# Error: Apply failed with 1 conflict
# conflict with "argocd" using apps/v1: .spec.replicas

# Option 1: Force ownership
helm upgrade myapp ./myapp --force

# Option 2: Remove conflicting field from Helm
# Let ArgoCD/Flux manage that field

# Option 3: Coordinate ownership
# Define which tool manages which fields
```

### Dry-Run Validation

```bash
# Client-side (template only)
helm upgrade myapp ./myapp --dry-run

# Server-side (validates against API)
helm upgrade myapp ./myapp --dry-run=server

# Server-side catches:
# - Invalid API versions
# - Missing CRDs
# - Admission webhook rejections
# - Resource conflicts
```

---

## Debugging Checklist

### Before Deploying

```bash
# 1. Lint
helm lint ./myapp --strict

# 2. Template locally
helm template myapp ./myapp -f values/env.yaml > rendered.yaml

# 3. Review rendered output
cat rendered.yaml | less

# 4. Dry-run against cluster
helm install myapp ./myapp --dry-run=server

# 5. Check for policy violations
conftest test rendered.yaml  # If using OPA
trivy config ./myapp         # Security scan
```

### After Failure

```bash
# 1. Check Helm status
helm status myapp
helm history myapp

# 2. Check Kubernetes resources
kubectl get all -l app.kubernetes.io/instance=myapp
kubectl get events --sort-by='.lastTimestamp' -n namespace

# 3. Check pods
kubectl describe pod -l app.kubernetes.io/instance=myapp
kubectl logs -l app.kubernetes.io/instance=myapp --all-containers

# 4. Check hooks
kubectl get jobs -l helm.sh/hook -n namespace

# 5. Check values used
helm get values myapp --all

# 6. Compare with expected
helm get manifest myapp | kubectl apply --dry-run=server -f -
```

---

## Common Error Messages

```bash
# "release: not found"
# Release doesn't exist - use install, not upgrade
helm install myapp ./myapp  # Not helm upgrade

# "cannot re-use a name that is still in use"
# Release exists - use upgrade, not install
helm upgrade myapp ./myapp  # Not helm install
# Or use upgrade --install for idempotent

# "UPGRADE FAILED: another operation is in progress"
# Release stuck in pending state
helm rollback myapp
# Or delete and recreate (data loss warning)

# "rendered manifests contain a resource that already exists"
# Resource created outside Helm
kubectl annotate <resource> meta.helm.sh/release-name=myapp
kubectl label <resource> app.kubernetes.io/managed-by=Helm
```
