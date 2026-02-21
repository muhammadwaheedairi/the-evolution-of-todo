# TaskFlow - AI-Powered Task Management Platform

Enterprise-grade task management system with AI chat interface, event-driven microservices, and cloud-native deployment.

## Overview

TaskFlow is a full-stack application that combines traditional task management with AI-powered natural language processing. Users can manage tasks through either a conversational AI interface or traditional UI controls.

**Key Features**:
- 🤖 AI-powered natural language task management
- 📋 Advanced task features (priority, tags, due dates, recurring tasks)
- 🔔 Real-time notifications via WebSocket
- 📧 Email reminders for due tasks
- 🎯 Event-driven microservices architecture
- ☸️ Kubernetes-ready with Dapr integration
- 🔒 Secure JWT authentication with Argon2 password hashing

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Browser                                 │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │  Next.js 16      │              │  Socket.IO       │            │
│  │  Frontend        │◄─────────────┤  Client          │            │
│  │  (Port 3000)     │   WebSocket  │  (Real-time)     │            │
│  └────────┬─────────┘              └──────────────────┘            │
└───────────┼──────────────────────────────────────────────────────────┘
            │ HTTP/REST (JWT Auth)
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (Minikube)                     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Nginx Ingress Controller                     │ │
│  │                    (taskflow.local)                             │ │
│  └──────────┬─────────────────────────────────────┬────────────────┘ │
│             │                                     │                  │
│             ▼                                     ▼                  │
│  ┌──────────────────────┐            ┌──────────────────────┐      │
│  │  Frontend Service    │            │  Backend Service     │      │
│  │  (ClusterIP:80)      │            │  (ClusterIP:8000)    │      │
│  └──────────────────────┘            └──────────┬───────────┘      │
│                                                  │                  │
│                                      ┌───────────┴───────────┐      │
│                                      │   Dapr Sidecar        │      │
│                                      │   (Pub/Sub, State)    │      │
│                                      └───────────┬───────────┘      │
│                                                  │                  │
│                                                  ▼                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Redpanda (Kafka-compatible)                      │  │
│  │              Topics: task-events, reminders, task-updates     │  │
│  └──────────┬────────────────────────────────────┬───────────────┘  │
│             │                                    │                  │
│             ▼                                    ▼                  │
│  ┌──────────────────────┐            ┌──────────────────────┐      │
│  │ Notification Service │            │  Reminder Service    │      │
│  │ (Email + WebSocket)  │            │  (APScheduler)       │      │
│  └──────────────────────┘            └──────────────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Neon PostgreSQL      │
                    │  (Serverless)         │
                    │  - users              │
                    │  - tasks              │
                    │  - conversations      │
                    │  - messages           │
                    └───────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19.2.3, Tailwind CSS 3.4.19
- **Animations**: Framer Motion 12.34.1
- **Forms**: React Hook Form + Zod
- **AI Chat**: OpenAI ChatKit 1.5.0
- **Real-time**: Socket.IO Client 4.8.3

### Backend
- **Framework**: FastAPI 0.115.0
- **Language**: Python 3.12+
- **ORM**: SQLModel 0.0.32
- **Database**: PostgreSQL 16 (Neon Serverless)
- **Auth**: JWT + Argon2
- **AI**: OpenAI Agents SDK 0.8.1 + LiteLLM
- **Events**: Kafka (aiokafka)
- **WebSocket**: Socket.IO (python-socketio)

### Infrastructure
- **Container**: Docker (multi-stage builds)
- **Orchestration**: Kubernetes (Minikube)
- **Service Mesh**: Dapr v1.14+
- **Message Broker**: Redpanda (Kafka-compatible)
- **Ingress**: Nginx Ingress Controller
- **Deployment**: Kubernetes manifests

## Project Structure

```
phase-5-cloud/
├── frontend/                    # Next.js 16 frontend
│   ├── app/                    # App Router pages
│   ├── components/             # React components
│   ├── lib/                    # API clients, types
│   ├── Dockerfile              # Multi-stage build
│   └── README.md               # Frontend docs
├── backend/                     # FastAPI backend
│   ├── src/
│   │   ├── main.py            # App entry point
│   │   ├── models/            # SQLModel models
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── mcp/               # MCP tools
│   │   ├── events/            # Kafka + WebSocket
│   │   └── utils/             # Security, agent
│   ├── alembic/               # Database migrations
│   ├── Dockerfile             # Multi-stage build
│   └── README.md              # Backend docs
├── services/
│   ├── notification-service/  # Email + WebSocket notifications
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── reminder-service/      # Due date monitoring
│       ├── main.py
│       ├── Dockerfile
│       └── requirements.txt
├── k8s-manifests/              # Kubernetes deployments
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── notification-deployment.yaml
│   ├── reminder-deployment.yaml
│   ├── redpanda-deployment.yaml
│   └── ingress.yaml
├── kafka/                      # Kafka configuration
│   ├── topics.json
│   └── local/docker-compose.yml
├── specs/                      # Feature specifications
├── history/                    # ADRs and PHRs
└── README.md                   # This file
```

