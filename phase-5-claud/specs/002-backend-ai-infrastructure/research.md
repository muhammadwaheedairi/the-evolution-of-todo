# Research Findings: Backend AI Infrastructure

## Decision 1: MCP Server Setup and Registration

**Decision**: Implement MCP server using the official Python MCP SDK with proper registration process.

**Rationale**: The official MCP SDK provides the standard way to create Model Context Protocol servers that can be integrated with LLMs. For the Todo app, we'll create an MCP server that exposes the 5 required tools (add_task, list_tasks, complete_task, delete_task, update_task).

**Implementation approach**:
- Create `backend/src/mcp/server.py` with MCP server initialization
- Define the 5 tools using the MCP decorator pattern
- Register the tools with the MCP server
- Ensure tools receive context information (like user_id) from the calling environment

## Decision 2: OpenAI Agents SDK Integration

**Decision**: Use OpenAI Agents SDK (openai-agents package) for agent orchestration with function calling capabilities.

**Rationale**: The OpenAI Agents SDK is a production-ready agent framework released in March 2025. It provides stateless agent orchestration that aligns with our constitutional requirements:
1. Maintains stateless architecture (required by constitution)
2. Full control over conversation history via Sessions
3. Direct integration with our MCP tools via MCP server integration
4. Database-backed conversation persistence using SQLAlchemy Sessions
5. Horizontal scalability without vendor lock-in

**Implementation approach**:
- Install `openai-agents` package
- Create Agent with system instructions for task management
- Integrate MCP server using `MCPServerStdio` or `MCPServerStreamableHttp`
- Use `SQLAlchemySession` for database-backed conversation history
- Use `Runner.run()` to execute agent with user messages
- Agent automatically has access to all MCP tools

**Key advantages**:
- Built-in MCP integration (no manual tool registration needed)
- Automatic conversation history management via Sessions
- Guardrails support for input/output validation
- Tracing enabled by default for debugging
- Production-ready with minimal abstractions

## Decision 3: Database-Backed Sessions

**Decision**: Use SQLAlchemy Sessions from OpenAI Agents SDK for conversation persistence.

**Rationale**: The Agents SDK provides `SQLAlchemySession` which stores conversation history in PostgreSQL, aligning perfectly with our stateless architecture requirement and existing database setup.

**Implementation approach**:
- Use `SQLAlchemySession.from_url()` with our Neon PostgreSQL connection string
- Session automatically stores all messages (user and assistant)
- Session retrieves conversation history on each request
- No manual database schema needed (SDK creates tables automatically)
- Each user gets unique session ID based on user_id

## Decision 4: Rate Limiting for OpenAI API

**Decision**: Implement token-based rate limiting with exponential backoff for API failures.

**Rationale**: OpenAI API has rate limits and costs money per token. We need to protect against both quota exhaustion and excessive costs while handling failures gracefully.

**Implementation approach**:
- Track token usage per user/conversation
- Implement rate limiting middleware for chat endpoint
- Add retry logic with exponential backoff for API failures
- Log token usage for monitoring and billing

## Alternatives Considered

### MCP Server Implementation
- **Option A**: Direct integration with OpenAI API functions - rejected as it doesn't follow MCP protocol requirements
- **Option B**: Custom protocol - rejected as it doesn't follow standards
- **Option C**: Official MCP SDK - chosen as it follows the specification

### Agent Implementation
- **Option A**: OpenAI Assistants API - rejected as it's stateful and stores history on OpenAI's servers (violates stateless architecture requirement)
- **Option B**: OpenAI Agents SDK - chosen as it provides stateless agent orchestration, built-in MCP integration, and database-backed sessions
- **Option C**: Custom parsing and routing - rejected as less reliable for natural language
- **Option D**: LangChain agents - rejected as it adds unnecessary complexity

### Session Management
- **Option A**: SQLite sessions - rejected as not suitable for production with multiple server instances
- **Option B**: SQLAlchemy sessions with PostgreSQL - chosen as it integrates with existing Neon database and supports horizontal scaling
- **Option C**: In-memory sessions - rejected as violates stateless requirement

### Rate Limiting
- **Option A**: Simple request counting - rejected as it doesn't account for token costs
- **Option B**: Token-based tracking with quotas - chosen as it properly manages costs and limits
- **Option C**: Time-based windowing - rejected as it doesn't account for token consumption