# Implementation Plan: Local Kubernetes Deployment

**Branch**: `004-local-k8s-deployment` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-local-k8s-deployment/spec.md`

## Summary

Deploy the Phase III Todo AI Chatbot application to a local Kubernetes cluster using Minikube and Helm Charts. The deployment containerizes both frontend (Next.js with ChatKit) and backend (FastAPI with OpenAI Agents SDK + MCP server) as separate services, with configuration managed via ConfigMaps and Secrets. The deployment must maintain 100% functional parity with Phase III while enabling local development in a production-like environment.

**Technical Approach**: Multi-stage Docker builds for minimal image sizes, Helm charts for declarative infrastructure, external Neon PostgreSQL database (not deployed in cluster), and Kubernetes Services for inter-service communication.

## Technical Context

**Language/Version**:
- Frontend: Node.js 20+ (Next.js 16 requirement)
- Backend: Python 3.11+ (Phase III requirement)

**Primary Dependencies**:
- Frontend: Next.js 16+, React 19+, OpenAI ChatKit, Tailwind CSS
- Backend: FastAPI, SQLModel, OpenAI Agents SDK, Official MCP SDK, python-jose, argon2-cffi
- Deployment: Docker 24+, Kubernetes 1.28+ (Minikube), Helm 3.12+

**Storage**:
- External Neon Serverless PostgreSQL (not deployed in cluster)
- No persistent volumes required (stateless pods)

**Testing**:
- Functional testing: Manual verification of Phase III features in deployed environment
- Deployment testing: Helm lint, dry-run validation, pod readiness checks
- Regression testing: Verify zero behavior drift from Phase III

**Target Platform**:
- Local development: Minikube on Linux/macOS/Windows
- Minimum requirements: 8GB RAM, 20GB disk space, 4 CPU cores

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Pod startup time: <60 seconds to Ready state
- Image build time: <5 minutes per service
- Deployment time: <5 minutes from helm install to accessible application
- Image size: <500MB per service

**Constraints**:
- Resource limits: Frontend 512Mi/500m CPU, Backend 1Gi/1000m CPU
- Total RAM usage: <2GB for entire application
- Local-only deployment (no cloud infrastructure)
- External database only (no in-cluster database)
- Single replica per service (local development)

**Scale/Scope**:
- 2 containerized services (frontend, backend)
- 1 Helm chart with 2 Deployments, 2 Services
- 3-5 ConfigMaps and Secrets
- Zero application code changes (deployment only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **Security First**:
- Kubernetes Secrets for sensitive data (JWT secret, OpenAI API key, database credentials)
- No secrets in container images or Helm values files
- Pods run as non-root users (securityContext)
- Phase III authentication and authorization unchanged

✅ **Stateless Design**:
- Pods are stateless and replaceable
- No in-memory state (conversation history in database)
- Horizontal scalability maintained (though single replica for local)
- Server restarts don't lose data

✅ **Type Safety**:
- Helm values validated against schemas
- TypeScript strict mode maintained in frontend
- Python type hints maintained in backend

✅ **API-First Architecture**:
- Kubernetes Services expose stable endpoints
- Frontend-backend communication via Service DNS
- REST API contracts unchanged from Phase III

✅ **Database Integrity**:
- External Neon PostgreSQL accessible from pods
- Database connection string in Kubernetes Secret
- All Phase III database standards maintained

✅ **AI Agent Architecture**:
- Agent behavior identical in Kubernetes deployment
- MCP tools function identically
- System prompts unchanged

✅ **Conversational Interface First**:
- ChatKit UI functions identically
- Natural language processing unchanged
- User experience identical to Phase III

✅ **Infrastructure as Code (NEW)**:
- All Kubernetes resources in Helm charts
- No imperative kubectl commands
- Version-controlled deployment configurations
- Reproducible deployments

### Technical Constraints Compliance

✅ **Container Runtime**: Docker with multi-stage builds, non-root users, official base images
✅ **Orchestration Platform**: Kubernetes (Minikube for local)
✅ **Package Manager**: Helm 3+ for all Kubernetes resources
✅ **Frontend Framework**: Next.js 16+ (unchanged)
✅ **Backend Framework**: FastAPI (unchanged)
✅ **Database**: Neon Serverless PostgreSQL (external)
✅ **Authentication**: Custom JWT with Argon2 (unchanged)
✅ **AI Framework**: OpenAI Agents SDK (unchanged)
✅ **MCP Protocol**: Official MCP SDK (unchanged)

### Deployment Standards Compliance

✅ **Containerization Standards**:
- Multi-stage builds for frontend and backend
- Official base images (node:alpine, python:slim)
- Non-root users in containers
- .dockerignore files to exclude unnecessary files
- Health check endpoints exposed

✅ **Kubernetes Deployment Standards**:
- Deployments with resource limits
- Liveness and readiness probes
- Services for inter-service communication
- ConfigMaps for non-sensitive config
- Secrets for sensitive data

✅ **Helm Chart Standards**:
- Standard structure (Chart.yaml, values.yaml, templates/)
- Helm templating for all resources
- Separate values files for environments
- Chart linting and validation
- Semantic versioning

✅ **Secrets Management Standards**:
- Kubernetes Secrets for all sensitive data
- Secrets created manually (not in Helm charts)
- Secret names referenced in templates
- Documentation for required secrets

✅ **Local Development Standards**:
- Minikube setup documented
- Same Helm charts with dev values
- Step-by-step deployment procedure
- Troubleshooting guide included

### Quality Gates Compliance

✅ **Phase IV Quality Gates**:
- Docker images build successfully
- Helm charts pass linting
- Helm dry-run succeeds
- Pods reach Ready state within 60 seconds
- Health checks pass
- No secrets in images or values files
- Containers run as non-root
- Resource limits prevent OOMKilled
- Application behavior identical to Phase III
- Deployment reproducible

**Gate Status**: ✅ PASSED - All constitutional requirements can be met with proposed approach

## Project Structure

### Documentation (this feature)

```text
specs/004-local-k8s-deployment/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (Docker/Helm/K8s best practices)
├── quickstart.md        # Phase 1 output (deployment guide)
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
# Existing Phase III structure (unchanged)
frontend/
├── app/
├── components/
├── lib/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── Dockerfile           # NEW - Multi-stage build
└── .dockerignore        # NEW - Exclude node_modules, .next, etc.