## Core Features

### 1. AI-Powered Task Management
**Natural Language Processing**:
- "add task buy groceries" → Creates task
- "show me high priority tasks" → Filters by priority
- "mark task 3 as done" → Completes task
- "add high priority task fix bug due tomorrow" → Creates with priority + due date

**AI Agent**:
- Model: arcee-ai/trinity-large-preview:free (via OpenRouter)
- Tools: add_task, list_tasks, complete_task, delete_task, update_task
- Conversational responses with emojis
- Context-aware task management

### 2. Advanced Task Features
- **Priority Levels**: High (🔴), Medium (🟡), Low (🟢)
- **Tags**: Multi-tag support with JSON storage
- **Due Dates**: Natural language parsing ("tomorrow", "next week")
- **Recurring Tasks**: Daily, weekly, monthly patterns with auto-creation
- **Search**: Full-text search in titles and descriptions
- **Filters**: Status, priority, tags, due date range
- **Sorting**: Multiple fields with asc/desc order

### 3. Event-Driven Architecture
**Kafka Topics**:
- `task-events`: CRUD operations (created, updated, completed, deleted)
- `reminders`: Scheduled task reminders
- `task-updates`: Real-time WebSocket updates

**Event Flow**:
1. User creates task → Backend publishes to `task-events`
2. Notification service consumes → Sends WebSocket notification
3. Reminder service monitors → Publishes to `reminders` when due
4. Notification service consumes → Sends email reminder

### 4. Real-time Notifications
- **WebSocket**: Socket.IO for browser notifications
- **Email**: SMTP integration for task reminders
- **Audio**: Sound alerts on task updates
- **Visual**: Toast notifications with icons

### 5. Microservices
**Backend Service**:
- REST API for task management
- AI chat endpoint
- JWT authentication
- Kafka event publishing
- WebSocket server

**Notification Service**:
- Consumes task-events and reminders
- Sends browser notifications via WebSocket
- Sends email reminders via SMTP
- Fetches user data from backend internal API

**Reminder Service**:
- Polls backend every 1 minute for due tasks
- Publishes reminder events to Kafka
- Tracks sent reminders (in-memory)
- Clears reminders on task completion

## Deployment

### Local Development

#### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- Docker & Docker Compose
- Minikube v1.38+
- kubectl v1.35+
- Helm v3.20+

#### Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd phase-5-cloud
```

2. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev  # http://localhost:3000
```

3. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with database URL, JWT secret, OpenRouter API key
alembic upgrade head
uvicorn src.main:app --reload  # http://localhost:8000
```

4. **Kafka Setup (Local)**
```bash
cd kafka/local
docker-compose up -d
```

### Kubernetes Deployment

#### Prerequisites
- Minikube running
- kubectl configured
- Docker images built

#### Build Images
```bash
# Frontend
cd frontend
docker build -t taskflow-frontend:latest .

# Backend
cd backend
docker build -t taskflow-backend:latest .

# Notification Service
cd services/notification-service
docker build -t taskflow-notification:latest .

# Reminder Service
cd services/reminder-service
docker build -t taskflow-reminder:latest .
```

#### Create Secrets
```bash
kubectl create secret generic taskflow-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=jwt-secret='your-secret-key' \
  --from-literal=openrouter-api-key='sk-or-v1-...'
```

#### Deploy
```bash
# Deploy Redpanda (Kafka)
kubectl apply -f k8s-manifests/redpanda-deployment.yaml

# Deploy Backend
kubectl apply -f k8s-manifests/backend-deployment.yaml

# Deploy Frontend
kubectl apply -f k8s-manifests/frontend-deployment.yaml

# Deploy Microservices
kubectl apply -f k8s-manifests/notification-deployment.yaml
kubectl apply -f k8s-manifests/reminder-deployment.yaml

# Deploy Ingress
kubectl apply -f k8s-manifests/ingress.yaml
```

#### Access Application
```bash
# Add to /etc/hosts
echo "$(minikube ip) taskflow.local" | sudo tee -a /etc/hosts

