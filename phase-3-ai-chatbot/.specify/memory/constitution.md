<!-- SYNC IMPACT REPORT
Version change: 1.1.0 → 2.0.0
Modified principles: Added AI Agent Architecture, MCP Protocol Standards, Conversational Interface, Stateless Conversation Management
Added sections: AI Agent Standards, MCP Server Standards, Natural Language Processing, Conversation Management, OpenAI Integration, ChatKit Standards, Tool Execution Standards
Removed sections: N/A
Templates requiring updates:
- .specify/templates/plan-template.md ✅ pending
- .specify/templates/spec-template.md ✅ pending
- .specify/templates/tasks-template.md ✅ pending
Runtime docs:
- README.md ⚠ pending review
Follow-up TODOs: Update MCP tool documentation, Add chatbot testing guidelines
-->

# Todo AI Chatbot Constitution

## Core Principles

### Security First
All user data must be protected and isolated. Security is the highest priority. JWT authentication must be enforced on every API route **including chat endpoints**, with multi-user task isolation fully enforced. All data must be properly isolated by user_id, and stateless authentication must be maintained with no shared sessions. **All MCP tools must validate user_id before execution. All conversation data must be isolated by user.**

### Stateless Design
Backend services should be horizontally scalable. No shared sessions are allowed; only stateless authentication using JWT tokens. The frontend and backend must share auth secrets via environment variables only. **AI agents must be stateless - no in-memory conversation state. All conversation history must persist in database. Server restarts must not lose conversation context.**

### Type Safety
All data structures must be strictly typed. All components must be properly typed (no 'any' types). All functions must have descriptive names (no single letters except loops). All async operations must be properly awaited. **All MCP tool schemas must be strictly typed. All agent responses must follow typed schemas.**

### API-First Architecture
Frontend and backend communicate only via REST API. All endpoints must follow REST conventions. All endpoints must include user_id in path for user-specific resources. All POST/PUT requests must validate request body. **Chat endpoint must follow same authentication patterns as REST endpoints. Natural language inputs must be validated before agent processing.**

### Database Integrity
All database operations must be transactional. All tables must have created_at and updated_at timestamps. All foreign keys must have proper constraints. All user-owned resources must have user_id foreign key. All queries must filter by user_id for user-specific data. No cascading deletes (explicit handling required). **Conversation and message tables must maintain referential integrity. All conversation history must be retrievable and ordered by timestamp.**

### **AI Agent Architecture (NEW)**
**All AI interactions must be deterministic and reproducible. Agent behavior must be consistent across sessions. Tool execution must be atomic and transactional. Agent must not hallucinate or invent data - only use actual MCP tool responses. System prompts must be version-controlled and documented.**

### **Conversational Interface First (NEW)**
**Natural language is the primary interface. Chat UI must be intuitive and conversational. Agent responses must be human-friendly, not JSON dumps. Agent must confirm actions before execution when appropriate. Error messages must be conversational, not technical.**

---

## Key Standards

### Authentication
JWT-based auth required for all protected endpoints **including chat API**. Authentication must use **custom JWT implementation with Argon2 password hashing**. This ensures consistent authentication patterns across frontend and backend, with proper token validation and user session management. **Chat endpoint must validate JWT tokens exactly like REST endpoints.**

### Authorization
User can only access their own tasks (enforced at API level). All database queries MUST filter by user_id. ALWAYS verify user_id in URL matches authenticated user. **All MCP tools MUST receive and validate user_id parameter. Agent cannot access data from other users under any circumstance.**

### Error Handling
All API endpoints must return proper HTTP status codes. All API endpoints must include proper error handling. All errors return proper error messages with status codes (400, 401, 404, 500). **Agent must handle tool errors gracefully and inform user conversationally. Network failures to OpenAI API must be handled with retry logic. Invalid natural language inputs must receive helpful clarification prompts.**

### Validation
All user inputs must be validated on both frontend and backend. All POST/PUT requests must validate request body. All forms validate user input before submission. **Natural language inputs must be sanitized before agent processing. Agent intent must be validated before tool execution. Tool parameters extracted by agent must be validated against schemas.**

