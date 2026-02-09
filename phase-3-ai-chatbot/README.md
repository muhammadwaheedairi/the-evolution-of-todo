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
| **Phase 3** | AI Chatbot with MCP Tools | 🚧 In Progress |

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
- **Deployment**: Docker Compose support

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
│   │   │   └── chat.py
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
│   └── README.md           # Backend documentation
│
├── specs/                   # Feature specifications
│   ├── 001-phase-2-fullstack/
│   ├── 002-backend-ai-infrastructure/
│   └── 003-frontend-chat-interface/
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

## 📚 Documentation

### Component Documentation

- **[Frontend Documentation](./frontend/README.md)** - Next.js app structure, components, API client, chat interface
- **[Backend Documentation](./backend/README.md)** - FastAPI endpoints, services, MCP tools, AI agent
- **[Architecture Decisions](./history/adr/)** - 7 ADRs documenting key architectural decisions
- **[Specifications](./specs/)** - Detailed feature specifications for all three phases

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
- Note: Conversation history is currently in-memory (lost on restart)
- Ensure chat endpoint authentication is working

#### Database connection errors
- Verify PostgreSQL service is running
- Check connection string format is correct
- For Neon: Ensure serverless connection string is used
- Try running migrations again

---

## 🚧 Known Limitations

### Current Implementation

- **Conversation storage**: Currently in-memory, lost on server restart (database persistence planned)
- **AI Model**: Using OpenRouter free models, not official OpenAI API
- **ChatKit configuration**: Domain allowlist setup needed for production
- **Test coverage**: Testing infrastructure planned but not complete
- **Rate limiting**: Not implemented (should be added for production)
- **Email verification**: Registration accepts any email format

### Planned Improvements

- Database persistence for conversations and messages
- Official OpenAI API integration
- Comprehensive test suite (unit, integration, E2E)
- Rate limiting and request throttling
- Email verification flow
- Password reset functionality
- Task categories and tags
- Task due dates and reminders
- Task priority levels
- Bulk task operations

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