# Open browser
open http://taskflow.local
```

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://taskflow.local
NEXT_PUBLIC_WS_URL=http://taskflow.local
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-...  # Production only
```

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=arcee-ai/trinity-large-preview:free
KAFKA_BOOTSTRAP_SERVERS=taskflow-redpanda:9092
KAFKA_ENABLED=true
INTERNAL_SECRET=internal-service-secret-2026
```

#### Notification Service (.env)
```bash
KAFKA_BOOTSTRAP_SERVERS=taskflow-redpanda:9092
BACKEND_URL=http://backend-service:8000
INTERNAL_SECRET=internal-service-secret-2026
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Reminder Service (.env)
```bash
KAFKA_BOOTSTRAP_SERVERS=taskflow-redpanda:9092
BACKEND_URL=http://backend-service:8000
INTERNAL_SECRET=internal-service-secret-2026
CHECK_INTERVAL_MINUTES=1
```

## API Documentation

### Authentication
```
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login user
```

### Tasks (JWT Required)
```
GET    /api/{user_id}/tasks              # List tasks
POST   /api/{user_id}/tasks              # Create task
GET    /api/{user_id}/tasks/{task_id}    # Get task
PUT    /api/{user_id}/tasks/{task_id}    # Update task
PATCH  /api/{user_id}/tasks/{task_id}/complete  # Toggle completion
DELETE /api/{user_id}/tasks/{task_id}    # Delete task
```

### Chat (JWT Required)
```
POST   /api/{user_id}/chat                      # Send message to AI
GET    /api/{user_id}/conversations/history     # Get chat history
DELETE /api/{user_id}/conversations/clear       # Clear history
```

### Health
```
GET /health  # Health check
GET /ready   # Readiness check
```

## Security

### Authentication
- **JWT Tokens**: HS256 algorithm, 7-day expiry
- **Password Hashing**: Argon2 (strongest algorithm)
- **User Isolation**: All queries filtered by user_id
- **Authorization**: URL user_id must match JWT user_id
- **Error Handling**: Return 404 (not 403) to prevent info leakage

### API Security
- CORS configuration
- Input validation with Pydantic/Zod
- SQL injection prevention (SQLModel parameterized queries)
- XSS prevention (React auto-escaping)
- CSRF protection (SameSite cookies)

## Monitoring & Observability

### Health Checks
- Backend: `GET /health`, `GET /ready`
- Notification Service: `GET /health`
- Reminder Service: `GET /health`

### Logging
- Structured logging with timestamps
- Log levels: INFO, WARNING, ERROR
- Kafka event tracking
- WebSocket connection tracking

### Metrics
- Task creation/completion rates
- AI agent response times
- Kafka message throughput
- WebSocket connection count

## Performance

- **Async/Await**: All I/O operations are async
- **Connection Pooling**: Database session management
- **Kafka Compression**: gzip compression on events
- **Caching**: In-memory conversation history (last 50 messages)
- **Code Splitting**: Next.js automatic route-based splitting
- **Lazy Loading**: Dynamic imports for heavy components

## Testing

### Backend
```bash
cd backend
pytest                          # Run all tests
pytest --cov=src               # With coverage
pytest tests/test_tasks.py     # Specific test file
```

### Frontend
```bash
cd frontend
npm run test                   # Unit tests
npm run test:e2e              # E2E tests (Playwright)
```

## Troubleshooting

### Common Issues

**1. Kafka Connection Failed**
```bash
# Check Redpanda is running
kubectl get pods | grep redpanda
kubectl logs <redpanda-pod>

# Verify bootstrap servers
kubectl exec -it <backend-pod> -- env | grep KAFKA
```

**2. WebSocket Not Connecting**
```bash
# Check backend WebSocket server
kubectl logs <backend-pod> | grep WebSocket

# Verify ingress configuration
kubectl describe ingress taskflow-ingress
```

**3. AI Agent Not Responding**
```bash
# Check OpenRouter API key
kubectl get secret taskflow-secrets -o yaml

# Verify agent logs
kubectl logs <backend-pod> | grep agent
```

**4. Database Migration Failed**
```bash
# Check database connection
kubectl exec -it <backend-pod> -- python -c "from src.database import engine; print(engine.url)"

# Run migrations manually
kubectl exec -it <backend-pod> -- alembic upgrade head
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- OpenAI Agents SDK for AI integration
- FastAPI for backend framework
- Next.js for frontend framework
- Redpanda for Kafka-compatible messaging
- Dapr for microservices runtime

---

**Version**: 0.3.0 (Phase 5)
**Last Updated**: 2026-02-21
**Status**: Production Ready
