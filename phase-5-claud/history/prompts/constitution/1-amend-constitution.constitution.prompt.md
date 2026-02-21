---
id: 1
title: Amend Constitution
stage: constitution
date: 2026-01-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-task-crud-auth
user: muhammadwaheed
command: sp.constitution
labels: [constitution, governance, principles]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
---

## Prompt

```text
Project: Todo Full-Stack Web Application (Phase II)

Core Principles:
- Security First: All user data must be protected and isolated
- Stateless Design: Backend services should be horizontally scalable
- Type Safety: All data structures must be strictly typed
- API-First Architecture: Frontend and backend communicate only via REST API
- Database Integrity: All database operations must be transactional

Key Standards:
- Authentication: JWT-based auth required for all protected endpoints
- Authorization: User can only access their own tasks (enforced at API level)
- Error Handling: All API endpoints must return proper HTTP status codes
- Validation: All user inputs must be validated on both frontend and backend
- Response Format: All API responses must follow consistent JSON structure
- Password Security: All passwords must be hashed (never stored in plain text)
- Environment Variables: All secrets must be stored in .env files (never hardcoded)

Technical Constraints:
- Frontend Framework: Next.js 16+ with App Router (not Pages Router)
- Backend Framework: FastAPI with async/await
- Database: Neon Serverless PostgreSQL only
- ORM: SQLModel for all database operations
- Authentication Library: Better Auth (not NextAuth or custom)
- Styling: Tailwind CSS only (no inline styles, no CSS modules)
- TypeScript: Strict mode enabled on frontend
- Python Version: 3.11+

Code Quality Standards:
- All API endpoints must include proper error handling
- All database queries must use parameterized statements (no raw SQL)
- All functions must have descriptive names (no single letters except loops)
- All magic numbers must be defined as constants
- All async operations must be properly awaited
- No console.log in production code (use proper logging)
- All components must be properly typed (no 'any' types)

API Design Standards:
- All endpoints must follow REST conventions
- All endpoints must include user_id in path for user-specific resources
- All POST/PUT requests must validate request body
- All successful operations return appropriate status (200, 201, 204)
- All errors return proper error messages with status codes (400, 401, 404, 500)
- All endpoints must check JWT token validity before processing

Database Standards:
- All tables must have created_at and updated_at timestamps
- All foreign keys must have proper constraints
- All user-owned resources must have user_id foreign key
- All queries must filter by user_id for user-specific data
- No cascading deletes (explicit handling required)

Security Requirements:
- JWT tokens must expire within 7 days
- All passwords must be hashed with bcrypt
- All API requests must validate JWT token
- All database connections must use SSL
- All environment variables must be validated on startup
- CORS must be configured properly (no wildcard in production)
- Rate limiting should be considered for API endpoints

Deployment Standards:
- Frontend must deploy to Vercel
- Backend must be containerizable
- All environment variables must be documented in .env.example
- Database migrations must be version controlled
- All services must have health check endpoints

Success Criteria:
- Users can sign up and sign in successfully
- Each user can only see and manage their own tasks
- All CRUD operations work correctly
- JWT authentication works end-to-end
- Frontend and backend communicate properly via API
- Application works when deployed (not just locally)
- No security vulnerabilities in authentication flow
- Database properly isolates user data

Quality Gates:
- All API endpoints return proper status codes
- All forms validate user input before submission
- All errors show user-friendly messages
- Application handles network errors gracefully
- No TypeScript errors in frontend
- No Python type errors in backend
- Database schema matches SQLModel definitions
```

## Response snapshot

Updated the project constitution file (.specify/memory/constitution.md) to incorporate the new principles and standards provided. The constitution now includes:
- Updated Core Principles section with Security First, Stateless Design, Type Safety, API-First Architecture, and Database Integrity
- Added Key Standards section covering Authentication, Authorization, Error Handling, Validation, Response Format, Password Security, and Environment Variables
- Added Technical Constraints section detailing Frontend Framework, Backend Framework, Database, ORM, Authentication Library, Styling, TypeScript, and Python Version requirements
- Added Code Quality Standards section
- Added API Design Standards section
- Added Database Standards section
- Added Security Requirements section
- Added Deployment Standards section
- Added Success Criteria section
- Added Quality Gates section
- Updated version from 1.0.0 to 1.1.0 with today's date as the last amended date
- Included a sync impact report at the top of the file showing the changes made

## Outcome

- ✅ Impact: Constitution updated to version 1.1.0 with comprehensive principles and standards
- 🧪 Tests: N/A (no tests for constitution update)
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: N/A
- 🧠 Reflection: The constitution now properly reflects all the principles and standards specified by the user, providing a comprehensive governance document for the project.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A