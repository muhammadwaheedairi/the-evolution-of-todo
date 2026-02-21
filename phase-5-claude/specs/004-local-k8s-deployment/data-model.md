# Data Model: Local Kubernetes Deployment

**Feature**: Phase IV Local Kubernetes Deployment
**Date**: 2026-02-09
**Status**: No changes to Phase III data models

## Overview

Phase IV is a deployment-only feature. **No database schema changes are required.** All Phase III data models remain unchanged and function identically in the Kubernetes deployment.

## Phase III Data Models (Unchanged)

### users
- **id**: UUID (primary key)
- **email**: string (unique)
- **name**: string
- **password_hash**: string (Argon2)
- **created_at**: timestamp
- **updated_at**: timestamp

### tasks
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id)
- **title**: string (not null)
- **description**: text (nullable)
- **completed**: boolean (default false)
- **created_at**: timestamp
- **updated_at**: timestamp

### conversations
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id, indexed)
- **created_at**: timestamp
- **updated_at**: timestamp

### messages
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id, indexed)
- **conversation_id**: integer (foreign key -> conversations.id, indexed)
- **role**: string ("user" or "assistant")
- **content**: text (message content)
- **created_at**: timestamp

## Database Connection from Kubernetes

### External Database
The Neon Serverless PostgreSQL database remains external to the Kubernetes cluster. Backend pods connect to the database using a connection string provided via Kubernetes Secret.

### Connection Configuration

**Kubernetes Secret**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-app-secrets
  namespace: todo-app
type: Opaque
data:
  DATABASE_URL: <base64-encoded-connection-string>
```

**Connection String Format**:
```
postgresql://user:password@host.neon.tech:5432/database?sslmode=require
```

**Backend Deployment Configuration**:
```yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: todo-app-secrets
        key: DATABASE_URL
```

### Connection Requirements

1. **SSL/TLS**: Neon requires SSL connections (`sslmode=require`)
2. **Network Access**: Kubernetes pods must have outbound internet access to reach Neon
3. **Connection Pooling**: SQLModel/SQLAlchemy handles connection pooling (no changes needed)
4. **Timeout Configuration**: Default timeouts are appropriate for Neon's serverless architecture

### Database Migrations

Database migrations (Alembic) are **not** run automatically during pod startup. Migrations must be run manually before deployment:

```bash
# Run migrations from local machine (not in Kubernetes)
cd backend
alembic upgrade head
```

**Rationale**: Running migrations in pod startup can cause race conditions with multiple replicas and is not idempotent.

## Verification

### Database Connectivity Test

Backend readiness probe verifies database connectivity:

```python
@app.get("/ready")
async def ready():
    try:
        await db.execute("SELECT 1")
        return {"status": "ready", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
```

If the readiness probe fails, the pod will not receive traffic, ensuring only healthy pods serve requests.

## Summary

- ✅ No database schema changes in Phase IV
- ✅ All Phase III models unchanged
- ✅ External Neon PostgreSQL database
- ✅ Connection string via Kubernetes Secret
- ✅ SSL/TLS required for Neon connection
- ✅ Migrations run manually before deployment
- ✅ Readiness probe verifies database connectivity

---

**Status**: ✅ COMPLETE - No data model changes required
