# The Evolution of Todo

> **A Journey from Console to Cloud-Native AI**

*Hackathon II: Mastering Spec-Driven Development & Cloud Native AI*

---

## 🌟 The Story

This repository documents the complete evolution of a todo application, progressing through five distinct stages—from a simple Python console script to a production-grade, AI-powered, cloud-native distributed system.

**Each phase represents a real-world progression in software development:**
```
Console Script → Web Application → AI Chatbot → Kubernetes → Cloud Production
```

---

## 📖 Evolution Stages

| Stage | Description | Status | Live Demo |
|-------|-------------|--------|-----------|
| **[Phase 1: Console](./phase-1-console/)** | In-memory Python CLI | ✅ Complete | - |
| **[Phase 2: Full-Stack](./phase-2-fullstack/)** | Multi-user web app | ✅ Complete | [View →](https://the-evolution-of-todo-sandy.vercel.app/) |
| **[Phase 3: AI Chatbot](./phase-3-ai-chatbot/)** | AI-powered task management | ✅ Complete | [View →](https://the-evolution-of-todo-dun.vercel.app/) |
| **[Phase 4: Kubernetes](./phase-4-kubernetes/)** | Containerized orchestration | ✅ Complete | Local (Minikube) |
| **[Phase 5: Cloud Native](./phase-5-claude/)** | Event-driven microservices | ✅ Complete | Local (Minikube + Kafka) |

---

## 🎯 Project Highlights

### **✅ Completed Phases (1, 2, 3, 4, 5)**

- ✅ **Phase 1**: Console todo app with in-memory storage
- ✅ **Phase 2**: Full-stack web application with JWT auth, PostgreSQL, deployed on Vercel
- ✅ **Phase 3**: AI-powered chatbot with OpenAI Agents SDK, MCP tools, and natural language interface
- ✅ **Phase 4**: Kubernetes deployment with Docker containers, Helm charts, and automated orchestration
- ✅ **Phase 5**: Event-driven microservices with Kafka, Dapr, real-time notifications, and email reminders

---

## 🏗️ Architecture Evolution

### Phase 1: Console App
```
┌─────────────┐
│   Python    │
│   Script    │
└─────────────┘
     ↓
 In-Memory
```

### Phase 2: Web Application
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │────▶│ FastAPI  │────▶│  Neon    │
│ Frontend │     │ Backend  │     │  DB      │
└──────────┘     └──────────┘     └──────────┘
```

### Phase 3: AI Chatbot
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ ChatKit  │────▶│ FastAPI  │────▶│ OpenAI   │────▶│  Neon    │
│   UI     │     │   Chat   │     │  Agent   │     │  DB      │
│          │     │ Endpoint │     │ + MCP    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### Phase 4: Kubernetes
```
┌─────────────────────────────────────────────────────┐
│              Minikube Cluster                       │
│  ┌──────────────┐         ┌──────────────┐        │
│  │  Frontend    │         │   Backend    │        │
│  │  Pods (x2)   │────────▶│   Pods (x2)  │───┐    │
│  │  NodePort    │         │  ClusterIP   │   │    │
│  └──────────────┘         └──────────────┘   │    │
│       :30000                                  │    │
└───────────────────────────────────────────────┼────┘
                                                │
                                                ▼
                                          ┌──────────┐
                                          │  Neon    │
                                          │  DB      │
                                          └──────────┘
```

### Phase 5: Cloud Native (Event-Driven Microservices)
```
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                            │
│  ┌──────────┐    Nginx Ingress    ┌──────────┐                 │
│  │ Frontend │◄───(taskflow.local)──│ Backend  │                 │
│  │ Service  │                      │ + Dapr   │                 │
│  └──────────┘                      └────┬─────┘                 │
│                                         │                        │
│                    ┌────────────────────┴────────────────┐      │
│                    │     Redpanda (Kafka)                │      │
│                    │  Topics: task-events, reminders     │      │
│                    └────────────────────────────────────┘      │
│                                         │                        │
│              ┌──────────────────────────▼──────────────────┐    │
│              │ Backend (Integrated)                         │    │
│              │ - Notification Consumer (WebSocket + Email)  │    │
│              │ - Reminder Scheduler (APScheduler)           │    │
│              └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
                   ┌──────────┐
                   │  Neon    │
                   │  DB      │
                   └──────────┘
```

---

## 📁 Phase 5: Complete Project Structure

```
phase-5-cloud/                           # Final Phase - Event-Driven Microservices
├── backend/                             # FastAPI Backend Service
│   ├── src/
│   │   ├── events/                      # Event-Driven Architecture
│   │   │   ├── __init__.py
│   │   │   ├── publisher.py            # Kafka event publisher
│   │   │   ├── consumer.py             # Kafka consumer (notifications + email)
│   │   │   ├── scheduler.py            # APScheduler (due date reminders)
│   │   │   ├── schemas.py              # Event schemas (TaskEvent, ReminderEvent)
│   │   │   └── websocket.py            # Socket.IO WebSocket manager
│   │   ├── mcp/                         # Model Context Protocol Tools
│   │   │   ├── __init__.py
│   │   │   ├── config.py               # MCP configuration
│   │   │   ├── server.py               # MCP server initialization
│   │   │   └── tools.py                # 5 MCP tools (add, list, complete, delete, update)
│   │   ├── middleware/
│   │   │   └── auth.py                 # JWT authentication middleware
│   │   ├── models/                      # SQLModel Database Models
│   │   │   ├── conversation.py         # Conversation & Message models
│   │   │   ├── task.py                 # Task model (priority, tags, due_date, recurrence)
│   │   │   └── user.py                 # User model (Argon2 hashing)
│   │   ├── routers/                     # FastAPI Route Handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 # Register/Login endpoints
│   │   │   ├── chat.py                 # AI chat endpoint
│   │   │   ├── health.py               # Health checks
│   │   │   ├── internal.py             # Internal API (microservices)
│   │   │   ├── notifications.py        # WebSocket notification endpoint
│   │   │   └── tasks.py                # Task CRUD endpoints
│   │   ├── schemas/                     # Pydantic Request/Response Schemas
│   │   │   ├── auth.py                 # Auth schemas
│   │   │   ├── chat.py                 # Chat request/response
│   │   │   └── task.py                 # Task schemas
│   │   ├── services/                    # Business Logic Layer
│   │   │   ├── __init__.py
│   │   │   ├── conversation_service.py # Chat history management
│   │   │   ├── message_service.py      # Message operations
│   │   │   ├── task_service.py         # Task business logic
│   │   │   └── user_service.py         # User operations
│   │   ├── utils/                       # Utility Functions
│   │   │   ├── agent.py                # AI agent creation (OpenAI + LiteLLM)
│   │   │   ├── security.py             # JWT + Argon2 utilities
│   │   │   └── validation.py           # Input validation
│   │   ├── config.py                    # Application settings (Pydantic)
│   │   ├── database.py                  # SQLModel session management
│   │   └── main.py                      # FastAPI app entry point
│   ├── alembic/                         # Database Migrations
│   │   ├── versions/
│   │   │   └── 2026-01-29_5050a5c0f214_create_users_and_tasks_tables.py
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── CLAUDE.md                        # Backend development instructions
│   ├── Dockerfile                       # Multi-stage Docker build
│   ├── README.md                        # Backend documentation
│   ├── alembic.ini                      # Alembic configuration
│   ├── pyproject.toml                   # Project metadata
│   ├── requirements.txt                 # Python dependencies
│   └── uv.lock                          # UV lock file
│
├── frontend/                            # Next.js 16 Frontend
│   ├── app/                             # Next.js App Router
│   │   ├── chat/
│   │   │   └── page.tsx                # AI chat interface page
│   │   ├── login/
│   │   │   └── page.tsx                # Login page
│   │   ├── register/
│   │   │   └── page.tsx                # Registration page
│   │   ├── tasks/
│   │   │   ├── [id]/                   # Dynamic task detail route
│   │   │   └── page.tsx                # Task management dashboard
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Landing page
│   ├── components/
│   │   ├── chat/                        # Chat Components
│   │   │   ├── ChatInput.tsx           # Message input field
│   │   │   ├── ChatInterface.tsx       # Main chat wrapper
│   │   │   ├── MessageList.tsx         # Conversation history
│   │   │   └── ToolCallIndicator.tsx   # Tool execution badges
│   │   ├── tasks/                       # Task Components
│   │   │   ├── DueDatePicker.tsx       # Due date selector
│   │   │   ├── PriorityBadge.tsx       # Priority indicator
│   │   │   ├── RecurrenceSelector.tsx  # Recurring task config
│   │   │   ├── TagCloud.tsx            # Tag management
│   │   │   └── TaskFilters.tsx         # Filter/search/sort panel
│   │   ├── EmptyState.tsx               # Empty state UI
│   │   ├── Footer.tsx                   # Footer component
│   │   ├── Header.tsx                   # Navigation bar
│   │   ├── KanbanBoard.tsx              # Kanban view
│   │   ├── LoginForm.tsx                # Login form
│   │   ├── RegisterForm.tsx             # Registration form
│   │   ├── TaskForm.tsx                 # Create/edit task form
│   │   ├── TaskItem.tsx                 # Task card component
│   │   └── TaskList.tsx                 # Task list view
│   ├── lib/                             # Utilities & API Clients
│   │   ├── api.ts                       # REST API client + JWT auth
│   │   ├── chat-api.ts                  # Chat endpoint client
│   │   ├── types.ts                     # TypeScript interfaces
│   │   └── useNotifications.ts          # WebSocket notifications hook
│   ├── public/
│   │   └── notification.mp3             # Notification sound
│   ├── CLAUDE.md                        # Frontend development instructions
│   ├── Dockerfile                       # Multi-stage Docker build
│   ├── README.md                        # Frontend documentation
│   ├── next.config.ts                   # Next.js configuration
│   ├── package.json                     # NPM dependencies
│   ├── proxy.ts                         # Route protection middleware
│   ├── tailwind.config.js               # Tailwind CSS config
│   └── tsconfig.json                    # TypeScript configuration
│
├── k8s-manifests/                       # Kubernetes Deployment Files
│   ├── backend-deployment.yaml          # Backend + Dapr sidecar + SMTP env vars
│   ├── frontend-deployment.yaml         # Frontend deployment
│   ├── ingress.yaml                     # Nginx ingress (taskflow.local)
│   └── redpanda-deployment.yaml         # Kafka broker (Redpanda)
│
├── kafka/                               # Kafka Configuration
│   ├── local/
│   │   └── docker-compose.yml          # Local Kafka setup
│   ├── create-topics.sh                 # Topic creation script
│   └── topics.json                      # Topic definitions (3 topics)
│
├── specs/                               # Feature Specifications
│   ├── 001-phase-2-fullstack/          # Phase 2 specs
│   │   ├── checklists/
│   │   ├── contracts/
│   │   ├── data-model.md
│   │   ├── plan.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── 002-backend-ai-infrastructure/   # Phase 3 backend specs
│   ├── 003-frontend-chat-interface/     # Phase 3 frontend specs
│   ├── 004-local-k8s-deployment/        # Phase 4 specs
│   └── 005-advanced-task-features/      # Phase 5 specs
│
├── history/                             # Development History
│   ├── adr/                             # Architecture Decision Records
│   │   ├── 0001-full-stack-technology-stack.md
│   │   ├── 0002-monorepo-architecture.md
│   │   ├── 0003-authentication-strategy.md
│   │   ├── 0004-database-strategy.md
│   │   ├── 0005-ai-agent-technology-stack.md
│   │   ├── 0006-conversation-data-management.md
│   │   └── 0007-mcp-server-architecture.md
│   └── prompts/                         # Prompt History Records
│       ├── 001-task-crud-auth/
│       ├── 002-frontend-chat-interface/
│       ├── 003-backend-ai-infrastructure/
│       ├── 004-local-k8s-deployment/
│       ├── 005-advanced-task-features/
│       ├── constitution/
│       └── general/
│
├── CLAUDE.md                            # Project-level instructions
└── README.md                            # Main project documentation
```

### Key Components

**Backend Service** (FastAPI + SQLModel + Kafka + WebSocket)
- REST API with JWT authentication
- AI agent with 5 MCP tools
- Kafka event publisher
- WebSocket server for real-time notifications
- Internal API for microservices

**Frontend Application** (Next.js 16 + TypeScript + Socket.IO)
- AI chat interface with ChatKit
- Advanced task management UI
- Real-time WebSocket notifications
- Responsive design with Tailwind CSS

**Integrated Services** (Merged into Backend)
- **Notification Consumer**: Consumes Kafka events, sends emails + WebSocket notifications
- **Reminder Scheduler**: Monitors due dates, publishes reminder events

**Infrastructure**
- **Kubernetes**: 4 deployment manifests with Dapr integration
- **Kafka**: 3 topics (task-events, reminders, task-updates)
- **Ingress**: Nginx ingress controller (taskflow.local)

**Database Schema**
- users, tasks, conversations, messages (PostgreSQL via Neon)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Socket.IO |
| **Backend** | FastAPI, Python 3.12, SQLModel, OpenAI Agents SDK |
| **Database** | Neon PostgreSQL (Serverless) |
| **Authentication** | Custom JWT + Argon2 |
| **AI/ML** | OpenAI Agents SDK, MCP Protocol, ChatKit, LiteLLM |
| **Messaging** | Apache Kafka (Redpanda), aiokafka |
| **Real-time** | Socket.IO, WebSocket |
| **Microservices** | Dapr v1.14+, Event-driven architecture |
| **Containerization** | Docker, Multi-stage builds |
| **Orchestration** | Kubernetes, Helm 3, Minikube |
| **Deployment** | Vercel, Kubernetes (Local) |
| **Development** | Claude Code (Spec-Driven) |

---

## 🚀 Quick Start

### Phase 1: Console App
```bash
cd phase-1-console
python src/main.py
```

### Phase 2: Web Application
```bash
cd phase-2-fullstack

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Phase 3: AI Chatbot
```bash
cd phase-3-ai-chatbot

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -e .
alembic upgrade head
uvicorn src.main:app --reload
```

### Phase 4: Kubernetes
```bash
cd phase-4-kubernetes

# Prerequisites: Docker, Minikube, kubectl, Helm
# Verify environment
./scripts/verify-environment.sh

# One-command deployment
./scripts/deploy-local.sh

# Access application
minikube service frontend-service --url
```

### Phase 5: Cloud Native
```bash
cd phase-5-cloud

# Prerequisites: Docker, Minikube, kubectl, Kafka
# Build images
docker build -t taskflow-frontend:latest ./frontend
docker build -t taskflow-backend:latest ./backend

# Create secrets
kubectl create secret generic taskflow-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=jwt-secret='your-secret' \
  --from-literal=openrouter-api-key='sk-or-v1-...' \
  --from-literal=smtp-user='your-email@gmail.com' \
  --from-literal=smtp-password='your-gmail-app-password'

# Deploy all services
kubectl apply -f k8s-manifests/

# Add to /etc/hosts
echo "$(minikube ip) taskflow.local" | sudo tee -a /etc/hosts

# Access application
open http://taskflow.local
```

**See individual phase README files for detailed setup.**

---

## 📚 Documentation

### Phase READMEs
- **[Phase 1 README](./phase-1-console/README.md)** - Console app setup
- **[Phase 2 README](./phase-2-fullstack/README.md)** - Web app setup
- **[Phase 3 README](./phase-3-ai-chatbot/README.md)** - AI chatbot setup
- **[Phase 4 README](./phase-4-kubernetes/README.md)** - Kubernetes deployment setup
- **[Phase 5 README](./phase-5-claude/README.md)** - Cloud-native microservices setup

### Specifications & Plans
- **[Phase 1 Specs](./phase-1-console/specs/todo-app/)** - Console app specifications
- **[Phase 2 Specs](./phase-2-fullstack/specs/001-task-crud-auth/)** - Full-stack web app specifications
- **[Phase 3 Specs](./phase-3-ai-chatbot/specs/)** - AI chatbot specifications (3 features)
- **[Phase 4 Specs](./phase-4-kubernetes/specs/004-local-k8s-deployment/)** - Kubernetes deployment specifications
- **[Phase 5 Specs](./phase-5-claude/specs/)** - Event-driven microservices specifications

### Architecture Decisions
- **[Phase 3 ADRs](./phase-3-ai-chatbot/history/adr/)** - Architecture Decision Records
- **[Phase 4 ADRs](./phase-4-kubernetes/history/adr/)** - Kubernetes architecture decisions

---

## 🎓 Development Approach

This project follows **Spec-Driven Development (SDD)** using Claude Code:

1. **Specify** → 2. **Plan** → 3. **Task** → 4. **Implement**

All phases built with AI-assisted development and zero manual coding.

---

## 🏆 Hackathon Information

**Event**: Hackathon II - Spec-Driven Development  
**Organization**: GIAIC / PIAIC / Panaversity  
**Timeline**: December 2025 - January 2026  
**Participant**: Muhammad Waheed (GIAIC ID: 00081685)

---

## 📊 Project Status

- **Total Phases**: 5
- **Completed**: 5/5 (100%) ✅
- **Status**: All Phases Complete
- **Lines of Code**: ~15,000+
- **Live Deployments**:
  - Phase 2 & 3: Vercel (Production)
  - Phase 4 & 5: Minikube (Local Kubernetes)
- **Container Images**: 2 (Frontend, Backend)
- **Kubernetes Resources**: 15+ (Deployments, Services, ConfigMaps, Secrets, Ingress)
- **Microservices**: 1 (Backend — includes notification + reminder)
- **Kafka Topics**: 3 (task-events, reminders, task-updates)
- **AI Features**: 5 MCP tools, conversational interface, stateless agent
- **Real-time Features**: WebSocket notifications, email reminders, event-driven updates

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

---

## 🤝 Acknowledgments

- **Claude Code** - AI-powered development assistant
- **GIAIC/PIAIC** - Educational organization
- **Panaversity** - Cloud-native AI initiative

---

## 📞 Contact

**Muhammad Waheed**
- GitHub: [@muhammadwaheedairi](https://github.com/muhammadwaheedairi)
- Email: muhammadwaheedairi@gmail.com
- WhatsApp: 03180297567

---

<div align="center">

**⭐ Star this repo if you found it helpful! ⭐**

*Built with 💙 using Spec-Driven Development*

</div>