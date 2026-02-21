"""Health check endpoints for Kubernetes probes."""
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from ..database import engine

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Liveness probe endpoint.

    Returns 200 if the service process is alive and running.
    Used by Kubernetes liveness probe to determine if the pod should be restarted.
    This is a simple check that doesn't verify external dependencies.
    """
    return {"status": "healthy"}


@router.get("/ready")
async def readiness_check():
    """
    Readiness probe endpoint.

    Returns 200 if the service is ready to accept traffic.
    Used by Kubernetes readiness probe to determine if the pod should receive requests.
    This check verifies external dependencies (database connection).
    """
    try:
        # Test database connection
        with Session(engine) as session:
            # Simple query to verify database connectivity
            session.exec(select(1)).first()

        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database unavailable: {str(e)}"
        )
