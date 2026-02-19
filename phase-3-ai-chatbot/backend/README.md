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
- 🛠️ **MCP Tools** - 5 standardized task management tools
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
| Auth | python-jose | Latest |
| Hashing | argon2-cffi | Latest |
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
│   │   ├── conversation.py      # Phase 3
│   │   └── message.py          # Phase 3
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── task.py
│   │   └── chat.py             # Phase 3
│   ├── routers/
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── chat.py             # Phase 3
│   ├── services/
│   │   ├── user_service.py
│   │   ├── task_service.py
│   │   └── conversation_service.py
│   ├── mcp/                    # Phase 3
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
- Python 3.13+
- PostgreSQL 16+
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
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Auth
JWT_SECRET_KEY=your-secret-key-32-chars-min
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# AI (Phase 3)
OPENROUTER_API_KEY=your-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-oss-120b:free

# App
CORS_ORIGINS=http://localhost:3000
```

### Database Setup & Commands
```bash
alembic upgrade head          # Apply migrations
uvicorn src.main:app --reload # Start dev server (http://localhost:8000)
```

| Command | Description |
|---------|-------------|
| `alembic upgrade head` | Apply all migrations |
| `alembic downgrade -1` | Rollback one migration |
| `alembic current` | Show current migration |
| `uvicorn src.main:app --reload` | Start dev server |

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:8000` | **Docs:** `/docs`

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

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
| GET | `/api/{user_id}/conversations/history` | Get conversation history |
| DELETE | `/api/{user_id}/conversations/clear` | Clear history |

---

## 🛠️ MCP Tools (Phase 3)

All tools wrap existing service layer functions and validate `user_id` before execution.

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `add_task` | user_id, title, description? | Create new task |
| `list_tasks` | user_id, status? | Retrieve tasks with filter |
| `complete_task` | user_id, task_id | Mark task as completed |
| `delete_task` | user_id, task_id | Remove task permanently |
| `update_task` | user_id, task_id, title?, description? | Modify task |

---

## 🔐 Authentication & Security

- **JWT Flow**: Login → token generated (7-day expiry) → sent in `Authorization: Bearer <token>` header → middleware validates on every request
- **Password Hashing**: Argon2 (memory-hard, GPU-resistant, OWASP recommended)
- **User Isolation**: All queries filtered by `user_id`. Unauthorized access returns 404 (not 403) to prevent information leakage

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection error | Verify `DATABASE_URL` format and PostgreSQL is running |
| Migration fails | Check DB connection, review migration file for conflicts |
| 401 on all endpoints | Verify `JWT_SECRET_KEY`, check `Bearer <token>` format |
| AI agent not responding | Verify `OPENROUTER_API_KEY` and available credits |
| Users seeing others' data | Ensure all service functions filter by `user_id` |

---

## 🔗 Related Documentation

- **[Root README](../README.md)** - Project overview
- **[Frontend README](../frontend/README.md)** - Frontend documentation

---

<div align="center">

**Built with FastAPI and Python 3.13**

</div>