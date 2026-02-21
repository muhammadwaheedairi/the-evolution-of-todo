# Research: Local Kubernetes Deployment

**Date**: 2026-02-09
**Feature**: Phase IV Local Kubernetes Deployment
**Purpose**: Document best practices and technical decisions for containerization and Kubernetes deployment

## 1. Docker Multi-Stage Build Patterns for Next.js 16

### Decision
Use multi-stage build with standalone output mode, node:alpine base image, and aggressive layer caching.

### Rationale
- **Standalone output**: Next.js 16 standalone mode reduces runtime dependencies by 80%+, resulting in images under 200MB
- **node:alpine**: Smallest official Node.js image (~40MB base vs ~300MB for node:slim)
- **Layer caching**: Copying package files before source code maximizes Docker layer cache hits during development

### Alternatives Considered
- **node:slim**: Larger base image but better compatibility with native modules (not needed for this project)
- **Distroless**: Most secure but harder to debug (overkill for local development)
- **Full build in single stage**: Simpler but results in 1GB+ images with build tools included

### Implementation Notes

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Key Points**:
- Enable standalone output in `next.config.js`: `output: 'standalone'`
- Use non-root user (nextjs:1001) for security
- Copy only necessary files to runtime stage
- Expected image size: 150-250MB

## 2. Docker Multi-Stage Build Patterns for FastAPI with UV

### Decision
Use multi-stage build with python:slim base image, UV for fast dependency installation, and virtual environment copying.

### Rationale
- **python:slim**: Good balance of size (~50MB) and compatibility (includes glibc)
- **UV package manager**: 10-100x faster than pip for dependency resolution and installation
- **Virtual environment**: Clean separation of dependencies, easy to copy between stages

### Alternatives Considered
- **python:alpine**: Smallest but requires compilation of many packages (slow builds, compatibility issues)
- **pip with requirements.txt**: Standard but much slower than UV
- **Poetry**: Good dependency management but slower than UV and adds complexity

### Implementation Notes

