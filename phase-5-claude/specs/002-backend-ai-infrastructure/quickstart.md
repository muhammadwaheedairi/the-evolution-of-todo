# Quickstart Guide: Backend AI Infrastructure

## Overview
This guide explains how to set up and run the AI-powered chatbot backend for the Todo app using OpenAI Agents SDK.

## Prerequisites
- Python 3.13+
- UV package manager
- Access to OpenAI API (with valid API key)
- PostgreSQL database (Neon Serverless recommended)

## Setup Steps

### 1. Clone and Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
# Install UV if not already installed
pip install uv

# Install all dependencies including OpenAI Agents SDK and MCP SDK
uv add openai-agents mcp
```

### 3. Set Up Environment Variables
Create a `.env` file in the backend directory with:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/todo_db
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run Database Migrations
```bash
# Apply migrations to create any custom tables if needed
# Note: SQLAlchemySession from Agents SDK creates its own tables automatically
uv run alembic upgrade head
```

### 5. Start the Backend Server
```bash
uv run python -m src.main
```

## Architecture Overview

### New Components Added:
1. **MCP Server** (`src/mcp/`): Defines 5 tools for AI agent (add_task, list_tasks, complete_task, delete_task, update_task)
2. **Agent Configuration** (`src/utils/agent.py`): OpenAI Agents SDK setup with MCP integration
3. **Chat Endpoint** (`src/routers/chat.py`): API endpoint for chat interactions
4. **SQLAlchemySession**: Automatic conversation history management (handled by Agents SDK)

### Key Features:
- **Stateless design**: SQLAlchemySession fetches conversation history from DB on every request
- **User isolation**: All queries filtered by user_id
- **Tool reuse**: MCP tools leverage existing task_service.py functions (no duplicate logic)
- **JWT authentication**: Same authentication middleware as existing task endpoints
- **Automatic history**: Agent SDK manages conversation persistence via SQLAlchemySession

## API Usage

### Chat Endpoint
Send a POST request to:
```
POST /api/{user_id}/chat
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "message": "Add a task to buy groceries"  // Required
}
```

**Note**: No need to send `conversation_id` - the SQLAlchemySession is created based on user_id and manages conversation automatically.

Response:
```json
{
  "conversation_id": "user_123",  // Session identifier
  "response": "I've added 'Buy groceries' to your task list.",
  "tool_calls": ["add_task"]
}
```

## MCP Tools Available
The AI agent can use these 5 tools (all reuse existing task_service.py functions):
1. `add_task` - Create new tasks
2. `list_tasks` - View existing tasks (filterable by status)
3. `complete_task` - Mark tasks as complete
4. `delete_task` - Remove tasks
5. `update_task` - Modify existing task details

## Natural Language Examples

Users can interact naturally:
- "add task buy groceries" → Creates task
- "show me all tasks" → Lists all tasks
- "what's pending?" → Lists pending tasks
- "mark task 3 as done" → Completes task
- "delete the meeting task" → Deletes task
- "change task 1 to 'call mom'" → Updates task

## Troubleshooting

### Common Issues:

1. **OpenAI API Key Missing**
   - Error: `AuthenticationError: No API key provided`
   - Solution: Ensure `OPENAI_API_KEY` is set in `.env` file

2. **Database Not Connected**
   - Error: `OperationalError: could not connect to server`
   - Solution: Verify `DATABASE_URL` is correct and database is running

3. **JWT Token Invalid**
   - Error: `401 Unauthorized`
   - Solution: Check that `JWT_SECRET` matches between frontend and backend

4. **User Isolation Failed**
   - Error: `404 Not Found`
   - Solution: Ensure `user_id` in URL matches authenticated user from JWT token

5. **OpenAI Agents SDK Import Error**
   - Error: `ModuleNotFoundError: No module named 'agents'`
   - Solution: Install with `uv add openai-agents`

6. **MCP Server Connection Failed**
   - Error: `MCPServerError: Failed to connect to MCP server`
   - Solution: Verify MCP server initialization in `src/mcp/server.py`

7. **SQLAlchemySession Table Creation Failed**
   - Error: `ProgrammingError: relation does not exist`
   - Solution: SQLAlchemySession creates tables automatically on first run. Check database permissions.

### Debugging:
- Check logs for detailed error messages
- Verify all environment variables are set: `env | grep -E "DATABASE_URL|JWT_SECRET|OPENAI_API_KEY"`
- Ensure database migrations have been applied: `uv run alembic current`
- Confirm user authentication is working for task endpoints first
- Test MCP tools independently before full agent integration
- Enable OpenAI Agents SDK tracing for debugging (enabled by default)

## Development Tips

### Testing the Chat Endpoint

```bash
# Example curl command to test chat endpoint
curl -X POST http://localhost:8000/api/USER_ID_HERE/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "add task buy milk"}'
```

### Verifying MCP Tools

Check that all 5 tools are registered:
```python
# In Python shell or test script
from src.mcp.server import server
tools = server.list_tools()
print(f"Registered tools: {[t.name for t in tools]}")
# Should print: ['add_task', 'list_tasks', 'complete_task', 'delete_task', 'update_task']
```

### Monitoring Conversation History

SQLAlchemySession stores conversations in database. You can query directly:
```sql
-- View all sessions
SELECT * FROM sessions;

