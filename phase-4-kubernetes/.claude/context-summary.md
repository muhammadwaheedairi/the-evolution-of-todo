# Technology Context Summary

## Current Project: Task CRUD Operations with Authentication

### Tech Stack
- **Frontend**: Next.js 16+, TypeScript 5.x, Tailwind CSS
- **Backend**: FastAPI, Python 3.13+, SQLModel ORM
- **Database**: PostgreSQL 16 (Neon Serverless)
- **Authentication**: Better Auth, JWT tokens
- **Containerization**: Docker, Docker Compose
- **Package Management**: UV (Python), npm (Node.js)

### Key Libraries & Frameworks
- **Frontend**:
  - Next.js App Router
  - Better Auth client
  - React Server Components
  - Tailwind CSS
- **Backend**:
  - FastAPI with async/await
  - SQLModel ORM
  - Pydantic v2
  - python-jose (JWT)
  - passlib[bcrypt] (password hashing)

### Architecture Patterns
- Full-stack web application (monorepo)
- Stateless authentication with JWT
- User data isolation via user_id filtering
- RESTful API design
- Server Components (default) + Client Components (when needed)

### Security Measures
- bcrypt password hashing
- JWT token validation
- User data isolation (all queries filter by user_id)
- 404 responses for unauthorized access (not 403)
- Environment variable management for secrets

### Development Workflow
- Next.js App Router patterns (async params/searchParams)
- FastAPI dependency injection
- SQLModel model relationships
- Alembic migrations
- Type-safe API contracts
