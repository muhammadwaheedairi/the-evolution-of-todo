# Todo Full-Stack Web Application - Backend

<p align="center">
  <img src="https://img.shields.io/badge/python-3.13+-blue?logo=python" alt="Python 3.13+" />
  <img src="https://img.shields.io/badge/fastapi-0.115+-green?logo=fastapi" alt="FastAPI 0.115+" />
  <img src="https://img.shields.io/badge/sqlmodel-purple?logo=postgresql" alt="SQLModel" />
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License" />
</p>

<p align="center">
  🔐 Secure & Scalable Task Management API • Built with FastAPI & SQLModel
</p>

---

## 🚀 Overview

This is the FastAPI backend for the Todo Full-Stack Web Application. It provides a secure, scalable API for managing user tasks with proper authentication and data isolation. Built with modern Python technologies and following industry best practices.

### ✨ Key Features
- **🔒 Secure Authentication**: JWT-based authentication with user isolation
- **⚡ High Performance**: FastAPI's asynchronous capabilities
- **📊 Robust ORM**: SQLModel for database operations
- **🛡️ Security Focused**: Password hashing, input validation, and data isolation
- **🧪 Well Tested**: Comprehensive unit and integration tests

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **[FastAPI](https://fastapi.tiangolo.com/)** | Web Framework | 0.115+ |
| **[Python](https://www.python.org/)** | Language | 3.13+ |
| **[SQLModel](https://sqlmodel.tiangolo.com/)** | ORM | Latest |
| **[PostgreSQL](https://www.postgresql.org/)** | Database | 16+ |
| **[JWT](https://jwt.io/)** | Authentication | python-jose |
| **[UV](https://github.com/astral-sh/uv)** | Package Manager | Latest |

---

## 📁 Project Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── src/                        # Source code
│   ├── main.py                 # Application entry point
│   ├── config.py               # Configuration
│   ├── database.py             # DB connection
│   ├── models/                 # SQLModel definitions
│   ├── schemas/                # Pydantic schemas
│   ├── routers/                # API routes
│   ├── middleware/             # Auth middleware
│   ├── services/               # Business logic
│   └── utils/                  # Helper functions
├── pyproject.toml              # Dependencies
├── alembic.ini                 # Migration config
└── run_migrations.py           # Migration runner
```

---

## 🗄️ Database Schema

### Tables

**users**
```sql
id UUID PRIMARY KEY
email STRING UNIQUE
name STRING
password_hash STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

**tasks**
```sql
id INTEGER PRIMARY KEY
user_id UUID FOREIGN KEY
title STRING NOT NULL
description TEXT
completed BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Indexes
- `tasks.user_id` - For user-based filtering
- `tasks.completed` - For status-based queries

---

## 🌐 API Endpoints

### Authentication
All protected endpoints require:
```
Authorization: Bearer <token>
```

### Available Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/{user_id}/tasks` | Get user tasks | ✅ |
| `POST` | `/api/{user_id}/tasks` | Create task | ✅ |
| `GET` | `/api/{user_id}/tasks/{id}` | Get task details | ✅ |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update task | ✅ |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | ✅ |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete task | ✅ |

---

## 🔐 Security Features

### Data Isolation
- **User Segregation**: Each query filters by `user_id`
- **URL Validation**: Confirms URL user matches authenticated user
- **Privacy Protection**: Returns 404 instead of 403 for unauthorized access

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Security**: bcrypt hashing for passwords
- **Input Validation**: Pydantic schemas for all inputs

---

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- PostgreSQL database
- UV package manager

### Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   uv sync
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   # Update with your configuration
   ```

4. **Run database migrations**
   ```bash
   uv run python run_migrations.py
   ```

5. **Start the development server**
   ```bash
   uv run python -m src.main
   # Or with hot reload
   uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## 🧪 Testing

Run the test suite:
```bash
# All tests
uv run pytest

# With coverage
uv run pytest --cov=src --cov-report=html

# Specific test module
uv run pytest tests/unit/test_models.py
```

---

## 📦 Development Commands

| Command | Description |
|---------|-------------|
| `uv run python -m src.main` | Start development server |
| `uv run uvicorn src.main:app --reload` | Hot reload server |
| `uv run pytest` | Run tests |
| `uv run alembic revision --autogenerate -m "desc"` | Create migration |
| `uv run alembic upgrade head` | Apply migrations |
| `uv run alembic downgrade -1` | Rollback migration |

---

## 🔑 Configuration

The application uses `Pydantic Settings` for configuration management. Key settings include:

- **Database URL**: Connection string for PostgreSQL
- **JWT Settings**: Secret keys and expiration times
- **CORS Origins**: Allowed frontend domains
- **Logging Level**: Console output verbosity

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<p align="center">
Made with ❤️ using FastAPI & SQLModel
</p>