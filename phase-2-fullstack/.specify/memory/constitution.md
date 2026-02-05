<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Modified principles: Spec-Driven Development → Security First, Zero Manual Coding → Stateless Design, Deterministic and Reproducible Outputs → Type Safety, FastAPI + SQLModel Backend Standard → API-First Architecture, Neon Serverless PostgreSQL Persistence → Database Integrity
Added sections: Authentication, Authorization, Error Handling, Validation, Response Format, Password Security, Environment Variables, Technical Constraints, Code Quality Standards, API Design Standards, Database Standards, Security Requirements, Deployment Standards, Success Criteria, Quality Gates
Removed sections: N/A
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/commands/*.md ⚠ pending review
Runtime docs:
- README.md ⚠ pending review
Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### Security First
All user data must be protected and isolated. Security is the highest priority. JWT authentication must be enforced on every API route, with multi-user task isolation fully enforced. All data must be properly isolated by user_id, and stateless authentication must be maintained with no shared sessions.

### Stateless Design
Backend services should be horizontally scalable. No shared sessions are allowed; only stateless authentication using JWT tokens. The frontend and backend must share auth secrets via environment variables only.

### Type Safety
All data structures must be strictly typed. All components must be properly typed (no 'any' types). All functions must have descriptive names (no single letters except loops). All async operations must be properly awaited.

### API-First Architecture
Frontend and backend communicate only via REST API. All endpoints must follow REST conventions. All endpoints must include user_id in path for user-specific resources. All POST/PUT requests must validate request body.

### Database Integrity
All database operations must be transactional. All tables must have created_at and updated_at timestamps. All foreign keys must have proper constraints. All user-owned resources must have user_id foreign key. All queries must filter by user_id for user-specific data. No cascading deletes (explicit handling required).

## Key Standards

### Authentication
JWT-based auth required for all protected endpoints. Authentication must use Better Auth with JWT-based tokens. This ensures consistent authentication patterns across frontend and backend, with proper token validation and user session management.

### Authorization
User can only access their own tasks (enforced at API level). All database queries MUST filter by user_id. ALWAYS verify user_id in URL matches authenticated user.

### Error Handling
All API endpoints must return proper HTTP status codes. All API endpoints must include proper error handling. All errors return proper error messages with status codes (400, 401, 404, 500).

### Validation
All user inputs must be validated on both frontend and backend. All POST/PUT requests must validate request body. All forms validate user input before submission.

### Response Format
All API responses must follow consistent JSON structure. All successful operations return appropriate status (200, 201, 204).

### Password Security
All passwords must be hashed (never stored in plain text). All passwords must be hashed with bcrypt. Never store plaintext passwords (use bcrypt).

### Environment Variables
All secrets must be stored in .env files (never hardcoded). All environment variables must be validated on startup. All secrets must be stored in .env files (never hardcoded).

## Technical Constraints

### Frontend Framework
Frontend Framework: Next.js 16+ with App Router (not Pages Router). Frontend must be built using Next.js 16+ App Router. This ensures modern React development patterns, server-side rendering capabilities, and consistent component architecture. Use Server Components (no 'use client') as default, Client Components only for interactivity (forms, onClick, useState).

### Backend Framework
Backend Framework: FastAPI with async/await. Backend must be built using Python FastAPI. This ensures high-performance, type-safe API development with automatic OpenAPI documentation generation.

### Database
Database: Neon Serverless PostgreSQL only. All data must be persisted in Neon Serverless PostgreSQL database. This ensures scalable, reliable storage with serverless benefits and proper integration with the SQLModel ORM.

### ORM
ORM: SQLModel for all database operations. All backend logic must be implemented using Python FastAPI with SQLModel ORM. This ensures consistency in backend architecture, proper type hints, and standardized API patterns across all services.

### Authentication Library
Authentication Library: Better Auth (not NextAuth or custom). Authentication must use Better Auth with JWT-based tokens. This ensures consistent authentication patterns across frontend and backend, with proper token validation and user session management.

### Styling
Styling: Tailwind CSS only (no inline styles, no CSS modules).

### TypeScript
TypeScript: Strict mode enabled on frontend.

### Python Version
Python Version: 3.11+.

## Code Quality Standards

All API endpoints must include proper error handling. All database queries must use parameterized statements (no raw SQL). All functions must have descriptive names (no single letters except loops). All magic numbers must be defined as constants. All async operations must be properly awaited. No console.log in production code (use proper logging). All components must be properly typed (no 'any' types).

## API Design Standards

All endpoints must follow REST conventions. All endpoints must include user_id in path for user-specific resources. All POST/PUT requests must validate request body. All successful operations return appropriate status (200, 201, 204). All errors return proper error messages with status codes (400, 401, 404, 500). All endpoints must check JWT token validity before processing.

## Database Standards

All tables must have created_at and updated_at timestamps. All foreign keys must have proper constraints. All user-owned resources must have user_id foreign key. All queries must filter by user_id for user-specific data. No cascading deletes (explicit handling required).

## Security Requirements

JWT tokens must expire within 7 days. All passwords must be hashed with bcrypt. All API requests must validate JWT token. All database connections must use SSL. All environment variables must be validated on startup. CORS must be configured properly (no wildcard in production). Rate limiting should be considered for API endpoints. JWT Tokens: Use shared secret (BETTER_AUTH_SECRET) between frontend and backend.

## Deployment Standards

Frontend must deploy to Vercel. Backend must be containerizable. All environment variables must be documented in .env.example. Database migrations must be version controlled. All services must have health check endpoints.

## Success Criteria

Users can sign up and sign in successfully. Each user can only see and manage their own tasks. All CRUD operations work correctly. JWT authentication works end-to-end. Frontend and backend communicate properly via API. Application works when deployed (not just locally). No security vulnerabilities in authentication flow. Database properly isolates user data.

## Quality Gates

All API endpoints return proper status codes. All forms validate user input before submission. All errors show user-friendly messages. Application handles network errors gracefully. No TypeScript errors in frontend. No Python type errors in backend. Database schema matches SQLModel definitions.

## Development Workflow

### Agentic Dev Stack Adherence
All development must follow the Agentic Dev Stack workflow: spec → plan → tasks → implementation. Each phase must be completed before moving to the next, with proper documentation and validation at each step.

### Spec-Driven Development
Spec-driven development (spec → plan → tasks → implementation) is mandatory. All features must begin with a clear specification that defines scope, requirements, acceptance criteria, and success metrics before any implementation begins.

### Success Criteria Enforcement
Success criteria must be met before considering any feature complete:
- Multi-user task isolation fully enforced
- All REST endpoints secured and functional
- Frontend communicates only via authenticated API calls
- Project follows Agentic Dev Stack workflow end-to-end
- Users can sign up and sign in successfully
- Each user can only see and manage their own tasks
- All CRUD operations work correctly
- JWT authentication works end-to-end
- Frontend and backend communicate properly via API
- Application works when deployed (not just locally)
- No security vulnerabilities in authentication flow
- Database properly isolates user data

## Governance

All development activities must comply with these constitutional principles. Any deviation requires formal amendment to this constitution with proper justification and approval. All pull requests and code reviews must verify compliance with these principles before approval.

**Version**: 1.1.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-28