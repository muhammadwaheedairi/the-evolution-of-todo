# API Contracts: Local Kubernetes Deployment

**Feature**: Phase IV Local Kubernetes Deployment
**Date**: 2026-02-09
**Status**: Phase III APIs unchanged, new health check endpoints added

## Overview

Phase IV is a deployment-only feature. **All Phase III REST API endpoints remain unchanged.** The only new endpoints are health checks required for Kubernetes liveness and readiness probes.

## Phase III API Endpoints (Unchanged)

All Phase III endpoints function identically in Kubernetes deployment:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Task Management Endpoints
All require JWT token: `Authorization: Bearer <token>`
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{id}` - Get task details
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

### Chat Endpoint
- `POST /api/{user_id}/chat` - Send message and receive AI response

For complete API specifications, see Phase III documentation.

## Service-to-Service Communication in Kubernetes

### Frontend to Backend
Frontend communicates with backend via Kubernetes Service DNS:

```typescript
// Frontend configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
                    "http://backend-service:8000";
```

**Service DNS Format**: `<service-name>.<namespace>.svc.cluster.local`
- Short form: `backend-service` (same namespace)
- Full form: `backend-service.todo-app.svc.cluster.local`

### Backend to External Database
Backend connects directly to external Neon PostgreSQL (no Kubernetes Service needed):

```python
# Backend configuration
DATABASE_URL = os.getenv("DATABASE_URL")  # From Kubernetes Secret
```

## New Health Check Endpoints (Phase IV)

Health check endpoints are required for Kubernetes liveness and readiness probes.

### Specification

See [health-checks.yaml](./health-checks.yaml) for OpenAPI specification.

### Implementation Requirements

**Frontend Health Checks**:
```typescript
// app/health/route.ts
export async function GET() {
  return Response.json({ status: "healthy" });
}

// app/ready/route.ts
export async function GET() {
  return Response.json({ status: "ready" });
}
```

**Backend Health Checks**:
```python
# src/routers/health.py
@router.get("/health")
async def health():
    return {"status": "healthy"}

@router.get("/ready")
async def ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database unavailable")
```

### Probe Configuration

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

## Summary

- ✅ All Phase III API endpoints unchanged
- ✅ Frontend-backend communication via Kubernetes Service DNS
- ✅ Backend-database communication via external connection
- ✅ New health check endpoints for Kubernetes probes
- ✅ Liveness probe checks process health
- ✅ Readiness probe checks database connectivity

---

**Status**: ✅ COMPLETE - API contracts documented
