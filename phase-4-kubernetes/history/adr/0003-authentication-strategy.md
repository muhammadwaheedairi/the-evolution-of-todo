# ADR-0003: Authentication Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-28
- **Feature:** Task CRUD Operations with Authentication
- **Context:** Need to implement a secure, scalable authentication system that ensures user data isolation and works seamlessly between the Next.js frontend and FastAPI backend.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will adopt a Better Auth + JWT authentication strategy with the following components:
- **Frontend Authentication**: Better Auth client with JWT plugin
- **Backend Authentication**: JWT token verification using python-jose
- **Token Management**: Stateful JWT tokens with 7-day expiration
- **Password Security**: bcrypt hashing with salt rounds
- **User Isolation**: All API endpoints validate user_id in URL matches authenticated user
- **Session Management**: Stateless authentication with JWT tokens only

## Consequences

### Positive

- Strong security with established authentication patterns
- Stateless architecture enabling horizontal scalability
- User data isolation through user_id validation in all requests
- Comprehensive security features from Better Auth
- Social login capabilities available for future expansion
- No shared session state between services
- Consistent authentication across frontend and backend

### Negative

- Complexity of managing JWT token lifecycle
- Need for proper token refresh mechanisms
- Potential for token theft if not properly secured
- Additional complexity for implementing token revocation
- Dependency on Better Auth library maintenance
- Need for secure storage of JWT secrets

## Alternatives Considered

Alternative A: Custom JWT implementation
- Why rejected: Security risk, reinventing wheel, increased maintenance burden

Alternative B: NextAuth.js with FastAPI backend
- Why rejected: Not compatible with FastAPI backend, would require additional adapters

Alternative C: Session-based authentication with server-side storage
- Why rejected: Violates constitutional stateless requirement, limits scalability

Alternative D: Third-party authentication services (Auth0, Firebase Auth)
- Why rejected: Vendor lock-in concerns, potential costs, reduced control over authentication flow

## References

- Feature Spec: specs/001-task-crud-auth/spec.md
- Implementation Plan: specs/001-task-crud-auth/plan.md
- Related ADRs: ADR-0001, ADR-0002, ADR-0004
- Evaluator Evidence: specs/001-task-crud-auth/research.md
