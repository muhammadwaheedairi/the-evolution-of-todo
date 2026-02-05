# Backend Workspace Instructions - FastAPI with SQLModel

This workspace contains the FastAPI backend for the Todo Full-Stack Web Application.

## Technology Stack

- **Framework**: FastAPI 0.115+
- **Language**: Python 3.13+
- **Package Manager**: UV
- **ORM**: SQLModel (NOT raw SQLAlchemy)
- **Database**: PostgreSQL 16 (Neon Serverless production)
- **Authentication**: JWT tokens (python-jose) - Custom implementation (not using Better Auth)
- **Password Hashing**: bcrypt (passlib)
- **Migrations**: Alembic
- **Testing**: pytest, pytest-asyncio, httpx

## Critical Requirements

### SQLModel ORM Rules

1. **Use SQLModel, NOT raw SQLAlchemy**: All database models must be SQLModel classes
2. **Type Hints Required**: All functions, parameters, return values must be type-hinted
3. **Pydantic v2 Integration**: Schemas use Pydantic v2 features
4. **Relationships**: Define foreign keys and relationships properly
5. **Field Validation**: Use `Field()` constraints (min_length, max_length)

### Security Requirements (NON-NEGOTIABLE)

1. **User Data Isolation**: ALL queries MUST filter by `user_id`
2. **Authorization**: Verify `user_id` in URL matches authenticated user
3. **JWT Validation**: All protected endpoints require valid JWT from Better Auth
4. **404 (not 403)**: Return 404 for unauthorized access (prevent info leakage)
5. **Password Hashing**: Always use bcrypt, NEVER plaintext
6. **SQL Injection Prevention**: SQLModel parameterized queries (automatic)

## Project Structure

```
backend/
├── .env                           # Environment variables
├── .venv                          # Virtual environment
├── CLAUDE.md                      # Backend workspace instructions
├── alembic/                       # Database migration files
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                  # Migration history
│       └── 2026-01-29_5050a5c0f214_create_users_and_tasks_tables.py
├── alembic.ini                    # Alembic configuration
├── pyproject.toml                 # Project dependencies and configuration
├── run_migrations.py              # Migration runner script
└── src/                          # Source code
    ├── __pycache__/               # Compiled Python files
    ├── config.py                  # Configuration management
    ├── database.py                # Database connection and session management
    ├── main.py                    # FastAPI application entry point
    ├── middleware/                # Authentication middleware
    │   ├── __pycache__/
    │   └── auth.py                # JWT authentication middleware
    ├── models/                    # SQLModel database models
    │   ├── __pycache__/
    │   ├── task.py                # Task model
    │   └── user.py                # User model
    ├── routers/                   # API route definitions
    │   ├── __init__.py
    │   ├── __pycache__/
    │   ├── auth.py                # Authentication routes
    │   └── tasks.py               # Task management routes
    ├── schemas/                   # Pydantic request/response schemas
    │   ├── __pycache__/
    │   ├── auth.py                # Authentication schemas
    │   └── task.py                # Task schemas
    ├── services/                  # Business logic layer
    │   ├── __init__.py
    │   ├── __pycache__/
    │   ├── task_service.py        # Task business logic
    │   └── user_service.py        # User business logic
    └── utils/                     # Utility functions
        ├── __pycache__/
        ├── security.py            # Security utilities (hashing, JWT)
        └── validation.py          # Validation utilities
```

## Database Schema

### Tables

#### users (managed by the application)
- **id**: UUID (primary key)
- **email**: string (unique)
- **name**: string
- **password_hash**: string
- **created_at**: timestamp
- **updated_at**: timestamp

#### tasks
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id)
- **title**: string (not null)
- **description**: text (nullable)
- **completed**: boolean (default false)
- **created_at**: timestamp
- **updated_at**: timestamp

### Indexes
- tasks.user_id (for filtering by user)
- tasks.completed (for status filtering)

## REST API Endpoints

### Base URL
- **Development**: http://localhost:8000
- **Production**: https://api.example.com

### Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoint Details

#### POST /api/auth/register
Register a new user.

**Request Body:**
- name: string (required, 1-100 characters)
- email: string (required, valid email format)
- password: string (required, min 8 characters)

**Response:** User object with success message

#### POST /api/auth/login
Login existing user.

**Request Body:**
- email: string (required, valid email format)
- password: string (required, min 8 characters)

**Response:** JWT token and user object

#### GET /api/{user_id}/tasks
List all tasks for authenticated user.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)

**Query Parameters:**
- url_user_id: string (required, must match authenticated user ID for validation)

**Response:** Array of Task objects

#### POST /api/{user_id}/tasks
Create a new task.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)

**Query Parameters:**
- url_user_id: string (required, must match authenticated user ID for validation)

**Request Body:**
- title: string (required, 1-200 characters)
- description: string (optional, max 1000 characters)