### Response Format
All API responses must follow consistent JSON structure. All successful operations return appropriate status (200, 201, 204). **Chat endpoint must return: conversation_id, assistant response text, and tool_calls array. Agent responses must be formatted as natural language, not raw data structures.**

### Password Security
All passwords must be hashed (never stored in plain text). All passwords must be hashed with **Argon2** (not bcrypt per constitution update). Never store plaintext passwords.

### Environment Variables
All secrets must be stored in .env files (never hardcoded). All environment variables must be validated on startup. **OpenAI API keys must be in environment variables. MCP server configuration must be environment-driven.**

---

## Technical Constraints

### Frontend Framework
Frontend Framework: Next.js 16+ with App Router (not Pages Router). Frontend must be built using Next.js 16+ App Router. Use Server Components (no 'use client') as default, Client Components only for interactivity. **ChatKit UI must be implemented as Client Component due to interactivity requirements.**

### Backend Framework
Backend Framework: FastAPI with async/await. Backend must be built using Python FastAPI. **All MCP tool handlers must be async. OpenAI Agent SDK must use async/await patterns. Chat endpoint must handle concurrent requests properly.**

### Database
Database: Neon Serverless PostgreSQL only. All data must be persisted in Neon Serverless PostgreSQL database. **Conversation and message tables must be in same database. No separate conversation store allowed.**

### ORM
ORM: SQLModel for all database operations. All backend logic must be implemented using Python FastAPI with SQLModel ORM. **Conversation and Message models must use SQLModel. All conversation queries must use SQLModel sessions.**

### **AI Framework (NEW)**
**AI Framework: OpenAI Agents SDK for agent orchestration. All agent logic must use official OpenAI Python SDK. Agent configuration must be centralized and version-controlled.**

### **MCP Protocol (NEW)**
**MCP Protocol: Official MCP SDK for tool definitions. All task operations must be exposed as MCP tools. MCP server must be separate module from FastAPI routes. Tool schemas must follow MCP specification exactly.**

### Authentication Library
Authentication Library: **Custom JWT with Argon2 hashing** (not Better Auth). Authentication must use custom JWT implementation with Argon2 password hashing for maximum security.

### **Chat UI Library (NEW)**
**Chat UI Library: OpenAI ChatKit for conversational interface. ChatKit must be properly configured with domain allowlist. Chat interface must handle streaming responses if implemented.**

### Styling
Styling: Tailwind CSS only (no inline styles, no CSS modules). **ChatKit components must use Tailwind for custom styling.**

### TypeScript
TypeScript: Strict mode enabled on frontend. **ChatKit integration must be properly typed.**

### Python Version
Python Version: 3.11+. **OpenAI SDK and MCP SDK must be compatible with Python 3.11+.**

---

## Code Quality Standards

All API endpoints must include proper error handling. All database queries must use parameterized statements (no raw SQL). All functions must have descriptive names (no single letters except loops). All magic numbers must be defined as constants. All async operations must be properly awaited. No console.log in production code (use proper logging). All components must be properly typed (no 'any' types). **All MCP tool handlers must have comprehensive error handling. All agent system prompts must be clear and unambiguous. All conversation flows must be logged for debugging.**

---

## API Design Standards

All endpoints must follow REST conventions. All endpoints must include user_id in path for user-specific resources. All POST/PUT requests must validate request body. All successful operations return appropriate status (200, 201, 204). All errors return proper error messages with status codes (400, 401, 404, 500). All endpoints must check JWT token validity before processing. **Chat endpoint must accept: user_id, message, optional conversation_id. Chat endpoint must return: conversation_id, response, tool_calls array.**

---

## **AI Agent Standards (NEW)**

### **System Prompt Requirements**
**System prompt must clearly define agent role as task management assistant. System prompt must list all available MCP tools with descriptions. System prompt must instruct agent to confirm destructive actions (delete). System prompt must be stored in separate configuration file, not hardcoded.**

### **Intent Recognition**
**Agent must correctly map natural language to tool calls:**
- **"add/create/remember" → add_task tool**
- **"show/list/display" → list_tasks tool**
- **"complete/done/finish" → complete_task tool**
- **"delete/remove/cancel" → delete_task tool**
- **"update/change/rename" → update_task tool**

