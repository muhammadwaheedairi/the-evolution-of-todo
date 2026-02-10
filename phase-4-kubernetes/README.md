# 🤖 TaskFlow AI - Intelligent Todo Management

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

**A full-stack AI-powered task management application with natural language interface**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference)

</div>

---

## 📋 Overview

TaskFlow AI is a modern, full-stack todo application that combines traditional task management with AI-powered conversational interfaces. Built as a three-phase hackathon project, it demonstrates advanced patterns in authentication, database design, and AI agent orchestration using the Model Context Protocol (MCP).

### 🎯 Project Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Database & Authentication Foundation | ✅ Complete |
| **Phase 2** | Full-Stack REST API with JWT Authentication | ✅ Complete |
| **Phase 3** | AI Chatbot with MCP Tools | ✅ Complete |
| **Phase 4** | Local Kubernetes Deployment | ✅ Complete |

### ✨ Key Highlights

- 🔐 **Custom JWT Authentication** with Argon2 password hashing
- 🤖 **AI Agent Integration** using OpenAI Agents SDK with LiteLLM
- 🛠️ **MCP Tool Protocol** for standardized AI-task interactions
- 💬 **Conversational Interface** with OpenAI ChatKit
- 🎨 **Modern UI** with Next.js 16 App Router and Tailwind CSS
- 🗄️ **PostgreSQL Database** with SQLModel ORM
- 🔒 **User Isolation** - Complete data separation per user
- 📱 **Responsive Design** - Works on desktop and mobile
- 🏗️ **Monorepo Structure** - Frontend and backend in one repository
- ☸️ **Kubernetes Ready** - Production-grade local deployment with Helm

---

## 🚀 Features

### Phase 2: REST API (Complete)

#### Authentication System
- User registration with email validation
- Secure login with JWT token generation
- Argon2 password hashing (OWASP recommended)
- Token-based authorization on all endpoints
- Automatic token refresh and logout handling

#### Task Management
- Create tasks with title and description
- List all tasks with filtering (all/pending/completed)
- Update task details (title, description)
- Toggle task completion status
- Delete tasks permanently
- User-specific task isolation (users only see their own tasks)

#### User Interface
- Responsive task list with empty states
- Task creation and editing forms with validation
- Real-time task updates without page refresh
- User profile display in header
- Clean, modern design with Tailwind CSS
- Mobile-friendly responsive layout

### Phase 3: AI Chatbot (In Progress)

#### Natural Language Interface
- Chat with AI to manage tasks conversationally
- Natural language task creation
- Conversational task queries
- Multi-turn conversations with context awareness
- Intent recognition and parameter extraction

#### MCP Tools (Implemented)
- **add_task** - Create tasks via natural language
- **list_tasks** - Query tasks by status (all/pending/completed)
- **complete_task** - Mark tasks as complete
- **delete_task** - Remove tasks
- **update_task** - Modify task details

#### AI Agent Features
- OpenAI Agents SDK integration
- LiteLLM for model flexibility (supports OpenRouter)
- Tool calling with function decorators
- System prompt for task assistant behavior
- Conversational response generation
- Tool execution transparency

### Phase 4: Kubernetes Deployment (Complete)

#### Container Infrastructure
- Multi-stage Docker builds for minimal image sizes (<500MB)
- Non-root container execution for security
- Health check endpoints for liveness and readiness probes
- Optimized layer caching for fast rebuilds
- Production-ready container images

#### Kubernetes Resources
- Helm charts for declarative infrastructure
- Frontend deployment with NodePort service (external access)
- Backend deployment with ClusterIP service (internal)
- ConfigMaps for non-sensitive configuration
- Kubernetes Secrets for sensitive data (JWT, API keys, database)
- Resource limits and requests for stability

#### Deployment Features
- One-command deployment with Helm
- Automated health monitoring
- Rolling updates with zero downtime
- Easy rollback to previous versions
- Horizontal scalability ready
- Local development with Minikube

