# Backend Workspace Instructions - FastAPI with AI Chatbot (Phase 3)

This workspace contains the FastAPI backend for the Todo AI Chatbot Application with MCP (Model Context Protocol) server architecture and OpenAI Agents SDK integration.

## Technology Stack

- **Framework**: FastAPI 0.115+
- **Language**: Python 3.13+
- **Package Manager**: UV
- **ORM**: SQLModel (NOT raw SQLAlchemy)
- **Database**: PostgreSQL 16 (Neon Serverless production)
- **Authentication**: JWT tokens (python-jose) - Custom implementation
- **Password Hashing**: Argon2 (argon2-cffi) - **UPDATED from bcrypt**
- **Migrations**: Alembic
- **Testing**: pytest, pytest-asyncio, httpx
- **AI Framework**: OpenAI Agents SDK - **NEW for Phase 3**
- **MCP Protocol**: Official MCP SDK - **NEW for Phase 3**

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
3. **JWT Validation**: All protected endpoints require valid JWT token
4. **404 (not 403)**: Return 404 for unauthorized access (prevent info leakage)
5. **Password Hashing**: Always use **Argon2**, NEVER plaintext
6. **SQL Injection Prevention**: SQLModel parameterized queries (automatic)
7. **NEW: Chat Endpoint Auth**: Chat endpoint MUST enforce same JWT validation
8. **NEW: MCP Tool Security**: All tools MUST validate user_id before execution
9. **NEW: Conversation Isolation**: All conversations filtered by user_id

### AI Agent Requirements (NEW for Phase 3)

1. **Stateless Design**: Agent MUST NOT store conversation state in memory
2. **Database Persistence**: ALL conversation history MUST persist in database
3. **Context Loading**: Fetch conversation history from DB on EVERY request
4. **Tool Execution**: MCP tools MUST reuse existing service layer functions
5. **Error Handling**: Agent errors MUST be translated to user-friendly messages
6. **Intent Recognition**: Correctly map natural language to MCP tool calls

## Project Structure

```
backend/
├── .env                           # Environment variables (includes OPENAI_API_KEY)
├── .venv                          # Virtual environment
├── CLAUDE.md                      # Backend workspace instructions
├── alembic/                       # Database migration files
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                  # Migration history
│       ├── 2026-01-29_5050a5c0f214_create_users_and_tasks_tables.py
│       └── 2026-02-06_xxxx_add_conversations_messages_tables.py  # NEW
├── alembic.ini                    # Alembic configuration
├── pyproject.toml                 # Project dependencies and configuration
├── run_migrations.py              # Migration runner script
└── src/                          # Source code
    ├── __pycache__/               # Compiled Python files
    ├── config.py                  # Configuration management (includes OpenAI config)
    ├── database.py                # Database connection and session management
    ├── main.py                    # FastAPI application entry point
    ├── middleware/                # Authentication middleware
    │   ├── __pycache__/
    │   └── auth.py                # JWT authentication middleware
    ├── models/                    # SQLModel database models
    │   ├── __pycache__/
    │   ├── task.py                # Task model
    │   ├── user.py                # User model
    │   ├── conversation.py        # Conversation model - NEW
    │   └── message.py             # Message model - NEW
    ├── routers/                   # API route definitions
    │   ├── __init__.py
    │   ├── __pycache__/
    │   ├── auth.py                # Authentication routes
    │   ├── tasks.py               # Task management routes
    │   └── chat.py                # Chat endpoint - NEW
    ├── schemas/                   # Pydantic request/response schemas
    │   ├── __pycache__/
    │   ├── auth.py                # Authentication schemas
    │   ├── task.py                # Task schemas
    │   └── chat.py                # Chat request/response schemas - NEW
    ├── services/                  # Business logic layer
    │   ├── __init__.py
    │   ├── __pycache__/
    │   ├── task_service.py        # Task business logic (REUSED by MCP tools)
    │   ├── user_service.py        # User business logic
    │   ├── conversation_service.py # Conversation management - NEW
    │   └── message_service.py     # Message management - NEW
    ├── mcp/                       # MCP Server - NEW for Phase 3
    │   ├── __init__.py
    │   ├── __pycache__/
    │   ├── server.py              # MCP server initialization
    │   ├── tools.py               # MCP tool definitions (5 tools)
    │   └── config.py              # MCP configuration
    └── utils/                     # Utility functions
        ├── __pycache__/
        ├── security.py            # Security utilities (hashing, JWT)
        ├── validation.py          # Validation utilities
        └── agent.py               # OpenAI Agent utilities - NEW
```

