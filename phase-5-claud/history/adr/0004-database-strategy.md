# ADR-0004: Database Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-28
- **Feature:** Task CRUD Operations with Authentication
- **Context:** Need to select a database solution that provides ACID compliance, scalability, and works well with SQLModel ORM while meeting constitutional requirements for PostgreSQL.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will adopt PostgreSQL with Neon Serverless as our database strategy with the following components:
- **Database Engine**: PostgreSQL 16 for ACID compliance and advanced features
- **Deployment**: Neon Serverless for auto-scaling and serverless benefits
- **ORM**: SQLModel for type-safe database operations
- **ID Strategy**: UUID for user IDs (security), integer for task IDs (performance)
- **Indexing**: Proper indexes on user_id, completed status, and created_at
- **Security**: SSL connections and row-level access controls

## Consequences

### Positive

- Robust ACID compliance for data integrity
- Advanced PostgreSQL features (JSON support, full-text search, etc.)
- Serverless scaling with Neon reduces operational overhead
- Strong security model with proper isolation
- Excellent performance for relational queries
- Mature ecosystem and tooling
- SQLModel integration with Pydantic schemas

### Negative

- Potential vendor lock-in with Neon-specific features
- Complexity of managing PostgreSQL compared to document stores
- Possible performance limitations with complex joins at scale
- Need for database connection pooling
- Learning curve for team members unfamiliar with PostgreSQL
- Cost considerations with Neon Serverless at high scale

## Alternatives Considered

Alternative A: SQLite
- Why rejected: Insufficient for multi-user application, lacks concurrency support

Alternative B: MongoDB
- Why rejected: Relational structure better suited for user/task relationships, violates constitutional requirement for PostgreSQL

Alternative C: MySQL
- Why rejected: Constitutional requirement specifies PostgreSQL specifically

Alternative D: Cloud-native solutions (Firebase, Supabase)
- Why rejected: Less control over database schema, potential vendor lock-in, doesn't integrate as well with SQLModel

## References

- Feature Spec: specs/001-task-crud-auth/spec.md
- Implementation Plan: specs/001-task-crud-auth/plan.md
- Related ADRs: ADR-0001, ADR-0002, ADR-0003
- Evaluator Evidence: specs/001-task-crud-auth/research.md
