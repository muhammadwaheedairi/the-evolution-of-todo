# Claude Code Rules - Todo AI Chatbot (Phase 3)

You are an expert AI assistant specializing in Spec-Driven Development (SDD) for the Todo AI Chatbot project. Your primary goal is to work with the architecture to build AI-powered conversational interfaces following the defined technology stack and specifications.

## Project Overview

### Objective
Build an AI-powered chatbot interface that manages tasks through natural language using MCP (Model Context Protocol) server architecture with OpenAI Agents SDK. The application transforms the Phase 2 REST API into a conversational interface while maintaining all security and isolation requirements.

### Core Features
- **Natural Language Task Management**: Add, delete, update, list, and complete tasks via chat
- **Conversational Interface**: OpenAI ChatKit-based UI for intuitive interactions
- **MCP Tool Protocol**: Standardized tools for AI agent to execute task operations
- **Stateless Conversations**: All conversation history persists in database
- **Multi-turn Context**: Agent remembers conversation history for contextual responses

### Technology Stack

**Frontend:**
- Next.js 16+ (App Router - NOT Pages Router)
- TypeScript (strict mode)
- Tailwind CSS v3.4+
- **OpenAI ChatKit** (NEW for Phase 3)
- Custom JWT Implementation (localStorage + cookies)
- React Hook Form with Zod validation (for non-chat forms)
- Lucide React for UI icons

**Backend:**
- FastAPI
- SQLModel ORM
- Python 3.13+
- UV package manager
- **OpenAI Agents SDK** (NEW for Phase 3)
- **Official MCP SDK** (NEW for Phase 3)

**Database:**
- Neon Serverless PostgreSQL
- **New Tables: conversations, messages** (Phase 3)

**Authentication:**
- Custom JWT Implementation (frontend) + JWT (backend)
- Token stored in both localStorage and cookies
- **Argon2 password hashing** (strongest security)
- Shared secret for token verification

**AI Integration (NEW for Phase 3):**
- OpenAI API (GPT-4 or GPT-4-turbo)
- MCP Server for tool definitions
- Stateless agent orchestration

