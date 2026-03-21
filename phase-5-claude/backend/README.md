# Backend - FastAPI AI-Powered Task Management API

Production-ready FastAPI backend with AI agent, event-driven architecture, and integrated notification/reminder system.

## Tech Stack

- **Framework**: FastAPI 0.115.0
- **Language**: Python 3.12+
- **ORM**: SQLModel 0.0.32
- **Database**: PostgreSQL 16 (Neon Serverless)
- **Auth**: JWT (PyJWT 2.11.0) + Argon2 (argon2-cffi 23.1.0)
- **AI**: OpenAI Agents SDK 0.8.1 + LiteLLM
- **Events**: Kafka (aiokafka) + Redpanda
- **WebSocket**: Socket.IO (python-socketio)
- **Scheduler**: APScheduler 3.10.4
- **Email**: aiosmtplib 3.0.2 (Gmail SMTP)
- **Migrations**: Alembic 1.14.0

## Project Structure

\`\`\`
backend/
├── src/
│   ├── main.py                  # FastAPI app entry
│   ├── config.py                # Settings (Pydantic)
│   ├── database.py              # SQLModel session
│   ├── models/
│   │   ├── user.py             # User model
│   │   ├── task.py             # Task model
│   │   └── conversation.py     # Conversation/Message models
│   ├── routers/
│   │   ├── auth.py             # Register/login
│   │   ├── tasks.py            # Task CRUD
│   │   ├── chat.py             # AI chat endpoint
│   │   ├── health.py           # Health checks
│   │   ├── notifications.py    # WebSocket notifications
│   │   └── internal.py         # Internal API (microservices)
│   ├── services/
│   │   ├── task_service.py     # Task business logic
│   │   ├── user_service.py     # User operations
│   │   └── conversation_service.py # Chat history
│   ├── middleware/
│   │   └── auth.py             # JWT validation
│   ├── schemas/
│   │   ├── auth.py             # Auth request/response
│   │   ├── task.py             # Task schemas
│   │   └── chat.py             # Chat schemas
│   ├── mcp/
│   │   ├── server.py           # MCP server
│   │   ├── tools.py            # MCP tool implementations
│   │   └── config.py           # MCP configuration
│   ├── events/
│   │   ├── publisher.py        # Kafka publisher
│   │   ├── consumer.py         # Kafka consumer (notifications + email)
│   │   ├── scheduler.py        # APScheduler (due date reminders)
│   │   ├── schemas.py          # Event schemas
│   │   └── websocket.py        # Socket.IO manager
│   └── utils/
│       ├── security.py         # JWT + Argon2
│       ├── validation.py       # Input validation
│       └── agent.py            # AI agent creation
├── alembic/                     # Database migrations
├── Dockerfile                   # Multi-stage build
├── requirements.txt             # Dependencies
└── pyproject.toml              # Project config
\`\`\`

## Database Schema

### users
- \`id\` (UUID, PK)
- \`email\` (unique, indexed)
- \`name\` (string)
- \`password_hash\` (Argon2)
- \`created_at\`, \`updated_at\`

### tasks
- \`id\` (int, PK)
- \`user_id\` (UUID, FK → users.id, indexed)
- \`title\` (string, 1-200 chars)
- \`description\` (text, nullable)
- \`completed\` (boolean, default false)
- \`due_date\` (datetime, nullable)
- \`recurrence_pattern\` (string: daily/weekly/monthly, nullable)
- \`next_occurrence_date\` (datetime, nullable)
- \`priority\` (string: high/medium/low, default medium)
- \`tags\` (JSON string, nullable)
- \`created_at\`, \`updated_at\`

### conversations
- \`id\` (int, PK)
- \`user_id\` (UUID, FK → users.id, indexed)
- \`created_at\`, \`updated_at\`

### messages
- \`id\` (int, PK)
- \`user_id\` (UUID, FK → users.id, indexed)
- \`conversation_id\` (int, FK → conversations.id, indexed)
- \`role\` (string: user/assistant)
- \`content\` (text)
- \`created_at\`

## REST API Endpoints

### Authentication
\`\`\`
POST /api/auth/register
POST /api/auth/login
\`\`\`

### Tasks (JWT Required)
\`\`\`
GET    /api/{user_id}/tasks              # List with filters
POST   /api/{user_id}/tasks              # Create
GET    /api/{user_id}/tasks/{task_id}    # Get one
PUT    /api/{user_id}/tasks/{task_id}    # Update
PATCH  /api/{user_id}/tasks/{task_id}/complete  # Toggle
DELETE /api/{user_id}/tasks/{task_id}    # Delete
\`\`\`

**Query Parameters**:
- \`status_filter\`: all/pending/completed
- \`priority\`: high/medium/low
- \`search\`: Full-text search
- \`sort_by\`: created_at/due_date/priority/title
- \`sort_order\`: asc/desc

### Chat (JWT Required)
\`\`\`
POST   /api/{user_id}/chat                      # Send message
GET    /api/{user_id}/conversations/history     # Get history
DELETE /api/{user_id}/conversations/clear       # Clear history
\`\`\`

### Health
\`\`\`
GET /health    # Health check
GET /ready     # Readiness check
\`\`\`

### Internal API
\`\`\`
GET /api/internal/users/{user_id}/email         # Get user email
GET /api/internal/tasks/due-soon                # Tasks due in 30min
\`\`\`

## AI Agent Architecture

### Agent Configuration (utils/agent.py)
\`\`\`python
# Uses OpenAI Agents SDK + LiteLLM
# Model: arcee-ai/trinity-large-preview:free (via OpenRouter)
# Tools: add_task, list_tasks, complete_task, delete_task, update_task
\`\`\`

**System Prompt**:
- Execute commands immediately without asking unnecessary questions
- Default priority: medium
- Parse natural language for priority, tags, due dates, recurrence
- Use emojis in responses (🔴🟡🟢📅🏷️🔄)
- Concise responses: "✅ Created task #X"

### MCP Tools (mcp/tools.py)

**add_task**:
- Parameters: title, description, due_date_str, recurrence_str, priority_str, tags_str
- Natural language parsing for dates ("tomorrow", "next week")
- Returns: Task ID, title, message with emojis

**list_tasks**:
- Parameters: status, priority, tags, search
- Filters and searches tasks
- Returns: Formatted task list with icons

**complete_task**:
- Parameters: task_id
- Auto-creates next occurrence for recurring tasks
- Returns: Confirmation message

**delete_task**:
- Parameters: task_id
- Permanently removes task
- Returns: Deletion confirmation

**update_task**:
- Parameters: task_id, title, description, due_date_str, recurrence_str, priority_str, tags_str
- Updates any task field
- Returns: Update confirmation

## Event-Driven Architecture

### Kafka Topics
1. **task-events**: Task CRUD operations
2. **reminders**: Scheduled task reminders
3. **task-updates**: Real-time WebSocket updates

### Event Publisher (events/publisher.py)
\`\`\`python
class KafkaPublisher:
    - publish_task_event(event: TaskEvent)
    - publish_reminder(event: ReminderEvent)
    - publish_task_update(event: TaskUpdateEvent)
\`\`\`

**Event Schema**:
\`\`\`python
{
  "event_type": "created|updated|completed|deleted",
  "task_id": int,
  "user_id": str,
  "task_data": {
    "title": str,
    "priority": str,
    "tags": str,
    "due_date": str,
    "recurrence_pattern": str,
    "completed": bool
  },
  "timestamp": str
}
\`\`\`

### WebSocket Manager (events/websocket.py)
\`\`\`python
# Socket.IO server for real-time notifications
# Tracks connected users: {user_id: {session_ids}}
# Events: connect, disconnect, notification
\`\`\`

## Microservices

Notification and reminder services are merged into the backend process:

### Notification Consumer (events/consumer.py)
**Purpose**: Consume Kafka events and send notifications

**Consumes**:
- \`task-events\`: Browser notifications via WebSocket
- \`reminders\`: Email notifications via SMTP

**Features**:
- WebSocket notifications to connected clients
- Email reminders via Gmail SMTP
- User email fetching from backend internal API

### Reminder Scheduler (events/scheduler.py)
**Purpose**: Monitor due dates and publish reminders

**Features**:
- Polls database every 1 minute for tasks due in 30 minutes
- Publishes reminder events to Kafka
- Tracks sent reminders (in-memory cache)
- Clears reminders on task completion/deletion

**Scheduler**: APScheduler (AsyncIOScheduler)

## Security

### Authentication
\`\`\`python
# JWT with HS256 algorithm
# Token expiry: 7 days
# Password hashing: Argon2 (strongest algorithm)
\`\`\`

### User Isolation
\`\`\`python
# ALL queries filter by user_id
# URL user_id must match JWT user_id
# Return 404 (not 403) for unauthorized access
\`\`\`

### Middleware (middleware/auth.py)
\`\`\`python
get_current_user(token: str) -> User
# Validates JWT, extracts user_id, returns User object
\`\`\`

## Docker Deployment

### Multi-Stage Build
\`\`\`dockerfile
# Stage 1: Builder (python:3.12-slim)
- Install dependencies
- Install aiokafka, python-socketio, apscheduler, aiosmtplib

# Stage 2: Runner (python:3.12-slim)
- Copy installed packages
- Non-root user (appuser:1001)
- Expose port 8000
- Health check on /health
- Start: uvicorn src.main:app
\`\`\`

### Build & Run
\`\`\`bash
# Build
docker build -t taskflow-backend:latest .

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET_KEY=... \
  -e OPENROUTER_API_KEY=... \
  -e KAFKA_BOOTSTRAP_SERVERS=taskflow-redpanda:9092 \
  taskflow-backend:latest
\`\`\`

## Environment Variables

\`\`\`bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# AI
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=arcee-ai/trinity-large-preview:free

# Kafka
KAFKA_BOOTSTRAP_SERVERS=taskflow-redpanda:9092
KAFKA_ENABLED=true

# Internal
INTERNAL_SECRET=internal-service-secret-2026

# SMTP (Email Reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=taskflow.reminders@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=taskflow.reminders@gmail.com
SMTP_FROM_NAME=TaskFlow Reminders
\`\`\`

## Development

\`\`\`bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Create migration
alembic revision --autogenerate -m "description"

# Run tests
pytest
\`\`\`

## API Response Examples

### Register
\`\`\`json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "User registered successfully"
}
\`\`\`

### Chat
\`\`\`json
POST /api/{user_id}/chat
{
  "message": "add high priority task fix bug due tomorrow"
}

Response:
{
  "conversation_id": "user_123e4567-e89b-12d3-a456-426614174000",
  "response": "✅ Created task #5: 'fix bug' 🔴 | 📅 Due: 2026-02-22",
  "tool_calls": ["add_task"]
}
\`\`\`

### List Tasks
\`\`\`json
GET /api/{user_id}/tasks?priority=high&search=bug

Response:
{
  "tasks": [
    {
      "id": 5,
      "title": "fix bug",
      "description": null,
      "completed": false,
      "priority": "high",
      "tags": null,
      "due_date": "2026-02-22T23:59:00",
      "recurrence_pattern": null,
      "created_at": "2026-02-21T10:30:00",
      "updated_at": "2026-02-21T10:30:00"
    }
  ]
}
\`\`\`

## Kubernetes Deployment

### Manifests (k8s-manifests/)
- \`backend-deployment.yaml\`: Backend with Dapr sidecar + SMTP env vars
- \`frontend-deployment.yaml\`: Next.js frontend
- \`redpanda-deployment.yaml\`: Kafka broker
- \`ingress.yaml\`: Nginx ingress (taskflow.local)

### Dapr Integration
\`\`\`yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "backend"
  dapr.io/app-port: "8000"
  dapr.io/log-level: "info"
\`\`\`

## Performance

- **Async/Await**: All I/O operations are async
- **Connection Pooling**: SQLModel session management
- **Kafka Compression**: gzip compression on events
- **WebSocket**: Efficient real-time communication
- **Caching**: In-memory conversation history (last 50 messages)

## Monitoring

- Health check: \`GET /health\`
- Readiness check: \`GET /ready\`
- Kafka publisher status
- WebSocket connection tracking
- Logging: INFO level with timestamps

---

**Version**: 0.4.0
**Last Updated**: 2026-03-21