## Database Schema

### Tables

#### users (managed by the application)
- **id**: UUID (primary key)
- **email**: string (unique)
- **name**: string
- **password_hash**: string (Argon2 hashed)
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

#### **conversations (NEW for Phase 3)**
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id, indexed)
- **created_at**: timestamp
- **updated_at**: timestamp

#### **messages (NEW for Phase 3)**
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id, indexed)
- **conversation_id**: integer (foreign key -> conversations.id, indexed)
- **role**: string ("user" or "assistant")
- **content**: text (message content)
- **created_at**: timestamp

### Indexes
- tasks.user_id (for filtering by user)
- tasks.completed (for status filtering)
- **conversations.user_id (for filtering conversations by user)** - NEW
- **messages.conversation_id (for fetching conversation history)** - NEW
- **messages.user_id (for user isolation)** - NEW

## REST API Endpoints

### Base URL
- **Development**: http://localhost:8000
- **Production**: https://api.example.com

### Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Authentication Endpoints

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

### Task Management Endpoints (Phase 2 - Keep functional)

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

### **Chat Endpoint (NEW for Phase 3)**

#### POST /api/{user_id}/chat
Send message and receive AI agent response.

**Path Parameters:**
- user_id: UUID (required, authenticated user's UUID)

**Request Body:**
```json
{
  "conversation_id": 123,  // Optional - creates new if not provided
  "message": "Add a task to buy groceries"  // Required - user's natural language input
}
```

**Response:**
```json
{
  "conversation_id": 123,
  "response": "I've added 'Buy groceries' to your task list.",
  "tool_calls": ["add_task"]  // Array of MCP tools executed
}
```

**Authentication:** Requires same JWT validation as task endpoints

**User Isolation:** Enforced via:
1. JWT token verification
2. user_id in URL matches authenticated user
3. All conversation/message queries filter by user_id
4. MCP tools receive and validate user_id

**Stateless Behavior:**
- Server does NOT store conversation state in memory
- Full conversation history fetched from database on each request
- Multiple backend instances can handle same conversation
- Server restart does not affect ongoing conversations

## MCP Tools (NEW for Phase 3)

All MCP tools are **wrappers** around existing `task_service.py` functions. They provide standardized interface for OpenAI Agent.

### Tool: add_task

**Purpose:** Create a new task

**Parameters:**
```python
{
  "user_id": str,  # Required - authenticated user's UUID
  "title": str,    # Required - task title (1-200 chars)
  "description": str  # Optional - task description (max 1000 chars)
}
```

**Returns:**
```python
{
  "task_id": int,
  "status": "created",
  "title": str
}
```

**Implementation:**
- Calls `task_service.create_task(user_id, title, description)`
- Validates user_id before execution
- Returns standardized MCP response format

### Tool: list_tasks

**Purpose:** Retrieve tasks from list

**Parameters:**
```python
{
  "user_id": str,  # Required - authenticated user's UUID
  "status": str    # Optional - "all" | "pending" | "completed"
}
```

**Returns:**
```python
[
  {
    "id": int,
    "title": str,
    "description": str,
    "completed": bool,
    "created_at": str
  },
  ...
]
```

**Implementation:**
- Calls `task_service.get_tasks(user_id, status)`
- Filters by user_id for data isolation
- Returns array of task objects

### Tool: complete_task

**Purpose:** Mark task as complete

**Parameters:**
```python
{
  "user_id": str,   # Required - authenticated user's UUID
  "task_id": int    # Required - task to complete
}
```

**Returns:**
```python
{
  "task_id": int,
  "status": "completed",
  "title": str
}
```

**Implementation:**
- Calls `task_service.update_task_status(user_id, task_id, completed=True)`
- Verifies task ownership (user_id)
- Returns confirmation

### Tool: delete_task

**Purpose:** Remove task from list

**Parameters:**
```python
{
  "user_id": str,   # Required - authenticated user's UUID
  "task_id": int    # Required - task to delete
}
```

**Returns:**
```python
{
  "task_id": int,
  "status": "deleted",
  "title": str
}
```

**Implementation:**
- Calls `task_service.delete_task(user_id, task_id)`
- Verifies task ownership (user_id)
- Returns confirmation with original title

### Tool: update_task

**Purpose:** Modify task title or description

**Parameters:**
```python
{
  "user_id": str,       # Required - authenticated user's UUID
  "task_id": int,       # Required - task to update
  "title": str,         # Optional - new title
  "description": str    # Optional - new description
}
```

**Returns:**
```python
{
  "task_id": int,
  "status": "updated",
  "title": str
}
```

**Implementation:**
- Calls `task_service.update_task(user_id, task_id, updates)`
- Verifies task ownership (user_id)
- Returns updated task confirmation

## Database Models (SQLModel)

### User Model

The application manages its own user model:

- **UserBase**: Contains common fields (name, email, password_hash)
- **User**: Database table model with UUID primary key, relationships to tasks **and conversations**
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

### **Conversation Model (NEW for Phase 3)**

The application uses SQLModel for conversation tracking:

- **ConversationBase**: Contains common fields
- **Conversation**: Database table model with integer primary key and UUID user_id foreign key
- **ConversationCreate**: Model for creating new conversations
- **ConversationRead**: Model for returning conversation data
- **ConversationWithMessages**: Model for conversation with full message history

**Relationships:**
- `user`: Relationship to User model
- `messages`: Relationship to Message model (one-to-many)

### **Message Model (NEW for Phase 3)**

The application uses SQLModel for message storage:

- **MessageBase**: Contains common fields (role, content)
- **Message**: Database table model with integer primary key, conversation_id and user_id foreign keys
- **MessageCreate**: Model for creating new messages
- **MessageRead**: Model for returning message data

**Relationships:**
- `conversation`: Relationship to Conversation model
- `user`: Relationship to User model

**Role Enum:**
- `"user"`: Message from user
- `"assistant"`: Message from AI agent

## Pydantic Schemas

### Authentication Schemas

The application implements custom authentication with various request/response schemas:

- **RegisterRequest**: Schema for user registration (name, email, password)
- **RegisterResponse**: Schema for registration response with user details
- **LoginRequest**: Schema for user login (email, password)
- **LoginResponse**: Schema for login response with JWT token
- **TokenData**: Schema for JWT token payload
- **AuthenticatedUser**: Schema for authenticated user data

### Task Schemas

The application defines various schemas for task management:

- **TaskBase**: Base schema with common fields (title, description)
- **TaskCreate**: Schema for creating new tasks
- **TaskUpdate**: Schema for updating existing tasks
- **TaskUpdateStatus**: Schema for updating completion status
- **TaskResponse**: Schema for returning task data
- **TaskListResponse**: Schema for returning lists of tasks
- **TaskDeleteResponse**: Schema for task deletion confirmation

### **Chat Schemas (NEW for Phase 3)**

The application defines schemas for chat interactions:

- **ChatRequest**: Schema for chat endpoint request
  ```python
  {
    "conversation_id": int | None,  # Optional - creates new if not provided
    "message": str                   # Required - user's natural language input
  }
  ```

- **ChatResponse**: Schema for chat endpoint response
  ```python
  {
    "conversation_id": int,
    "response": str,                 # AI agent's response
    "tool_calls": list[str]          # List of MCP tools executed
  }
  ```

- **ConversationHistoryResponse**: Schema for retrieving conversation history
- **MessageResponse**: Schema for individual message data

## Security Utilities

### Security Utilities

The application implements security utilities for authentication:

- **Password hashing**: Uses **Argon2** for secure password storage (strongest algorithm)
- **JWT token creation**: Creates signed JWT tokens with configurable expiration
- **JWT token verification**: Validates tokens and checks for expiration
- **Password verification**: Compares plain text passwords against hashed versions

**IMPORTANT: Migrated from bcrypt to Argon2 for Phase 3**

## Middleware for JWT Validation

The application implements JWT validation middleware for secure authentication:

- `get_current_user`: Retrieves the authenticated user from the JWT token in the Authorization header
- `verify_user_id_in_url_matches_authenticated_user`: Verifies that the user_id in the URL matches the authenticated user's ID to enforce user data isolation
- `get_current_active_user`: Gets the current active user with potential additional status checks

**NEW for Phase 3:** Chat endpoint MUST use same middleware functions.

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

### **Chat Endpoint Pattern (NEW for Phase 3)**

**Critical Stateless Architecture:**

```python
@router.post("/api/{user_id}/chat")
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Authenticate user (same as task endpoints)
    verify_user_id_in_url_matches_authenticated_user(user_id, current_user)
    
    # 2. Get or create conversation (from database)
    conversation = await get_or_create_conversation(db, user_id, request.conversation_id)
    
    # 3. Save user message to database
    await save_message(db, conversation.id, "user", request.message, user_id)
    
    # 4. Fetch full conversation history from database
    history = await get_conversation_history(db, conversation.id)
    
    # 5. Build messages array for OpenAI agent
    messages = [{"role": msg.role, "content": msg.content} for msg in history]
    messages.append({"role": "user", "content": request.message})
    
    # 6. Run OpenAI agent with MCP tools
    agent_response = await run_agent_with_tools(messages, user_id)
    
    # 7. Save assistant response to database
    await save_message(db, conversation.id, "assistant", agent_response.content, user_id)
    
    # 8. Return response (server holds NO state)
    return ChatResponse(
        conversation_id=conversation.id,
        response=agent_response.content,
        tool_calls=[tool.name for tool in agent_response.tool_calls]
    )
```

**Key Points:**
- Server memory stores NOTHING
- Every request fetches history from database
- Multiple servers can handle same conversation
- Server restart = no data loss

## Services Layer

### Task Service (`task_service.py`)

Core business logic for task management. **REUSED by MCP tools.**

Functions:
- `create_task(user_id, title, description)`: Create new task
- `get_tasks(user_id, status)`: Get filtered task list
- `get_task(user_id, task_id)`: Get single task
- `update_task(user_id, task_id, updates)`: Update task fields
- `update_task_status(user_id, task_id, completed)`: Toggle completion
- `delete_task(user_id, task_id)`: Delete task

All functions enforce user_id filtering.

### **Conversation Service (`conversation_service.py`) - NEW**

Manages conversation lifecycle:

Functions:
- `get_or_create_conversation(db, user_id, conversation_id)`: Fetch existing or create new
- `get_user_conversations(db, user_id)`: List all user conversations
- `delete_conversation(db, user_id, conversation_id)`: Delete conversation and messages

### **Message Service (`message_service.py`) - NEW**

Manages message storage and retrieval:

Functions:
- `save_message(db, conversation_id, role, content, user_id)`: Store message
- `get_conversation_history(db, conversation_id)`: Fetch messages ordered by timestamp
- `delete_messages(db, conversation_id)`: Clear conversation messages

```markdown
## OpenAI Agent Integration (NEW for Phase 3)

### Agent Configuration

The application uses OpenAI Agents SDK with custom configuration:

```python
# src/utils/agent.py

from agents import Agent, Runner, SQLiteSession
from src.config import settings
from src.mcp.tools import (
    add_task_tool,
    list_tasks_tool,
    complete_task_tool,
    delete_task_tool,
    update_task_tool
)

# System prompt defining agent behavior
SYSTEM_PROMPT = """You are a helpful task management assistant. You help users manage their todo list through natural language.

Available tools:
- add_task: Create a new task
- list_tasks: Show tasks (all, pending, or completed)
- complete_task: Mark a task as done
- delete_task: Remove a task
- update_task: Modify task details

Always confirm actions with friendly responses. Ask for clarification if needed.
Examples:
- User: "add task buy milk" → Call add_task, respond "I've added 'Buy milk' to your tasks."
- User: "show me pending tasks" → Call list_tasks with status="pending"
"""

# Create the task management agent
task_agent = Agent(
    name="TaskManager",
    instructions=SYSTEM_PROMPT,
    model="gpt-4o",  # or "gpt-4-turbo"
    tools=[
        add_task_tool,
        list_tasks_tool,
        complete_task_tool,
        delete_task_tool,
        update_task_tool
    ]
)

async def run_agent_with_tools(messages: list, user_id: str):
    """
    Run OpenAI agent with MCP tools
    
    Args:
        messages: Conversation history + new message
        user_id: Authenticated user's UUID (passed to tools)
    
    Returns:
        Agent response with tool execution results
    """
    # Create temporary session for this request
    session = SQLiteSession(
        session_id=f"temp_{user_id}",
        db_path=":memory:"
    )
    
    # Extract the latest user message
    latest_message = messages[-1]["content"] if messages else ""
    
    # Run the agent with user context
    result = await Runner.run(
        agent=task_agent,
        input=latest_message,
        session=session,
        context={"user_id": user_id}  # Inject user_id for tools
    )
    
    # Return response with tool calls
    return {
        "response": result.final_output,
        "tool_calls": [call.tool_name for call in (result.tool_calls or [])]
    }
```

### System Prompt

Stored in configuration, defines agent behavior:

```python
SYSTEM_PROMPT = """You are a helpful task management assistant. You help users manage their todo list through natural language.

Available tools:
- add_task: Create a new task
- list_tasks: Show tasks (all, pending, or completed)
- complete_task: Mark a task as done
- delete_task: Remove a task
- update_task: Modify task details

Always confirm actions with friendly responses. Ask for clarification if needed.
Examples:
- User: "add task buy milk" → Call add_task, respond "I've added 'Buy milk' to your tasks."
- User: "show me pending tasks" → Call list_tasks with status="pending"
"""
```

## MCP Tools Implementation (NEW for Phase 3)

### Tool Definitions

```python
# src/mcp/tools.py

from agents import function_tool
from typing import Optional, Literal
from src.services.task_service import TaskService

@function_tool
async def add_task_tool(
    title: str,
    description: str = "",
    user_id: str = None  # Injected from context
) -> str:
    """Create a new task for the user.
    
    Args:
        title: The task title
        description: Optional task description
        user_id: User's UUID (automatically injected from context)
    """
    # Validate user_id
    if not user_id:
        return "Error: user_id required"
    
    # Call existing service (CODE REUSE)
    task = await TaskService.create_task(user_id, title, description)
    
    # Return user-friendly message
    return f"✓ I've added '{task.title}' to your task list (ID: {task.id})"

@function_tool
async def list_tasks_tool(
    status: Literal["all", "pending", "completed"] = "all",
    user_id: str = None
) -> str:
    """Show user's tasks filtered by status.
    
    Args:
        status: Filter by 'pending', 'completed', or 'all'
        user_id: User's UUID (automatically injected from context)
    """
    if not user_id:
        return "Error: user_id required"
    
    # Call existing service
    tasks = await TaskService.get_tasks(user_id, status)
    
    if not tasks:
        return "You have no tasks yet."
    
    # Format tasks
    task_list = []
    for task in tasks:
        checkbox = "✓" if task.completed else "☐"
        task_list.append(f"{checkbox} [{task.id}] {task.title}")
    
    return "\n".join(task_list)

@function_tool
async def complete_task_tool(task_id: int, user_id: str = None) -> str:
    """Mark a task as completed.
    
    Args:
        task_id: The task ID to complete
        user_id: User's UUID (automatically injected from context)
    """
    if not user_id:
        return "Error: user_id required"
    
    try:
        task = await TaskService.update_task_status(user_id, task_id, completed=True)
        return f"✓ Marked '{task.title}' as completed!"
    except ValueError:
        return f"Task {task_id} not found."

@function_tool
async def delete_task_tool(task_id: int, user_id: str = None) -> str:
    """Remove a task permanently.
    
    Args:
        task_id: The task ID to delete
        user_id: User's UUID (automatically injected from context)
    """
    if not user_id:
        return "Error: user_id required"
    
    try:
        task = await TaskService.delete_task(user_id, task_id)
        return f"✓ Deleted '{task.title}'"
    except ValueError:
        return f"Task {task_id} not found."

@function_tool
async def update_task_tool(
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    user_id: str = None
) -> str:
    """Modify task details.
    
    Args:
        task_id: The task ID to update
        title: New title (optional)
        description: New description (optional)
        user_id: User's UUID (automatically injected from context)
    """
    if not user_id:
        return "Error: user_id required"
    
    if not title and not description:
        return "Provide title or description to update."
    
    try:
        updates = {}
        if title:
            updates["title"] = title
        if description:
            updates["description"] = description
            
        task = await TaskService.update_task(user_id, task_id, updates)
        return f"✓ Updated '{task.title}'"
    except ValueError:
        return f"Task {task_id} not found."
```

**Key Pattern:** All MCP tools **reuse** existing `task_service.py` functions. No duplicate logic.

## Configuration Management

The application uses Pydantic BaseSettings for configuration management:

- Database settings with DATABASE_URL
- Authentication settings with JWT secrets and algorithms
- **OpenAI settings with OPENAI_API_KEY** - NEW
- **MCP server settings** - NEW
- App settings like name, version, and debug mode
- CORS settings for cross-origin resource sharing
- Security settings (Argon2 parameters)

**Environment Variables (NEW for Phase 3):**
```bash
# .env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_ALGORITHM=HS256
OPENAI_API_KEY=sk-...  # NEW
MCP_SERVER_NAME=todo-mcp-server  # NEW
```

## Database Connection

The application establishes database connections using SQLModel:

- Database engine creation with the configured DATABASE_URL
- Session dependency for database operations
- Initialization function for creating database tables

**NEW for Phase 3:** Conversations and Messages tables created automatically.

## Testing Pattern

### Integration Test (User Isolation - CRITICAL)

The application includes integration tests to ensure user data isolation:

**Existing Tests (Phase 2):**
- Verify users cannot access other users' tasks
- Returns 404 (not 403) to prevent information leakage

**NEW Tests (Phase 3):**
- Verify users cannot access other users' conversations
- Verify conversation history persists after server restart
- Verify MCP tools enforce user_id validation
- Verify agent responses are conversational (not JSON dumps)
- Verify stateless behavior (no in-memory state)

### Natural Language Test Scenarios

```python
# tests/test_chat.py

async def test_add_task_via_chat():
    """Test agent creates task from natural language"""
    response = await client.post(
        f"/api/{user_id}/chat",
        json={"message": "add task buy groceries"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert "buy groceries" in response.json()["response"].lower()
    assert "add_task" in response.json()["tool_calls"]
    
    # Verify task was actually created
    tasks = await client.get(f"/api/{user_id}/tasks")
    assert any(t["title"] == "buy groceries" for t in tasks.json())
```

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

# Run specific test file
uv run pytest tests/test_chat.py

# Create migration
uv run alembic revision --autogenerate -m "add conversations and messages tables"

# Apply migrations
uv run alembic upgrade head

# Downgrade migration
uv run alembic downgrade -1

# Test MCP server standalone (NEW)
uv run python -m src.mcp.server

# Test agent with sample message (NEW)
uv run python -m src.utils.agent "show me all tasks"
```

## Critical Checklist

Before deploying ANY endpoint:

**Phase 2 Requirements (still apply):**
- [ ] User data isolation: ALL queries filter by `user_id`
- [ ] Authorization: Verify `user_id` in URL matches authenticated user
- [ ] JWT validation: Protected endpoints require valid token
- [ ] 404 (not 403): Unauthorized access returns 404
- [ ] Password hashing: Use Argon2, NEVER plaintext
- [ ] Input validation: Use Pydantic schemas
- [ ] Type hints: All functions fully typed
- [ ] Tests: Unit + integration coverage
- [ ] User isolation test: Verify cross-user access returns 404

**Phase 3 New Requirements:**
- [ ] Stateless: NO conversation state in server memory
- [ ] Database persistence: ALL conversation history in database
- [ ] MCP tools: REUSE existing service layer functions
- [ ] Tool security: ALL tools validate user_id parameter
- [ ] Conversation isolation: Conversations filtered by user_id
- [ ] Agent responses: Conversational, not technical JSON dumps
- [ ] Context loading: Fetch full history from DB on every request
- [ ] Error handling: Agent errors translated to user-friendly messages
- [ ] Natural language tests: Cover add, list, complete, delete, update scenarios
- [ ] Server restart test: Conversations resume correctly

## Custom JWT Authentication

### How It Works

**NOT using Better Auth - Custom JWT implementation:**

1. User registers/logs in → Backend creates JWT token
2. Backend signs token with secret key (from environment variable)
3. Frontend stores token in localStorage and cookies
4. Frontend includes token in all API request headers: `Authorization: Bearer <token>`
5. Backend middleware extracts and verifies token
6. Backend decodes user_id from token payload
7. Backend verifies user_id in URL matches token user_id
8. Backend filters all queries by authenticated user_id

**NEW for Phase 3:** Chat endpoint follows EXACT same authentication flow.

### Security Benefits

| Benefit | Description |
|---------|-------------|
| User Isolation | Each user only sees their own tasks and conversations |
| Stateless Auth | Backend doesn't need to call external service to verify users |
| Token Expiry | JWTs expire automatically (e.g., after 7 days) |
| No Shared DB Session | Independent verification on every request |
| Conversation Security | Chat messages isolated by user_id |

### API Behavior

After Auth:
- All endpoints require valid JWT token
- Requests without token receive 401 Unauthorized
- Each user only sees/modifies their own tasks and conversations
- Task and conversation ownership enforced on every operation
- **MCP tools receive user_id from authenticated request**

## Reference Documentation

**Core Technologies:**
- FastAPI: https://fastapi.tiangolo.com/
- SQLModel: https://sqlmodel.tiangolo.com/
- Pydantic v2: https://docs.pydantic.dev/latest/
- Alembic: https://alembic.sqlalchemy.org/
- python-jose: https://python-jose.readthedocs.io/
- Argon2: https://argon2-cffi.readthedocs.io/

**NEW for Phase 3:**
- OpenAI API: https://platform.openai.com/docs/api-reference
- OpenAI Agents SDK: https://github.com/openai/swarm
- Official MCP SDK: https://modelcontextprotocol.io/docs
- MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk

## Migration Path (Phase 2 → Phase 3)

### What to Keep
✅ All existing task endpoints (REST API still works)
✅ User authentication flow (JWT)
✅ Task service layer (will be reused by MCP tools)
✅ User isolation patterns (same for conversations)
✅ Database connection and migrations

### What to Add
➕ Conversations and Messages tables (Alembic migration)
➕ Chat endpoint (`POST /api/{user_id}/chat`)
➕ Conversation and Message services
➕ MCP server module (`src/mcp/`)
➕ OpenAI agent integration (`src/utils/agent.py`)
➕ Chat request/response schemas
➕ Natural language test scenarios

### What to Update
🔄 Password hashing: bcrypt → Argon2
🔄 Configuration: Add OPENAI_API_KEY
🔄 Dependencies: Add openai, mcp packages
🔄 User model: Add relationship to conversations

### What NOT to Change
❌ Task service logic (will be reused as-is)
❌ Authentication middleware (will be reused for chat)
❌ User isolation patterns (same principle applies)
❌ Database connection setup

## When to Use Skills

### Backend-Specific Skills
- **fastapi-expert**: Comprehensive FastAPI knowledge for building production-ready APIs. Use when building FastAPI applications, implementing REST APIs, setting up database operations with SQLModel, implementing authentication (OAuth2/JWT), or needing guidance on middleware, security, scalability, or performance optimization.
- **sqlmodel-expert**: Advanced SQLModel patterns and comprehensive database migrations with Alembic. Use when creating SQLModel models, defining relationships, setting up database migrations, optimizing queries, or troubleshooting Alembic issues.
- **building-with-openai-agents**: Use when building AI agents with OpenAI's Agents SDK. Triggers include creating agents, implementing tools, multi-agent handoffs, guardrails, MCP integration, tracing. Also for using LiteLLM to run agents on alternative models.
- **building-mcp-servers**: Guides creation of high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services in Python (FastMCP) or Node/TypeScript (MCP SDK).
- **tool-design**: Design tools that agents can use effectively. Use when creating new tools for agents, debugging tool-related failures, or optimizing existing tool sets. Particularly relevant for MCP tool development in Phase 3.
- **context-fundamentals**: Understand the components, mechanics, and constraints of context in agent systems. Use when designing agent architectures, debugging context-related failures, or optimizing context usage in the OpenAI agent.
- **context-optimization**: Apply optimization techniques to extend effective context capacity. Use when context limits constrain agent performance, when optimizing for cost or latency, or when implementing long-running agent systems.
- **context-degradation**: Recognize, diagnose, and mitigate patterns of context degradation in agent systems. Use when context grows large, agent performance degrades unexpectedly, or debugging agent failures.
- **multi-agent-patterns**: Design multi-agent architectures for complex tasks. Use when single-agent context limits are exceeded, when tasks decompose naturally into subtasks, or when specializing agents improves quality.

---


**Current Phase:** 3 - AI Chatbot  
**Backend Version:** 2.0.0  
**Last Updated:** 2026-02-06

This backend implements AI-powered conversational task management while maintaining strict security, user isolation, and stateless architecture principles.