backend/
├── src/
│   ├── main.py
│   ├── models/
│   ├── routers/
│   ├── services/
│   └── mcp/
├── alembic/
├── pyproject.toml
├── Dockerfile           # NEW - Multi-stage build
└── .dockerignore        # NEW - Exclude __pycache__, .venv, etc.

# NEW - Helm chart structure
helm/
├── Chart.yaml           # Chart metadata (name, version, appVersion)
├── values.yaml          # Default values (common configuration)
├── values-dev.yaml      # Development overrides (1 replica, lower limits)
├── templates/
│   ├── _helpers.tpl     # Named templates for reusable components
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml   # Non-sensitive configuration
│   └── NOTES.txt        # Post-install instructions
└── README.md            # Installation and usage instructions

# NEW - Deployment scripts (optional helpers)
scripts/
├── build-images.sh      # Build Docker images locally
├── create-secrets.sh    # Create Kubernetes Secrets
└── deploy-local.sh      # Deploy to Minikube

# NEW - Deployment documentation
docs/
└── deployment/
    ├── minikube-setup.md
    ├── troubleshooting.md
    └── architecture.md
```

**Structure Decision**: Web application structure with existing frontend/ and backend/ directories. Added Dockerfile to each service directory for containerization. Created new helm/ directory at repository root for Helm chart. Added optional scripts/ directory for deployment helpers. No changes to Phase III application code structure.

## Complexity Tracking

> No constitutional violations - this section is not needed.

## Phase 0: Research & Best Practices

### Research Tasks

The following research tasks will be executed to resolve technical unknowns and establish best practices:

1. **Docker Multi-Stage Build Patterns for Next.js**
   - Research optimal Next.js 16 Dockerfile structure
   - Investigate standalone output mode for minimal runtime
   - Determine best practices for node_modules caching
   - Find recommended base images (node:alpine vs node:slim)

2. **Docker Multi-Stage Build Patterns for FastAPI**
   - Research optimal FastAPI Dockerfile structure
   - Investigate UV package manager in Docker builds
   - Determine best practices for Python dependency caching
   - Find recommended base images (python:slim vs python:alpine)

3. **Helm Chart Best Practices for Web Applications**
   - Research standard Helm chart structure for frontend/backend apps
   - Investigate named templates (_helpers.tpl) patterns
   - Determine best practices for values organization
   - Find recommended labeling conventions (app.kubernetes.io/*)

4. **Kubernetes Health Check Patterns**
   - Research liveness vs readiness probe differences
   - Investigate health check endpoint implementation
   - Determine appropriate timeouts and thresholds
   - Find best practices for graceful shutdown

5. **Kubernetes Resource Limit Recommendations**
   - Research appropriate CPU/memory limits for Next.js
   - Investigate appropriate CPU/memory limits for FastAPI
   - Determine requests vs limits best practices
   - Find guidelines for local development resource allocation

6. **ConfigMap vs Secret Decision Criteria**
   - Research what data belongs in ConfigMaps vs Secrets
   - Investigate Secret encryption at rest in Minikube
   - Determine best practices for Secret rotation
   - Find patterns for referencing Secrets in Deployments

7. **Service Discovery and Networking in Kubernetes**
   - Research DNS-based service discovery patterns
   - Investigate ClusterIP vs NodePort vs LoadBalancer
   - Determine best practices for frontend-backend communication
   - Find patterns for external database connectivity

8. **Minikube Configuration for Local Development**
   - Research recommended Minikube resource allocation
   - Investigate useful Minikube addons (ingress, metrics-server)
   - Determine best practices for using Minikube Docker daemon
   - Find troubleshooting patterns for common Minikube issues

### Research Output

Research findings will be documented in `research.md` with the following structure:

```markdown
# Research: Local Kubernetes Deployment

