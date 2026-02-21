# AI Agent Patterns

GPU scheduling, model volumes, sidecar injection, and scale-to-zero for AI workloads.

---

## GPU Scheduling

### Node Selection

```yaml
# values.yaml
gpu:
  enabled: false
  type: nvidia  # nvidia, amd
  count: 1
  nodeSelector:
    accelerator: nvidia-tesla-t4

tolerations:
  - key: "nvidia.com/gpu"
    operator: "Exists"
    effect: "NoSchedule"
```

### Template Pattern

```yaml
# deployment.yaml
spec:
  template:
    spec:
      {{- if .Values.gpu.enabled }}
      nodeSelector:
        {{- toYaml .Values.gpu.nodeSelector | nindent 8 }}
      tolerations:
        {{- toYaml .Values.tolerations | nindent 8 }}
      {{- end }}
      containers:
        - name: {{ .Chart.Name }}
          {{- if .Values.gpu.enabled }}
          resources:
            limits:
              nvidia.com/gpu: {{ .Values.gpu.count }}
          {{- end }}
```

### Multi-GPU Pattern

```yaml
# values.yaml
gpu:
  enabled: true
  count: 4
  memoryLimit: "40Gi"  # Per GPU memory

resources:
  requests:
    cpu: "8000m"
    memory: "64Gi"
  limits:
    cpu: "16000m"
    memory: "128Gi"
    nvidia.com/gpu: 4
```

---

## Model Volume Management

### PVC for Model Storage

```yaml
# values.yaml
modelStorage:
  enabled: true
  storageClass: "fast-ssd"
  size: "100Gi"
  accessMode: ReadWriteOnce

# For shared models across pods
sharedModels:
  enabled: false
  storageClass: "nfs"
  size: "500Gi"
  accessMode: ReadWriteMany
```

### PVC Template

```yaml
# pvc.yaml
{{- if .Values.modelStorage.enabled }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ include "myapp.fullname" . }}-models
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  accessModes:
    - {{ .Values.modelStorage.accessMode }}
  storageClassName: {{ .Values.modelStorage.storageClass }}
  resources:
    requests:
      storage: {{ .Values.modelStorage.size }}
{{- end }}
```

### Init Container for Model Download

```yaml
# values.yaml
initContainers:
  modelDownload:
    enabled: true
    image: "amazon/aws-cli:latest"
    command:
      - /bin/sh
      - -c
      - |
        aws s3 sync s3://my-models/llama-7b /models/llama-7b
    env:
      - name: AWS_DEFAULT_REGION
        value: "us-east-1"
    resources:
      requests:
        cpu: "500m"
        memory: "1Gi"
```

### Init Container Template

```yaml
# deployment.yaml
spec:
  template:
    spec:
      {{- if .Values.initContainers.modelDownload.enabled }}
      initContainers:
        - name: model-download
          image: {{ .Values.initContainers.modelDownload.image }}
          command:
            {{- toYaml .Values.initContainers.modelDownload.command | nindent 12 }}
          {{- with .Values.initContainers.modelDownload.env }}
          env:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          volumeMounts:
            - name: models
              mountPath: /models
          resources:
            {{- toYaml .Values.initContainers.modelDownload.resources | nindent 12 }}
      {{- end }}
      containers:
        - name: {{ .Chart.Name }}
          volumeMounts:
            - name: models
              mountPath: /models
              readOnly: true
      volumes:
        - name: models
          {{- if .Values.modelStorage.enabled }}
          persistentVolumeClaim:
            claimName: {{ include "myapp.fullname" . }}-models
          {{- else }}
          emptyDir:
            sizeLimit: {{ .Values.modelStorage.size | default "50Gi" }}
          {{- end }}
```

### EmptyDir for Cache

```yaml
# values.yaml
cache:
  enabled: true
  sizeLimit: "10Gi"
  medium: ""  # or "Memory" for tmpfs

# Template
volumes:
  - name: cache
    emptyDir:
      {{- if .Values.cache.sizeLimit }}
      sizeLimit: {{ .Values.cache.sizeLimit }}
      {{- end }}
      {{- if .Values.cache.medium }}
      medium: {{ .Values.cache.medium }}
      {{- end }}
```

---

## Sidecar Injection

### Dapr Sidecar

```yaml
# values.yaml
dapr:
  enabled: true
  appId: "my-agent"
  appPort: "8080"
  config: "tracing"

# deployment.yaml annotations
metadata:
  annotations:
    {{- if .Values.dapr.enabled }}
    dapr.io/enabled: "true"
    dapr.io/app-id: {{ .Values.dapr.appId }}
    dapr.io/app-port: {{ .Values.dapr.appPort | quote }}
    {{- with .Values.dapr.config }}
    dapr.io/config: {{ . }}
    {{- end }}
    {{- end }}
```

### Istio Sidecar

```yaml
# values.yaml
istio:
  enabled: true
  inject: true

# deployment.yaml
metadata:
  labels:
    {{- if .Values.istio.enabled }}
    sidecar.istio.io/inject: {{ .Values.istio.inject | quote }}
    {{- end }}
```

### Custom Sidecar (Logging)

```yaml
# values.yaml
sidecars:
  logging:
    enabled: true
    image: "fluent/fluent-bit:latest"
    resources:
      requests:
        cpu: "50m"
        memory: "64Mi"
      limits:
        cpu: "100m"
        memory: "128Mi"

# deployment.yaml
containers:
  - name: {{ .Chart.Name }}
    # ... main container
  {{- if .Values.sidecars.logging.enabled }}
  - name: logging
    image: {{ .Values.sidecars.logging.image }}
    resources:
      {{- toYaml .Values.sidecars.logging.resources | nindent 10 }}
    volumeMounts:
      - name: logs
        mountPath: /var/log/app
  {{- end }}
```