#### Security & Best Practices
- Secrets management via Kubernetes Secrets
- Pod security contexts (non-root users)
- Resource quotas to prevent resource exhaustion
- Network policies for service isolation
- Health probes for automatic recovery
- Infrastructure as Code with Helm

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI component library |
| TypeScript | 5.0+ | Type-safe JavaScript |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| React Hook Form | Latest | Form state management |
| Zod | Latest | Schema validation |
| OpenAI ChatKit | 1.5.0 | Conversational UI component |
| Lucide React | Latest | Icon library |

#### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115+ | Modern Python web framework |
| Python | 3.13+ | Programming language |
| SQLModel | 0.0.22 | SQL database ORM |
| PostgreSQL | 16 | Relational database |
| python-jose | Latest | JWT token handling |
| argon2-cffi | Latest | Password hashing |
| OpenAI Agents SDK | 0.8.1 | AI agent orchestration |
| LiteLLM | Latest | Multi-model LLM gateway |
| Uvicorn | Latest | ASGI server |

#### Database & Infrastructure
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **Package Manager**: UV (backend), npm/yarn/pnpm (frontend)
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes (Minikube for local)
- **Package Management**: Helm 3+ for Kubernetes deployments
- **Deployment**: Docker Compose (development), Kubernetes (production-like)

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js 16  │  │   ChatKit    │  │  Tailwind    │      │
│  │  App Router  │  │   (Phase 3)  │  │     CSS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     JWT Token Auth                           │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    HTTP/REST API
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                            │         Backend                  │
│                     ┌──────▼──────┐                          │
│                     │   FastAPI   │                          │
│                     │  Endpoints  │                          │
│                     └──────┬──────┘                          │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐       │
│    │  Auth   │      │   Task    │     │   Chat    │       │
│    │ Service │      │  Service  │     │  Service  │       │
│    └─────────┘      └─────┬─────┘     └─────┬─────┘       │
│                            │                  │             │
│                            │           ┌──────▼──────┐      │
│                            │           │  AI Agent   │      │
│                            │           │  (OpenAI)   │      │
│                            │           └──────┬──────┘      │
│                            │                  │             │
│                            │           ┌──────▼──────┐      │
│                            │           │  MCP Tools  │      │
│                            │           │  (5 tools)  │      │
│                            │           └──────┬──────┘      │
│                            │                  │             │
│                     ┌──────▼──────────────────▼──────┐      │
│                     │      SQLModel ORM              │      │
│                     └──────────────┬─────────────────┘      │
└────────────────────────────────────┼─────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   PostgreSQL DB     │
                          │  (Neon Serverless)  │
                          └─────────────────────┘
