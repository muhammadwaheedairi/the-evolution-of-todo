# Hooks Lifecycle

Hook types, weights, deletion policies, and common patterns.

---

## Hook Types

| Hook | Executes | Common Use |
|------|----------|------------|
| `pre-install` | Before any resources created | DB setup, pre-checks |
| `post-install` | After all resources created | Smoke tests, notifications |
| `pre-delete` | Before any resources deleted | Backups, cleanup |
| `post-delete` | After all resources deleted | Final cleanup, notifications |
| `pre-upgrade` | Before upgrade, after templates rendered | DB migrations, backups |
| `post-upgrade` | After all resources upgraded | Smoke tests, cache warm |
| `pre-rollback` | Before rollback | Backup current state |
| `post-rollback` | After rollback complete | Notifications, verification |
| `test` | When `helm test` invoked | Integration tests |

---

## Hook Annotations

### Basic Hook

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-pre-upgrade
  annotations:
    "helm.sh/hook": pre-upgrade
```

### Multiple Hooks

```yaml
annotations:
  # Runs on both install and upgrade
  "helm.sh/hook": pre-install,pre-upgrade
```

### Hook Weight (Ordering)

```yaml
annotations:
  "helm.sh/hook": pre-upgrade
  "helm.sh/hook-weight": "-5"  # Lower = runs first
```

Execution order:
1. Sort by weight (ascending: -10, -5, 0, 5, 10)
2. Same weight: resource order (Helm 3.2.0+)

### Deletion Policy

```yaml
annotations:
  "helm.sh/hook": pre-upgrade
  "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```

| Policy | Behavior |
|--------|----------|
| `before-hook-creation` | Delete previous hook resource before creating new |
| `hook-succeeded` | Delete after hook succeeds |
| `hook-failed` | Delete after hook fails |

---

## Common Hook Patterns

### Database Migration (Pre-Upgrade)

```yaml
# templates/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-migration
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  backoffLimit: 3
  activeDeadlineSeconds: 300
  template:
    metadata:
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      restartPolicy: Never
      containers:
        - name: migration
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          command: ["./migrate", "up"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "myapp.fullname" . }}-secrets
                  key: database-url
```

### Backup Before Upgrade

```yaml
# templates/backup-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-backup
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "-10"  # Run before migration
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: backup
          image: postgres:15
          command:
            - /bin/sh
            - -c
            - |
              pg_dump $DATABASE_URL > /backup/$(date +%Y%m%d_%H%M%S).sql
          volumeMounts:
            - name: backup
              mountPath: /backup
      volumes:
        - name: backup
          persistentVolumeClaim:
            claimName: {{ include "myapp.fullname" . }}-backups
```

### Post-Install Smoke Test

```yaml
# templates/smoke-test.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-smoke-test
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: smoke-test
          image: curlimages/curl:latest
          command:
            - /bin/sh
            - -c
            - |
              sleep 10  # Wait for service to be ready
              curl -f http://{{ include "myapp.fullname" . }}:{{ .Values.service.port }}/health
              exit $?
```

### Helm Test

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
spec:
  restartPolicy: Never
  containers:
    - name: test
      image: curlimages/curl:latest
      command:
        - /bin/sh
        - -c
        - |
          curl -f http://{{ include "myapp.fullname" . }}:{{ .Values.service.port }}/health
```

```bash
# Run tests
helm test myapp

# With timeout
helm test myapp --timeout 5m

# Show logs
helm test myapp --logs
```

---

## Values-Driven Hooks

### Conditional Hooks

```yaml
# values.yaml
hooks:
  migration:
    enabled: true
    image: ""  # Uses main app image if empty
    command: ["./migrate", "up"]
  backup:
    enabled: true
    schedule: "pre-upgrade"
```

```yaml
# templates/migration-job.yaml
{{- if .Values.hooks.migration.enabled }}
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-migration
  annotations:
    "helm.sh/hook": pre-upgrade
spec:
  template:
    spec:
      containers:
        - name: migration
          image: {{ .Values.hooks.migration.image | default (printf "%s:%s" .Values.image.repository (.Values.image.tag | default .Chart.AppVersion)) }}
          command:
            {{- toYaml .Values.hooks.migration.command | nindent 12 }}
{{- end }}
```

---

## Hook Debugging

### Check Hook Status

```bash
# List hooks for release
helm get hooks myapp