**Response:** Created Task object

#### GET /api/{user_id}/tasks/{task_id}
Get task details for a specific task.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)
- task_id: integer (required, task ID)

**Query Parameters:**
- url_user_id: string (required, must match authenticated user ID for validation)

**Response:** Single Task object

#### PUT /api/{user_id}/tasks/{task_id}
Update a task.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)
- task_id: integer (required, task ID)

**Query Parameters:**
- url_user_id: string (required, must match authenticated user ID for validation)

**Request Body:**
- title: string (required, 1-200 characters)
- description: string (optional, max 1000 characters)

**Response:** Updated Task object

#### PATCH /api/{user_id}/tasks/{task_id}/complete
Toggle completion status.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)
- task_id: integer (required, task ID)

**Query Parameters:**
- url_user_id: string (required, must match authenticated user ID for validation)

**Request Body:**
- completed: boolean

**Response:** Updated Task object with new completion status

#### DELETE /api/{user_id}/tasks/{task_id}
Delete a task.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)
- task_id: integer (required, task ID)

**Query Parameters:**
- url_user_id: string (required, must match authenticated user ID for validation)

**Response:** Success confirmation (204 No Content)

## Database Models (SQLModel)

### User Model

The application manages its own user model instead of relying on Better Auth for database storage:

- **UserBase**: Contains common fields (name, email, password_hash)
- **User**: Database table model with UUID primary key, relationships to tasks
- **UserCreate**: Model for registration with email validation
- **UserRead**: Model for returning user data (excluding password)
- **UserUpdate**: Model for updating user information
- **UserLogin**: Model for authentication requests

### Task Model

The application uses SQLModel for task management:

- **TaskBase**: Contains common fields (title, description, completed)
- **Task**: Database table model with integer primary key and UUID user_id foreign key
- **TaskCreate**: Model for creating new tasks
- **TaskRead**: Model for returning task data
- **TaskUpdate**: Model for updating existing tasks
- **TaskUpdateStatus**: Model for updating completion status

## Pydantic Schemas

### Authentication Schemas

The application implements custom authentication with various request/response schemas:

- **RegisterRequest**: Schema for user registration (name, email, password)
- **RegisterResponse**: Schema for registration response with user details
- **LoginRequest**: Schema for user login (email, password)
- **LoginResponse**: Schema for login response with JWT token
- **TokenData**: Schema for JWT token payload
- **AuthenticatedUser**: Schema for authenticated user data
- **RefreshTokenRequest/Response**: Schemas for token refresh functionality
- **ChangePasswordRequest**: Schema for password change requests
- **ForgotPasswordRequest**: Schema for initiating password reset
- **ResetPasswordRequest**: Schema for completing password reset
- **UserProfileResponse**: Schema for user profile data
- **UpdateProfileRequest**: Schema for updating user profile information

### Task Schemas

The application defines various schemas for task management:

- **TaskBase**: Base schema with common fields (title, description)
- **TaskCreate**: Schema for creating new tasks
- **TaskUpdate**: Schema for updating existing tasks
- **TaskUpdateStatus**: Schema for updating completion status
- **TaskResponse**: Schema for returning task data
- **TaskListResponse**: Schema for returning lists of tasks
- **TaskDeleteResponse**: Schema for task deletion confirmation
- **TaskToggleCompletionRequest/Response**: Schemas for toggling completion status

## Security Utilities

### Security Utilities

The application implements security utilities for authentication:

- **Password hashing**: Uses bcrypt for secure password storage
- **JWT token creation**: Creates signed JWT tokens with configurable expiration
- **JWT token verification**: Validates tokens and checks for expiration
- **Password verification**: Compares plain text passwords against hashed versions

## Middleware for JWT Validation

The application implements JWT validation middleware for secure authentication. This includes:
- `get_current_user`: Retrieves the authenticated user from the JWT token in the Authorization header
- `verify_user_id_in_url_matches_authenticated_user`: Verifies that the user_id in the URL matches the authenticated user's ID to enforce user data isolation
- `get_current_active_user`: Gets the current active user with potential additional status checks

## API Endpoints Pattern

### Task Endpoints with User Isolation

The application implements secure task endpoints with proper user isolation:

- **list_tasks**: Retrieves all tasks for the authenticated user with proper filtering
- **create_task**: Creates new tasks associated with the authenticated user
- **get_task**: Retrieves a specific task after verifying user ownership
- **update_task**: Updates tasks after verifying user ownership
- **update_task_completion**: Toggles completion status after verifying user ownership
- **delete_task**: Deletes tasks after verifying user ownership

All endpoints enforce user isolation by verifying that the user_id in the URL matches the authenticated user's ID.

## Configuration Management

