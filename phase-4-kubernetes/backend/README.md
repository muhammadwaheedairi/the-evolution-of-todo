# ⚙️ TaskFlow AI - Backend Documentation

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![SQLModel](https://img.shields.io/badge/SQLModel-0.0.22-red?style=flat-square)

**FastAPI backend with AI agent orchestration and MCP tools**

</div>

---

## 📋 Overview

Modern Python backend built with FastAPI featuring RESTful task management API and AI-powered conversational interface using OpenAI Agents SDK with MCP tools.

### Key Features
- ✅ **FastAPI** - Modern, fast Python web framework
- 🗄️ **SQLModel ORM** - Type-safe database operations
- 🔐 **Custom JWT Auth** - Argon2 password hashing (OWASP recommended)
- 🤖 **OpenAI Agents SDK** - AI agent orchestration
- 🛠️ **5 MCP Tools** - Standardized task management tools
- 📊 **PostgreSQL + Alembic** - Data persistence with migrations

---

## 🏗️ Architecture

### Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | FastAPI | 0.115+ |
| Language | Python | 3.13+ |
| ORM | SQLModel | 0.0.22 |
| Database | PostgreSQL | 16 |
| Auth | python-jose + argon2-cffi | Latest |
| AI | OpenAI Agents SDK | 0.8.1 |
| Migrations | Alembic | Latest |

### Project Structure
```
backend/
├── src/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── conversation.py   # Phase 3
│   │   └── message.py        # Phase 3
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── task.py
│   │   └── chat.py           # Phase 3
│   ├── routers/
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── chat.py           # Phase 3
│   ├── services/
│   │   ├── user_service.py
│   │   ├── task_service.py
│   │   └── conversation_service.py
│   ├── mcp/                  # Phase 3
│   │   ├── server.py
│   │   ├── tools.py
│   │   └── config.py
│   └── middleware/auth.py
├── alembic/
├── .env
├── alembic.ini
└── pyproject.toml
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.13+, PostgreSQL 16+
- OpenRouter API Key (for AI features)

### Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e .
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET_KEY=your-secret-key-32-chars-min
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
OPENROUTER_API_KEY=your-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-oss-120b:free
CORS_ORIGINS=http://localhost:3000
```

### Commands
```bash
alembic upgrade head                        # Apply migrations
uvicorn src.main:app --reload --port 8000   # Start dev server
```

| Command | Description |
|---------|-------------|
| `alembic upgrade head` | Apply all migrations |
| `alembic downgrade -1` | Rollback one migration |
| `alembic current` | Show current migration |

---

## 🔌 API Endpoints

**Docs:** `http://localhost:8000/docs`

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (name, email, password) |
| POST | `/api/auth/login` | Login → returns JWT token |

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

---

## 🛠️ MCP Tools (Phase 3)

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `add_task` | user_id, title, description? | Create task |
| `list_tasks` | user_id, status? | List tasks with filter |
| `complete_task` | user_id, task_id | Mark complete |
| `delete_task` | user_id, task_id | Remove task |
| `update_task` | user_id, task_id, title?, description? | Modify task |

---

## 🔐 Authentication & Security

- **JWT Flow**: Login → token (7-day expiry) → `Authorization: Bearer <token>` on all requests
- **Password Hashing**: Argon2 (memory-hard, GPU-resistant)
- **User Isolation**: All queries filtered by `user_id`. Unauthorized access returns 404 (not 403)

---

## 🐳 Docker & Kubernetes (Phase 4)

### Docker
```bash
eval $(minikube docker-env)
docker build -t todo-backend:latest .
docker run -p 8000:8000 -e DATABASE_URL='...' -e JWT_SECRET_KEY='...' todo-backend:latest
```

### Kubernetes Deployment
```bash
minikube start --cpus=4 --memory=8192
kubectl create namespace todo-app
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=JWT_SECRET_KEY='your-secret' \
  --from-literal=JWT_ALGORITHM='HS256' \
  --from-literal=ACCESS_TOKEN_EXPIRE_DAYS='7' \
  --from-literal=OPENROUTER_API_KEY='your-key' \
  --from-literal=UV_ENVIRONMENT='development' \
  --namespace=todo-app
helm install todo-app ./helm --namespace todo-app --values ./helm/values-dev.yaml
```

**Helm values (dev):**
```yaml
backend:
  image: todo-backend
  tag: latest
  imagePullPolicy: Never
  replicas: 1
  resources:
    requests: { memory: "256Mi", cpu: "250m" }
    limits: { memory: "512Mi", cpu: "500m" }
```

**Migrations in K8s:**
```bash
kubectl exec -it <backend-pod> -n todo-app -- alembic upgrade head
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection error | Verify `DATABASE_URL`, add `?sslmode=require` for Neon |
| 401 on all endpoints | Check `JWT_SECRET_KEY`, verify `Bearer <token>` format |
| AI agent not responding | Verify `OPENROUTER_API_KEY` and available credits |
| `ImagePullBackOff` | Rebuild with `eval $(minikube docker-env)`, set `imagePullPolicy: Never` |
| Import errors | Use relative imports (`from ..database` not `from backend.src.database`) |
| Users seeing others' data | Ensure all service functions filter by `user_id` |

---

## 🔗 Related Documentation

- **[Root README](../README.md)** - Project overview
- **[Frontend README](../frontend/README.md)** - Frontend documentation

---

<div align="center">

**Built with FastAPI and Python 3.13**

</div>