# Watch hook jobs
kubectl get jobs -l app.kubernetes.io/instance=myapp -w

# Get hook logs
kubectl logs job/myapp-migration
```

### Common Hook Failures

| Issue | Cause | Solution |
|-------|-------|----------|
| Hook never completes | No `restartPolicy: Never` | Add to Job spec |
| Hook runs forever | No deadline | Add `activeDeadlineSeconds` |
| Previous hook blocks | No deletion policy | Add `before-hook-creation` |
| Hooks accumulate | No cleanup | Add `hook-succeeded/hook-failed` |
| Wrong order | Missing weights | Add explicit `hook-weight` |

### Skip Hooks

```bash
# Skip hooks during install/upgrade
helm upgrade myapp ./myapp --no-hooks

# Skip hooks during rollback
helm rollback myapp 1 --no-hooks

# Skip hooks during uninstall
helm uninstall myapp --no-hooks
```

---

## Critical Hook Behaviors

### Pre-Hook Failures Block Releases

```
Pre-install hook fails → Install BLOCKED (no resources created)
Pre-upgrade hook fails → Upgrade BLOCKED (release stays at current version)
```

This protects against deploying incompatible code with wrong schema.

### Hooks Don't Auto-Rollback

```
Upgrade with hooks:
1. Pre-upgrade hook runs ✅
2. Resources upgraded ✅
3. Post-upgrade hook FAILS ❌
4. Release marked FAILED
5. BUT: Pre-upgrade changes (migrations) are NOT rolled back!
```

**Critical**: If `pre-upgrade` migrates your database, and `post-upgrade` fails, the database stays migrated even though release failed. Plan accordingly.

### Cache Invalidation (Post-Upgrade)

```yaml
# templates/cache-flush-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-cache-flush
  annotations:
    "helm.sh/hook": post-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: cache-flush
          image: redis:7
          command:
            - /bin/sh
            - -c
            - |
              redis-cli -h {{ .Release.Name }}-redis FLUSHALL
```

---

## Hook Best Practices

### Error Handling in Scripts

```yaml
command:
  - /bin/sh
  - -c
  - |
    set -e  # Exit on first error

    # Retry logic for transient failures
    for i in $(seq 1 5); do
      curl -f http://myapp/health && break
      echo "Attempt $i failed, retrying..."
      sleep 5
    done

    # Idempotent operations
    psql -c "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY)"
```

### Job Configuration

```yaml
spec:
  backoffLimit: 3              # Retry count
  activeDeadlineSeconds: 600   # Max runtime (10 min)
  ttlSecondsAfterFinished: 300 # Cleanup after 5 min
  template:
    spec:
      restartPolicy: Never     # REQUIRED for Jobs
```

### Weight Strategy

| Weight | Use For |
|--------|---------|
| -100 to -50 | Critical pre-checks |
| -50 to -10 | Backups |
| -10 to 0 | Migrations |
| 0 to 10 | Default operations |
| 10 to 50 | Smoke tests |
| 50 to 100 | Notifications |

### Idempotency

```bash
# Migrations should be idempotent
# Good: CREATE TABLE IF NOT EXISTS
# Bad: CREATE TABLE (fails on re-run)

# Use migration tools with state tracking
# - Flyway
# - Alembic
# - golang-migrate
```

---

## CRD Installation Hook

### Install CRDs Before Resources

```yaml
# templates/crds/my-crd.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: myresources.example.com
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-100"
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  group: example.com
  # ... CRD spec
```

### Alternative: crds/ Directory

```
myapp/
├── crds/                    # Auto-installed, not templated
│   └── myresource-crd.yaml
├── templates/
└── Chart.yaml
```

CRDs in `crds/` directory:
- Installed before templates
- Not templated (no {{ }})
- Not upgraded (manual management)
- Not uninstalled with chart

---

## Hook Resource Types

| Resource | Use Case | Notes |
|----------|----------|-------|
| Job | One-time tasks | Most common |
| Pod | Simple tasks | Less control than Job |
| ConfigMap | Config pre-creation | Rarely needed |
| Secret | Secret pre-creation | Use ESO instead |
| ServiceAccount | RBAC setup | If hooks need permissions |
