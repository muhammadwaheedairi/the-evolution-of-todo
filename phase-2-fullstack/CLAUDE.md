# Claude Code Rules - Todo Full-Stack Web Application

You are an expert AI assistant specializing in Spec-Driven Development (SDD) for the Todo Full-Stack Web Application project. Your primary goal is to work with the architecture to build products following the defined technology stack and specifications.

## Project Overview

### Objective
Build a full-stack modern multi-user web application with persistent storage using Claude Code and Spec-Kit Plus. The application implements the 5 core task management features with secure authentication and responsive UI.

### Core Features
- **Add Task**: Create new tasks with title and description
- **Delete Task**: Remove tasks from the user's list
- **Update Task**: Modify existing task details
- **View Task List**: Display all tasks with filtering and sorting
- **Mark as Complete**: Toggle task completion status

### Technology Stack

**Frontend:**
- Next.js 16+ (App Router - NOT Pages Router)
- TypeScript (strict mode)
- Tailwind CSS v3.4+
- Custom JWT Implementation (localStorage + cookies)
- React Hook Form with Zod validation
- Lucide React for UI icons

**Backend:**
- FastAPI
- SQLModel ORM
- Python 3.13+
- UV package manager

**Database:**
- Neon Serverless PostgreSQL

**Authentication:**
- Custom JWT Implementation (frontend) + JWT (backend)
- Token stored in both localStorage and cookies
- Shared secret for token verification

**Project Structure:**
- Monorepo with frontend/ and backend/ directories
- Spec-Kit organization with /specs, /history/adr
- CLAUDE.md files at root and workspace levels

## Architecture

### Database Schema
#### users (managed by the application)
- **id**: UUID (primary key)
- **email**: string (unique)
- **name**: string
- **password_hash**: string
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

### REST API Endpoints
All endpoints require JWT token in header: `Authorization: Bearer <token>`

- `GET /api/{user_id}/tasks` - List all tasks for authenticated user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get task details
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion status

## Available Skills

### FastAPI Expert
- Comprehensive FastAPI knowledge for building production-ready APIs from basic to planet-scale
- Use when building FastAPI applications, implementing REST APIs, setting up database operations with SQLModel, implementing authentication (OAuth2/JWT), deploying to Docker/Kubernetes, or needing guidance on middleware, WebSockets, background tasks, dependency injection, security, scalability, or performance optimization
- Located at: `.claude/skills/fastapi-expert/`

### SQLModel Expert
- Advanced SQLModel patterns and comprehensive database migrations with Alembic
- Use when creating SQLModel models, defining relationships (one-to-many, many-to-many, self-referential), setting up database migrations, optimizing queries, solving N+1 problems, implementing inheritance patterns, working with composite keys, creating indexes, performing data migrations, or troubleshooting Alembic issues
- Located at: `.claude/skills/sqlmodel-expert/`

### Frontend Design
- Create distinctive, production-grade frontend interfaces with high design quality
- Use when building web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI)
- Generates creative, polished code and UI design that avoids generic AI aesthetics
- Located at: `.claude/skills/frontend-design/`

### Building Next.js Apps
- Build Next.js 16 applications with correct patterns and distinctive design
- Use when creating pages, layouts, dynamic routes, upgrading from Next.js 15, or implementing proxy.ts
- Covers breaking changes (async params/searchParams, Turbopack, cacheComponents) and frontend aesthetics
- NOT when building non-React or backend-only applications
- Located at: `.claude/skills/building-nextjs-apps/`

### Next.js DevTools
- Next.js development tooling via MCP
- Use when working on Next.js applications, debugging routing, or inspecting app structure
- NOT for general React or non-Next.js projects
- Located at: `.claude/skills/nextjs-devtools/`

## Critical Phase II Requirements

### Security (MANDATORY)
1. **User Isolation:** ALL database queries MUST filter by `user_id`
2. **Authorization:** ALWAYS verify `user_id` in URL matches authenticated user
3. **JWT Tokens:** Use shared secret (`BETTER_AUTH_SECRET`) between frontend and backend
4. **Password Security:** Never store plaintext passwords (use bcrypt)

### API Contract Alignment
1. **Design First:** Define API contracts in specs before implementation
2. **Backend First:** Implement backend endpoints before frontend client
3. **Type Safety:** Use TypeScript types that match backend schemas
4. **Contract Testing:** Verify OpenAPI spec matches frontend expectations

### Next.js App Router Rules
1. **Default:** Use Server Components (no 'use client')
2. **Client Components:** Only for interactivity (forms, onClick, useState)
3. **Mark Clearly:** Add `'use client'` directive at top of file
4. **No Pages Router:** Phase II requires App Router only

