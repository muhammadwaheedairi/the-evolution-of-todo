# ADR-0006: Conversation Data Management

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-02-06
- **Feature:** Backend AI Infrastructure
- **Context:** Need to determine how conversation data will be stored and managed to support stateless architecture while maintaining user isolation and conversation persistence requirements.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will adopt a dual-approach for conversation data management:
- **Primary Storage**: SQLAlchemySession from OpenAI Agents SDK for automatic conversation persistence
- **Schema**: Conversation and Message models using SQLModel with proper user_id isolation
- **Persistence**: PostgreSQL database via Neon Serverless for all conversation data
- **Access Control**: User_id filtering for strict conversation isolation
- **History Management**: Automatic conversation history retrieval via Sessions

## Consequences

### Positive

- Seamless integration with OpenAI Agents SDK for automatic conversation management
- Leverages existing PostgreSQL infrastructure without additional dependencies
- Maintains stateless architecture with database-backed session storage
- Strong user isolation through user_id filtering at database level
- Automatic conversation history management without manual implementation
- Horizontal scalability with shared database storage
- Consistent with existing SQLModel patterns in the application
- Supports conversation persistence across server restarts

### Negative

- Reliance on third-party session management (reduced control)
- Potential complexity in querying or analyzing conversation data directly
- Limited ability to customize session storage structure
- Additional database tables managed by the SDK (potential schema conflicts)
- Less visibility into exact session storage implementation details
- Possible performance considerations with complex conversation history queries

## Alternatives Considered

Alternative A: Custom conversation and message services with manual database management
- Why rejected: Would duplicate functionality provided by SQLAlchemySession, more complex implementation

Alternative B: In-memory session storage with cache (Redis)
- Why rejected: Violates constitutional requirement for stateless architecture with database persistence

Alternative C: Separate document database for conversations
- Why rejected: Would introduce additional infrastructure complexity and data fragmentation

Alternative D: File-based session storage
- Why rejected: Not suitable for production environments, doesn't scale well, difficult to query

## References

- Feature Spec: specs/phase3-backend-ai-infrastructure/spec.md
- Implementation Plan: specs/phase3-backend-ai-infrastructure/plan.md
- Research Findings: specs/phase3-backend-ai-infrastructure/research.md
- Related ADRs: ADR-0004, ADR-0005
- Evaluator Evidence: specs/phase3-backend-ai-infrastructure/research.md