```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml ./
RUN uv venv /opt/venv && \
    . /opt/venv/bin/activate && \
    uv pip install -r pyproject.toml

# Runtime stage
FROM python:3.11-slim AS runner
WORKDIR /app
RUN useradd -m -u 1001 appuser
COPY --from=builder /opt/venv /opt/venv
COPY --chown=appuser:appuser ./src ./src
USER appuser
ENV PATH="/opt/venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Points**:
- UV installs dependencies 10-100x faster than pip
- Virtual environment copied from builder to runner
- Non-root user (appuser:1001) for security
- Expected image size: 200-300MB

## 3. Helm Chart Best Practices for Web Applications

### Decision
Use standard Helm chart structure with named templates, app.kubernetes.io/* labels, and environment-specific values files.

### Rationale
- **Standard structure**: Follows Helm conventions, easy for other developers to understand
- **Named templates**: DRY principle for labels, selectors, and common configurations
- **app.kubernetes.io/* labels**: Kubernetes recommended labels for better tooling integration
- **Environment-specific values**: Separate dev/prod configurations without duplicating templates

### Alternatives Considered
- **Flat template structure**: Simpler but leads to duplication
- **Custom labels**: Works but doesn't integrate with Kubernetes ecosystem tools
- **Single values file**: Simpler but mixes dev/prod concerns

### Implementation Notes

**Chart Structure**:
```
helm/
├── Chart.yaml
├── values.yaml          # Common defaults
├── values-dev.yaml      # Local development overrides
├── templates/
│   ├── _helpers.tpl     # Named templates
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   └── NOTES.txt
└── README.md
```

**Named Templates (_helpers.tpl)**:
```yaml
{{- define "todo-app.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "todo-app.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

**Key Points**:
- Use `{{ include "todo-app.labels" . }}` in all resources
- Separate values files: `helm install -f values-dev.yaml`
- Document all values in values.yaml with comments

## 4. Kubernetes Health Check Patterns

### Decision
Implement separate /health (liveness) and /ready (readiness) endpoints with appropriate timeouts and thresholds.

### Rationale
- **Separate endpoints**: Liveness checks basic process health, readiness checks dependencies (database, external APIs)
- **Appropriate timeouts**: Prevents false positives during startup and legitimate slow responses
- **Failure thresholds**: Allows transient failures without pod restarts

### Alternatives Considered
- **Single health endpoint**: Simpler but can't distinguish between "dead" and "temporarily unavailable"
- **TCP probes**: Faster but doesn't verify application logic
- **Exec probes**: Most flexible but higher overhead

### Implementation Notes

**Liveness Probe** (is the process alive?):
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe** (can it handle traffic?):
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

**Endpoint Implementation** (FastAPI):
```python
@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/ready")
async def ready():
    # Check database connection
    try:
        await db.execute("SELECT 1")
        return {"status": "ready", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
```

**Key Points**:
- Liveness: Simple check, longer delays, more failures allowed
- Readiness: Checks dependencies, shorter delays, fewer failures allowed
- Frontend: Can use simpler checks (just return 200 OK)

## 5. Kubernetes Resource Limit Recommendations

### Decision
Use requests=limits for local development, with frontend at 512Mi/500m and backend at 1Gi/1000m.

### Rationale
- **Requests=Limits**: Guarantees QoS class, prevents resource contention on developer laptops
- **Frontend limits**: Next.js typically uses 200-400Mi, 512Mi provides headroom
- **Backend limits**: FastAPI + OpenAI SDK + MCP can spike to 800Mi, 1Gi provides safety margin
- **CPU in millicores**: 500m = 0.5 CPU core, 1000m = 1 CPU core

### Alternatives Considered
- **Requests < Limits**: Better resource utilization but can cause OOMKilled on laptops
- **No limits**: Simplest but risks exhausting laptop resources
- **Lower limits**: More efficient but risks OOMKilled during normal operation

### Implementation Notes

**Frontend Resources**:
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Backend Resources**:
```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

**Key Points**:
- Total: 1.5Gi RAM, 1.5 CPU cores (fits on 8GB laptop with 4 cores)
- Requests=Limits ensures Guaranteed QoS class
- Monitor actual usage: `kubectl top pods -n todo-app`
- Adjust if OOMKilled or underutilized

## 6. ConfigMap vs Secret Decision Criteria

### Decision
Use ConfigMaps for non-sensitive configuration, Secrets for credentials and API keys, with base64 encoding and environment variable injection.

### Rationale
- **ConfigMaps**: Visible in kubectl describe, suitable for URLs, feature flags, non-sensitive settings
- **Secrets**: Base64 encoded, encrypted at rest (in production), suitable for passwords, API keys, tokens
- **Environment variables**: Standard 12-factor app pattern, works with existing Phase III code

### Alternatives Considered
- **All in Secrets**: More secure but harder to debug configuration issues
- **Volume mounts**: More flexible but requires code changes to read files
- **External secret managers**: Best for production but overkill for local development

### Implementation Notes

**ConfigMap** (non-sensitive):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-app-config
data:
  BACKEND_URL: "http://backend-service:8000"
  LOG_LEVEL: "info"
  ENVIRONMENT: "development"
```

**Secret** (sensitive):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-app-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded>
  OPENAI_API_KEY: <base64-encoded>
  DATABASE_URL: <base64-encoded>
```

**Usage in Deployment**:
```yaml
env:
  - name: BACKEND_URL
    valueFrom:
      configMapKeyRef:
        name: todo-app-config
        key: BACKEND_URL
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: todo-app-secrets
        key: JWT_SECRET
```

**Key Points**:
- Create Secrets manually: `kubectl create secret generic todo-app-secrets --from-literal=JWT_SECRET=xxx`
- Never commit Secrets to Git
- Document required Secrets in README
- Minikube encrypts Secrets at rest by default

## 7. Service Discovery and Networking in Kubernetes

### Decision
Use ClusterIP for backend (internal), NodePort for frontend (external access), and DNS-based service discovery.

### Rationale
- **ClusterIP**: Default service type, only accessible within cluster, perfect for backend
- **NodePort**: Exposes service on each node's IP, easy access from host machine for local development
- **DNS discovery**: Kubernetes built-in, services accessible via `<service-name>.<namespace>.svc.cluster.local`

### Alternatives Considered
- **LoadBalancer**: Requires cloud provider or MetalLB, overkill for local
- **Ingress**: More features but requires ingress controller setup
- **Port-forward**: Simpler but requires manual command, not persistent

### Implementation Notes

**Backend Service** (ClusterIP):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
```

**Frontend Service** (NodePort):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30000  # Optional: specify port
```

**Frontend to Backend Communication**:
```typescript
// In frontend code, use Kubernetes Service DNS
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
                    "http://backend-service:8000";
```

**External Database Connection**:
```python
# Backend connects to external Neon database
DATABASE_URL = os.getenv("DATABASE_URL")  # From Secret
# No special Kubernetes configuration needed
```

**Key Points**:
- Backend accessible at: `http://backend-service:8000` (from within cluster)
- Frontend accessible at: `http://<minikube-ip>:30000` (from host)
- Get Minikube IP: `minikube ip`
- External database: No Kubernetes Service needed, direct connection

## 8. Minikube Configuration for Local Development

### Decision
Start Minikube with 4 CPUs, 8GB RAM, Docker driver, and enable ingress and metrics-server addons.

### Rationale
- **4 CPUs, 8GB RAM**: Sufficient for application (1.5Gi, 1.5 CPU) plus Kubernetes overhead
- **Docker driver**: Most compatible, works on all platforms
- **Ingress addon**: Useful for future enhancements (not required for Phase IV)
- **Metrics-server addon**: Enables `kubectl top` for resource monitoring

### Alternatives Considered
- **2 CPUs, 4GB RAM**: Too constrained, risks OOMKilled
- **VirtualBox driver**: More isolated but slower and requires VirtualBox installation
- **Podman driver**: Newer but less tested

### Implementation Notes

**Minikube Start Command**:
```bash
minikube start \
  --cpus=4 \
  --memory=8192 \
  --driver=docker \
  --kubernetes-version=v1.28.0
```

**Enable Addons**:
```bash
minikube addons enable ingress
minikube addons enable metrics-server
```

**Use Minikube Docker Daemon** (for local image builds):
```bash
eval $(minikube docker-env)
# Now docker build commands use Minikube's Docker daemon
# Images built are immediately available in Minikube
```

**Common Troubleshooting**:

1. **Minikube won't start**:
   ```bash
   minikube delete  # Clean slate
   minikube start --cpus=4 --memory=8192
   ```

2. **Pods stuck in ImagePullBackOff**:
   ```bash
   # Ensure using Minikube Docker daemon
   eval $(minikube docker-env)
   # Set imagePullPolicy: Never in Helm values
   ```

3. **Can't access application**:
   ```bash
   minikube ip  # Get Minikube IP
   kubectl get svc -n todo-app  # Get NodePort
   # Access: http://<minikube-ip>:<nodeport>
   ```

4. **Pods OOMKilled**:
   ```bash
   kubectl top pods -n todo-app  # Check actual usage
   # Increase resource limits in values-dev.yaml
   ```

**Key Points**:
- Minimum system requirements: 8GB RAM, 4 CPU cores, 20GB disk
- Docker driver is default and most compatible
- Use `minikube docker-env` to avoid pushing images to registry
- Stop Minikube when not in use: `minikube stop`

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Next.js Docker | Multi-stage with standalone output, node:alpine | <250MB images |
| FastAPI Docker | Multi-stage with UV, python:slim | <300MB images, fast builds |
| Helm Structure | Standard structure with named templates | Maintainable, follows conventions |
| Health Checks | Separate liveness/readiness endpoints | Reliable pod lifecycle management |
| Resource Limits | Requests=Limits, 512Mi/1Gi | Guaranteed QoS, prevents contention |
| Config Management | ConfigMaps for config, Secrets for credentials | Secure, follows 12-factor app |
| Networking | ClusterIP backend, NodePort frontend | Simple, works for local development |
| Minikube Config | 4 CPU, 8GB RAM, Docker driver | Sufficient resources, compatible |

## Implementation Priorities

1. **Phase 1 (Critical)**: Dockerfiles, health check endpoints
2. **Phase 2 (Critical)**: Helm chart structure, basic templates
3. **Phase 3 (Important)**: ConfigMaps, Secrets, values files
4. **Phase 4 (Important)**: Documentation, troubleshooting guide
5. **Phase 5 (Nice-to-have)**: Helper scripts, advanced monitoring

---

**Research Status**: ✅ COMPLETE
**Next Step**: Create Phase 1 design artifacts (data-model.md, contracts/, quickstart.md)