### **Response Quality**
**Agent responses must be conversational and friendly. Agent must confirm successful actions ("I've added 'Buy milk' to your tasks"). Agent must ask for clarification on ambiguous requests. Agent must not expose internal errors to users - translate to friendly messages.**

### **Context Management**
**Agent must use conversation history for context. Agent must remember previous messages in same conversation. Agent must handle multi-turn interactions (follow-up questions). Conversation context must be loaded from database on every request.**

---

## **MCP Server Standards (NEW)**

### **Tool Definition Requirements**
**All 5 tools must be defined: add_task, list_tasks, complete_task, delete_task, update_task. Each tool must have clear description and typed parameters. Tool schemas must include user_id as required parameter. Tool responses must be standardized JSON format.**

### **Tool Execution Standards**
**Tools must be wrappers around existing task services (code reuse). Tools must validate all parameters before execution. Tools must handle errors and return structured error responses. Tools must log execution for audit trail.**

### **MCP Protocol Compliance**
**MCP server must implement official MCP specification. Tool schemas must validate using MCP SDK validators. MCP server must be independently testable (separate from FastAPI app).**

---

## **Conversation Management Standards (NEW)**

### **Conversation Persistence**
**All conversations must persist in database. Each message must store: role (user/assistant), content, timestamp. Conversation history must be retrievable by conversation_id. Conversations must be filterable by user_id.**

### **Stateless Request Handling**
**Chat endpoint must fetch conversation history on every request. Server memory must not store any conversation state. Multiple backend instances must handle same conversation consistently. Server restarts must not affect ongoing conversations.**

### **Conversation Lifecycle**
**New conversations created automatically when conversation_id not provided. Conversations persist indefinitely unless explicitly deleted. Users can only access their own conversations. Conversation IDs must be unique and non-guessable.**

---

## **Natural Language Processing Standards (NEW)**

### **Input Validation**
**Natural language inputs must be sanitized (no SQL injection via chat). Maximum message length enforced (prevent abuse). Empty messages rejected with friendly error. Repeated identical messages rate-limited.**

### **Intent Extraction**
**Agent must extract task details from natural language accurately. Agent must handle varied phrasings ("add task buy milk" vs "remember to buy milk"). Agent must ask for missing required information (task title). Agent must handle multi-action requests appropriately.**

### **Error Recovery**
**Agent must handle unrecognized intents gracefully ("I didn't understand, can you rephrase?"). Agent must provide examples of valid commands when confused. Agent must recover from partial failures (some tools succeed, some fail).**

---

## **OpenAI Integration Standards (NEW)**

### **API Key Security**
**OpenAI API key must be in environment variables only. API key must never be exposed in frontend code. API key must be validated on backend startup.**

### **Rate Limiting**
**Implement rate limiting on chat endpoint to prevent OpenAI quota abuse. Track tokens used per user/conversation. Implement exponential backoff for OpenAI API failures.**

### **Model Selection**
**Use GPT-4 or GPT-4-turbo for best natural language understanding. Model version must be configurable via environment variable. Fallback model strategy if primary model unavailable.**

---

## **ChatKit Standards (NEW)**

### **Domain Allowlist**
**Production frontend domain must be added to OpenAI domain allowlist. Domain key must be obtained and stored in environment variables. Local development (localhost) must work without domain key.**

### **UI/UX Requirements**
**Chat interface must be primary interface (not secondary to forms). Chat must show conversation history on load. Chat must indicate when agent is processing (loading state). Chat must show which tools were executed (transparency).**

### **Message Rendering**
**User messages and agent messages must be visually distinct. Timestamps must be shown for all messages. Tool execution results can be shown (optional, for transparency). Error messages must be user-friendly, not technical.**

---

## Database Standards

All tables must have created_at and updated_at timestamps. All foreign keys must have proper constraints. All user-owned resources must have user_id foreign key. All queries must filter by user_id for user-specific data. No cascading deletes (explicit handling required). **Conversations table must have user_id foreign key. Messages table must have conversation_id and user_id foreign keys. Conversation history queries must order by created_at ASC.**

---

## Security Requirements