```

### Database Schema

#### Core Tables

**users** (Application-managed authentication)
- Stores user accounts with UUID primary keys
- Email addresses (unique, indexed)
- Argon2 hashed passwords
- User profile information (name)
- Timestamps for account tracking

**tasks** (Task management)
- Task records with auto-incrementing IDs
- Foreign key relationship to users
- Title and description fields
- Completion status (boolean)
- User isolation via user_id filtering
- Timestamps for creation and updates

**conversations** (Phase 3 - Chat history)
- Conversation sessions per user
- Foreign key relationship to users
- Indexed by user_id for fast queries
- Timestamps for session tracking

**messages** (Phase 3 - Chat messages)
- Individual messages in conversations
- Foreign keys to both users and conversations
- Role field (user or assistant)
- Message content (text)
- Indexed for efficient history retrieval

### Project Structure

```
Todo-Full-Stack-Web-Application/
├── frontend/                 # Next.js 16 App Router application
│   ├── app/                 # Pages and layouts
│   │   ├── page.tsx        # Landing page
│   │   ├── layout.tsx      # Root layout
│   │   ├── login/          # Authentication pages
│   │   ├── register/
│   │   ├── tasks/          # Task management UI
│   │   └── chat/           # AI chat interface (Phase 3)
│   ├── components/          # React components
│   │   ├── chat/           # Chat UI components
│   │   ├── Header.tsx
│   │   ├── TaskList.tsx
│   │   └── ...
│   ├── lib/                # API clients and utilities
│   │   ├── api.ts          # Task API client
│   │   ├── chat-api.ts     # Chat API client (Phase 3)
│   │   └── types.ts        # TypeScript definitions
│   └── README.md           # Frontend documentation
│
├── backend/                 # FastAPI Python backend
│   ├── src/
│   │   ├── main.py         # Application entry point
│   │   ├── config.py       # Configuration management
│   │   ├── database.py     # Database connection
│   │   ├── models/         # SQLModel database models
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── conversation.py
│   │   │   └── message.py
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── task.py
│   │   │   └── chat.py
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── chat.py
│   │   │   └── health.py   # Health check endpoints (Phase 4)
│   │   ├── services/       # Business logic layer
│   │   │   ├── task_service.py
│   │   │   ├── conversation_service.py
│   │   │   └── message_service.py
│   │   ├── mcp/            # MCP server (Phase 3)
│   │   │   ├── server.py
│   │   │   ├── tools.py
│   │   │   └── config.py
│   │   ├── middleware/     # Authentication middleware
│   │   │   └── auth.py
│   │   └── utils/          # Utility functions
│   │       ├── security.py
│   │       ├── validation.py
│   │       └── agent.py
│   ├── alembic/            # Database migrations
│   │   └── versions/
│   ├── Dockerfile          # Multi-stage Docker build (Phase 4)
│   ├── .dockerignore       # Docker build exclusions (Phase 4)
│   └── README.md           # Backend documentation
│
├── helm/                    # Kubernetes Helm charts (Phase 4)
│   ├── Chart.yaml          # Chart metadata
│   ├── values.yaml         # Default configuration
│   ├── values-dev.yaml     # Development overrides
│   ├── templates/          # Kubernetes resource templates
│   │   ├── _helpers.tpl    # Template helpers
│   │   ├── frontend-deployment.yaml
│   │   ├── frontend-service.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── configmap.yaml
│   │   └── NOTES.txt
│   └── README.md           # Helm deployment guide
│
├── docs/                    # Documentation (Phase 4)
│   └── deployment/
│       ├── minikube-setup.md
│       ├── lifecycle-management.md
│       ├── secrets-management.md
│       ├── configuration.md
│       ├── troubleshooting.md
│       └── phase-iii-verification.md
│
├── scripts/                 # Automation scripts (Phase 4)
│   ├── verify-environment.sh
│   ├── create-secrets.sh
│   ├── build-images.sh
│   └── deploy-local.sh
│
├── specs/                   # Feature specifications
│   ├── 001-phase-2-fullstack/
│   ├── 002-backend-ai-infrastructure/
│   ├── 003-frontend-chat-interface/
│   └── 004-local-k8s-deployment/  # Phase 4 specs
│
├── history/                 # Development history
│   ├── adr/                # Architecture Decision Records
│   │   ├── 001-technology-stack.md
│   │   ├── 002-monorepo-architecture.md
│   │   ├── 003-authentication-strategy.md
│   │   ├── 004-database-strategy.md
│   │   ├── 005-ai-agent-stack.md
│   │   ├── 006-conversation-data.md
│   │   └── 007-mcp-architecture.md
│   └── prompts/            # Development prompts
│
├── .specify/               # SpecKit templates
│   ├── memory/
│   │   └── constitution.md # Project principles (v2.0.0)
│   └── templates/
│
├── docker-compose.yml      # Multi-service setup
├── .gitignore
├── CLAUDE.md              # AI development instructions
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **Python** 3.13+
- **PostgreSQL** 16+ (or Neon account)
- **OpenRouter API Key** (for AI features)
- **Docker** 24+ (for containerized deployment)
- **Minikube** 1.32+ (for Kubernetes deployment)
- **Helm** 3.12+ (for Kubernetes deployment)
- **kubectl** 1.28+ (for Kubernetes deployment)