### SQLModel Rules
1. **ORM Only:** Use SQLModel, not raw SQLAlchemy
2. **Relationships:** Define foreign keys and relationships
3. **Validation:** Use Field() constraints (min_length, max_length)
4. **Indexes:** Add indexes on foreign keys and frequently queried fields


## Development Workflow

1. **Write Specification** - Define requirements and features
2. **Generate Plan** - Create architectural implementation plan
3. **Break into Tasks** - Decompose into actionable tasks
4. **Implement via Claude Code** - Use skills to generate code

## Authentication Flow

Custom JWT Implementation (not using Better Auth):
1. User registers/logs in on Frontend → Frontend sends credentials to backend
2. Backend authenticates user → Creates JWT token and returns to frontend
3. Frontend stores token in localStorage → Includes JWT token in all API request headers
4. Backend receives request → Extracts token, verifies signature using shared secret
5. Backend identifies user → Validates token and retrieves user ID from database
6. Backend enforces user isolation → Verifies that URL user_id matches authenticated user ID
7. Backend filters data → Returns only tasks belonging to that user

Security Benefits:
- User Isolation: Each user only sees their own tasks
- Stateless Auth: Backend doesn't need to call frontend to verify users
- Token Expiry: JWTs expire automatically
- No Shared DB Session: Independent verification

## MCP Servers for Documentation

- **better-auth**: https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp
- **context7**: https://mcp.context7.com/mcp
- **neon**: https://mcp.neon.tech/mcp

## Official Documentation (Required Reading)

**CRITICAL**: Always verify implementation patterns against official docs before coding. Use context7 MCP server to fetch documentation.

### Required Documentation by Component

**Frontend (Next.js):**
- Next.js 16+ App Router: https://nextjs.org/docs/app
- React Server Components: https://react.dev/reference/rsc/server-components
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs/

**Backend (FastAPI):**
- FastAPI: https://fastapi.tiangolo.com/
- FastAPI Security (JWT): https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- SQLModel: https://sqlmodel.tiangolo.com/
- Pydantic v2: https://docs.pydantic.dev/latest/
- Python 3.13: https://docs.python.org/3.13/

**Database:**
- Neon PostgreSQL: https://neon.tech/docs
- PostgreSQL 16: https://www.postgresql.org/docs/16/

**Authentication:**
- Custom JWT Implementation: https://jwt.io/introduction
- JWT (python-jose): https://python-jose.readthedocs.io/
- LocalStorage Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

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

# Better Auth JWT configuration
context7 fetch "Better Auth JWT plugin shared secret"
```


## Project Structure
- `.claude/skills/` - Project-specific Claude Code skills
- `frontend/` - Next.js frontend application
- `backend/` - Python FastAPI backend
- `specs/` - Feature specifications and plans
- `history/prompts/` - Prompt History Records
- `history/adr/` - Architecture Decision Records

## Development Guidelines

### For All Agents
- Follow the Agentic Dev Stack workflow strictly
- Use the available skills to generate code
- Maintain consistency with the defined tech stack
- Ensure all API calls include JWT authentication
- Implement user isolation for all data operations

### Code Standards
- Use TypeScript for frontend components
- Use Python with type hints for backend
- Follow REST API best practices
- Implement proper error handling
- Include comprehensive tests
- Maintain responsive design for UI

## Task Management
- All tasks are stored in Neon Serverless PostgreSQL
- Tasks are isolated by user_id for security
- Indexes on user_id and completed for performance
- Created and updated timestamps for audit trails

This project follows a strict separation of concerns between frontend and backend with secure authentication and authorization implemented through JWT tokens.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
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
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps.

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

## Active Technologies
- Python 3.13 + FastAPI, SQLModel, Neon Serverless PostgreSQL, Better Auth, python-jose, passlib[bcrypt], psycopg2-binary (001-backend-auth)
- Neon Serverless PostgreSQL database with SQLModel ORM (001-backend-auth)
- TypeScript 5.x, React 18+ with Next.js 16+ App Router + Next.js 16+, React 18+, Custom JWT Implementation, Tailwind CSS, React Hook Form, Fetch API, Zod Validation (001-frontend-ui-auth-integration)
- N/A (frontend only, data stored on backend via API calls) (001-frontend-ui-auth-integration)
- TypeScript 5.x, JavaScript ES2022 + Tailwind CSS v3.4+, Next.js 16+, React 18+ (002-ui-redesign)
- N/A (styling only) (002-ui-redesign)

## Recent Changes
- 001-backend-auth: Added Python 3.13 + FastAPI, SQLModel, Neon Serverless PostgreSQL, Better Auth, python-jose, passlib[bcrypt], psycopg2-binary
