# ADR-0001: Full-Stack Technology Stack

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-28
- **Feature:** Task CRUD Operations with Authentication
- **Context:** Need to establish a technology stack that meets constitutional requirements for the Phase II Todo application, with focus on security, scalability, and maintainability.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will adopt a full-stack technology stack consisting of:
- **Frontend**: Next.js 16+ with App Router, TypeScript 5.x, Tailwind CSS
- **Backend**: FastAPI with Python 3.13+, SQLModel ORM
- **Database**: PostgreSQL 16 (Neon Serverless)
- **Authentication**: Better Auth with JWT plugin
- **Package Management**: UV (Python), npm (Node.js)
- **Styling**: Tailwind CSS only (no inline styles, no CSS modules)

## Consequences

### Positive

- Strong type safety throughout the stack (TypeScript + Pydantic + SQLModel)
- Excellent developer experience with Next.js App Router patterns
- Automatic OpenAPI documentation generation with FastAPI
- Seamless integration between SQLModel and Pydantic schemas
- Server-side rendering capabilities with Next.js
- Built-in security best practices with Better Auth
- Horizontal scalability with stateless JWT authentication
- Modern, efficient development patterns across frontend and backend

### Negative

- Learning curve for team members unfamiliar with Next.js 16+ patterns
- Potential vendor lock-in with Neon Serverless PostgreSQL
- Complexity of managing multiple technology ecosystems
- Need for specialized knowledge in both Python and JavaScript/TypeScript
- Potential performance overhead with complex SQLModel relationships

## Alternatives Considered

Alternative Stack A: Flask + React + SQLAlchemy + Custom Auth
- Why rejected: Less modern, no automatic API documentation, more manual work for type safety

Alternative Stack B: Remix + Express + Prisma + NextAuth.js
- Why rejected: Not compliant with constitutional requirements (Next.js 16+ App Router required)

Alternative Stack C: Django + React + Django ORM + Django Auth
- Why rejected: Not aligned with constitutional requirements (FastAPI and Next.js specifically required)

## References

- Feature Spec: specs/001-task-crud-auth/spec.md
- Implementation Plan: specs/001-task-crud-auth/plan.md
- Related ADRs: ADR-0002, ADR-0003, ADR-0004
- Evaluator Evidence: specs/001-task-crud-auth/research.md
