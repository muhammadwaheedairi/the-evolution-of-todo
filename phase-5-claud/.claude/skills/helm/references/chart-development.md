# Chart Development

Templates, helpers, hooks, dependencies, and library chart patterns.

---

## Template Syntax

### Built-in Objects

| Object | Access | Contains |
|--------|--------|----------|
| `.Release` | `.Release.Name`, `.Release.Namespace` | Release metadata |
| `.Chart` | `.Chart.Name`, `.Chart.Version` | Chart.yaml data |
| `.Values` | `.Values.image.repository` | Merged values |
| `.Capabilities` | `.Capabilities.KubeVersion` | Cluster capabilities |
| `.Template` | `.Template.Name`, `.Template.BasePath` | Current template info |
| `.Files` | `.Files.Get "config.ini"` | Access non-template files |

### Template Functions

```yaml
# String functions
{{ .Values.name | quote }}              # "value"
{{ .Values.name | upper }}              # VALUE
{{ .Values.name | lower }}              # value
{{ .Values.name | title }}              # Value
{{ .Values.name | trim }}               # Remove whitespace
{{ .Values.name | default "fallback" }} # Default value

# Flow control - conditionals
{{ if .Values.enabled }}...{{ end }}
{{ if and .Values.a .Values.b }}...{{ end }}
{{ if or .Values.a .Values.b }}...{{ end }}
{{ if not .Values.disabled }}...{{ end }}

# Comparison operators
{{ if eq .Values.env "production" }}...{{ end }}
{{ if ne .Values.env "development" }}...{{ end }}
{{ if lt .Values.replicas 3 }}...{{ end }}
{{ if le .Values.replicas 3 }}...{{ end }}
{{ if gt .Values.replicas 1 }}...{{ end }}
{{ if ge .Values.replicas 2 }}...{{ end }}

# if/else if/else chain
{{- if eq .Values.env "production" }}
  replicas: 5
{{- else if eq .Values.env "staging" }}
  replicas: 2
{{- else }}
  replicas: 1
{{- end }}

# Loops - list iteration
{{- range .Values.items }}
  - {{ . }}
{{- end }}

# Loops - with index
{{- range $index, $value := .Values.items }}
  - index: {{ $index }}, value: {{ $value }}
{{- end }}

# Loops - map iteration
{{- range $key, $value := .Values.map }}
  {{ $key }}: {{ $value }}
{{- end }}

# Root context ($) - access parent scope inside range/with
{{- range .Values.containers }}
  image: {{ $.Values.image.repository }}:{{ .tag }}  # $ accesses root
{{- end }}

# With (scoped)
{{- with .Values.nested }}
  value: {{ .field }}  # .field is relative to .Values.nested
{{- end }}

# Capability detection - check cluster API versions
{{- if .Capabilities.APIVersions.Has "networking.k8s.io/v1" }}
apiVersion: networking.k8s.io/v1
{{- else }}
apiVersion: networking.k8s.io/v1beta1
{{- end }}

# Check Kubernetes version
{{- if semverCompare ">=1.25-0" .Capabilities.KubeVersion.GitVersion }}
  # Use features available in K8s 1.25+
{{- end }}

# Required (fail if missing)
{{ required "image.repository is required" .Values.image.repository }}

# tpl (evaluate strings as templates)
{{ tpl .Values.dynamicTemplate . }}

# toYaml (convert to YAML)
{{ toYaml .Values.annotations | nindent 4 }}

# include (call named template)
{{ include "myapp.labels" . | nindent 4 }}
```

### Whitespace Control

```yaml
# Trim left whitespace
{{- .Values.name }}

# Trim right whitespace
{{ .Values.name -}}

# Trim both
{{- .Values.name -}}

# indent vs nindent
# indent: adds spaces to ALL lines
# nindent: adds NEWLINE + spaces (use this most often)

# indent (use when already on new line)
data: |
{{ .Values.config | indent 2 }}

# nindent (adds newline first - most common)
annotations:
{{ toYaml .Values.annotations | nindent 2 }}

# Common pattern for nested YAML
spec:
  containers:
    - name: app
      env:
        {{- range $key, $value := .Values.env }}
        - name: {{ $key }}
          value: {{ $value | quote }}
        {{- end }}
```