### Deployment Options

Choose one of the following deployment methods:

#### Option 1: Local Development (Recommended for Development)

Best for: Active development, debugging, hot reload

#### Option 2: Docker Compose (Recommended for Testing)

Best for: Testing full stack locally, simulating production

#### Option 3: Kubernetes with Minikube (Recommended for Production-like Environment)

Best for: Production-like testing, learning Kubernetes, deployment validation

---

### Option 1: Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Todo-Full-Stack-Web-Application
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Set up environment variables (create .env file)
# See backend/README.md for required variables

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (create .env.local file)
# See frontend/README.md for required variables

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 4. Using Docker Compose (Alternative)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 3: Kubernetes Deployment with Minikube

#### Prerequisites

Ensure you have the following tools installed:
- Docker 24+
- Minikube 1.32+
- kubectl 1.28+
- Helm 3.12+

For detailed installation instructions, see [Minikube Setup Guide](./docs/deployment/minikube-setup.md).

#### Quick Deployment

```bash
# 1. Start Minikube with adequate resources
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Configure Docker to use Minikube's daemon
eval $(minikube docker-env)

# 3. Build Docker images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# 4. Create Kubernetes namespace
kubectl create namespace todo-app

# 5. Create secrets (replace with your actual values)
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:5432/db?sslmode=require' \
  --from-literal=JWT_SECRET_KEY='your-jwt-secret-key-here' \
  --from-literal=JWT_ALGORITHM='HS256' \
  --from-literal=ACCESS_TOKEN_EXPIRE_DAYS='7' \
  --from-literal=UV_ENVIRONMENT='production' \
  --from-literal=OPENROUTER_API_KEY='sk-or-v1-your-key-here' \
  --namespace=todo-app

# 6. Deploy with Helm
helm install todo-app ./helm \
  --namespace=todo-app \
  --values=helm/values-dev.yaml

# 7. Wait for pods to be ready
kubectl wait --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=todo-app \
  --namespace=todo-app \
  --timeout=120s

# 8. Get application URL
minikube service todo-app-frontend -n todo-app --url
```

#### Automated Deployment Script

For convenience, use the automated deployment script:

```bash
# Run automated deployment
./scripts/deploy-local.sh

# The script will:
# - Verify prerequisites
# - Configure Docker environment
# - Build images
# - Create namespace and secrets (interactive)
# - Deploy with Helm
# - Display access URL
```

#### Accessing the Application

After deployment, access the application at:

```bash
# Get Minikube IP and NodePort
MINIKUBE_IP=$(minikube ip)
NODE_PORT=$(kubectl get service todo-app-frontend -n todo-app -o jsonpath='{.spec.ports[0].nodePort}')

# Application URL
echo "http://$MINIKUBE_IP:$NODE_PORT"

# Or use Minikube service command (opens browser)
minikube service todo-app-frontend -n todo-app
```

#### Managing the Deployment

**View pod status:**
```bash
kubectl get pods -n todo-app
```

**View logs:**
```bash
# Frontend logs
kubectl logs -n todo-app deployment/todo-app-frontend -f

# Backend logs
kubectl logs -n todo-app deployment/todo-app-backend -f
```

**Upgrade deployment:**
```bash
# After code changes, rebuild images
eval $(minikube docker-env)
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# Restart deployments
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

**Uninstall:**
```bash
# Remove Helm release
helm uninstall todo-app -n todo-app

