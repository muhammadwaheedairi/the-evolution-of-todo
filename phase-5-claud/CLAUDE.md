# Claude Code Rules - Todo AI Chatbot (Phase 5)

You are an expert AI assistant specializing in Spec-Driven Development (SDD) for the Todo AI Chatbot project. Build event-driven microservices with AI-powered conversational interfaces, distributed runtime with Dapr, and production-grade cloud deployment.

## Project Overview

**Objective:** Full-stack AI-powered Todo application with conversational interface, event-driven microservices, and cloud deployment.

**Current Phase:** Phase 5 - Advanced Cloud Deployment (Kafka, Dapr, OCI)

### Development Phases

| Phase | Focus | Status | Tech Stack |
|-------|-------|--------|------------|
| I | Backend API + Database | ✅ Complete | FastAPI, SQLModel, Neon PostgreSQL |
| II | Frontend + Auth | ✅ Complete | Next.js 16, TypeScript, Custom JWT |
| III | AI Chatbot + MCP | ✅ Complete | OpenAI Agents SDK, MCP, ChatKit |
| IV | Local Kubernetes | ✅ Complete | Docker, Minikube, Helm |
| V | Cloud Deployment | 🚧 In Progress | Kafka, Dapr, OCI OKE |

### Core Features by Phase

**Phase 1-2:** Task CRUD, JWT auth, user isolation, responsive UI
**Phase 3:** Natural language task management, MCP tools, stateless conversations, ChatKit UI
**Phase 4:** Docker containers, Kubernetes deployment, Helm charts
**Phase 5:** Event-driven architecture, Kafka messaging, Dapr runtime, recurring tasks, priorities, tags, due dates, notifications, CI/CD

### Technology Stack

**Frontend:** Next.js 16+ (App Router), TypeScript, Tailwind CSS, OpenAI ChatKit, Custom JWT
**Backend:** FastAPI, SQLModel, Python 3.13+, UV, OpenAI Agents SDK, MCP SDK
**Database:** Neon PostgreSQL (users, tasks, conversations, messages, notifications, recurring_patterns)
**Auth:** Custom JWT + Argon2 password hashing
**Phase 4:** Docker, Kubernetes, Helm 3+, Minikube
**Phase 5:** Apache Kafka (Strimzi), Dapr v1.14+, OCI OKE, GitHub Actions, Prometheus, Grafana

### Architecture (Phase 5)

```
Frontend (Next.js) → Task Service (FastAPI + MCP + Dapr)
                          ↓ Publishes Events
                     Apache Kafka (3 topics)
                          ↓ Subscribes
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
Notification Service              Recurring Task Service
(reminders topic)                 (task-events topic)
        ↓                                   ↓
    Send Notifications              Generate Task Instances
                          ↓
                  Neon PostgreSQL
```

**3 Microservices:**
1. **Task Service:** Auth, CRUD, AI chat, event publishing, reminder scheduling
2. **Notification Service:** Consume reminders, send notifications
3. **Recurring Task Service:** Consume task events, generate recurring instances

**3 Kafka Topics:**
- `task-events`: CRUD operations (producers: Task Service, consumers: Recurring Task Service)
- `reminders`: Scheduled notifications (producers: Task Service, consumers: Notification Service)
- `recurring-tasks`: Pattern-based generation (optional)

**Dapr Building Blocks:** Pub/Sub, State, Service Invocation, Jobs API, Secrets

**Deployment Targets:**
- Local Dev: Direct execution (no K8s, no Dapr)
- Minikube: Full K8s + Dapr + Kafka (1 broker)
- OCI OKE: Production (3 brokers, HA, 4 OCPUs, 24GB RAM)

## Database Schema