---

## _helpers.tpl Patterns

### Underscore Convention

Files prefixed with `_` are **not rendered as manifests**:

```
templates/
├── _helpers.tpl      # Utility library (NOT rendered)
├── deployment.yaml   # Rendered to manifest
├── service.yaml      # Rendered to manifest
└── _security.tpl     # Additional helpers (NOT rendered)
```

This Helm convention centralizes reusable template fragments in discoverable locations.

### include vs template (CRITICAL)

**Always use `include`, never `template`:**

```yaml
# BAD - template renders directly, breaks indentation
metadata:
  labels:
    {{ template "myapp.labels" . }}  # BROKEN YAML!

# GOOD - include returns string, can pipe to nindent
metadata:
  labels:
    {{- include "myapp.labels" . | nindent 4 }}  # Correct!
```

| Action | Returns | Pipeable | Use |
|--------|---------|----------|-----|
| `template` | Renders directly | No | Never use |
| `include` | String | Yes | Always use |

### Naming Convention

Follow `chartname.component` pattern to prevent subchart collisions:

```yaml
# Good naming
{{- define "myapp.labels" -}}        # Chart name prefix
{{- define "myapp.fullname" -}}
{{- define "myapp.selectorLabels" -}}

# Bad naming (may collide with subcharts)
{{- define "labels" -}}              # No prefix!
{{- define "fullname" -}}
```

