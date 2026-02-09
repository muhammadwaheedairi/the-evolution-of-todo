# Feature Specification: Backend AI Infrastructure

**Feature Branch**: `1-phase3-backend-ai-infrastructure`
**Created**: 2026-02-06
**Status**: Draft

## Context

We have a working Phase 2 app with FastAPI backend, custom JWT auth, and task CRUD operations. Phase 3 adds conversational interface using OpenAI Agents SDK and MCP protocol. All conversation data must persist in database (stateless architecture). Existing task services must be reused by MCP tools.

## Requirements Overview

This specification covers the complete backend implementation for AI chatbot functionality:

1. **DATABASE EXTENSION**
   - Conversations table (id, user_id, created_at, updated_at)
   - Messages table (id, user_id, conversation_id, role, content, created_at)
   - Alembic migration
   - SQLModel models with relationships

2. **MCP SERVER IMPLEMENTATION**
   - Install Official MCP SDK
   - Create src/mcp/ module
   - Define 5 tools: add_task, list_tasks, complete_task, delete_task, update_task
   - Tool schemas following MCP specification
   - Tool handlers that REUSE existing task_service.py functions

3. **OPENAI AGENTS SDK INTEGRATION**
   - Install openai-agents package
   - Create Agent with task management instructions
   - Integrate MCP server using MCPServerStdio
   - Use SQLAlchemySession for database-backed conversation history
   - Runner to execute agent with user messages

4. **CHAT API ENDPOINT**
   - POST /api/{user_id}/chat
   - Request: {conversation_id?: int, message: string}
   - Response: {conversation_id: int, response: string, tool_calls: string[]}
   - Stateless architecture (SQLAlchemySession manages history)
   - Same JWT authentication as task endpoints

5. **TESTING**
   - Natural language test scenarios (add, list, complete, delete, update)
   - Conversation persistence after server restart
   - Multi-user chat isolation
   - Stateless behavior verification

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chat Endpoint with Natural Language Task Management (Priority: P1)

As a user, I want to interact with the todo app through a chat interface where I can add, update, delete, list, and complete tasks using natural language. I should be able to say things like "add task buy groceries" or "show me all pending tasks" and the system should correctly interpret my intent and execute the appropriate action.

**Why this priority**: This is the core functionality of the AI chatbot feature that delivers the primary value proposition to users - replacing manual task management with natural language interactions.

**Independent Test**: Can be fully tested by sending various natural language commands to the chat endpoint and verifying that the corresponding tasks are created/modified in the database. Delivers immediate value by enabling natural language task management.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they send "add task buy groceries", **Then** a new task titled "buy groceries" is created in their task list and the agent responds with confirmation
2. **Given** a user has tasks, **When** they send "show me all tasks", **Then** the agent returns a list of all their tasks
3. **Given** a user has pending tasks, **When** they send "mark task 3 as done", **Then** the task with ID 3 is marked as completed and the agent confirms the action

---

### User Story 2 - Persistent Conversation History (Priority: P2)

As a user, I want my conversation with the AI assistant to be saved so that I can continue from where I left off, even if I close the app or the server restarts. My conversation context should be preserved to enable multi-turn interactions.

**Why this priority**: This ensures the conversation feels natural and continuous, allowing for complex interactions that span multiple exchanges.

**Independent Test**: Can be tested by creating a conversation, adding several exchanges, restarting the server, and then verifying that the conversation history is properly retrieved and the AI can continue the conversation contextually.

**Acceptance Scenarios**:

1. **Given** a user has an ongoing conversation, **When** they send follow-up messages, **Then** the system remembers previous exchanges and responds contextually
2. **Given** a server restart occurs, **When** a user returns to their conversation, **Then** the system retrieves their conversation history from SQLAlchemySession and can continue appropriately

---

### User Story 3 - Secure Multi-User Isolation (Priority: P3)

As a user, I want my conversations and tasks to be completely isolated from other users, ensuring privacy and security. My data should be accessible only to me and the AI assistant should only operate on my data.

**Why this priority**: Security and privacy are fundamental requirements that must be maintained even when adding new AI features.

**Independent Test**: Can be tested by having multiple users interact with the system simultaneously and verifying that each user only sees their own conversations and tasks.

**Acceptance Scenarios**:

1. **Given** multiple authenticated users, **When** they all send messages to the chat endpoint, **Then** each user only accesses their own conversations and tasks
2. **Given** a user attempting to access another user's conversations, **When** they make a request with wrong user_id, **Then** they receive an access denial (404 error)

---

### Edge Cases

- What happens when a user sends malformed natural language that doesn't match any known patterns? The agent should gracefully respond with a helpful message asking for clarification.
- How does the system handle multiple simultaneous requests from the same user? Requests should be processed safely without conflicts.
- What occurs when the OpenAI API is temporarily unavailable? The system should handle the error gracefully and inform the user with retry logic.
- What happens when MCP tools fail during execution? The agent should handle tool errors gracefully and inform the user conversationally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use OpenAI Agents SDK (openai-agents package) for agent orchestration
- **FR-002**: System MUST integrate MCP server using MCPServerStdio from the Agents SDK
- **FR-003**: System MUST use SQLAlchemySession for database-backed conversation persistence
- **FR-004**: System MUST provide a chat endpoint at POST /api/{user_id}/chat that accepts conversation_id and message
- **FR-005**: System MUST reuse existing task_service.py functions for all MCP tools to avoid duplication
- **FR-006**: System MUST validate user_id in all database queries to enforce data isolation
- **FR-007**: System MUST authenticate all chat endpoint requests using the same JWT validation as task endpoints
- **FR-008**: System MUST execute MCP tools that map natural language to appropriate task operations (add, list, complete, delete, update)
- **FR-009**: System MUST use Runner.run() to execute agent with automatic conversation history management
- **FR-010**: System MUST return structured responses with conversation_id, response text, and tool_calls array
- **FR-011**: System MUST implement MCP server with 5 defined tools following official MCP specification
- **FR-012**: System MUST ensure stateless architecture where SQLAlchemySession manages conversation history retrieval
- **FR-013**: System MUST ensure agent responses are conversational and human-friendly, not technical
- **FR-014**: System MUST handle OpenAI API failures with retry logic and exponential backoff
- **FR-015**: System MUST maintain all existing Phase 2 functionality without regression

### Key Entities *(include if feature involves data)*

**Note**: While we define Conversation and Message models for reference, the OpenAI Agents SDK's SQLAlchemySession automatically manages conversation storage. Our custom models are primarily for compatibility and potential custom queries.

- **Conversation**: Represents a single conversation thread; linked to a user via user_id (may be managed by SQLAlchemySession tables)
- **Message**: Represents a single message within a conversation; has role (user/assistant), content, and timestamps (may be managed by SQLAlchemySession tables)
- **Agent**: OpenAI Agents SDK Agent instance with task management instructions and MCP tools
- **Session**: SQLAlchemySession instance that manages conversation history in PostgreSQL

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully interact with the task management system through natural language commands with at least 90% accuracy for common operations (add, list, complete, delete, update)
- **SC-002**: Conversation history persists correctly across server restarts with no data loss (verified via SQLAlchemySession)
- **SC-003**: Each user's conversations and tasks are completely isolated from other users with zero unauthorized access incidents
- **SC-004**: Chat responses are delivered within 5 seconds for 95% of requests under normal load conditions
- **SC-005**: Agent responses are conversational and user-friendly rather than technical/error-like 100% of the time
- **SC-006**: All existing Phase 2 functionality continues to work without regression after AI chatbot implementation
- **SC-007**: All natural language test scenarios pass (add, list, complete, delete, update operations)
- **SC-008**: MCP tools correctly reuse existing service functions without duplicating business logic
- **SC-009**: Agent successfully integrates with MCP server and executes all 5 tools correctly
- **SC-010**: SQLAlchemySession correctly stores and retrieves conversation history from PostgreSQL database

## Constraints

- Follow constitution v2.0.0 principles (AI Agent Architecture, Stateless Design, MCP Protocol Standards)
- Maintain existing Phase 2 functionality
- Use Argon2 password hashing (not bcrypt)
- Use custom JWT authentication (not Better Auth)
- Stateless design (SQLAlchemySession manages history, NO in-memory conversation state)
- OpenAI Agents SDK for agent orchestration (NOT Assistants API)
- Official MCP SDK for tool protocol
- PostgreSQL database for all persistence (existing Neon connection)