# Delete namespace (optional)
kubectl delete namespace todo-app
```

#### Kubernetes Documentation

For detailed Kubernetes deployment documentation, see:
- **[Helm Deployment Guide](./helm/README.md)** - Complete Helm chart documentation
- **[Minikube Setup](./docs/deployment/minikube-setup.md)** - Tool installation and configuration
- **[Lifecycle Management](./docs/deployment/lifecycle-management.md)** - Upgrade, rollback, uninstall procedures
- **[Secrets Management](./docs/deployment/secrets-management.md)** - Managing sensitive configuration
- **[Configuration Guide](./docs/deployment/configuration.md)** - ConfigMaps and environment variables
- **[Troubleshooting](./docs/deployment/troubleshooting.md)** - Common issues and solutions
- **[Phase III Verification](./docs/deployment/phase-iii-verification.md)** - Testing checklist

---

## 📚 Documentation

### Component Documentation

- **[Frontend Documentation](./frontend/README.md)** - Next.js app structure, components, API client, chat interface
- **[Backend Documentation](./backend/README.md)** - FastAPI endpoints, services, MCP tools, AI agent
- **[Helm Deployment Guide](./helm/README.md)** - Kubernetes deployment with Helm charts
- **[Kubernetes Documentation](./docs/deployment/)** - Complete Kubernetes deployment guides
- **[Architecture Decisions](./history/adr/)** - 7 ADRs documenting key architectural decisions
- **[Specifications](./specs/)** - Detailed feature specifications for all four phases

### Key Concepts

#### Authentication Flow

The application uses a custom JWT authentication system:

1. User registers or logs in through the frontend
2. Backend validates credentials and generates JWT token (7-day expiration)
3. Frontend stores token in both localStorage and cookies
4. All API requests include token in Authorization header
5. Backend validates token and extracts user_id on every request
6. Backend enforces user isolation by filtering all queries by user_id

#### AI Agent Flow (Phase 3)

The conversational interface follows this pattern:

1. User sends natural language message via chat interface
2. Backend authenticates request using JWT validation
3. System retrieves or creates conversation in database
4. User message is saved to database
5. Full conversation history is loaded from database
6. OpenAI Agent processes message with conversation context
7. Agent invokes appropriate MCP tools based on intent
8. Tools execute via existing task service layer
9. Agent generates conversational response
10. Assistant response is saved to database
11. Response returned to frontend with tool execution details

#### MCP Tools Architecture

All MCP tools are wrappers around existing task service functions:

- **Code Reuse**: Tools call existing `task_service.py` functions
- **User Validation**: All tools validate user_id before execution
- **Standardized Interface**: Consistent input/output format for AI agent
- **Security**: Same user isolation rules as REST endpoints
- **Transparency**: Tool execution results visible to users

---

## 🔌 API Reference

### Base URLs

- **Development**: `http://localhost:8000`
- **Production**: `https://muhammadwaheedairi-taskflow-backend-ai.hf.space`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |

### Task Management Endpoints

All task endpoints require JWT authentication via Authorization header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all user tasks |
| POST | `/api/{user_id}/tasks` | Create new task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get specific task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task |

### Chat Endpoints (Phase 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{user_id}/chat` | Send message to AI agent |
| GET | `/api/{user_id}/conversations/history` | Get conversation history |
| DELETE | `/api/{user_id}/conversations/clear` | Clear conversation history |

### MCP Tools (Phase 3)

Available tools for AI agent:

| Tool | Purpose | Parameters |
|------|---------|------------|
| `add_task` | Create new task | user_id, title, description (optional) |
| `list_tasks` | List tasks by status | user_id, status (all/pending/completed) |
| `complete_task` | Mark task complete | user_id, task_id |
| `delete_task` | Remove task | user_id, task_id |
| `update_task` | Modify task | user_id, task_id, title, description |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

**Note**: Comprehensive test infrastructure is planned but not yet fully implemented.

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- Verify Python version is 3.13 or higher
- Check DATABASE_URL is correctly configured
- Ensure all migrations have been applied
- Verify API keys are set in environment variables

#### Frontend can't connect to backend
- Confirm backend is running on expected port
- Check NEXT_PUBLIC_API_URL in frontend .env.local
- Verify CORS settings allow frontend origin
- Clear browser cache and localStorage

#### AI chat not working
- Verify OpenRouter API key is valid and has credits
- Check if free model is available
- Ensure chat endpoint authentication is working
- Check backend logs for AI agent errors

