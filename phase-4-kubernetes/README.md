# 🤖 TaskFlow AI - Intelligent Todo Management

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

**A full-stack AI-powered task management application with natural language interface**

</div>

---

## 📋 Overview

TaskFlow AI is a modern full-stack todo application combining traditional task management with AI-powered conversational interfaces, built across four phases demonstrating authentication, database design, AI agent orchestration with MCP, and Kubernetes deployment.

### 🎯 Project Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Database & Authentication Foundation | ✅ Complete |
| **Phase 2** | Full-Stack REST API with JWT Auth | ✅ Complete |
| **Phase 3** | AI Chatbot with MCP Tools | ✅ Complete |
| **Phase 4** | Local Kubernetes Deployment | ✅ Complete |

### ✨ Key Highlights
- 🔐 **Custom JWT Auth** with Argon2 password hashing
- 🤖 **OpenAI Agents SDK** with LiteLLM for AI orchestration
- 🛠️ **5 MCP Tools** for standardized AI-task interactions
- 💬 **OpenAI ChatKit** conversational interface
- 🎨 **Next.js 16 App Router** + Tailwind CSS
- 🗄️ **PostgreSQL** with SQLModel ORM + Alembic migrations
- ☸️ **Kubernetes Ready** with Helm charts

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js 16  │  │   ChatKit    │  │  Tailwind    │      │
│  │  App Router  │  │   (Phase 3)  │  │     CSS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                 │
│                     JWT Token Auth                           │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/REST API
┌────────────────────────────┼─────────────────────────────────┐
│                     ┌──────▼──────┐       Backend            │
│                     │   FastAPI   │                          │
│                     │  Endpoints  │                          │
│                     └──────┬──────┘                          │
│         ┌──────────────────┼──────────────────┐             │
│    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐       │
│    │  Auth   │      │   Task    │     │   Chat    │       │
│    │ Service │      │  Service  │     │  Service  │       │
│    └─────────┘      └─────┬─────┘     └─────┬─────┘       │
│                            │           ┌──────▼──────┐      │
│                            │           │  AI Agent   │      │
│                            │           │  (OpenAI)   │      │
│                            │           └──────┬──────┘      │
│                            │           ┌──────▼──────┐      │
│                            │           │  MCP Tools  │      │
│                            │           │  (5 tools)  │      │
│                            │           └──────┬──────┘      │
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

### Technology Stack

#### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI component library |
| TypeScript | 5.0+ | Type-safe JavaScript |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| OpenAI ChatKit | 1.5.0 | Conversational UI |
| React Hook Form + Zod | Latest | Form validation |

#### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115+ | Python web framework |
| Python | 3.13+ | Programming language |
| SQLModel | 0.0.22 | Database ORM |
| PostgreSQL | 16 | Relational database |
| OpenAI Agents SDK | 0.8.1 | AI agent orchestration |
| argon2-cffi + python-jose | Latest | Auth & password security |

### Project Structure
```
Todo-Full-Stack-Web-Application/
├── frontend/
│   ├── app/                # Pages (landing, login, register, tasks, chat)
│   ├── components/         # React components + chat/
│   ├── lib/                # api.ts, chat-api.ts, types.ts
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── main.py
│   │   ├── models/         # user, task, conversation, message
│   │   ├── schemas/        # auth, task, chat
│   │   ├── routers/        # auth, tasks, chat, health
│   │   ├── services/       # task, conversation, message services
│   │   ├── mcp/            # server.py, tools.py (Phase 3)
│   │   └── middleware/     # auth.py
│   ├── alembic/
│   ├── Dockerfile
│   └── README.md
├── helm/                   # Kubernetes Helm charts (Phase 4)
│   ├── values-dev.yaml
│   └── templates/
├── docs/deployment/        # K8s guides
├── scripts/                # build-images, deploy-local
├── history/adr/            # 7 Architecture Decision Records
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, Python 3.13+, PostgreSQL 16+
- OpenRouter API Key (for AI features)
- Docker 24+, Minikube 1.32+, Helm 3.12+ (for K8s)

---

### Option 1: Local Development
```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -e .
alembic upgrade head
uvicorn src.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Backend: `http://localhost:8000` | Docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:3000`

---

### Option 2: Docker Compose
```bash
docker-compose up -d
```

---

### Option 3: Kubernetes (Minikube)
```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker
eval $(minikube docker-env)

# 2. Build images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .

# 3. Create namespace & secrets
kubectl create namespace todo-app
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@host/db?sslmode=require' \
  --from-literal=JWT_SECRET_KEY='your-jwt-secret' \
  --from-literal=JWT_ALGORITHM='HS256' \
  --from-literal=ACCESS_TOKEN_EXPIRE_DAYS='7' \
  --from-literal=UV_ENVIRONMENT='production' \
  --from-literal=OPENROUTER_API_KEY='sk-or-v1-your-key' \
  --namespace=todo-app

# 4. Deploy & access
helm install todo-app ./helm --namespace=todo-app --values=helm/values-dev.yaml
minikube service todo-app-frontend -n todo-app
```

**Automated deployment:** `./scripts/deploy-local.sh`

---

## 🔌 API Reference

**Base URL:** `http://localhost:8000` | **Docs:** `/docs`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → JWT token |

### Tasks *(Auth Required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List tasks (filter: all/pending/completed) |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task |

### Chat *(Phase 3, Auth Required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{user_id}/chat` | Send message to AI agent |
| GET | `/api/{user_id}/conversations/history` | Get history |
| DELETE | `/api/{user_id}/conversations/clear` | Clear history |

### MCP Tools (Phase 3)
| Tool | Parameters | Purpose |
|------|-----------|---------|
| `add_task` | user_id, title, description? | Create task |
| `list_tasks` | user_id, status? | List with filter |
| `complete_task` | user_id, task_id | Mark complete |
| `delete_task` | user_id, task_id | Remove task |
| `update_task` | user_id, task_id, title?, description? | Modify task |

---

## 💬 Natural Language Examples (Phase 3)

| User Says | Action |
|-----------|--------|
| "add task buy groceries" | Creates task |
| "show me all tasks" | Lists all tasks |
| "what's pending?" | Lists pending tasks |
| "mark task 3 as done" | Completes task 3 |
| "delete the meeting task" | Deletes matching task |
| "change task 1 to 'call mom'" | Updates task 1 |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `DATABASE_URL`, run `alembic upgrade head` |
| Frontend can't connect | Verify `NEXT_PUBLIC_API_URL`, check CORS settings |
| AI chat not working | Verify `OPENROUTER_API_KEY` and available credits |
| `ImagePullBackOff` | Set `imagePullPolicy: Never`, rebuild with `eval $(minikube docker-env)` |
| Pods in `CrashLoopBackOff` | Check logs: `kubectl logs <pod> -n todo-app --previous` |
| Cannot access app | Try: `kubectl port-forward -n todo-app service/todo-app-frontend 3000:3000` |

---

## 📚 Documentation

- **[Frontend README](./frontend/README.md)** - Components, API client, chat interface
- **[Backend README](./backend/README.md)** - Endpoints, services, MCP tools
- **[Helm Guide](./helm/README.md)** - Kubernetes deployment
- **[K8s Docs](./docs/deployment/)** - Minikube setup, secrets, lifecycle management
- **[ADRs](./history/adr/)** - 7 architecture decision records

---

<div align="center">

**Built with ❤️ for Hackathon 2**

</div>