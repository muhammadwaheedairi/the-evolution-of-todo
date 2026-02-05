# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan implements a complete task management system with user authentication as specified in the feature requirements. The implementation follows a full-stack web architecture with a Next.js 16+ frontend using App Router and a FastAPI backend with SQLModel ORM. The system ensures proper user data isolation through JWT-based authentication with Better Auth, where all API endpoints require valid tokens and all database queries filter by user_id. The architecture supports the seven core user stories: registration, login, view tasks, create task, update task, delete task, and toggle completion, with proper security measures including bcrypt password hashing, JWT token validation, and secure data isolation.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI (backend), Next.js 16+ (frontend), SQLModel (ORM), Better Auth (authentication), Tailwind CSS (styling)
**Storage**: PostgreSQL 16 (Neon Serverless)
**Testing**: pytest (backend), Jest/Playwright (frontend)
**Target Platform**: Web application (browser-based)
**Project Type**: web (determines source structure)
**Performance Goals**: Authentication requests complete in under 2 seconds, Task operations complete in under 1 second, Support 100 concurrent users
**Constraints**: All queries must filter by user_id, JWT tokens expire within 7 days, Passwords hashed with bcrypt, All API endpoints validate JWT tokens
**Scale/Scope**: Multi-user task management system with proper data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification

**Security First**:
- ✓ JWT authentication enforced on every API route
- ✓ Multi-user task isolation fully enforced (all queries filter by user_id)
- ✓ Data properly isolated by user_id
- ✓ Stateless authentication maintained with no shared sessions

**Stateless Design**:
- ✓ No shared sessions allowed; only stateless authentication using JWT tokens
- ✓ Frontend and backend share auth secrets via environment variables only

**Type Safety**:
- ✓ All data structures strictly typed
- ✓ All components properly typed (no 'any' types)
- ✓ Functions have descriptive names
- ✓ All async operations properly awaited

**API-First Architecture**:
- ✓ Frontend and backend communicate only via REST API
- ✓ All endpoints follow REST conventions
- ✓ All endpoints include user_id in path for user-specific resources
- ✓ All POST/PUT requests validate request body

**Database Integrity**:
- ✓ All database operations transactional
- ✓ All tables have created_at and updated_at timestamps
- ✓ All foreign keys have proper constraints
- ✓ All user-owned resources have user_id foreign key
- ✓ All queries filter by user_id for user-specific data
- ✓ No cascading deletes (explicit handling required)

**Authentication**:
- ✓ JWT-based auth required for all protected endpoints
- ✓ Better Auth with JWT-based tokens used

**Authorization**:
- ✓ Users can only access their own tasks (enforced at API level)
- ✓ All database queries filter by user_id
- ✓ Always verify user_id in URL matches authenticated user

**Technical Constraints**:
- ✓ Next.js 16+ with App Router (not Pages Router)
- ✓ FastAPI with async/await
- ✓ Neon Serverless PostgreSQL only
- ✓ SQLModel for all database operations
- ✓ Better Auth (not NextAuth or custom)
- ✓ Tailwind CSS only (no inline styles, no CSS modules)
- ✓ TypeScript strict mode enabled on frontend
- ✓ Python 3.11+ (actually 3.13+)

**Security Requirements**:
- ✓ JWT tokens expire within 7 days
- ✓ All passwords hashed with bcrypt
- ✓ All API requests validate JWT token
- ✓ All database connections use SSL
- ✓ CORS configured properly (no wildcard in production)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                # FastAPI app initialization
│   ├── config.py              # Environment variable management
│   ├── database.py            # Database connection, session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User SQLModel
│   │   └── task.py            # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py            # RegisterRequest, LoginRequest, etc.
│   │   └── task.py            # TaskCreate, TaskUpdate, TaskResponse
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py            # /api/auth/* endpoints
│   │   └── tasks.py           # /api/{user_id}/tasks/* endpoints
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py            # JWT validation middleware
│   └── utils/
│       ├── __init__.py
│       ├── security.py        # bcrypt, JWT utilities
│       └── deps.py            # Dependency injection
├── tests/
│   ├── conftest.py            # pytest fixtures
│   ├── unit/
│   │   ├── test_models.py
│   │   └── test_security.py
│   └── integration/
│       ├── test_auth.py
│       ├── test_tasks.py
│       └── test_user_isolation.py  # CRITICAL: Test data isolation
├── alembic/
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── pyproject.toml             # UV project configuration
└── .env                       # Environment variables

frontend/
├── app/                        # App Router (NOT pages/)
│   ├── layout.tsx             # Root layout (Server Component)
│   ├── page.tsx               # Home/dashboard page
│   ├── register/
│   │   └── page.tsx           # Registration page
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── tasks/
│   │   ├── page.tsx           # Task list page
│   │   ├── [id]/
│   │   │   └── page.tsx       # Task detail/edit page
│   │   └── new/
│   │       └── page.tsx       # Create task page
│   ├── error.tsx              # Global error boundary
│   └── loading.tsx            # Global loading state
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── TaskList.tsx           # Client Component (interactive)
│   ├── TaskItem.tsx           # Client Component (toggle, delete)
│   ├── TaskForm.tsx           # Client Component (form)
│   ├── RegisterForm.tsx       # Client Component (form)
│   ├── LoginForm.tsx          # Client Component (form)
│   └── EmptyState.tsx         # Server Component
├── lib/
│   ├── api.ts                 # Type-safe API client
│   ├── auth.ts                # Better Auth configuration
│   └── types.ts               # TypeScript interfaces
└── tests/
    ├── components/            # Jest component tests
    ├── integration/           # Integration tests
    └── e2e/                   # Playwright E2E tests
```

**Structure Decision**: Web application structure with separate backend (FastAPI) and frontend (Next.js) services following the monorepo pattern. This structure supports the required technology stack with clear separation of concerns between frontend and backend components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Phase Completion Status

**Phase 0 (Research)**: COMPLETE
- research.md created with all architectural decisions documented
- All technology choices justified and alternatives considered

**Phase 1 (Design & Contracts)**: COMPLETE
- data-model.md created with complete entity definitions
- API contracts created in /contracts/ directory (OpenAPI specification)
- quickstart.md created with setup instructions
- Agent context updated with new technology stack