The application uses Pydantic BaseSettings for configuration management, loading settings from environment variables. Key configuration areas include:
- Database settings with DATABASE_URL
- Authentication settings with JWT secrets and algorithms
- App settings like name, version, and debug mode
- CORS settings for cross-origin resource sharing
- Security settings for password requirements and login attempts
- Rate limiting configuration
- API settings for routing and tagging

## Database Connection

The application establishes database connections using SQLModel with the following components:
- Database engine creation with the configured DATABASE_URL
- Session dependency for database operations
- Initialization function for creating database tables

## Testing Pattern

### Integration Test (User Isolation - CRITICAL)

The application includes integration tests to ensure user data isolation, particularly to verify that users cannot access other users' tasks. The critical test verifies that when a user attempts to access another user's tasks, the system returns a 404 (not found) instead of 403 (forbidden) to prevent information leakage about resource existence.


## Development Commands

```bash
# Run development server (hot reload)
uv run python -m src.main

# Alternative way to run development server
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src --cov-report=html

# Create migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Downgrade migration
uv run alembic downgrade -1
```

## Critical Checklist

Before deploying ANY endpoint:

- [ ] User data isolation: ALL queries filter by `user_id`
- [ ] Authorization: Verify `user_id` in URL matches authenticated user
- [ ] JWT validation: Protected endpoints require valid Better Auth token
- [ ] 404 (not 403): Unauthorized access returns 404
- [ ] Password hashing: NEVER store plaintext passwords
- [ ] Input validation: Use Pydantic schemas
- [ ] Type hints: All functions fully typed
- [ ] Tests: Unit + integration coverage
- [ ] User isolation test: Verify cross-user access returns 404

## Better Auth + FastAPI Integration

### The Challenge:
Better Auth is a JavaScript/TypeScript authentication library that runs on your Next.js frontend. However, your FastAPI backend is a separate Python service that needs to verify which user is making API requests.

### The Solution: JWT Tokens
Better Auth can be configured to issue JWT (JSON Web Token) tokens when users log in. These tokens are self-contained credentials that include user information and can be verified by any service that knows the secret key.

### How It Works
1. User logs in on Frontend → Better Auth creates a session and issues a JWT token
2. Frontend makes API call → Includes the JWT token in the Authorization: Bearer <token> header
3. Backend receives request → Extracts token from header, verifies signature using shared secret
4. Backend identifies user → Decodes token to get user ID, email, etc. and matches it with the user ID in the URL
5. Backend filters data → Returns only tasks belonging to that user

### What Needs to Change

| Component | Changes Required |
|-----------|------------------|
| Better Auth Config | Enable JWT plugin to issue tokens |
| Frontend API Client | Attach JWT token to every API request header |
| FastAPI Backend | Add middleware to verify JWT and extract user |
| API Routes | Filter all queries by the authenticated user's ID |

### The Shared Secret
Both frontend (Better Auth) and backend (FastAPI) must use the same secret key for JWT signing and verification. This is typically set via environment variable `BETTER_AUTH_SECRET` in both services.

### Security Benefits

| Benefit | Description |
|---------|-------------|
| User Isolation | Each user only sees their own tasks |
| Stateless Auth | Backend doesn't need to call frontend to verify users |
| Token Expiry | JWTs expire automatically (e.g., after 7 days) |
| No Shared DB Session | Frontend and backend can verify auth independently |

### API Behavior Change
After Auth:
- All endpoints require valid JWT token
- Requests without token receive 401 Unauthorized
- Each user only sees/modifies their own tasks
- Task ownership is enforced on every operation

## Relevant Skills

### fastapi-expert
- **Purpose**: Comprehensive FastAPI knowledge for building production-ready APIs from basic to planet-scale
- **When to use**: Building FastAPI applications, implementing REST APIs, setting up database operations with SQLModel, implementing authentication (OAuth2/JWT), deploying to Docker/Kubernetes, or needing guidance on middleware, WebSockets, background tasks, dependency injection, security, scalability, or performance optimization
- **Why it's relevant**: This skill provides comprehensive knowledge for building production-ready FastAPI applications with proper architecture, security, and scalability patterns

### sqlmodel-expert
- **Purpose**: Advanced SQLModel patterns and comprehensive database migrations with Alembic
- **When to use**: Creating SQLModel models, defining relationships (one-to-many, many-to-many, self-referential), setting up database migrations, optimizing queries, solving N+1 problems, implementing inheritance patterns, working with composite keys, creating indexes, performing data migrations, or troubleshooting Alembic issues
- **Why it's relevant**: Essential for working with SQLModel ORM, which is the required ORM for this project, and for handling database operations properly

## Reference Documentation

- FastAPI: https://fastapi.tiangolo.com/
- SQLModel: https://sqlmodel.tiangolo.com/
- Pydantic v2: https://docs.pydantic.dev/latest/
- Alembic: https://alembic.sqlalchemy.org/
- Better Auth: https://www.better-auth.com/docs
- python-jose: https://python-jose.readthedocs.io/