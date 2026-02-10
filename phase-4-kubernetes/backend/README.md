# ⚙️ TaskFlow AI - Backend Documentation

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![SQLModel](https://img.shields.io/badge/SQLModel-0.0.22-red?style=flat-square)

**FastAPI backend with AI agent orchestration and MCP tools**

[Overview](#-overview) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Endpoints](#-api-endpoints) • [MCP Tools](#-mcp-tools)

</div>

---

## 📋 Overview

The backend is a modern Python application built with FastAPI, featuring RESTful API endpoints for task management and an AI-powered conversational interface using OpenAI Agents SDK with Model Context Protocol (MCP) tools. It demonstrates best practices for API design, database management, authentication, and AI agent integration.

### Key Features

- ✅ **FastAPI Framework** - Modern, fast Python web framework
- 🗄️ **SQLModel ORM** - Type-safe database operations
- 🔐 **Custom JWT Authentication** - Secure token-based auth
- 🔒 **Argon2 Password Hashing** - OWASP recommended security
- 🤖 **OpenAI Agents SDK** - AI agent orchestration
- 🛠️ **MCP Tools** - Standardized tool protocol
- 📊 **PostgreSQL Database** - Reliable data persistence
- 🔄 **Alembic Migrations** - Database version control
- 🎯 **User Isolation** - Complete data separation
- 📝 **Type Hints** - Full Python type safety

---

## 🏗️ Architecture

### Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.115+ | Web framework |
| **Language** | Python | 3.13+ | Programming language |
| **ORM** | SQLModel | 0.0.22 | Database ORM |
| **Database** | PostgreSQL | 16 | Data storage |
| **Auth** | python-jose | Latest | JWT handling |
| **Hashing** | argon2-cffi | Latest | Password security |
| **AI** | OpenAI Agents SDK | 0.8.1 | Agent orchestration |
| **LLM Gateway** | LiteLLM | Latest | Multi-model support |
| **Migrations** | Alembic | Latest | Schema versioning |
| **Server** | Uvicorn | Latest | ASGI server |
| **Validation** | Pydantic | 2.0+ | Data validation |

### Project Structure

```
backend/
├── src/                          # Source code
│   ├── main.py                  # FastAPI application entry
│   ├── config.py                # Configuration management
│   ├── database.py              # Database connection
│   │
│   ├── models/                  # SQLModel database models
│   │   ├── user.py             # User model
│   │   ├── task.py             # Task model
│   │   ├── conversation.py     # Conversation model (Phase 3)
│   │   └── message.py          # Message model (Phase 3)
│   │
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── auth.py             # Authentication schemas
│   │   ├── task.py             # Task schemas
│   │   └── chat.py             # Chat schemas (Phase 3)
│   │
│   ├── routers/                 # API route handlers
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── tasks.py            # Task management endpoints
│   │   └── chat.py             # Chat endpoint (Phase 3)
│   │
│   ├── services/                # Business logic layer
│   │   ├── user_service.py     # User operations
│   │   ├── task_service.py     # Task operations
│   │   ├── conversation_service.py  # Conversation management
│   │   └── message_service.py  # Message management
│   │
│   ├── mcp/                     # MCP Server (Phase 3)
│   │   ├── server.py           # MCP server initialization
│   │   ├── tools.py            # Tool definitions (5 tools)
│   │   └── config.py           # MCP configuration
│   │
│   ├── middleware/              # Request middleware
│   │   └── auth.py             # JWT authentication
│   │
│   └── utils/                   # Utility functions
│       ├── security.py         # Security utilities
│       ├── validation.py       # Input validation
│       └── agent.py            # AI agent utilities
│
├── alembic/                     # Database migrations
│   ├── env.py                  # Alembic environment
│   ├── script.py.mako          # Migration template
│   └── versions/               # Migration files
│       └── 2026-01-29_*.py    # Initial migration
│
├── tests/                       # Test suite (planned)
├── .env                         # Environment variables
├── alembic.ini                  # Alembic configuration
├── pyproject.toml              # Project dependencies
├── run_migrations.py           # Migration runner
└── README.md                   # This file
```

### Architectural Layers

**1. API Layer (Routers)**
- Handle HTTP requests and responses
- Input validation via Pydantic schemas
- Authentication via middleware
- Route to appropriate services

**2. Service Layer**
- Business logic implementation
- Database operations via SQLModel
- User isolation enforcement
- Error handling and validation

**3. Data Layer (Models)**
- SQLModel database models
- Relationships and constraints
- Type-safe database operations
- Automatic schema generation

**4. AI Layer (Phase 3)**
- OpenAI Agent orchestration
- MCP tool execution
- Conversation management
- Natural language processing

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.13+ (recommended: 3.14)
- **PostgreSQL** 16+ (or Neon account)
- **pip** or **uv** package manager
- **OpenRouter API Key** (for AI features)

### Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -e .
```

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

**Database Configuration:**
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Neon: Use serverless connection string

**Authentication Configuration:**
- `JWT_SECRET_KEY` - Secret key for JWT signing (32+ characters)
- `JWT_ALGORITHM` - Algorithm for JWT (default: HS256)
- `JWT_EXPIRATION_DAYS` - Token expiration (default: 7)

**AI Configuration (Phase 3):**
- `OPENROUTER_API_KEY` - OpenRouter API key for AI models
- `OPENAI_BASE_URL` - API base URL (default: https://openrouter.ai/api/v1)
- `OPENAI_MODEL` - Model to use (default: openai/gpt-oss-120b:free)

**Application Configuration:**
- `APP_NAME` - Application name
- `APP_VERSION` - Application version
- `DEBUG` - Debug mode (true/false)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

### Database Setup

```bash
# Run database migrations
alembic upgrade head

# Verify migration status
alembic current

# Create new migration (if needed)
alembic revision --autogenerate -m "description"
```

### Development Server

```bash
# Start development server with hot reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Server will start at http://localhost:8000
# API documentation at http://localhost:8000/docs
```

### Available Commands

| Command | Description |
|---------|-------------|
| `uvicorn src.main:app --reload` | Start development server |
| `alembic upgrade head` | Apply all migrations |
| `alembic downgrade -1` | Rollback one migration |
| `alembic current` | Show current migration |
| `alembic history` | Show migration history |
| `pytest tests/ -v` | Run tests (when implemented) |
| `pytest --cov=src` | Run tests with coverage |

---

## 🔌 API Endpoints

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://muhammadwaheedairi-taskflow-backend-ai.hf.space`

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Authentication Endpoints

#### POST /api/auth/register
**Purpose:** Register new user account

**Request Body:**
- `name` (string, required) - User's full name (1-100 characters)
- `email` (string, required) - Valid email address
- `password` (string, required) - Password (minimum 8 characters)

**Response:** 201 Created
- User object with id, name, email, created_at
- Password hash not included in response

**Error Responses:**
- 400 Bad Request - Invalid input or email already exists
- 422 Unprocessable Entity - Validation errors

#### POST /api/auth/login
**Purpose:** Authenticate user and receive JWT token

**Request Body:**
- `email` (string, required) - User's email address
- `password` (string, required) - User's password

**Response:** 200 OK
- `access_token` (string) - JWT token for authentication
- `token_type` (string) - Always "bearer"
- `user` (object) - User details (id, name, email)

**Error Responses:**
- 401 Unauthorized - Invalid credentials
- 422 Unprocessable Entity - Validation errors

### Task Management Endpoints

**Authentication Required:** All task endpoints require JWT token in Authorization header.

#### GET /api/{user_id}/tasks
**Purpose:** List all tasks for authenticated user

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user

**Query Parameters:**
- `status` (string, optional) - Filter by status: "all", "pending", "completed"

**Response:** 200 OK
- Array of task objects

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - user_id mismatch
- 404 Not Found - User not found

#### POST /api/{user_id}/tasks
**Purpose:** Create new task

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user

**Request Body:**
- `title` (string, required) - Task title (1-200 characters)
- `description` (string, optional) - Task description (max 1000 characters)

**Response:** 201 Created
- Created task object with id, user_id, title, description, completed, timestamps

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - user_id mismatch
- 422 Unprocessable Entity - Validation errors

#### GET /api/{user_id}/tasks/{task_id}
**Purpose:** Get specific task details

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user
- `task_id` (integer, required) - Task ID

**Response:** 200 OK
- Task object

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 404 Not Found - Task not found or doesn't belong to user

#### PUT /api/{user_id}/tasks/{task_id}
**Purpose:** Update task details

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user
- `task_id` (integer, required) - Task ID

**Request Body:**
- `title` (string, optional) - New task title
- `description` (string, optional) - New task description

**Response:** 200 OK
- Updated task object

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 404 Not Found - Task not found or doesn't belong to user
- 422 Unprocessable Entity - Validation errors

#### PATCH /api/{user_id}/tasks/{task_id}/complete
**Purpose:** Toggle task completion status

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user
- `task_id` (integer, required) - Task ID

**Request Body:**
- `completed` (boolean, required) - New completion status

**Response:** 200 OK
- Updated task object with new completion status

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 404 Not Found - Task not found or doesn't belong to user

#### DELETE /api/{user_id}/tasks/{task_id}
**Purpose:** Delete task permanently

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user
- `task_id` (integer, required) - Task ID

**Response:** 204 No Content
- Empty response body

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 404 Not Found - Task not found or doesn't belong to user

### Chat Endpoints (Phase 3)

#### POST /api/{user_id}/chat
**Purpose:** Send message to AI agent and receive response

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user

**Request Body:**
- `conversation_id` (integer, optional) - Existing conversation ID (creates new if not provided)
- `message` (string, required) - User's natural language message

**Response:** 200 OK
- `conversation_id` (integer) - Conversation ID for this session
- `response` (string) - AI agent's conversational response
- `tool_calls` (array) - List of MCP tools executed (e.g., ["add_task", "list_tasks"])

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - user_id mismatch
- 422 Unprocessable Entity - Validation errors
- 500 Internal Server Error - AI agent error

#### GET /api/{user_id}/conversations/history
**Purpose:** Retrieve conversation history

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user

**Query Parameters:**
- `conversation_id` (integer, optional) - Specific conversation (returns all if not provided)

**Response:** 200 OK
- Array of message objects with role, content, timestamp

**Error Responses:**
- 401 Unauthorized - Invalid or missing token
- 404 Not Found - Conversation not found

#### DELETE /api/{user_id}/conversations/clear
**Purpose:** Clear all conversation history

**Path Parameters:**
- `user_id` (UUID, required) - Must match authenticated user

**Response:** 204 No Content
- Empty response body

**Error Responses:**
- 401 Unauthorized - Invalid or missing token

---

## 🗄️ Database Models

### User Model

**Table:** `users`

**Purpose:** Store user accounts with authentication credentials

**Fields:**
- `id` (UUID) - Primary key, auto-generated
- `email` (VARCHAR 255) - Unique, indexed, required
- `name` (VARCHAR 100) - User's full name, required
- `password_hash` (VARCHAR 255) - Argon2 hashed password, required
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time

**Relationships:**
- One-to-many with tasks
- One-to-many with conversations

**Indexes:**
- Primary key on `id`
- Unique index on `email`

### Task Model

**Table:** `tasks`

**Purpose:** Store user tasks with completion status

**Fields:**
- `id` (INTEGER) - Primary key, auto-increment
- `user_id` (UUID) - Foreign key to users.id, indexed, required
- `title` (VARCHAR 200) - Task title, required
- `description` (VARCHAR 1000) - Task description, optional
- `completed` (BOOLEAN) - Completion status, default false
- `created_at` (TIMESTAMP) - Task creation time
- `updated_at` (TIMESTAMP) - Last update time

**Relationships:**
- Many-to-one with users

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `completed` for filtering

**Constraints:**
- Foreign key constraint on `user_id` (CASCADE delete)
- NOT NULL constraint on `title`

### Conversation Model (Phase 3)

**Table:** `conversations`

**Purpose:** Track conversation sessions for chat interface

**Fields:**
- `id` (INTEGER) - Primary key, auto-increment
- `user_id` (UUID) - Foreign key to users.id, indexed, required
- `created_at` (TIMESTAMP) - Conversation start time
- `updated_at` (TIMESTAMP) - Last message time

**Relationships:**
- Many-to-one with users
- One-to-many with messages

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`

**Constraints:**
- Foreign key constraint on `user_id` (CASCADE delete)

### Message Model (Phase 3)

**Table:** `messages`

**Purpose:** Store individual messages in conversations

**Fields:**
- `id` (INTEGER) - Primary key, auto-increment
- `user_id` (UUID) - Foreign key to users.id, indexed, required
- `conversation_id` (INTEGER) - Foreign key to conversations.id, indexed, required
- `role` (VARCHAR 20) - Message role: "user" or "assistant", required
- `content` (TEXT) - Message content, required
- `created_at` (TIMESTAMP) - Message timestamp

**Relationships:**
- Many-to-one with users
- Many-to-one with conversations

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Foreign key index on `conversation_id`

**Constraints:**
- Foreign key constraint on `user_id` (CASCADE delete)
- Foreign key constraint on `conversation_id` (CASCADE delete)
- NOT NULL constraint on `role` and `content`

---

## 🛠️ MCP Tools (Phase 3)

### Tool Architecture

All MCP tools are wrappers around existing service layer functions, ensuring code reuse and consistency. Each tool validates user_id before execution and returns standardized responses for the AI agent.

### Available Tools

#### add_task
**Purpose:** Create a new task for the user

**Parameters:**
- `user_id` (string, required) - Authenticated user's UUID
- `title` (string, required) - Task title (1-200 characters)
- `description` (string, optional) - Task description (max 1000 characters)

**Returns:**
- `task_id` (integer) - Created task ID
- `status` (string) - "created"
- `title` (string) - Task title
- `message` (string) - User-friendly confirmation

**Service Function:** `task_service.create_task()`

#### list_tasks
**Purpose:** Retrieve tasks filtered by status

**Parameters:**
- `user_id` (string, required) - Authenticated user's UUID
- `status` (string, optional) - Filter: "all", "pending", "completed" (default: "all")

**Returns:**
- Array of task objects with id, title, description, completed, created_at
- `count` (integer) - Number of tasks returned
- `status_filter` (string) - Applied filter

**Service Function:** `task_service.get_tasks()`

#### complete_task
**Purpose:** Mark a task as completed

**Parameters:**
- `user_id` (string, required) - Authenticated user's UUID
- `task_id` (integer, required) - Task ID to complete

**Returns:**
- `task_id` (integer) - Completed task ID
- `status` (string) - "completed"
- `title` (string) - Task title
- `message` (string) - User-friendly confirmation

**Service Function:** `task_service.update_task_status()`

#### delete_task
**Purpose:** Remove a task permanently

**Parameters:**
- `user_id` (string, required) - Authenticated user's UUID
- `task_id` (integer, required) - Task ID to delete

**Returns:**
- `task_id` (integer) - Deleted task ID
- `status` (string) - "deleted"
- `title` (string) - Original task title
- `message` (string) - User-friendly confirmation

**Service Function:** `task_service.delete_task()`

#### update_task
**Purpose:** Modify task title or description

**Parameters:**
- `user_id` (string, required) - Authenticated user's UUID
- `task_id` (integer, required) - Task ID to update
- `title` (string, optional) - New task title
- `description` (string, optional) - New task description

**Returns:**
- `task_id` (integer) - Updated task ID
- `status` (string) - "updated"
- `title` (string) - New task title
- `message` (string) - User-friendly confirmation

**Service Function:** `task_service.update_task()`

### Tool Execution Flow

1. AI agent receives natural language message
2. Agent determines intent and selects appropriate tool
3. Agent extracts parameters from user message
4. Tool validates user_id parameter
5. Tool calls corresponding service function
6. Service function performs database operation
7. Tool formats response for agent
8. Agent generates conversational response
9. Response returned to user with tool execution details

---

## 🤖 AI Agent Integration (Phase 3)

### OpenAI Agents SDK

The backend uses OpenAI Agents SDK for AI agent orchestration with LiteLLM for multi-model support.

**Current Configuration:**
- **Model**: OpenRouter free model (openai/gpt-oss-120b:free)
- **API**: OpenRouter API (not direct OpenAI)
- **Tools**: 5 MCP tools for task management
- **Context**: Conversation history loaded from database

### System Prompt

The AI agent is configured with a system prompt that defines its behavior:

**Role:** Task management assistant

**Capabilities:**
- Create tasks from natural language
- List tasks with filtering
- Complete tasks
- Delete tasks
- Update task details

**Behavior:**
- Friendly and conversational responses
- Confirm actions with clear messages
- Ask for clarification when needed
- Provide helpful examples

### Conversation Management

**Current Implementation:**
- In-memory storage using dictionary
- Stores last 50 messages per user
- Lost on server restart

**Planned Implementation:**
- Database persistence using conversation and message models
- Stateless architecture (no server memory)
- Full history retrieval on each request
- Horizontal scaling support

### Natural Language Processing

The agent understands various natural language patterns:

**Task Creation:**
- "add task buy groceries"
- "I need to remember to pay bills"
- "create a task for meeting tomorrow"

**Task Listing:**
- "show me all tasks"
- "what's pending?"
- "list completed tasks"

**Task Completion:**
- "mark task 3 as done"
- "complete the grocery task"
- "I finished task 5"

**Task Deletion:**
- "delete task 2"
- "remove the meeting task"
- "get rid of task 7"

**Task Updates:**
- "change task 1 to 'call mom tonight'"
- "update task 3 description"
- "rename task 5"

---

## 🔐 Authentication System

### JWT Token Flow

1. User registers or logs in via authentication endpoints
2. Backend validates credentials against database
3. Backend generates JWT token with user_id in payload
4. Token signed with secret key from environment
5. Token returned to client with 7-day expiration
6. Client includes token in Authorization header for all requests
7. Middleware validates token on every protected endpoint
8. Middleware extracts user_id from token payload
9. Endpoint verifies user_id in URL matches token user_id
10. Database queries filtered by authenticated user_id

### Password Security

**Hashing Algorithm:** Argon2 (OWASP recommended)

**Benefits:**
- Memory-hard algorithm (resistant to GPU attacks)
- Configurable time and memory costs
- Winner of Password Hashing Competition
- Superior to bcrypt and PBKDF2

**Configuration:**
- Time cost: 2 iterations
- Memory cost: 65536 KB
- Parallelism: 4 threads
- Hash length: 32 bytes

### User Isolation

**Critical Security Requirement:** All database queries MUST filter by user_id

**Enforcement Points:**
1. Middleware validates JWT token
2. Endpoint verifies user_id in URL matches authenticated user
3. Service layer filters all queries by user_id
4. Database returns only user's own data
5. Unauthorized access returns 404 (not 403) to prevent information leakage

**Protected Resources:**
- Tasks (user can only see/modify their own)
- Conversations (user can only access their own)
- Messages (user can only view their own)

---

## 🧪 Testing

### Testing Strategy

The application follows a comprehensive testing approach:

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Security Tests** - User isolation verification
- **AI Tests** - Natural language processing

### Critical Test Scenarios

**User Isolation Tests:**
- Verify users cannot access other users' tasks
- Verify users cannot access other users' conversations
- Verify 404 response (not 403) for unauthorized access
- Verify JWT token validation

**Task Management Tests:**
- Create, read, update, delete operations
- Task filtering by status
- Completion toggle
- Input validation

**Chat Interface Tests (Phase 3):**
- Natural language task creation
- Intent recognition accuracy
- Tool execution verification
- Conversation persistence
- Error handling

**Authentication Tests:**
- Registration with valid/invalid data
- Login with correct/incorrect credentials
- Token expiration handling
- Password hashing verification

---

## 🐛 Troubleshooting

### Common Issues

#### Database connection errors
**Symptoms:** Application fails to start, connection timeout

**Solutions:**
- Verify PostgreSQL is running
- Check DATABASE_URL format is correct
- For Neon: Use serverless connection string
- Verify network connectivity to database
- Check database credentials are correct

#### Migration errors
**Symptoms:** Alembic fails to apply migrations

**Solutions:**
- Check database connection is working
- Verify alembic.ini configuration
- Try downgrading and re-upgrading
- Check for conflicting migrations
- Review migration file for errors

#### JWT token validation fails
**Symptoms:** 401 Unauthorized on all protected endpoints

**Solutions:**
- Verify JWT_SECRET_KEY is set correctly
- Check token is being sent in Authorization header
- Verify token format: "Bearer <token>"
- Check token hasn't expired (7-day limit)
- Verify JWT_ALGORITHM matches (HS256)

#### AI agent not responding
**Symptoms:** Chat endpoint returns errors

**Solutions:**
- Verify OPENROUTER_API_KEY is valid
- Check API key has available credits
- Verify model is available (free models may have limits)
- Check network connectivity to OpenRouter
- Review agent logs for specific errors

#### User isolation not working
**Symptoms:** Users can see other users' data

**Solutions:**
- Verify all service functions filter by user_id
- Check middleware is validating user_id correctly
- Review database queries for missing filters
- Test with multiple user accounts
- Check endpoint authorization logic

---

## 🐳 Docker & Kubernetes Deployment (Phase 4)

### Docker Containerization

The backend is containerized using a multi-stage Docker build for optimal image size and security.

#### Dockerfile Structure

**Location:** `backend/Dockerfile`

```dockerfile
# Build stage - Install dependencies
FROM python:3.13-slim AS builder
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir uv && \
    uv pip install --system --no-cache -r pyproject.toml

# Runtime stage - Minimal production image
FROM python:3.13-slim
WORKDIR /app
RUN useradd -m -u 1001 appuser
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --chown=appuser:appuser ./src ./src
COPY --chown=appuser:appuser ./alembic ./alembic
COPY --chown=appuser:appuser ./alembic.ini ./alembic.ini
USER appuser
EXPOSE 8000
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Features:**
- **Multi-stage build**: Separates dependency installation from runtime
- **Non-root user**: Runs as `appuser` (UID 1001) for security
- **Slim base**: Uses python:3.13-slim for smaller images
- **UV package manager**: Fast dependency installation
- **Layer caching**: Optimized for faster rebuilds
- **Unbuffered output**: Immediate log visibility

#### Building Docker Image

```bash
# Navigate to backend directory
cd backend

# Build image locally
docker build -t todo-backend:latest .

# Build for Minikube (use Minikube's Docker daemon)
eval $(minikube docker-env)
docker build -t todo-backend:latest .

# Verify image
docker images | grep todo-backend
```

#### Running Container Locally

```bash
# Run container with environment variables
docker run -p 8000:8000 \
  -e DATABASE_URL='postgresql://user:pass@host/db' \
  -e JWT_SECRET_KEY='your-secret-key' \
  -e JWT_ALGORITHM='HS256' \
  -e OPENROUTER_API_KEY='your-api-key' \
  todo-backend:latest

# Access API documentation
open http://localhost:8000/docs
```

### Kubernetes Deployment

The backend is deployed to Kubernetes using Helm charts for declarative infrastructure management.

#### Helm Chart Structure

**Location:** `helm/templates/backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.backend.replicas }}
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: {{ .Values.backend.image }}:{{ .Values.backend.tag }}
        imagePullPolicy: {{ .Values.backend.imagePullPolicy }}
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: DATABASE_URL
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: JWT_SECRET_KEY
        - name: JWT_ALGORITHM
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: JWT_ALGORITHM
        - name: ACCESS_TOKEN_EXPIRE_DAYS
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: ACCESS_TOKEN_EXPIRE_DAYS
        - name: OPENROUTER_API_KEY
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: OPENROUTER_API_KEY
        - name: UV_ENVIRONMENT
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: UV_ENVIRONMENT
        - name: LOG_LEVEL
          value: "info"
        resources:
          requests:
            memory: {{ .Values.backend.resources.requests.memory }}
            cpu: {{ .Values.backend.resources.requests.cpu }}
          limits:
            memory: {{ .Values.backend.resources.limits.memory }}
            cpu: {{ .Values.backend.resources.limits.cpu }}
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
```

#### Kubernetes Service

**Location:** `helm/templates/backend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: {{ .Values.namespace }}
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
```

**Note:** Backend uses ClusterIP (internal only) since it's accessed by frontend within the cluster.

#### Health Check Endpoints

The backend includes dedicated health check endpoints for Kubernetes probes:

**Liveness Probe - `/health`:**
```python
@router.get("/health")
async def health_check():
    """
    Liveness probe endpoint.
    Returns 200 if the service process is alive and running.
    """
    return {"status": "healthy"}
```

**Readiness Probe - `/ready`:**
```python
@router.get("/ready")
async def readiness_check():
    """
    Readiness probe endpoint.
    Returns 200 if the service is ready to accept traffic.
    Verifies database connectivity.
    """
    try:
        with Session(engine) as session:
            session.exec(select(1)).first()
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database unavailable: {str(e)}"
        )
```

**Probe Configuration:**
- **Liveness**: Checks if process is running (simple health check)
- **Readiness**: Checks if database is accessible (verifies dependencies)
- **Initial Delay**: 30s for liveness, 10s for readiness
- **Period**: 10s for liveness, 5s for readiness

#### Deployment Steps

**Prerequisites:**
- Minikube running with sufficient resources (4 CPU, 8GB RAM)
- Docker images built and available in Minikube's Docker daemon
- Kubernetes secrets created with required credentials

**Deploy to Minikube:**

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Use Minikube's Docker daemon
eval $(minikube docker-env)

# 3. Build backend image
cd backend
docker build -t todo-backend:latest .

# 4. Create namespace
kubectl create namespace todo-app

# 5. Create secrets with all required environment variables
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://neondb_owner:password@host/neondb?sslmode=require' \
  --from-literal=JWT_SECRET_KEY='your-jwt-secret-key-here' \
  --from-literal=JWT_ALGORITHM='HS256' \
  --from-literal=ACCESS_TOKEN_EXPIRE_DAYS='7' \
  --from-literal=UV_ENVIRONMENT='development' \
  --from-literal=OPENROUTER_API_KEY='your-openrouter-api-key' \
  --namespace=todo-app

# 6. Deploy with Helm
cd ..
helm install todo-app ./helm \
  --namespace todo-app \
  --values ./helm/values-dev.yaml

# 7. Verify deployment
kubectl get pods -n todo-app
kubectl get services -n todo-app

# 8. Check backend logs
kubectl logs -f deployment/backend-deployment -n todo-app

# 9. Test health endpoints
kubectl port-forward service/backend-service 8000:8000 -n todo-app
curl http://localhost:8000/health
curl http://localhost:8000/ready
```

#### Environment Variables in Kubernetes

All environment variables are stored in Kubernetes Secrets and injected at runtime:

**Required Secrets:**
- `DATABASE_URL`: Neon PostgreSQL connection string
  - Format: `postgresql://user:pass@host/db?sslmode=require`
  - Must include SSL mode for Neon serverless

- `JWT_SECRET_KEY`: Secret key for JWT signing
  - Minimum 32 characters
  - Use cryptographically secure random string

- `JWT_ALGORITHM`: JWT signing algorithm
  - Value: `HS256` (HMAC with SHA-256)

- `ACCESS_TOKEN_EXPIRE_DAYS`: Token expiration period
  - Value: `7` (7 days)

- `OPENROUTER_API_KEY`: OpenRouter API key for AI features
  - Format: `sk-or-v1-...`
  - Required for chat functionality

- `UV_ENVIRONMENT`: Environment mode
  - Values: `development` or `production`

**Creating Secrets:**

```bash
# Create all secrets at once
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='your-database-url' \
  --from-literal=JWT_SECRET_KEY='your-jwt-secret' \
  --from-literal=JWT_ALGORITHM='HS256' \
  --from-literal=ACCESS_TOKEN_EXPIRE_DAYS='7' \
  --from-literal=UV_ENVIRONMENT='development' \
  --from-literal=OPENROUTER_API_KEY='your-api-key' \
  --namespace=todo-app

# Verify secrets exist
kubectl get secrets -n todo-app

# View secret keys (not values)
kubectl describe secret todo-app-secrets -n todo-app
```

**Helm Values Configuration:**

```yaml
# helm/values-dev.yaml
backend:
  image: todo-backend
  tag: latest
  imagePullPolicy: Never  # Use local images in Minikube
  replicas: 1
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
```

#### Accessing the Backend

**Via Port Forwarding (Recommended for testing):**
```bash
# Forward local port 8000 to backend service
kubectl port-forward service/backend-service 8000:8000 -n todo-app

# Access API documentation
open http://localhost:8000/docs

# Test health endpoint
curl http://localhost:8000/health
```

**Via Frontend Service (Production pattern):**
```bash
# Backend is accessed by frontend using Kubernetes DNS
# Frontend uses: http://backend-service:8000
# No external access needed for backend in production
```

**Direct Pod Access (Debugging):**
```bash
# Get pod name
kubectl get pods -n todo-app -l app=backend

# Execute command in pod
kubectl exec -it <backend-pod-name> -n todo-app -- sh

# Inside pod, test locally
curl http://localhost:8000/health
```

### Kubernetes Troubleshooting

#### Pod Not Starting

**Symptoms:** Pod stuck in `Pending`, `CrashLoopBackOff`, or `Error`

**Solutions:**

1. **Check pod status and events:**
   ```bash
   kubectl get pods -n todo-app
   kubectl describe pod <backend-pod-name> -n todo-app
   kubectl get events -n todo-app --sort-by='.lastTimestamp'
   ```

2. **Check pod logs:**
   ```bash
   kubectl logs <backend-pod-name> -n todo-app
   kubectl logs <backend-pod-name> -n todo-app --previous
   ```

3. **Common issues:**
   - **Missing litellm dependency**: Add `litellm>=1.0.0` to pyproject.toml
   - **Import errors**: Use relative imports (`from ..database` not `from backend.src.database`)
   - **Missing secrets**: Verify all required secrets exist
   - **Database connection failure**: Check DATABASE_URL is correct
   - **Insufficient resources**: Increase CPU/memory limits

#### Database Connection Errors

**Symptoms:** Readiness probe failing, 503 errors from `/ready` endpoint

**Solutions:**

1. **Verify DATABASE_URL format:**
   ```bash
   kubectl get secret todo-app-secrets -n todo-app -o jsonpath='{.data.DATABASE_URL}' | base64 -d
   ```

2. **Test database connectivity from pod:**
   ```bash
   kubectl exec -it <backend-pod-name> -n todo-app -- sh
   # Inside pod:
   python -c "from sqlmodel import create_engine; engine = create_engine('$DATABASE_URL'); print('Connected!')"
   ```

3. **Common issues:**
   - **SSL mode missing**: Add `?sslmode=require` to Neon connection string
   - **Wrong credentials**: Verify username and password
   - **Network policy blocking**: Check if network policies allow egress
   - **Neon database paused**: Neon serverless databases auto-pause after inactivity

#### Import Errors

**Symptoms:** Pod crashes with `ModuleNotFoundError`

**Solutions:**

1. **Check import statements:**
   ```bash
   # Wrong (absolute import)
   from backend.src.database import engine

   # Correct (relative import)
   from ..database import engine
   ```

2. **Verify all imports use relative paths:**
   ```bash
   kubectl logs <backend-pod-name> -n todo-app | grep "ModuleNotFoundError"
   ```

3. **Rebuild image after fixing imports:**
   ```bash
   eval $(minikube docker-env)
   docker build -t todo-backend:latest .
   kubectl rollout restart deployment/backend-deployment -n todo-app
   ```

#### Health Check Failures

**Symptoms:** Pods restarting frequently, readiness probe failing

**Solutions:**

1. **Test health endpoints manually:**
   ```bash
   kubectl port-forward <backend-pod-name> 8000:8000 -n todo-app
   curl http://localhost:8000/health
   curl http://localhost:8000/ready
   ```

2. **Check probe configuration:**
   ```bash
   kubectl describe pod <backend-pod-name> -n todo-app | grep -A 10 "Liveness\|Readiness"
   ```

3. **Common issues:**
   - **Initial delay too short**: Increase `initialDelaySeconds` if app takes longer to start
   - **Database not ready**: Readiness probe fails if database unreachable
   - **Wrong endpoint path**: Verify `/health` and `/ready` routes exist

#### Secret Configuration Issues

**Symptoms:** Environment variables not set, authentication failures

**Solutions:**

1. **Verify secrets exist:**
   ```bash
   kubectl get secrets -n todo-app
   kubectl describe secret todo-app-secrets -n todo-app
   ```

2. **Check environment variables in pod:**
   ```bash
   kubectl exec -it <backend-pod-name> -n todo-app -- env | grep -E "DATABASE_URL|JWT_SECRET_KEY|OPENROUTER_API_KEY"
   ```

3. **Recreate secrets if needed:**
   ```bash
   kubectl delete secret todo-app-secrets -n todo-app
   kubectl create secret generic todo-app-secrets \
     --from-literal=DATABASE_URL='...' \
     --from-literal=JWT_SECRET_KEY='...' \
     --namespace=todo-app
   kubectl rollout restart deployment/backend-deployment -n todo-app
   ```

#### Resource Constraints

**Symptoms:** Pod evicted, OOMKilled, CPU throttling

**Solutions:**

1. **Check resource usage:**
   ```bash
   kubectl top pods -n todo-app
   kubectl describe pod <backend-pod-name> -n todo-app | grep -A 5 "Limits\|Requests"
   ```

2. **Increase resource limits:**
   ```yaml
   # helm/values-dev.yaml
   backend:
     resources:
       requests:
         memory: "512Mi"  # Increased from 256Mi
         cpu: "500m"      # Increased from 250m
       limits:
         memory: "1Gi"    # Increased from 512Mi
         cpu: "1000m"     # Increased from 500m
   ```

3. **Redeploy with new limits:**
   ```bash
   helm upgrade todo-app ./helm \
     --namespace todo-app \
     --values ./helm/values-dev.yaml
   ```

### Resource Management

**Development (Minikube):**
- CPU Request: 250m (0.25 CPU cores)
- CPU Limit: 500m (0.5 CPU cores)
- Memory Request: 256Mi
- Memory Limit: 512Mi
- Replicas: 1

**Production (Recommended):**
- CPU Request: 500m (0.5 CPU cores)
- CPU Limit: 1000m (1 CPU core)
- Memory Request: 512Mi
- Memory Limit: 1Gi
- Replicas: 2+ (for high availability)

**Scaling:**
```bash
# Scale backend deployment
kubectl scale deployment backend-deployment --replicas=2 -n todo-app

# Verify scaling
kubectl get pods -n todo-app -l app=backend

# Check if all replicas are ready
kubectl get deployment backend-deployment -n todo-app
```

### Security Best Practices

1. **Non-root User**: Container runs as `appuser` (UID 1001)
2. **Secret Management**: All sensitive data in Kubernetes Secrets (never in code)
3. **No Privileged Mode**: Never run containers in privileged mode
4. **Resource Limits**: Always set CPU and memory limits
5. **Health Checks**: Implement both liveness and readiness probes
6. **Database SSL**: Always use SSL for database connections (Neon requires it)
7. **API Key Rotation**: Regularly rotate JWT secrets and API keys
8. **Network Policies**: Consider implementing network policies for production

### Database Migrations in Kubernetes

**Running Migrations:**

```bash
# Option 1: Run migrations in existing pod
kubectl exec -it <backend-pod-name> -n todo-app -- alembic upgrade head

# Option 2: Run migrations as Kubernetes Job (recommended for production)
kubectl create job --from=cronjob/migration-job migration-manual-001 -n todo-app

# Option 3: Run migrations before deployment (init container pattern)
# Add to deployment.yaml:
initContainers:
- name: migrations
  image: todo-backend:latest
  command: ["alembic", "upgrade", "head"]
  env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: todo-app-secrets
          key: DATABASE_URL
```

**Verify Migration Status:**

```bash
# Check current migration version
kubectl exec -it <backend-pod-name> -n todo-app -- alembic current

# View migration history
kubectl exec -it <backend-pod-name> -n todo-app -- alembic history
```

---

## 📦 Dependencies

### Core Dependencies

- **fastapi** (0.115+) - Web framework
- **uvicorn** (latest) - ASGI server
- **sqlmodel** (0.0.22) - Database ORM
- **psycopg2-binary** (latest) - PostgreSQL adapter
- **python-jose** (latest) - JWT handling
- **argon2-cffi** (latest) - Password hashing
- **pydantic** (2.0+) - Data validation
- **alembic** (latest) - Database migrations

### AI Dependencies (Phase 3)

- **openai** (1.59.5) - OpenAI SDK
- **openai-agents** (0.8.1) - Agents SDK
- **litellm** (latest) - Multi-model gateway
- **httpx** (latest) - HTTP client

### Development Dependencies

- **pytest** (latest) - Testing framework
- **pytest-asyncio** (latest) - Async test support
- **pytest-cov** (latest) - Coverage reporting
- **black** (latest) - Code formatting
- **mypy** (latest) - Type checking

---

## 🔗 Related Documentation

- **[Root README](../README.md)** - Project overview and architecture
- **[Frontend README](../frontend/README.md)** - Frontend documentation
- **[Specifications](../specs/)** - Feature specifications for all phases
- **[ADRs](../history/adr/)** - Architecture decision records

---

<div align="center">

**Built with FastAPI and Python 3.13**

[⬆ Back to Top](#-taskflow-ai---backend-documentation)

</div>