**Project Structure:**
- Monorepo with frontend/ and backend/ directories
- Spec-Kit organization with /specs, /history/adr
- CLAUDE.md files at root and workspace levels
- **New: backend/src/mcp/** for MCP server
- **New: backend/src/services/conversation_service.py**

## Architecture

### Database Schema

#### users (managed by the application)
- **id**: UUID (primary key)
- **email**: string (unique)
- **name**: string
- **password_hash**: string (Argon2)
- **created_at**: timestamp
- **updated_at**: timestamp

#### tasks
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id)
- **title**: string (not null)
- **description**: text (nullable)
- **completed**: boolean (default false)
- **created_at**: timestamp
- **updated_at**: timestamp

#### **conversations (NEW for Phase 3)**
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id, indexed)
- **created_at**: timestamp
- **updated_at**: timestamp

#### **messages (NEW for Phase 3)**
- **id**: integer (primary key)
- **user_id**: UUID (foreign key -> users.id, indexed)
- **conversation_id**: integer (foreign key -> conversations.id, indexed)
- **role**: string ("user" or "assistant")
- **content**: text (message content)
- **created_at**: timestamp

### REST API Endpoints

**Authentication Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

**Task Management Endpoints (Phase 2 - Keep functional):**
All endpoints require JWT token: `Authorization: Bearer <token>`
- `GET /api/{user_id}/tasks` - List all tasks for authenticated user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get task details
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion status

**Chat Endpoint (NEW for Phase 3):**
- `POST /api/{user_id}/chat` - Send message and receive AI response
  - **Request:** `{conversation_id?: int, message: string}`
  - **Response:** `{conversation_id: int, response: string, tool_calls: string[]}`

### MCP Tools (NEW for Phase 3)

All MCP tools are wrappers around existing task services. They provide standardized interface for AI agent.

**Tool: add_task**
- **Purpose**: Create a new task
- **Parameters**: 
  - `user_id` (string, required)
  - `title` (string, required)
  - `description` (string, optional)
- **Returns**: `{task_id: int, status: string, title: string}`

**Tool: list_tasks**
- **Purpose**: Retrieve tasks from list
- **Parameters**:
  - `user_id` (string, required)
  - `status` (string, optional: "all", "pending", "completed")
- **Returns**: Array of task objects

**Tool: complete_task**
- **Purpose**: Mark task as complete
- **Parameters**:
  - `user_id` (string, required)
  - `task_id` (int, required)
- **Returns**: `{task_id: int, status: string, title: string}`

**Tool: delete_task**
- **Purpose**: Remove task from list
- **Parameters**:
  - `user_id` (string, required)
  - `task_id` (int, required)
- **Returns**: `{task_id: int, status: string, title: string}`

**Tool: update_task**
- **Purpose**: Modify task title or description
- **Parameters**:
  - `user_id` (string, required)
  - `task_id` (int, required)
  - `title` (string, optional)
  - `description` (string, optional)
- **Returns**: `{task_id: int, status: string, title: string}`

## Critical Phase III Requirements

### AI Agent Standards (MANDATORY)
1. **Stateless Design**: Agent must NOT store conversation state in memory
2. **Database Persistence**: All conversation history MUST persist in database
3. **Context Loading**: Fetch conversation history from DB on EVERY request
4. **Intent Recognition**: Correctly map natural language to MCP tool calls
5. **Conversational Responses**: Translate tool results into human-friendly messages
6. **Error Handling**: Handle tool failures gracefully with user-friendly messages

### MCP Server Standards (MANDATORY)
1. **Tool Wrappers**: MCP tools MUST reuse existing task_service functions
2. **User Validation**: All tools MUST validate user_id parameter
3. **Typed Schemas**: All tool schemas must follow MCP specification exactly
4. **Separate Module**: MCP server must be in separate module from FastAPI routes
5. **Independent Testing**: MCP tools must be testable without FastAPI app

### Conversation Management (MANDATORY)
1. **Stateless Requests**: Each chat request is independent
2. **History Retrieval**: Load full conversation history from database
3. **Message Persistence**: Save both user and assistant messages
4. **User Isolation**: Conversations filtered by user_id
5. **Conversation IDs**: Auto-create new conversation if not provided

### Security (MANDATORY - Inherited from Phase 2)
1. **User Isolation**: ALL database queries MUST filter by `user_id`
2. **Authorization**: ALWAYS verify `user_id` in URL matches authenticated user
3. **JWT Tokens**: Use shared secret for token verification
4. **Password Security**: Argon2 hashing (strongest algorithm)
5. **Chat Endpoint Auth**: Chat endpoint MUST enforce same JWT auth as REST endpoints
6. **MCP Tool Security**: Tools MUST never bypass user_id validation

### Natural Language Processing
1. **Input Sanitization**: Validate and sanitize all chat inputs
2. **Intent Extraction**: Agent must handle varied phrasings
3. **Missing Information**: Agent must ask for required parameters
4. **Error Recovery**: Provide helpful examples when confused
5. **Multi-action Handling**: Handle compound requests appropriately

### API Contract Alignment
1. **Design First**: Define API contracts in specs before implementation
2. **Backend First**: Implement backend endpoints before frontend client
3. **Type Safety**: Use TypeScript types that match backend schemas
4. **Contract Testing**: Verify OpenAPI spec matches frontend expectations

### Next.js App Router Rules
1. **Default**: Use Server Components (no 'use client')
2. **Client Components**: Only for interactivity (ChatKit, forms, onClick, useState)
3. **Mark Clearly**: Add `'use client'` directive at top of file
4. **No Pages Router**: Phase III requires App Router only

### SQLModel Rules
1. **ORM Only**: Use SQLModel, not raw SQLAlchemy
2. **Relationships**: Define foreign keys and relationships
3. **Validation**: Use Field() constraints (min_length, max_length)
4. **Indexes**: Add indexes on foreign keys and frequently queried fields

## Development Workflow

1. **Write Specification** - Define requirements and features
2. **Generate Plan** - Create architectural implementation plan
3. **Break into Tasks** - Decompose into actionable tasks
4. **Implement via Claude Code** - Use skills to generate code

## Authentication Flow (Inherited from Phase 2)

Custom JWT Implementation:
1. User registers/logs in on Frontend → Frontend sends credentials to backend
2. Backend authenticates user → Creates JWT token and returns to frontend
3. Frontend stores token in localStorage → Includes JWT token in all API request headers
4. Backend receives request → Extracts token, verifies signature using shared secret
5. Backend identifies user → Validates token and retrieves user ID from database
6. Backend enforces user isolation → Verifies that URL user_id matches authenticated user ID
7. Backend filters data → Returns only tasks belonging to that user

**NEW for Phase 3**: Chat endpoint follows EXACT same authentication flow.

## Conversation Flow (NEW for Phase 3)

**Stateless Request Cycle:**
1. Receive user message via `POST /api/{user_id}/chat`
2. Authenticate user (JWT verification)
3. Get or create conversation (fetch from DB or create new)
4. Save user message to database
5. Fetch full conversation history from database
6. Build messages array for OpenAI agent (history + new message)
7. Run OpenAI agent with MCP tools
8. Agent invokes appropriate MCP tool(s) based on intent
9. Tools execute via existing task services
10. Save assistant response to database
11. Return response to client
12. **Server holds NO state** (ready for next independent request)

**Key Stateless Benefits:**
- Any server instance can handle any request
- Server restarts don't lose conversations
- Horizontal scaling works seamlessly
- Conversations resume after backend restart

## MCP Servers for Documentation

- **openai**: https://platform.openai.com/docs
- **mcp**: https://modelcontextprotocol.io/
- **context7**: https://mcp.context7.com/mcp
- **neon**: https://mcp.neon.tech/mcp

## Official Documentation (Required Reading)

**CRITICAL**: Always verify implementation patterns against official docs before coding. Use context7 MCP server to fetch documentation.

### Required Documentation by Component

**Frontend (Next.js + ChatKit):**
- Next.js 16+ App Router: https://nextjs.org/docs/app
- React Server Components: https://react.dev/reference/rsc/server-components
- **OpenAI ChatKit: https://platform.openai.com/docs/guides/chatkit** (NEW)
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs/

**Backend (FastAPI + OpenAI + MCP):**
- FastAPI: https://fastapi.tiangolo.com/
- FastAPI Security (JWT): https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- SQLModel: https://sqlmodel.tiangolo.com/
- Pydantic v2: https://docs.pydantic.dev/latest/
- Python 3.13: https://docs.python.org/3.13/
- **OpenAI Python SDK: https://platform.openai.com/docs/api-reference** (NEW)
- **OpenAI Agents SDK: https://github.com/openai/swarm** (NEW)
- **Official MCP SDK: https://modelcontextprotocol.io/docs** (NEW)

**Database:**
- Neon PostgreSQL: https://neon.tech/docs
- PostgreSQL 16: https://www.postgresql.org/docs/16/

**Authentication:**
- Custom JWT Implementation: https://jwt.io/introduction
- JWT (python-jose): https://python-jose.readthedocs.io/
- **Argon2 (argon2-cffi): https://argon2-cffi.readthedocs.io/** (NEW)
- LocalStorage Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

**AI & MCP (NEW for Phase 3):**
- OpenAI API: https://platform.openai.com/docs/api-reference/chat
- MCP Protocol: https://modelcontextprotocol.io/introduction
- MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk

### Documentation-First Workflow

Before implementing any feature:
1. **Read the spec** → Understand requirements
2. **Fetch official docs via context7 MCP** → Get current patterns
3. **Verify approach** → Check for breaking changes or deprecations
4. **Implement** → Use documented patterns
5. **Cite in ADR** → Reference docs in architectural decisions

### Example: Using context7 MCP

```bash
# Verify Next.js Server Component patterns
context7 fetch "Next.js 16 App Router server components data fetching"

# Check FastAPI dependency injection
context7 fetch "FastAPI dependency injection database session"

# SQLModel relationships syntax
context7 fetch "SQLModel foreign key relationships one-to-many"

# OpenAI ChatKit setup (NEW)
context7 fetch "OpenAI ChatKit domain allowlist configuration"

# OpenAI Agents SDK usage (NEW)
context7 fetch "OpenAI Agents SDK tool calling with function definitions"

# MCP tool schema definition (NEW)
context7 fetch "MCP Python SDK tool schema definition and registration"
```

## Project Structure

```
Todo-AI-Chatbot/
├── .specify/
│   ├── memory/
│   │   └── constitution.md (v2.0.0 - Phase 3)
│   ├── templates/
│   └── scripts/
├── .claude/
│   └── skills/
├── frontend/
│   ├── app/
│   │   ├── chat/              (NEW - ChatKit page)
│   │   │   └── page.tsx
│   │   ├── tasks/             (Keep for reference)
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   └── CLAUDE.md
├── backend/
│   ├── src/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── conversation.py    (NEW)
│   │   │   └── message.py         (NEW)
│   │   ├── schemas/
│   │   │   └── chat.py            (NEW)
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   └── chat.py            (NEW)
│   │   ├── services/
│   │   │   ├── task_service.py
│   │   │   ├── conversation_service.py  (NEW)
│   │   │   └── message_service.py       (NEW)
│   │   ├── mcp/                   (NEW)
│   │   │   ├── __init__.py
│   │   │   ├── server.py
│   │   │   └── tools.py
│   │   ├── middleware/
│   │   │   └── auth.py
│   │   └── utils/
│   ├── alembic/
│   │   └── versions/
│   │       └── xxx_add_conversations_messages.py  (NEW)
│   ├── CLAUDE.md
│   └── pyproject.toml
├── specs/
│   ├── phase3-chatbot/           (NEW)
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   └── phase2-web-app/
├── history/
│   ├── prompts/
│   │   ├── constitution/
│   │   ├── phase3-chatbot/       (NEW)
│   │   └── general/
│   └── adr/
│       └── 003-mcp-architecture.md  (NEW)
├── .env
├── docker-compose.yml
└── README.md
```

## Development Guidelines

### For All Agents
- Follow the Agentic Dev Stack workflow strictly
- Use the available skills to generate code
- Maintain consistency with the defined tech stack
- Ensure all API calls include JWT authentication
- Implement user isolation for all data operations
- **NEW: Ensure stateless conversation management**
- **NEW: All MCP tools must reuse existing services**
- **NEW: Agent responses must be conversational, not technical**

### Code Standards
- Use TypeScript for frontend components
- Use Python with type hints for backend
- Follow REST API best practices
- **NEW: Follow MCP protocol specifications**
- **NEW: Agent system prompts must be documented**
- Implement proper error handling
- Include comprehensive tests
- Maintain responsive design for UI

### Natural Language Examples (Phase 3)

**User Says** → **Agent Should Execute**:
- "add task buy groceries" → `add_task(title="buy groceries")`
- "show me all tasks" → `list_tasks(status="all")`
- "what's pending?" → `list_tasks(status="pending")`
- "mark task 3 as done" → `complete_task(task_id=3)`
- "delete the meeting task" → `list_tasks()` then `delete_task(task_id=X)`
- "change task 1 to 'call mom tonight'" → `update_task(task_id=1, title="call mom tonight")`

## When to Use Skills

### Development Skills (General)
- **frontend-design**: Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, or applications that need aesthetic attention.
- **building-nextjs-apps**: Build Next.js 16 applications with correct patterns and distinctive design. Use when creating pages, layouts, dynamic routes, or upgrading from Next.js 15. Covers breaking changes and frontend aesthetics.
- **fastapi-expert**: Comprehensive FastAPI knowledge for building production-ready APIs. Use when building FastAPI applications, implementing REST APIs, setting up database operations with SQLModel, implementing authentication (OAuth2/JWT), or needing guidance on middleware, security, scalability, or performance optimization.
- **sqlmodel-expert**: Advanced SQLModel patterns and comprehensive database migrations with Alembic. Use when creating SQLModel models, defining relationships, setting up database migrations, optimizing queries, or troubleshooting Alembic issues.
- **nextjs-devtools**: Next.js development tooling via MCP. Inspect routes, components, build info, and debug Next.js apps. Use when working on Next.js applications, debugging routing, or inspecting app structure.

### AI & MCP Skills (Phase 3)
- **building-with-openai-agents**: Use when building AI agents with OpenAI's Agents SDK. Triggers include creating agents, implementing tools, multi-agent handoffs, guardrails, MCP integration, tracing. Also for using LiteLLM to run agents on alternative models.
- **building-mcp-servers**: Guides creation of high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services.
- **tool-design**: Design tools that agents can use effectively. Use when creating new tools for agents, debugging tool-related failures, or optimizing existing tool sets.
- **context-fundamentals**: Understand the components, mechanics, and constraints of context in agent systems. Use when designing agent architectures, debugging context-related failures, or optimizing context usage.
- **context-optimization**: Apply optimization techniques to extend effective context capacity. Use when context limits constrain agent performance, when optimizing for cost or latency, or when implementing long-running agent systems.
- **context-degradation**: Recognize, diagnose, and mitigate patterns of context degradation in agent systems. Use when context grows large, agent performance degrades unexpectedly, or debugging agent failures.
- **multi-agent-patterns**: Design multi-agent architectures for complex tasks. Use when single-agent context limits are exceeded, when tasks decompose naturally into subtasks, or when specializing agents improves quality.

### Chat Interface Skills (Phase 3)
- **building-chat-interfaces**: Build AI chat interfaces with custom backends, authentication, and context injection. Use when integrating chat UI with AI agents, adding auth to chat, injecting user/page context, or implementing httpOnly cookie proxies.
- **building-chat-widgets**: Build interactive AI chat widgets with buttons, forms, and bidirectional actions. Use when creating agentic UIs with clickable widgets, entity tagging, or server-handled widget actions.

### Browser Automation Skills
- **browsing-with-playwright**: Browser automation using Playwright MCP. Navigate websites, fill forms, click elements, take screenshots, and extract data. Use when tasks require web browsing, form submission, web scraping, UI testing, or any browser interaction.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions
- All changes are small, testable, and reference code precisely
- **NEW: Agent responses are conversational and helpful**
- **NEW: Conversation state persists correctly across server restarts**
- **NEW: MCP tools execute correctly when called by agent**

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/` (e.g., `phase3-chatbot/`)
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.
- **NEW: All conversation flows must be tested for stateless behavior**
- **NEW: All MCP tools must be independently testable**

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.
**NEW: Verify MCP protocol patterns against official MCP SDK docs**
**NEW: Verify OpenAI Agent patterns against official OpenAI docs**

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.
**NEW: MCP server must be independently testable before integration**
**NEW: Chat endpoint must be tested with various natural language inputs**

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows
- **NEW: AI agent configuration changes**
- **NEW: MCP tool additions or modifications**

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (e.g., `phase3-chatbot/`)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body
   - Write the completed file with agent file tools
   - Confirm absolute path in output

[Rest of PHR process same as before...]

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting
- **NEW: MCP architecture decisions should be documented**
- **NEW: Agent system prompt changes should be documented**
- Wait for user consent; never auto‑create the ADR

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment.

**Invocation Triggers:**
1. **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions
2. **Unforeseen Dependencies:** Surface dependencies and ask for prioritization
3. **Architectural Uncertainty:** Present options with tradeoffs
4. **Completion Checkpoint:** Summarize and confirm next steps
5. **NEW: Natural Language Ambiguity:** When chat input could mean multiple things, ask for clarification
6. **NEW: Agent Behavior Tuning:** When agent response quality needs adjustment, get user feedback

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing
- Never hardcode secrets or tokens; use `.env` and docs
- Prefer the smallest viable diff; do not refactor unrelated code
- Cite existing code with code references (start:end:path)
- Keep reasoning private; output only decisions, artifacts, and justifications
- **NEW: MCP tools must reuse existing services, not duplicate logic**
- **NEW: Agent system prompts must be version-controlled**
- **NEW: Conversation persistence must be tested after every backend change**

### Execution contract for every request
1) Confirm surface and success criteria (one sentence)
2) List constraints, invariants, non‑goals
3) Produce the artifact with acceptance checks inlined
4) Add follow‑ups and risks (max 3 bullets)
5) Create PHR in appropriate subdirectory under `history/prompts/`
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion
7) **NEW: For chat features, include natural language test scenarios**
8) **NEW: For MCP tools, verify against existing service implementations**

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant
- **NEW: Natural language examples for chat features**
- **NEW: Stateless behavior verification for conversation features**
- **NEW: MCP tool schema validation against specification**

## Architect Guidelines (for planning)

[Same as before, plus:]

**NEW for Phase 3:**
- **AI Agent Design:** System prompt structure, intent mapping, error handling
- **MCP Protocol Compliance:** Tool schemas, parameter validation, response formats
- **Stateless Architecture:** Conversation persistence strategy, history retrieval patterns
- **Natural Language Processing:** Input sanitization, intent extraction, ambiguity resolution

## Architecture Decision Records (ADR) - Intelligent Suggestion

[Same as before, plus:]

**NEW Phase 3 ADR Triggers:**
- MCP tool architecture decisions
- Agent system prompt design
- Stateless conversation management approach
- Natural language intent mapping strategy
- OpenAI API integration patterns

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles (v2.0.0 for Phase 3)
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts
- **NEW: `backend/src/mcp/`** — MCP server and tools
- **NEW: `specs/phase3-chatbot/`** — Phase 3 specifications

## Code Standards
See `.specify/memory/constitution.md` (v2.0.0) for:
- Code quality, testing, performance, security
- **NEW: AI agent standards**
- **NEW: MCP server standards**
- **NEW: Conversation management standards**
- **NEW: Natural language processing standards**

## Active Technologies
- TypeScript 5+ (strict mode enabled) (002-frontend-chat-interface)
- Backend PostgreSQL (conversation history) - Frontend uses localStorage for JWT tokens only (002-frontend-chat-interface)

**Phase 2 (Keep functional):**
- Python 3.13 + FastAPI, SQLModel, Neon PostgreSQL, python-jose, argon2-cffi
- Next.js 16+, React 19+, TypeScript 5+, Tailwind CSS
- Custom JWT authentication

**Phase 3 (New additions):**
- **OpenAI Python SDK** (AI agent orchestration)
- **OpenAI Agents SDK** (tool calling framework)
- **Official MCP SDK** (tool protocol implementation)
- **OpenAI ChatKit** (conversational UI)
- **Conversation & Message models** (SQLModel)

## Recent Changes

**Phase 3 - AI Chatbot Implementation:**
- Added OpenAI Agents SDK integration
- Added Official MCP SDK for tool definitions
- Added ChatKit conversational interface
- Added conversation and message database models
- Added stateless chat endpoint
- Added 5 MCP tools (add, list, complete, delete, update)
- Updated constitution to v2.0.0 with AI standards
- Migrated password hashing from bcrypt to Argon2

**Phase 2 - Full-Stack Web Application (completed):**
- Added custom JWT authentication system
- Added task CRUD operations
- Added user isolation and security
- Added responsive UI with Tailwind CSS

---

**Current Phase:** 3 - AI Chatbot  
**Constitution Version:** 2.0.0  
**Last Updated:** 2026-02-06

This project follows strict stateless architecture for AI agent conversations while maintaining security, user isolation, and spec-driven development principles.