---

## Scale-to-Zero (KEDA)

### KEDA ScaledObject

```yaml
# values.yaml
keda:
  enabled: true
  minReplicaCount: 0
  maxReplicaCount: 10
  cooldownPeriod: 300
  pollingInterval: 30

  triggers:
    # HTTP requests
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: http_requests_total
        threshold: "100"
        query: sum(rate(http_requests_total{app="myapp"}[2m]))

    # Queue depth
    - type: rabbitmq
      metadata:
        queueName: agent-tasks
        queueLength: "5"
```

### ScaledObject Template

```yaml
# scaledobject.yaml
{{- if .Values.keda.enabled }}
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    name: {{ include "myapp.fullname" . }}
  minReplicaCount: {{ .Values.keda.minReplicaCount }}
  maxReplicaCount: {{ .Values.keda.maxReplicaCount }}
  cooldownPeriod: {{ .Values.keda.cooldownPeriod }}
  pollingInterval: {{ .Values.keda.pollingInterval }}
  triggers:
    {{- toYaml .Values.keda.triggers | nindent 4 }}
{{- end }}
```

### GPU-Aware Scaling

```yaml
# Scale based on GPU utilization
keda:
  enabled: true
  triggers:
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: gpu_utilization
        threshold: "80"
        query: |
          avg(DCGM_FI_DEV_GPU_UTIL{pod=~"myapp-.*"})
```

### Queue-Based Scaling for Agents

```yaml
# Scale agents based on pending tasks
keda:
  enabled: true
  minReplicaCount: 0  # Scale to zero when idle
  maxReplicaCount: 20
  triggers:
    - type: redis
      metadata:
        address: redis:6379
        listName: agent-tasks
        listLength: "1"  # One agent per task
```

---

## AI Agent Resource Profiles

### Small Agent (Inference Only)

```yaml
# values.yaml
profile: small

resources:
  requests:
    cpu: "500m"
    memory: "2Gi"
  limits:
    cpu: "2000m"
    memory: "4Gi"

gpu:
  enabled: false
```

### Medium Agent (7B Model)

```yaml
profile: medium

resources:
  requests:
    cpu: "2000m"
    memory: "16Gi"
  limits:
    cpu: "4000m"
    memory: "32Gi"

gpu:
  enabled: true
  count: 1
```

### Large Agent (70B Model)

```yaml
profile: large

resources:
  requests:
    cpu: "8000m"
    memory: "64Gi"
  limits:
    cpu: "16000m"
    memory: "128Gi"

gpu:
  enabled: true
  count: 4
```

### Profile Selection Helper

```yaml
# _helpers.tpl
{{- define "myapp.resourceProfile" -}}
{{- $profiles := dict
  "small" (dict "cpu" "500m" "memory" "2Gi" "cpuLimit" "2000m" "memoryLimit" "4Gi")
  "medium" (dict "cpu" "2000m" "memory" "16Gi" "cpuLimit" "4000m" "memoryLimit" "32Gi")
  "large" (dict "cpu" "8000m" "memory" "64Gi" "cpuLimit" "16000m" "memoryLimit" "128Gi")
-}}
{{- $profile := index $profiles .Values.profile -}}
resources:
  requests:
    cpu: {{ $profile.cpu }}
    memory: {{ $profile.memory }}
  limits:
    cpu: {{ $profile.cpuLimit }}
    memory: {{ $profile.memoryLimit }}
{{- end }}
```

---

## Health Probes for AI Workloads

### Slow Startup (Model Loading)

```yaml
# values.yaml
probes:
  startup:
    enabled: true
    path: /health/startup
    initialDelaySeconds: 0
    periodSeconds: 10
    failureThreshold: 60  # 10 minutes to load model

  liveness:
    path: /health/live
    initialDelaySeconds: 600  # After model loaded
    periodSeconds: 30
    timeoutSeconds: 10

  readiness:
    path: /health/ready
    initialDelaySeconds: 0
    periodSeconds: 10
```

### GPU Health Check

```yaml
# Custom health endpoint that checks GPU
probes:
  liveness:
    path: /health/gpu
    # Endpoint should verify:
    # - GPU is accessible
    # - CUDA initialized
    # - Model loaded in GPU memory
```

---

## Example: Complete AI Agent Chart

```yaml
# values.yaml
replicaCount: 1
profile: medium

image:
  repository: myorg/ai-agent
  tag: ""
  pullPolicy: IfNotPresent

# Model storage
modelStorage:
  enabled: true
  storageClass: "fast-ssd"
  size: "100Gi"

# Model download
initContainers:
  modelDownload:
    enabled: true
    image: "amazon/aws-cli:latest"
    command:
      - /bin/sh
      - -c
      - aws s3 sync s3://models/llama-7b /models/

# GPU configuration
gpu:
  enabled: true
  count: 1
  nodeSelector:
    accelerator: nvidia-a100

# Scale to zero when idle
keda:
  enabled: true
  minReplicaCount: 0
  maxReplicaCount: 5
  cooldownPeriod: 600  # 10 min idle before scale down
  triggers:
    - type: prometheus
      metadata:
        query: sum(rate(agent_requests_total[5m]))
        threshold: "1"

# Dapr for state/pubsub
dapr:
  enabled: true
  appId: "ai-agent"
  appPort: "8080"

# Slow startup for model loading
probes:
  startup:
    failureThreshold: 60
    periodSeconds: 10
```