### Standard Helpers

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "myapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "myapp.labels" -}}
helm.sh/chart: {{ include "myapp.chart" . }}
{{ include "myapp.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "myapp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "myapp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
```

### Security Context Helper

```yaml
{{/*
Pod security context
*/}}
{{- define "myapp.podSecurityContext" -}}
runAsNonRoot: true
runAsUser: {{ .Values.podSecurityContext.runAsUser | default 1000 }}
runAsGroup: {{ .Values.podSecurityContext.runAsGroup | default 1000 }}
fsGroup: {{ .Values.podSecurityContext.fsGroup | default 1000 }}
seccompProfile:
  type: RuntimeDefault
{{- end }}

{{/*
Container security context
*/}}
{{- define "myapp.containerSecurityContext" -}}
allowPrivilegeEscalation: false
readOnlyRootFilesystem: {{ .Values.securityContext.readOnlyRootFilesystem | default true }}
capabilities:
  drop:
    - ALL
{{- end }}
```

### imagePullSecrets Helper (Conditional)

```yaml
{{/*
Image pull secrets - renders nothing if empty
*/}}
{{- define "myapp.imagePullSecrets" -}}
{{- with .Values.imagePullSecrets }}
imagePullSecrets:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}

# Usage in deployment.yaml
spec:
  {{- include "myapp.imagePullSecrets" . | nindent 6 }}
```

### Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| `{{ template "x" . }}` | Can't pipe, breaks indent | Use `{{ include "x" . \| nindent N }}` |
| `{{ include "x" }}` | Missing context | Always pass `.` as second arg |
| `{{ include "x" . \| indent 4 }}` | Wrong indentation | Count from margin to key |
| `{{- define "labels" -}}` | No chart prefix | Use `"chartname.labels"` |
| Accessing `.Values` in nested `range` | Wrong scope | Use `$.Values` for root |

### Context Passing Rules

```yaml
# ALWAYS pass context explicitly
{{ include "myapp.labels" . }}           # Correct
{{ include "myapp.labels" }}             # WRONG - no context!

# In nested loops, use $ for root context
{{- range .Values.items }}
  # . = current item
  # $ = root context
  name: {{ $.Release.Name }}-{{ .name }}
{{- end }}
```

---

## Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "myapp.labels" . | nindent 8 }}
        {{- with .Values.podLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      securityContext:
        {{- include "myapp.podSecurityContext" . | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- include "myapp.containerSecurityContext" . | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort | default 8080 }}
              protocol: TCP
          {{- if .Values.probes.liveness }}
          livenessProbe:
            httpGet:
              path: {{ .Values.probes.liveness.path }}
              port: http
            initialDelaySeconds: {{ .Values.probes.liveness.initialDelaySeconds | default 10 }}
            periodSeconds: {{ .Values.probes.liveness.periodSeconds | default 15 }}
          {{- end }}
          {{- if .Values.probes.readiness }}
          readinessProbe:
            httpGet:
              path: {{ .Values.probes.readiness.path }}
              port: http
            initialDelaySeconds: {{ .Values.probes.readiness.initialDelaySeconds | default 5 }}
            periodSeconds: {{ .Values.probes.readiness.periodSeconds | default 10 }}
          {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

---

## Dependencies

### Version Constraints

| Constraint | Example | Matches |
|------------|---------|---------|
| Exact | `12.5.0` | Only 12.5.0 |
| Wildcard | `12.x.x` | Any 12.*.* |
| Caret | `^12.5.0` | >=12.5.0, <13.0.0 (minor/patch updates) |
| Tilde | `~12.5.0` | >=12.5.0, <12.6.0 (patch updates only) |
| Range | `>=12.0.0, <13.0.0` | Explicit bounds |

### Chart.yaml Dependencies

```yaml
dependencies:
  # Required dependency with caret constraint
  - name: postgresql
    version: "^12.5.0"  # Allows 12.5.x, 12.6.x, etc.
    repository: "oci://registry-1.docker.io/bitnamicharts"

  # Conditional dependency
  - name: redis
    version: "~17.0.0"  # Patch updates only: 17.0.x
    repository: "oci://registry-1.docker.io/bitnamicharts"
    condition: redis.enabled

  # Tagged dependency (enable groups)
  - name: monitoring
    version: "1.x.x"
    repository: "file://../monitoring"
    tags:
      - observability

  # Aliased (multiple instances of same chart)
  - name: redis
    version: "17.x.x"
    repository: "oci://registry-1.docker.io/bitnamicharts"
    alias: cache
    condition: cache.enabled

  # import-values (remap subchart values)
  - name: postgresql
    version: "^12.0.0"
    repository: "oci://registry-1.docker.io/bitnamicharts"
    import-values:
      - child: auth        # Subchart exports under 'auth'
        parent: dbAuth     # Parent accesses via 'dbAuth'
```

### Repository Types

| Type | Format | Use Case |
|------|--------|----------|
| OCI | `oci://ghcr.io/org/charts` | Modern, recommended |
| HTTP | `https://charts.bitnami.com/bitnami` | Legacy repositories |
| File | `file://../my-chart` | Local development |

### Dependency Commands

```bash
# Download dependencies
helm dependency update ./myapp

# Build dependencies from lock file
helm dependency build ./myapp

# List dependencies
helm dependency list ./myapp
```

### Subchart Values

```yaml
# Parent values.yaml
# Pass values to subchart
postgresql:
  auth:
    username: myapp
    database: myapp
  primary:
    persistence:
      size: 10Gi

# Enable/disable conditional dependencies
redis:
  enabled: true
  # All redis chart values available here

# Bulk enable via tags
tags:
  database: true
  observability: false
```

### Subchart Service Naming

Subcharts generate service names prefixed with release name:

```yaml
# In parent chart template, reference subchart services:
env:
  - name: DATABASE_HOST
    value: "{{ .Release.Name }}-postgresql"  # e.g., myapp-postgresql
  - name: REDIS_HOST
    value: "{{ .Release.Name }}-redis"       # e.g., myapp-redis

# For aliased dependencies
  - name: CACHE_HOST
    value: "{{ .Release.Name }}-cache"       # Uses alias name
```

---

## Library Charts

### Why Library Charts?

Library charts solve the **standardization problem**:

| Without Library | With Library |
|-----------------|--------------|
| Copy-paste security contexts across 10 services | Define once, inherit everywhere |
| Inconsistent labels per team | Org-standard labels automatic |
| Security policy changes require 10 PRs | Single update propagates to all |
| Each chart 500+ lines | Thin charts ~50 lines each |

**Use case:** Security team requires `runAsNonRoot: true` across all deployments. Encode once in library → all consuming charts inherit it automatically.

### Key Behavior

- `type: library` → **Cannot be installed directly** (no `helm install`)
- Only provides templates via `define`/`include`
- Consumed as dependency by application charts
- Templates use underscore prefix: `_deployment.tpl`

### Library Chart.yaml

```yaml
apiVersion: v2
name: myapp-lib
version: 0.1.0
type: library  # CRITICAL: marks as library, cannot install directly
description: Reusable templates for myapp charts
```

### Library Template (_deployment.tpl)

```yaml
{{/*
Generic deployment template
Usage: {{ include "myapp-lib.deployment" (dict "root" . "component" "api") }}
*/}}
{{- define "myapp-lib.deployment" -}}
{{- $root := .root -}}
{{- $component := .component -}}
{{- $values := index $root.Values $component -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ printf "%s-%s" (include "myapp-lib.fullname" $root) $component }}
  labels:
    {{- include "myapp-lib.labels" $root | nindent 4 }}
    app.kubernetes.io/component: {{ $component }}
spec:
  replicas: {{ $values.replicaCount | default 2 }}
  selector:
    matchLabels:
      {{- include "myapp-lib.selectorLabels" $root | nindent 6 }}
      app.kubernetes.io/component: {{ $component }}
  template:
    metadata:
      labels:
        {{- include "myapp-lib.selectorLabels" $root | nindent 8 }}
        app.kubernetes.io/component: {{ $component }}
    spec:
      containers:
        - name: {{ $component }}
          image: "{{ $values.image.repository }}:{{ $values.image.tag | default $root.Chart.AppVersion }}"
          resources:
            {{- toYaml $values.resources | nindent 12 }}
{{- end }}
```

### Consuming Library Chart

```yaml
# Application Chart.yaml
dependencies:
  - name: myapp-lib
    version: ">=0.1.0"
    repository: "file://../myapp-lib"  # or OCI registry
```

```yaml
# Application deployment.yaml
{{- include "myapp-lib.deployment" (dict "root" . "component" "api") }}
```

---

## Template Debugging

### Debug Commands

```bash
# Render all templates
helm template myapp ./myapp

# Render with debug (shows errors)
helm template myapp ./myapp --debug 2>&1

# Render specific template
helm template myapp ./myapp -s templates/deployment.yaml

# Show computed values
helm template myapp ./myapp --debug | head -50

# Dry-run against cluster
helm install myapp ./myapp --dry-run --debug
```

### Common Template Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `nil pointer evaluating` | Missing value | Add `{{ if }}` check or `default` |
| `wrong type for value` | Type mismatch | Check value type in values.yaml |
| `template not found` | Wrong template name | Check `define` name matches `include` |
| `YAML parse error` | Bad indentation | Use `nindent` consistently |

### Debugging Tips

```yaml
# Print variable for debugging
{{ printf "%#v" .Values.complex | fail }}

# Check if value exists
{{- if .Values.optional }}
  # use it
{{- end }}

# Safe nested access
{{ (.Values.parent).child | default "fallback" }}
```

---

## Notes Template (NOTES.txt)

```
{{- $fullname := include "myapp.fullname" . -}}

1. Get the application URL:
{{- if contains "NodePort" .Values.service.type }}
  export NODE_PORT=$(kubectl get --namespace {{ .Release.Namespace }} -o jsonpath="{.spec.ports[0].nodePort}" services {{ $fullname }})
  export NODE_IP=$(kubectl get nodes --namespace {{ .Release.Namespace }} -o jsonpath="{.items[0].status.addresses[0].address}")
  echo http://$NODE_IP:$NODE_PORT
{{- else if contains "LoadBalancer" .Values.service.type }}
  NOTE: It may take a few minutes for the LoadBalancer IP to be available.
  export SERVICE_IP=$(kubectl get svc --namespace {{ .Release.Namespace }} {{ $fullname }} --template "{{"{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"}}")
  echo http://$SERVICE_IP:{{ .Values.service.port }}
{{- else if contains "ClusterIP" .Values.service.type }}
  kubectl --namespace {{ .Release.Namespace }} port-forward svc/{{ $fullname }} 8080:{{ .Values.service.port }}
  echo "Visit http://127.0.0.1:8080"
{{- end }}
```
