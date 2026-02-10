# Implementation Plan: Backend AI Infrastructure

**Feature**: [Link to spec](./spec.md)
**Created**: 2026-02-06
**Status**: Draft
**Team**: Backend Team

## Technical Context

This plan outlines the implementation of the Backend AI Infrastructure for the Todo App Hackathon Phase 3. The system will provide an AI-powered chatbot interface that allows users to manage their tasks through natural language commands using OpenAI Agents SDK and MCP (Model Context Protocol) server architecture.

**Key Technical Challenges**:
- Implementing a stateless architecture that persists conversation history in the database
- Building MCP server with 5 tools that reuse existing task_service functions
- Integrating OpenAI Agents SDK with proper context management
- Ensuring user data isolation across conversations and tasks
- Maintaining the same JWT authentication as existing endpoints

**Resolved Unknowns**:
- MCP server setup and registration process: Use official MCP SDK with proper tool registration
- Rate limiting strategy for OpenAI API calls: Token-based tracking with quotas
- OpenAI model selection: Use GPT-4 or GPT-4-turbo for best natural language understanding

## Architecture Overview

The backend AI infrastructure will extend the existing FastAPI application with new components:
1. Database extensions for conversations and messages
2. MCP server module with 5 standardized tools
3. Services layer for conversation management
4. Chat endpoint with OpenAI integration
5. Enhanced authentication for chat interactions

## Constitution Check

This implementation must comply with the project constitution v2.0.0:

### ✅ Compliance Checks

- **Security First**: JWT authentication enforced on chat endpoint with user_id isolation
- **Stateless Design**: Conversation state persisted in database, not in memory
- **API-First Architecture**: Following same patterns as existing REST API
- **Database Integrity**: User_id foreign keys enforced for conversations/messages
- **AI Agent Architecture**: Deterministic behavior, no hallucination
- **Conversational Interface First**: Human-friendly responses, not technical dumps
- **Response Format**: Structured responses as specified in requirements
- **Argon2 Password Hashing**: Maintaining existing security standard
- **SQLModel ORM**: Extending existing database patterns
- **OpenAI Agents SDK**: Using approved AI framework
- **Official MCP SDK**: Using compliant MCP protocol
- **Custom JWT**: Continuing existing authentication approach
- **Type Safety**: Maintaining existing type checking standards

### ❌ Violations

None identified.

### ⚠️ Concerns

None identified.

## Implementation Gates

### Gate 1: Architecture Feasibility - PASSED
The proposed architecture is technically feasible with existing technology stack.

### Gate 2: Compliance - PASSED
Implementation aligns with constitutional requirements and constraints.

### Gate 3: Resource Adequacy - PASSED
Required dependencies (OpenAI, MCP SDK) are available and compatible.

---

## Phase 0: Research & Discovery

### Research Completed: MCP Server Setup and Registration
**Status**: COMPLETED
**Result**: Implementation approach documented in research.md

### Research Completed: OpenAI Agents SDK Configuration
**Status**: COMPLETED
**Result**: Configuration recommendations documented in research.md

### Research Completed: Rate Limiting for OpenAI API
**Status**: COMPLETED
**Result**: Rate limiting approach documented in research.md

---

## Phase 1: System Design

### 1.1 Data Model Design

#### Entity: Conversation
- **Fields**:
  - id: integer (primary key, auto-increment)
  - user_id: UUID (foreign key to users.id, indexed for isolation)
  - created_at: datetime (timestamp)
  - updated_at: datetime (timestamp)
- **Relationships**:
  - Owner: User (many-to-one)
  - Messages: Message[] (one-to-many)

#### Entity: Message
- **Fields**:
  - id: integer (primary key, auto-increment)
  - user_id: UUID (foreign key to users.id, indexed for isolation)
  - conversation_id: integer (foreign key to conversations.id, indexed)
  - role: string (enum: "user"|"assistant")
  - content: text (message content)
  - created_at: datetime (timestamp)
- **Relationships**:
  - Conversation: Conversation (many-to-one)
  - User: User (many-to-one)

#### Validation Rules
- All entities must have proper user_id for isolation
- Messages must belong to existing conversations
- Role must be either "user" or "assistant"
- Content must not exceed reasonable length limits

### 1.2 API Contracts

