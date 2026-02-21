# ADR-0002: Monorepo Architecture

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-28
- **Feature:** Task CRUD Operations with Authentication
- **Context:** Need to determine the project structure for the full-stack application with separate frontend and backend services while maintaining coordination between them.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will adopt a monorepo architecture with separate frontend and backend services within a single repository. The structure will be:
- **Backend**: FastAPI application in `backend/` directory
- **Frontend**: Next.js application in `frontend/` directory
- **Shared Specifications**: Feature specs in `specs/` directory
- **Documentation**: Shared documentation and configuration at root level

## Consequences

### Positive

- Unified version control and release management
- Simplified dependency management across services
- Easier coordination of cross-cutting changes
- Shared tooling and configuration
- Single CI/CD pipeline for the entire application
- Improved developer experience with consistent environment setup
- Easier navigation and understanding of the entire system

### Negative

- Larger repository size and potentially slower cloning
- Potential for tighter coupling between frontend and backend
- May complicate independent deployments if needed later
- Single point of failure for the repository
- Potentially more complex branching strategies

## Alternatives Considered

Alternative A: Separate repositories for frontend and backend
- Why rejected: Higher coordination overhead, more complex CI/CD setup, difficulty in coordinating cross-cutting changes

Alternative B: Single codebase mixing frontend and backend code
- Why rejected: Poor separation of concerns, difficult to scale, mixed technology stacks causing confusion

Alternative C: Microservices with multiple repositories
- Why rejected: Premature complexity for this application size, excessive overhead for a single product team

## References

- Feature Spec: specs/001-task-crud-auth/spec.md
- Implementation Plan: specs/001-task-crud-auth/plan.md
- Related ADRs: ADR-0001, ADR-0003, ADR-0004
- Evaluator Evidence: specs/001-task-crud-auth/research.md