JWT tokens must expire within 7 days. All passwords must be hashed with **Argon2** (strongest algorithm). All API requests must validate JWT token. All database connections must use SSL. All environment variables must be validated on startup. CORS must be configured properly (no wildcard in production). Rate limiting should be considered for API endpoints. **Chat endpoint must enforce same authentication as REST endpoints. MCP tools must never bypass user_id validation. OpenAI API keys must be rotated periodically. Conversation data must be as protected as task data.**

---

## Deployment Standards

Frontend must deploy to Vercel. Backend must be containerizable. All environment variables must be documented in .env.example. Database migrations must be version controlled. All services must have health check endpoints. **OpenAI domain allowlist must be configured before production deployment. MCP server must be tested in production-like environment. Chat endpoint must handle production load (concurrent conversations).**

---

## **Success Criteria (Updated for Phase 3)**

Users can sign up and sign in successfully. Each user can only see and manage their own tasks. All CRUD operations work correctly. JWT authentication works end-to-end. Frontend and backend communicate properly via API. Application works when deployed (not just locally). No security vulnerabilities in authentication flow. Database properly isolates user data. 

**NEW Phase 3 Criteria:**
- **Users can manage tasks via natural language chat interface**
- **Agent correctly interprets all 5 task operation intents**
- **Conversation history persists across server restarts**
- **Multiple conversations can exist per user**
- **Agent responses are conversational and helpful**
- **All MCP tools execute correctly when called by agent**
- **User data isolation maintained in chat interactions**
- **ChatKit UI properly configured and deployed**
- **OpenAI domain allowlist configured correctly**
- **No conversation state lost on backend restart (stateless verification)**

---

## **Quality Gates (Updated for Phase 3)**

All API endpoints return proper status codes. All forms validate user input before submission. All errors show user-friendly messages. Application handles network errors gracefully. No TypeScript errors in frontend. No Python type errors in backend. Database schema matches SQLModel definitions.

**NEW Phase 3 Quality Gates:**
- **All natural language test scenarios pass (add, list, complete, delete, update)**
- **Agent does not hallucinate or invent tasks**
- **Conversation persistence verified after backend restart**
- **Multi-user chat isolation verified (user A cannot see user B's chats)**
- **MCP tools handle all edge cases (invalid IDs, missing parameters)**
- **Chat endpoint handles concurrent requests without corruption**
- **OpenAI API errors handled gracefully (retry, fallback messages)**
- **ChatKit renders properly across browsers (Chrome, Firefox, Safari)**

---

## Development Workflow

### Agentic Dev Stack Adherence
All development must follow the Agentic Dev Stack workflow: spec → plan → tasks → implementation. Each phase must be completed before moving to the next, with proper documentation and validation at each step. **All AI agent features must be spec-driven. MCP tool definitions must be planned before implementation. Conversation flows must be documented in specs.**

### Spec-Driven Development
Spec-driven development (spec → plan → tasks → implementation) is mandatory. All features must begin with a clear specification that defines scope, requirements, acceptance criteria, and success metrics before any implementation begins. **AI agent system prompts must be specified before coding. Natural language test scenarios must be part of acceptance criteria.**

### Success Criteria Enforcement
Success criteria must be met before considering any feature complete. **Phase 3 must meet all Phase 2 criteria PLUS new chatbot criteria listed above.**

---

## **Tool Execution Standards (NEW)**

### **Atomicity**
**Each tool execution must be atomic (complete or fail, no partial states). Failed tool execution must not corrupt database. Agent must report tool failures clearly to user.**

### **Idempotency**
**Where possible, tools should be idempotent (safe to retry). Duplicate add_task calls should be handled intelligently (warn user). Complete already-completed tasks should be no-op, not error.**

### **Audit Trail**
**All tool executions should be logged with: user_id, tool_name, parameters, result, timestamp. Logs should be queryable for debugging. Failed tool executions must be logged with error details.**

---

## Governance

All development activities must comply with these constitutional principles. Any deviation requires formal amendment to this constitution with proper justification and approval. All pull requests and code reviews must verify compliance with these principles before approval. **AI agent behavior changes require constitutional review. MCP tool additions require spec and constitutional approval.**

---

**Version**: 2.0.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-06  
**Phase**: 3 - AI Chatbot with MCP Architecture  
**Previous Version**: 1.1.0 (Phase 2 - Full-Stack Web Application)