**users:** id (UUID), email, name, password_hash (Argon2), created_at, updated_at
**tasks:** id, user_id, title, description, completed, created_at, updated_at, due_date, priority (enum), tags (JSON), recurrence_pattern (JSON), is_recurring, parent_recurring_id
**conversations:** id, user_id, created_at, updated_at
**messages:** id, user_id, conversation_id, role, content, created_at
**notifications:** id, user_id, task_id, notification_type (enum), sent_at, status (enum), created_at
**recurring_patterns:** id, user_id, task_template (JSON), pattern_type (enum), pattern_config (JSON), start_date, end_date, is_active, created_at, updated_at

## REST API Endpoints

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`
**Tasks (JWT required):** `GET|POST /api/{user_id}/tasks`, `GET|PUT|DELETE /api/{user_id}/tasks/{id}`, `PATCH /api/{user_id}/tasks/{id}/complete`
**Chat:** `POST /api/{user_id}/chat` - Request: `{conversation_id?: int, message: string}`, Response: `{conversation_id: int, response: string, tool_calls: string[]}`

## MCP Tools (Phase 3)

All tools wrap existing task services and publish events to Kafka via Dapr (Phase 5).

**add_task:** user_id, title, description?, due_date?, priority?, tags?, recurrence_pattern? → Publishes `task.created`
**list_tasks:** user_id, status?, priority?, tags?, due_date_range?, sort_by? → Returns task array
**complete_task:** user_id, task_id → Publishes `task.completed`
**delete_task:** user_id, task_id → Publishes `task.deleted`
**update_task:** user_id, task_id, title?, description?, due_date?, priority?, tags? → Publishes `task.updated`

## Critical Requirements by Phase

### Phase 1-2: Backend + Frontend
- User isolation: ALL queries filter by user_id
- JWT auth: Verify user_id in URL matches token
- Argon2 password hashing
- Custom JWT implementation (localStorage + cookies)

### Phase 3: AI Chatbot (MANDATORY)
**AI Agent:**
- Stateless design (NO memory state)
- Database persistence for all conversations
- Load history from DB on EVERY request
- Intent recognition → MCP tool calls
- Conversational responses (human-friendly)

**MCP Server:**
- Tools MUST reuse existing task_service functions
- User validation in ALL tools
- Typed schemas per MCP specification
- Separate module from FastAPI routes
- Independent testing without FastAPI app

**Conversation Management:**
- Stateless requests (each independent)
- History retrieval from database
- Save user + assistant messages
- User isolation (filter by user_id)
- Auto-create conversation if not provided

**Security:**
- Chat endpoint MUST enforce JWT auth
- MCP tools MUST validate user_id
- Never bypass user isolation

### Phase 4: Kubernetes (MANDATORY)
**Infrastructure as Code:**
- Helm charts only (no raw YAML)
- No imperative kubectl commands
- Version controlled
- Reproducible deployments

**Containerization:**
- Multi-stage Dockerfiles
- Non-root execution
- Official base images (node:alpine, python:slim)
- No secrets in images

**Kubernetes:**
- Stateless pods
- Health checks (liveness + readiness)
- Resource limits
- Service discovery via DNS
- Dedicated namespace

**Deployment:**
- Pods ready within 60 seconds
- Functional parity with Phase III
- Survive pod restarts
- Clean helm install/upgrade/uninstall

### Phase 5: Event-Driven + Cloud (MANDATORY)
**Event Publishing:**
- ALL task CRUD operations publish events via Dapr Pub/Sub
- Events include: event_id (unique), event_type, aggregate_id, user_id, timestamp, correlation_id, payload, metadata
- Publish AFTER database commit (transactional outbox)
- Retry with exponential backoff on failure

**Dapr Integration:**
- ALL cross-service communication via Dapr
- NO direct Kafka client libraries (use Dapr Pub/Sub)
- NO direct Redis/Memcached (use Dapr State)
- Scheduled reminders via Dapr Jobs API (NOT cron)
- Secrets via Dapr Secrets API
- Component configuration via YAML only

**Microservices:**
- Independently deployable
- No shared database tables for writes
- Event-driven commands (async)
- Stateless (use Dapr State or database)
- Health checks (/health, /ready)

**Event Schemas:**
- Standardized format (see above)
- Versioned in metadata.version
- Backward compatible (add fields, never remove)
- Partition keys = aggregate_id (ordering)
- Immutable (never modify/delete)

**Advanced Task Features:**
- Due dates → schedule reminders via Dapr Jobs API
- Priority enum (high, medium, low), default: medium
- Tags as JSON array, multi-tag filtering
- Recurring patterns as JSON (daily, weekly, monthly)
- Full-text search via PostgreSQL tsvector
- Natural language support for all features

**Cloud Deployment:**
- OCI Always Free tier (4 OCPUs, 24GB RAM)
- No paid services (self-host Kafka via Strimzi)
- Resource limits on all pods
- Rolling updates (zero downtime)
- GitHub Actions CI/CD
- Prometheus + Grafana monitoring

## Development Workflow

1. **Specify** (`/sp.specify`) - Define requirements
2. **Plan** (`/sp.plan`) - Architecture decisions
3. **Tasks** (`/sp.tasks`) - Actionable tasks
4. **Implement** - Use skills to generate code
5. **Phase 5:** Test in Minikube → Deploy to OCI via CI/CD

### Phase 5 Workflow
**Part A:** Advanced features (due dates, priorities, tags, recurring tasks)
**Part B:** Event-driven architecture (Kafka + Dapr on Minikube)
**Part C:** Cloud deployment (OCI OKE + CI/CD + monitoring)

## Authentication Flow

1. User registers/logs in → Backend creates JWT → Frontend stores in localStorage
2. Frontend includes JWT in all API headers
3. Backend verifies JWT signature → Retrieves user_id
4. Backend enforces user isolation → Verifies URL user_id matches token
5. Backend filters data → Returns only user's tasks

**Phase 3:** Chat endpoint follows EXACT same flow.

## Conversation Flow (Phase 3)

1. Receive message via `POST /api/{user_id}/chat`
2. Authenticate user (JWT)
3. Get/create conversation (DB)
4. Save user message (DB)
5. Fetch conversation history (DB)
6. Build messages array for OpenAI agent
7. Run agent with MCP tools
8. Agent invokes tools → Execute via task services
9. Save assistant response (DB)
10. Return response
11. **Server holds NO state** (stateless)

## Natural Language Examples

**Basic (Phase 3):**
- "add task buy groceries" → `add_task(title="buy groceries")`
- "show me all tasks" → `list_tasks(status="all")`
- "mark task 3 as done" → `complete_task(task_id=3)`

**Advanced (Phase 5):**
- "add high priority task buy milk due tomorrow" → `add_task(title="buy milk", priority="high", due_date="...")`
- "create recurring task standup every weekday" → `add_task(title="standup", recurrence_pattern={...})`
- "show me high priority tasks" → `list_tasks(priority="high")`
- "what's due this week?" → `list_tasks(due_date_range={...})`

## Project Structure

```
Todo-AI-Chatbot/
├── frontend/                    # Next.js 16, TypeScript, ChatKit
│   ├── app/chat/               # Phase 3
│   ├── components/tasks/       # Phase 5 (filters, tags, priorities)
│   ├── Dockerfile              # Phase 4
│   └── CLAUDE.md
├── backend/                     # FastAPI, SQLModel, MCP
│   ├── src/
│   │   ├── models/             # user, task, conversation, message, notification, recurring_pattern
│   │   ├── routers/            # auth, tasks, chat, events
│   │   ├── services/           # task_service, conversation_service, dapr_service
│   │   ├── events/             # Phase 5 (publisher, schemas, jobs)
│   │   └── mcp/                # Phase 3 (server, tools)
│   ├── alembic/versions/       # Migrations
│   ├── Dockerfile              # Phase 4
│   └── CLAUDE.md
├── services/                    # Phase 5
│   ├── notification-service/
│   └── recurring-task-service/
├── dapr-components/             # Phase 5 (pubsub, statestore, secrets)
├── kafka/                       # Phase 5 (Strimzi manifests, topics)
├── helm/                        # Phase 4 (Chart, values, templates)
├── .github/workflows/           # Phase 5 (test, build, deploy)
├── monitoring/                  # Phase 5 (Prometheus, Grafana)
├── specs/                       # Spec-driven development
├── history/                     # PHRs, ADRs
└── .specify/                    # SpecKit templates
```

## Development Guidelines

**For All Agents:**
- Follow Agentic Dev Stack workflow
- Use available skills
- Maintain tech stack consistency
- JWT auth on all API calls
- User isolation for all data
- **Phase 3:** Stateless conversations, MCP tools reuse services, conversational responses
- **Phase 5:** Publish events via Dapr, independent microservices, no direct Kafka, Dapr Secrets API

**Code Standards:**
- TypeScript (frontend), Python with type hints (backend)
- REST API best practices
- **Phase 3:** MCP protocol compliance, documented system prompts
- **Phase 5:** Versioned event schemas, correlation_id for tracing, health check endpoints
- Proper error handling, comprehensive tests, responsive UI

## Prerequisites

**Phase 1-4:** Node.js 20+, Python 3.13+, PostgreSQL client, Git, Docker, Minikube v1.38+, kubectl v1.35+, Helm v3.20+

**Phase 5 Additional:**
- Dapr CLI v1.14+ (`dapr init` local, `dapr init -k` K8s)
- Strimzi operator (via Helm)
- OCI CLI (for production)
- OCI account (Always Free tier)
- GitHub account (CI/CD)

## Skills to Use

**General:** frontend-design, building-nextjs-apps, fastapi-expert, sqlmodel-expert, nextjs-devtools
**AI/MCP (Phase 3):** building-with-openai-agents, building-mcp-servers, tool-design, context-fundamentals, building-chat-interfaces
**Infrastructure (Phase 4-5):** docker, kubernetes, helm, kafka, scaffolding-fastapi-dapr, operating-production-services

**Phase 5 Skill Usage:**
- **scaffolding-fastapi-dapr** for new microservices (Notification, Recurring Task)
- **kafka** for Kafka cluster via Strimzi
- **kubernetes** for K8s manifests
- **helm** for packaging charts
- **docker** for containerization

## Task Context

**Your Surface:** Project-level guidance and task execution

**Success Metrics:**
- Outputs follow user intent
- PHRs created for every user prompt
- ADR suggestions for significant decisions
- Small, testable changes with code references
- **Phase 3:** Conversational responses, persistent state, correct MCP execution
- **Phase 5:** Event-driven workflows, independent microservices, cloud deployment

## Core Guarantees

- Record every user input in PHR (verbatim, no truncation)
- PHR routing: constitution → `history/prompts/constitution/`, feature → `history/prompts/<feature-name>/`, general → `history/prompts/general/`
- ADR suggestions (never auto-create, require user consent)
- **Phase 3:** Test stateless behavior, independent MCP testing
- **Phase 5:** Test event flows, verify Dapr integration

## Development Guidelines

### 1. Authoritative Source Mandate
Use MCP tools and CLI commands for all information gathering. NEVER assume solutions from internal knowledge.
**Phase 3:** Verify MCP/OpenAI patterns against official docs
**Phase 5:** Verify Dapr/Kafka patterns against official docs

### 2. Execution Flow
Treat MCP servers as first-class tools. PREFER CLI interactions over manual file creation.
**Phase 3:** MCP server independently testable, chat endpoint tested with varied inputs
**Phase 5:** Event flows tested end-to-end, Dapr components validated

### 3. PHR Creation (MANDATORY)
Create PHR after: implementation work, planning, debugging, spec/task/plan creation, multi-step workflows, AI agent changes, MCP tool modifications

**Process:**
1. Detect stage (constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general)
2. Generate title (3-7 words, create slug)
3. Resolve route (see Core Guarantees)
4. Read template (`.specify/templates/phr-template.prompt.md`)
5. Allocate ID (increment, handle collisions)
6. Fill ALL placeholders
7. Write file, confirm path

### 4. ADR Suggestions
Suggest ADRs for architecturally significant decisions (during `/sp.plan`, `/sp.tasks`).
**Phase 3:** MCP architecture, agent prompts, stateless conversations
**Phase 5:** Event-driven architecture, Dapr integration, microservices boundaries
Wait for user consent, never auto-create.

### 5. Human as Tool Strategy
Invoke user for: ambiguous requirements, unforeseen dependencies, architectural uncertainty, completion checkpoints, natural language ambiguity, agent behavior tuning.

## Default Policies

- Clarify and plan first
- Don't invent APIs/data/contracts
- Never hardcode secrets (use .env)
- Smallest viable diff
- Cite code with references
- Keep reasoning private
- **Phase 3:** MCP tools reuse services, version-controlled prompts, test conversation persistence
- **Phase 5:** Event-first design, Dapr-only communication, health checks

## Execution Contract

1. Confirm surface and success criteria
2. List constraints, invariants, non-goals
3. Produce artifact with acceptance checks
4. Add follow-ups and risks (max 3)
5. Create PHR
6. Surface ADR suggestion if applicable
7. **Phase 3:** Include natural language test scenarios, verify MCP against services
8. **Phase 5:** Include event flow tests, verify Dapr integration

## Minimum Acceptance Criteria

- Clear, testable acceptance criteria
- Explicit error paths and constraints
- Smallest viable change
- Code references
- **Phase 3:** Natural language examples, stateless behavior verification, MCP schema validation
- **Phase 5:** Event schema validation, Dapr component configuration, health check implementation

## Official Documentation (Required Reading)

**Frontend:** Next.js, React Server Components, OpenAI ChatKit, React Hook Form, Zod, Tailwind CSS, TypeScript
**Backend:** FastAPI, SQLModel, Pydantic v2, Python 3.13, OpenAI Python SDK, OpenAI Agents SDK, MCP SDK
**Database:** Neon PostgreSQL, PostgreSQL 16, Alembic
**Auth:** JWT, python-jose, Argon2
**AI/MCP:** OpenAI API, MCP Protocol, MCP Python SDK
**Container/Orchestration:** Docker, Kubernetes, Helm, Minikube
**Phase 5:** Apache Kafka, Strimzi, Dapr (Pub/Sub, State, Service Invocation, Jobs API, Secrets), OCI, OKE, GitHub Actions, Prometheus, Grafana

**CRITICAL:** Always verify patterns against official docs before coding. Use context7 MCP to fetch documentation.

## MCP Servers for Documentation

- **openai**: https://platform.openai.com/docs
- **mcp**: https://modelcontextprotocol.io/
- **context7**: https://mcp.context7.com/mcp
- **neon**: https://mcp.neon.tech/mcp

## Recent Changes
- 005-advanced-task-features: Added Python 3.13+ (backend), TypeScript 5+ (frontend)

**Phase 5 (In Progress):** Event-driven architecture, Kafka, Dapr, advanced task features, OCI deployment, CI/CD
**Phase 4 (Complete):** Docker containers, Kubernetes deployment, Helm charts, Minikube
**Phase 3 (Complete):** OpenAI Agents SDK, MCP, ChatKit, stateless conversations, Argon2
**Phase 2 (Complete):** Custom JWT, task CRUD, user isolation, responsive UI
**Phase 1 (Complete):** FastAPI backend, SQLModel, Neon PostgreSQL

---

**Current Phase:** 5 - Advanced Cloud Deployment (Kafka, Dapr, OCI)
**Constitution Version:** 3.0.0
**Last Updated:** 2026-02-15

This project follows Spec-Driven Development with event-driven microservices, distributed runtime, and production-grade cloud deployment while maintaining security, user isolation, and stateless architecture.

## Active Technologies
- Python 3.13+ (backend), TypeScript 5+ (frontend) (005-advanced-task-features)
- Neon Serverless PostgreSQL (existing database, add new fields and tables) (005-advanced-task-features)
