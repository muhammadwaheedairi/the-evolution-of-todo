"""Task Management Agent with full feature support: priority, tags, search, filter, recurring, due dates."""

from typing import Dict, Any, List
from agents import Agent, Runner, function_tool
from agents.extensions.models.litellm_model import LitellmModel
from sqlmodel import Session

from ..config import settings
from ..mcp.tools import (
    add_task as mcp_add_task,
    list_tasks as mcp_list_tasks,
    complete_task as mcp_complete_task,
    delete_task as mcp_delete_task,
    update_task as mcp_update_task
)


def create_task_agent(session: Session, user_id: str) -> Agent:
    """Create enhanced task management agent with all features."""
    
    @function_tool
    def add_task(title: str, description: str = "", due_date: str = None, recurrence: str = None, priority: str = None, tags: str = None) -> str:
        """Add a new task to the user's task list.
        
        Args:
            title: The title of the task (required)
            description: Optional description of the task
            due_date: Due date ("tomorrow", "next week", "2026-02-20")
            recurrence: "daily", "weekly", or "monthly"
            priority: "high", "medium", or "low"
            tags: Tags as text like "work urgent"
        """
        try:
            # Use named parameters to avoid order issues
            result = mcp_add_task(
                user_id=user_id,
                title=title,
                description=description,
                due_date_str=due_date,
                recurrence_str=recurrence,
                priority_str=priority,
                tags_str=tags,
                session=session
            )
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ Failed to create task: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ Error creating task: {str(e)}"
    
    @function_tool
    def list_tasks(status: str = "all", priority: str = None, tags: str = None, search: str = None) -> str:
        """List tasks with filtering and search.
        
        Args:
            status: "all", "pending", or "completed"
            priority: Filter by "high", "medium", or "low"
            tags: Filter by tags (JSON array like '["work", "urgent"]')
            search: Search in title and description
        """
        try:
            result = mcp_list_tasks(
                user_id=user_id,
                status=status,
                priority=priority,
                tags=tags,
                search=search,
                session=session
            )
            
            if not result["success"]:
                return f"❌ {result.get('error')}"
            
            tasks = result["tasks"]
            if not tasks:
                return f"📋 No tasks found."
            
            output = f"📋 Found {result['count']} tasks:\n"
            for task in tasks:
                icon = "✅" if task["completed"] else "⬜"
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.get("priority"), "")
                
                output += f"{icon} {priority_emoji} #{task['id']}: {task['title']}"
                
                if task.get("description"):
                    output += f" - {task['description']}"
                if task.get("tags"):
                    output += f" 🏷️{task['tags']}"
                if task.get("due_date"):
                    output += f" 📅{task['due_date'][:10]}"
                if task.get("recurrence_pattern"):
                    output += f" 🔄{task['recurrence_pattern']}"
                output += "\n"
            
            return output.strip()
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    @function_tool
    def complete_task(task_id: int) -> str:
        """Mark task as completed. Auto-creates next for recurring tasks.
        
        Args:
            task_id: The ID of the task to complete
        """
        try:
            result = mcp_complete_task(
                user_id=user_id,
                task_id=task_id,
                session=session
            )
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ {result.get('error')}"
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    @function_tool
    def delete_task(task_id: int) -> str:
        """Delete a task permanently.
        
        Args:
            task_id: The ID of the task to delete
        """
        try:
            result = mcp_delete_task(
                user_id=user_id,
                task_id=task_id,
                session=session
            )
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ {result.get('error')}"
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    @function_tool
    def update_task(task_id: int, title: str = None, description: str = None, due_date: str = None, recurrence: str = None, priority: str = None, tags: str = None) -> str:
        """Update task details including priority and tags.
        
        Args:
            task_id: The ID of the task to update
            title: New title for the task (optional)
            description: New description for the task (optional)
            due_date: New due date (optional)
            recurrence: New recurrence pattern (optional)
            priority: New priority (optional)
            tags: New tags (optional)
        """
        try:
            result = mcp_update_task(
                user_id=user_id,
                task_id=task_id,
                title=title,
                description=description,
                due_date_str=due_date,
                recurrence_str=recurrence,
                priority_str=priority,
                tags_str=tags,
                session=session
            )
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ {result.get('error')}"
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    litellm_model = LitellmModel(
        model=f"openrouter/{settings.OPENAI_MODEL}",
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENAI_BASE_URL
    )
    
    agent = Agent(
        name="TaskManager",
        instructions="""You are a direct task management assistant. Execute commands immediately without asking unnecessary questions.

**CRITICAL BEHAVIOR:**
- When user says "add task X" → IMMEDIATELY create it with defaults (medium priority, no tags, no due date)
- ONLY ask for clarification if the command is completely unclear
- NEVER ask for optional information like priority, tags, or due dates unless user specifically requests help
- Default priority is "medium" - use it automatically
- If user provides details, use them. If not, use defaults and execute immediately

**Features (ALL OPTIONAL):**
- **Priorities**: high, medium (default), low
- **Tags**: Parse from "tagged work urgent" or "#work"
- **Due dates**: "tomorrow", "next week", "2026-02-20"
- **Recurrence**: "daily", "weekly", "monthly"

**CORRECT Examples:**
User: "add task write documentation"
→ IMMEDIATELY: add_task(title="write documentation")
→ Response: "✅ Created task #5: 'write documentation'"

User: "add high priority task fix bug due tomorrow"
→ IMMEDIATELY: add_task(title="fix bug", priority="high", due_date="tomorrow")
→ Response: "✅ Created task #6: 'fix bug' 🔴 | 📅 Due: tomorrow"

User: "add task review code tagged work"
→ IMMEDIATELY: add_task(title="review code", tags="work")
→ Response: "✅ Created task #7: 'review code' 🏷️ work"

**WRONG Examples (NEVER DO THIS):**
❌ User: "add task X" → You: "What priority should I use?"
❌ User: "add task X" → You: "Would you like to add tags?"
❌ User: "add task X" → You: "Do you want to set a due date?"

**Other Commands:**
- "show all tasks" → list_tasks(status="all")
- "show high priority tasks" → list_tasks(priority="high")
- "mark task 3 as done" → complete_task(3)
- "delete task 5" → delete_task(5)

**Response Style:**
- Use emojis: 🔴🟡🟢 (priority), 🏷️ (tags), 📅 (due), 🔄 (recurring)
- Be concise: "✅ Created task #X" or "✅ Completed task #X"
- Execute first, explain after
- Never ask for optional information""",
        
        model=litellm_model,
        tools=[add_task, list_tasks, complete_task, delete_task, update_task]
    )
    
    return agent


async def run_agent_with_mcp_tools(
    session: Session,
    user_id: str,
    message: str,
    conversation_history: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """Run the task agent with a user message."""
    try:
        agent = create_task_agent(session, user_id)
        result = await Runner.run(agent, message)
        
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        tool_calls = []
        if hasattr(result, 'new_items'):
            for item in result.new_items:
                if hasattr(item, 'type') and item.type == 'tool_call':
                    tool_calls.append(item.name if hasattr(item, 'name') else 'unknown')
        
        return {
            "response": response_text,
            "tool_calls": list(set(tool_calls)),
            "success": True
        }
        
    except Exception as e:
        return {
            "response": f"I encountered an error: {str(e)}. Please try again.",
            "tool_calls": [],
            "success": False,
            "error": str(e)
        }