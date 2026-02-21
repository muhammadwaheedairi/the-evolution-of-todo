# Values Patterns

Precedence rules, environment overlays, and schema validation.

---

## Values Precedence (CRITICAL)

From **lowest to highest priority** (later overrides earlier):

```
1. Default values from dependent charts
2. Parent chart's values.yaml
3. -f/--values files (in order specified)
4. --set parameters
5. --set-string parameters
6. --set-file parameters
```

### Example Override Chain

```bash
# Base values + staging overlay + specific override
helm install myapp ./myapp \
  -f values.yaml \
  -f values/staging.yaml \
  --set image.tag=v1.2.3
```

### Subchart Value Precedence

```yaml
# Parent overrides subchart defaults
postgresql:
  auth:
    username: myapp  # Overrides postgresql chart's default

# Global values available to all subcharts
global:
  storageClass: "fast"
  # Subcharts can access via .Values.global.storageClass
```

---

## Environment Overlays

### Structure

```
myapp/
├── values.yaml           # Base defaults (production-safe)
└── values/
    ├── dev.yaml          # Development overrides
    ├── staging.yaml      # Staging overrides
    └── prod.yaml         # Production (minimal, mostly defaults)
```

### Base values.yaml (Production Defaults)

```yaml
replicaCount: 3
image:
  repository: myorg/myapp
  pullPolicy: IfNotPresent
  tag: ""

resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "1Gi"

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10

probes:
  liveness:
    initialDelaySeconds: 10
  readiness:
    initialDelaySeconds: 5
```

### values/dev.yaml (Development)

```yaml
replicaCount: 1

resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"

autoscaling:
  enabled: false

# Development-specific settings
debug:
  enabled: true
  verboseLogging: true
```

### values/staging.yaml (Staging)

```yaml
replicaCount: 2

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
```

### Usage Pattern

```bash
# Development
helm upgrade --install myapp ./myapp -f values/dev.yaml -n dev

# Staging
helm upgrade --install myapp ./myapp -f values/staging.yaml -n staging

# Production (uses base values.yaml)
helm upgrade --install myapp ./myapp -n prod
```

---

## Schema Validation (values.schema.json)

### Basic Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["image", "replicaCount"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "description": "Number of pod replicas"
    },
    "image": {
      "type": "object",
      "required": ["repository"],
      "properties": {
        "repository": {
          "type": "string",
          "pattern": "^[a-z0-9][a-z0-9._/-]*$",
          "description": "Container image repository"
        },
        "tag": {
          "type": "string",
          "description": "Image tag (defaults to appVersion)"
        },
        "pullPolicy": {
          "type": "string",
          "enum": ["Always", "IfNotPresent", "Never"],
          "default": "IfNotPresent"
        }
      }
    },
    "resources": {
      "type": "object",
      "properties": {
        "requests": {
          "$ref": "#/$defs/resourceSpec"
        },
        "limits": {
          "$ref": "#/$defs/resourceSpec"
        }
      }
    }
  },
  "$defs": {
    "resourceSpec": {
      "type": "object",
      "properties": {
        "cpu": {
          "type": "string",
          "pattern": "^[0-9]+m?$"
        },
        "memory": {
          "type": "string",
          "pattern": "^[0-9]+(Mi|Gi)$"
        }
      }
    }
  }
}
```

### Validation Commands

```bash
# Lint validates against schema
helm lint ./myapp

# Install/upgrade validates automatically
helm install myapp ./myapp  # Fails if values don't match schema

# Skip validation (not recommended)
helm install myapp ./myapp --skip-schema-validation
```

### Schema Best Practices

| Practice | Why |
|----------|-----|
| Use `required` for critical values | Fail early on missing config |
| Add `enum` for constrained choices | Prevent typos |
| Use `pattern` for formats | Validate strings (ports, URLs) |
| Add `minimum`/`maximum` | Prevent resource exhaustion |
| Use `$defs` for reuse | DRY schema definitions |

---

## Computed Values (tpl)

### Dynamic Templates in Values

```yaml
# values.yaml
hostname: "myapp"
domain: "example.com"

# Template string (evaluated at render time)
fullHostname: "{{ .Values.hostname }}.{{ .Values.domain }}"
```

```yaml
# Template usage
ingress:
  hosts:
    - host: {{ tpl .Values.fullHostname . }}
```

### Conditional Computed Values

```yaml
# values.yaml
environment: staging

# In template
{{- $dbHost := "" }}
{{- if eq .Values.environment "production" }}
{{- $dbHost = "prod-db.internal" }}
{{- else }}
{{- $dbHost = "dev-db.internal" }}
{{- end }}
```

---

## Global Values

### Definition

```yaml
# Parent chart values.yaml
global:
  imageRegistry: "ghcr.io"
  imagePullSecrets:
    - name: registry-secret
  storageClass: "fast-ssd"
```

### Access in Subcharts

```yaml
# Subchart template
image: {{ .Values.global.imageRegistry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}

{{- with .Values.global.imagePullSecrets }}
imagePullSecrets:
  {{- toYaml . | nindent 2 }}
{{- end }}
```

---

## Merging Strategy

### Default Merge (Deep)

```yaml
# values.yaml
config:
  key1: value1
  key2: value2

# override.yaml
config:
  key2: override2
  key3: value3

# Result (deep merged)
config:
  key1: value1      # preserved
  key2: override2   # overridden
  key3: value3      # added
```

### Replace Entire Section

Use `null` to clear, then set:

```yaml
# override.yaml - replace entire config
config: null

# Then in another file or --set
config:
  key3: value3
```

### Array Handling

Arrays are **replaced**, not merged:

```yaml
# values.yaml
tolerations:
  - key: "node-role.kubernetes.io/master"
    effect: "NoSchedule"

# override.yaml
tolerations:
  - key: "gpu"
    effect: "NoSchedule"

# Result (array replaced, NOT merged)
tolerations:
  - key: "gpu"
    effect: "NoSchedule"
```

---

## Common Value Patterns

### Feature Flags

```yaml
features:
  metrics:
    enabled: true
    port: 9090
  tracing:
    enabled: false
    endpoint: ""
```

### External Service Config

```yaml
externalDatabase:
  enabled: false  # Use when not deploying embedded DB
  host: ""
  port: 5432
  username: ""
  existingSecret: ""  # Name of K8s secret with password
```

### Resource Profiles

```yaml
# Predefined profiles
resourceProfile: medium

profiles:
  small:
    cpu: "100m"
    memory: "128Mi"
  medium:
    cpu: "500m"
    memory: "512Mi"
  large:
    cpu: "2000m"
    memory: "2Gi"
```

```yaml
# Template usage
resources:
  requests:
    {{- $profile := index .Values.profiles .Values.resourceProfile }}
    cpu: {{ $profile.cpu }}
    memory: {{ $profile.memory }}
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Secrets in values | Exposed in repo | Use existingSecret references |
| No schema | Silent misconfiguration | Add values.schema.json |
| Deep nesting | Hard to override | Flatten where possible |
| Required with defaults | Confusing | Either required OR has default |
| Environment in image.tag | Forces rebuild | Use image.tag separate from env |