## Docker Multi-Stage Builds

### Decision: [Chosen approach]
### Rationale: [Why chosen]
### Alternatives Considered: [What else evaluated]
### Implementation Notes: [Key details]

## Helm Chart Structure

### Decision: [Chosen approach]
### Rationale: [Why chosen]
### Alternatives Considered: [What else evaluated]
### Implementation Notes: [Key details]

[... continue for all research areas]
```

## Phase 1: Design & Contracts

### Data Model

**No new data models required.** Phase III data models (users, tasks, conversations, messages) remain unchanged. Database schema is not modified in Phase IV.

A minimal `data-model.md` will be created documenting:
- Confirmation that Phase III models are unchanged
- Database connection requirements from Kubernetes pods
- Connection string management via Kubernetes Secret

### API Contracts

**No new API contracts required.** Phase III REST API endpoints remain unchanged:
- Authentication endpoints (register, login)
- Task management endpoints (CRUD operations)
- Chat endpoint (conversational interface)

A minimal `contracts/` directory will be created documenting:
- Confirmation that Phase III APIs are unchanged
- Service-to-service communication patterns in Kubernetes
- Health check endpoint specifications (new for Phase IV)

### Health Check Endpoints

**New endpoints required for Kubernetes probes:**

```yaml
# contracts/health-checks.yaml
openapi: 3.0.0
info:
  title: Health Check Endpoints
  version: 1.0.0

paths:
  /health:
    get:
      summary: Liveness probe endpoint
      description: Returns 200 if service is alive (basic health)
      responses:
        '200':
          description: Service is alive
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "healthy"

  /ready:
    get:
      summary: Readiness probe endpoint
      description: Returns 200 if service is ready to accept traffic
      responses:
        '200':
          description: Service is ready
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "ready"
                  database:
                    type: string
                    example: "connected"
        '503':
          description: Service not ready
```

### Quickstart Guide

A comprehensive `quickstart.md` will be created with:

1. **Prerequisites**
   - Docker installation verification
   - Minikube installation verification
   - Helm installation verification
   - kubectl installation verification

2. **Environment Setup**
   - Minikube start command with resource allocation
   - Minikube addon enablement
   - Docker daemon configuration

3. **Secret Creation**
   - Step-by-step commands to create Kubernetes Secrets
   - Example values for local development
   - Security warnings about production secrets

4. **Image Building**
   - Commands to build frontend and backend images
   - Using Minikube Docker daemon for local images
   - Image tagging conventions

5. **Deployment**
   - Helm install command with dev values
   - Verification commands (kubectl get pods, services)
   - Accessing the application (port-forward or NodePort)

6. **Verification**
   - Health check verification
   - Application functionality testing
   - Log inspection commands

7. **Troubleshooting**
   - Common issues and solutions
   - Diagnostic commands
   - Where to find help

### Agent Context Update

After Phase 1 completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `CLAUDE.md` with Phase IV deployment context (already completed in previous step).

## Phase 2: Task Breakdown

Task breakdown will be handled by `/sp.tasks` command (not part of this plan).

Expected task categories:
1. **Environment Setup Tasks**: Dockerfiles, .dockerignore files
2. **Helm Chart Tasks**: Chart structure, templates, values files
3. **Health Check Tasks**: Implement /health and /ready endpoints
4. **Documentation Tasks**: Quickstart guide, troubleshooting guide
5. **Verification Tasks**: Deployment testing, functional testing

## Implementation Notes

### Critical Success Factors

1. **Zero Application Code Changes**: Phase III application code must not be modified. Only add Dockerfiles and deployment configurations.

2. **Functional Parity**: All Phase III features must work identically in Kubernetes deployment. Comprehensive regression testing required.

3. **Reproducible Deployments**: Deployment must work on any developer machine with documented prerequisites. No manual configuration steps.

4. **Security Compliance**: All Phase III security requirements must be maintained. Secrets management must follow Kubernetes best practices.

5. **Resource Efficiency**: Deployment must run on standard developer laptops. Resource limits must prevent system exhaustion.

### Risk Mitigation

1. **Risk**: Docker images too large (>500MB)
   - **Mitigation**: Multi-stage builds, .dockerignore, minimal base images

2. **Risk**: Pods fail to start within 60 seconds
   - **Mitigation**: Optimize image layers, appropriate resource limits, fast health checks

3. **Risk**: Application behavior differs from Phase III
   - **Mitigation**: Comprehensive functional testing, environment variable validation

4. **Risk**: Database connectivity issues from pods
   - **Mitigation**: Connection string testing, network troubleshooting guide

5. **Risk**: Secrets accidentally committed to Git
   - **Mitigation**: .gitignore configuration, documentation warnings, pre-commit hooks

### Next Steps

1. Execute Phase 0 research tasks
2. Document findings in `research.md`
3. Create Phase 1 design artifacts (`data-model.md`, `contracts/`, `quickstart.md`)
4. Run `/sp.tasks` to generate task breakdown
5. Begin implementation following task order

---

**Plan Status**: ✅ COMPLETE - Ready for Phase 0 research execution