-- View messages for a specific user
SELECT * FROM messages WHERE session_id LIKE 'user_123%';
```

## Next Steps

1. Test all natural language scenarios (add, list, complete, delete, update)
2. Verify conversation persistence after server restart
3. Test multi-user isolation (different users can't access each other's data)
4. Integrate with frontend ChatKit interface (Phase 3 Spec 2)
5. Monitor OpenAI API usage and costs
6. Implement rate limiting if needed for production
```

---

## 📝 Key Corrections Made:

### **1. Dependencies Installation:**
```diff
- uv pip install openai mcp-sdk
+ uv add openai-agents mcp
```
- ✅ Correct package names
- ✅ Use `uv add` instead of `uv pip install`

### **2. Environment Variables:**
```diff
- MCP_SERVER_NAME=todo-mcp-server
```
- ❌ Removed - Not needed as environment variable
- ✅ MCP server name defined in code

### **3. Database Migrations Note:**
```diff
+ Note: SQLAlchemySession from Agents SDK creates its own tables automatically
```
- ✅ Clarifies automatic table creation
- ✅ Custom models optional

### **4. Architecture Overview:**
```diff
- Conversation Service (conversation_service.py)
- Message Service (message_service.py)
+ Agent Configuration (src/utils/agent.py)
+ SQLAlchemySession: Automatic conversation history management
```
- ✅ Reflects Agents SDK architecture
- ✅ No manual conversation/message services needed

### **5. API Usage:**
```diff
- "conversation_id": 123,  // Optional
+ // No conversation_id needed - SQLAlchemySession manages it
```
- ✅ Simplified request format
- ✅ Session based on user_id automatically

### **6. Response Format:**
```diff
- "conversation_id": 123
+ "conversation_id": "user_123"  // Session identifier
```
- ✅ Session ID is string (user-based)
- ✅ More accurate to Agents SDK behavior

### **7. Added Natural Language Examples:**
- ✅ Shows what users can say
- ✅ Expected behaviors clear

### **8. Troubleshooting - Added:**
- **Issue 5**: OpenAI Agents SDK import error
- **Issue 6**: MCP server connection failed
- **Issue 7**: SQLAlchemySession table creation

### **9. Development Tips Section - NEW:**
- ✅ Testing commands
- ✅ Verifying MCP tools
- ✅ Monitoring conversation history
- ✅ SQL queries for debugging

### **10. Next Steps - Updated:**
```diff
+ Integrate with frontend ChatKit interface (Phase 3 Spec 2)
+ Monitor OpenAI API usage and costs