#### Database connection errors
- Verify PostgreSQL service is running
- Check connection string format is correct
- For Neon: Ensure serverless connection string is used
- Try running migrations again

### Kubernetes-Specific Issues

#### Pods stuck in Pending
- Check Minikube has sufficient resources (4 CPU, 8GB RAM minimum)
- Verify images exist: `eval $(minikube docker-env) && docker images | grep todo`
- Check resource limits in values-dev.yaml
- View pod events: `kubectl describe pod <pod-name> -n todo-app`

#### Pods in CrashLoopBackOff
- Check pod logs: `kubectl logs <pod-name> -n todo-app --previous`
- Verify secrets exist: `kubectl get secrets -n todo-app`
- Check environment variables are correctly configured
- Ensure database connection string is valid

#### ImagePullBackOff errors
- Ensure `imagePullPolicy: Never` in values-dev.yaml
- Verify Docker environment: `eval $(minikube docker-env)`
- Rebuild images in Minikube's Docker daemon
- Check image names match in values files

#### Cannot access application
- Get Minikube IP: `minikube ip`
- Get NodePort: `kubectl get svc todo-app-frontend -n todo-app`
- Try port-forward: `kubectl port-forward -n todo-app service/todo-app-frontend 3000:3000`
- Check pods are Running: `kubectl get pods -n todo-app`

#### Health check failures
- Verify health endpoints respond: `kubectl logs -n todo-app deployment/todo-app-backend`
- Check database connectivity from backend pod
- Increase probe delays in values-dev.yaml if needed
- Ensure backend started successfully

For comprehensive Kubernetes troubleshooting, see [Troubleshooting Guide](./docs/deployment/troubleshooting.md).

---

## 🚧 Known Limitations

### Current Implementation

- **AI Model**: Using OpenRouter with LiteLLM, not official OpenAI API
- **Test coverage**: Testing infrastructure planned but not complete
- **Rate limiting**: Not implemented (should be added for production)
- **Email verification**: Registration accepts any email format

### Planned Improvements

- Official OpenAI API integration option
- Comprehensive test suite (unit, integration, E2E)
- Rate limiting and request throttling
- Email verification flow
- Password reset functionality
- Task categories and tags
- Task due dates and reminders
- Task priority levels
- Bulk task operations
- Production Kubernetes deployment (cloud providers)
- CI/CD pipeline for automated deployments
- Monitoring and observability (Prometheus, Grafana)

---

## 📖 Natural Language Examples (Phase 3)

The AI chat interface understands these types of commands:

| User Says | Agent Action |
|-----------|--------------|
| "add task buy groceries" | Creates task with title "buy groceries" |
| "show me all tasks" | Lists all tasks in conversational format |
| "what's pending?" | Lists only pending tasks |
| "mark task 3 as done" | Marks task ID 3 as completed |
| "delete the meeting task" | Finds and deletes matching task |
| "change task 1 to 'call mom tonight'" | Updates task 1 with new title |
| "I need to remember to pay bills" | Creates task "pay bills" |
| "what have I completed?" | Lists completed tasks |

---

## 🤝 Contributing

This project follows Spec-Driven Development (SDD) methodology:

1. **Write Specification** - Define requirements in `/specs`
2. **Generate Plan** - Create implementation plan
3. **Break into Tasks** - Decompose into actionable tasks
4. **Implement** - Execute via development workflow
5. **Document Decisions** - Record ADRs for significant choices

---

## 📄 License

This project is built for educational and hackathon purposes.

---

## 🙏 Acknowledgments

- **OpenAI** - Agents SDK and ChatKit
- **FastAPI** - Modern Python web framework
- **Next.js** - React framework
- **Neon** - Serverless PostgreSQL
- **Vercel** - Deployment platform

---

<div align="center">

**Built with ❤️ for Hackathon 2**

[⬆ Back to Top](#-taskflow-ai---intelligent-todo-management)

</div>