#### Chat Endpoint
```
POST /api/{user_id}/chat
Headers: Authorization: Bearer <jwt_token>
Request Body:
{
  "conversation_id": integer | null,  // Optional - creates new if not provided
  "message": string                   // Required - user's natural language input
}
Response:
{
  "conversation_id": integer,
  "response": string,                 // AI agent's response
  "tool_calls": string[]             // List of MCP tools executed
}
```

#### Authentication
- Same JWT validation as existing task endpoints
- Verify user_id in URL matches authenticated user
- Filter all database queries by user_id

### 1.3 Component Design

#### MCP Server Architecture
- Location: `backend/src/mcp/`
- Components:
  - server.py: MCP server initialization
  - tools.py: 5 MCP tool definitions
  - config.py: MCP configuration

#### Services Layer
- conversation_service.py: Conversation lifecycle management
- message_service.py: Message storage and retrieval
- Reuse existing task_service.py functions

#### Chat Endpoint Flow
1. Authenticate user (JWT validation)
2. Get or create conversation from DB
3. Save user message to DB
4. Fetch full conversation history from DB
5. Run OpenAI agent with MCP tools
6. Save assistant response to DB
7. Return response (no in-memory state)

### 1.4 Quickstart Guide

#### Prerequisites
- Python 3.13+
- FastAPI
- SQLModel
- OpenAI Python SDK
- Official MCP SDK
- Argon2

#### Setup Steps
1. Install dependencies: OpenAI, MCP SDK
2. Create database migrations for conversations/messages
3. Implement conversation and message models
4. Build MCP server with 5 tools
5. Create conversation and message services
6. Implement chat endpoint
7. Add authentication middleware
8. Test with natural language commands

---

## Phase 2: Implementation Roadmap

### Sprint 1: Database Foundation
- [ ] Create SQLModel models for Conversation and Message
- [ ] Add relationships to User model
- [ ] Create Alembic migration for new tables
- [ ] Implement conversation_service.py
- [ ] Implement message_service.py

### Sprint 2: MCP Server
- [ ] Set up MCP server module structure
- [ ] Implement 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- [ ] Ensure tools reuse existing task_service functions
- [ ] Add user_id validation to all tools
- [ ] Test MCP tools independently

### Sprint 3: Chat Endpoint
- [ ] Implement chat endpoint with JWT authentication
- [ ] Implement stateless conversation flow
- [ ] Integrate OpenAI Agents SDK
- [ ] Add error handling for agent responses
- [ ] Ensure conversational response format

### Sprint 4: Integration & Testing
- [ ] End-to-end testing of chat functionality
- [ ] Natural language test scenarios
- [ ] User isolation verification
- [ ] Persistence verification after restart
- [ ] Performance and rate limiting

---

## Technology Choices & Justifications

### OpenAI Agents SDK
- **Choice**: Use OpenAI Agents SDK for agent orchestration
- **Justification**: Official OpenAI solution for building AI agents with tool use capabilities
- **Alternative considered**: LangChain - rejected as it's more general purpose

### Official MCP SDK
- **Choice**: Use official Model Context Protocol SDK
- **Justification**: Standardized protocol for connecting LLMs with external tools
- **Alternative considered**: Custom tool protocol - rejected as non-standard

### SQLModel for ORM
- **Choice**: Extend existing SQLModel patterns
- **Justification**: Consistent with existing database approach, type safety
- **Alternative considered**: Raw SQLAlchemy - rejected as it breaks consistency

### Stateless Architecture
- **Choice**: No in-memory conversation state
- **Justification**: Enables horizontal scaling, persistence across restarts
- **Alternative considered**: In-memory cache - rejected due to statelessness constraint

---

## Risk Assessment

### High Risk Items
- OpenAI API availability and costs
- Complexity of MCP server integration
- Natural language understanding accuracy

### Mitigation Strategies
- Implement fallback responses for API failures
- Thorough testing of MCP tools
- Comprehensive natural language test suite

### Contingency Plans
- Fallback to rule-based responses if agent fails
- Rate limiting to control API costs
- Caching strategies if needed for performance

---

## Success Criteria

The implementation will be considered successful when:
1. ✅ Chat endpoint functional with proper authentication
2. ✅ Agent correctly maps natural language to tools
3. ✅ Conversation history persists across server restarts
4. ✅ MCP tools reuse existing services without duplication
5. ✅ All tests pass including natural language scenarios
6. ✅ Agent responses are conversational and user-friendly
7. ✅ User isolation maintained for conversations
8. ✅ Existing Phase 2 functionality preserved