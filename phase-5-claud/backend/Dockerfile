# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Copy pyproject.toml
COPY pyproject.toml ./

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    --use-deprecated=legacy-resolver \
    -e .

# Install aiokafka for Phase 5
RUN pip install --no-cache-dir aiokafka python-socketio python-engineio aiohttp httpx

# Runtime stage
FROM python:3.12-slim AS runner

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1001 appuser

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=appuser:appuser ./src ./src
COPY --chown=appuser:appuser ./alembic ./alembic
COPY --chown=appuser:appuser ./alembic.ini ./alembic.ini

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]