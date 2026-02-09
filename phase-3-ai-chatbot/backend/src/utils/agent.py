"""
Task Management Agent using OpenAI Agents SDK with LiteLLM.
Uses free models via OpenRouter with tool support.
"""

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
    """
    Create a task management agent using OpenAI Agents SDK with LiteLLM.
    
    Args:
        session: Database session for tool execution
        user_id: User ID for task isolation
        
    Returns:
        Configured Agent instance
    """
    
    # Define tools with proper error handling
    @function_tool
    def add_task(title: str, description: str = "") -> str:
        """Add a new task to the user's task list.
        
        Args:
            title: The title of the task (required)
            description: Optional description of the task
        """
        try:
            result = mcp_add_task(user_id, title, description, session=session)
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ Failed to create task: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ Error creating task: {str(e)}"
    
    @function_tool
    def list_tasks(status: str = "all") -> str:
        """List tasks from the user's task list.
        
        Args:
            status: Filter tasks by status - "all", "pending", or "completed"
        """
        try:
            result = mcp_list_tasks(user_id, status, session=session)
            
            if not result["success"]:
                return f"❌ Failed to list tasks: {result.get('error', 'Unknown error')}"
            
            tasks = result["tasks"]
            if not tasks:
                return f"📋 No {status} tasks found."
            
            output = f"📋 {status.capitalize()} tasks ({result['count']}):\n"
            for task in tasks:
                icon = "✅" if task["completed"] else "⬜"
                output += f"{icon} #{task['id']}: {task['title']}"
                if task.get("description"):
                    output += f" - {task['description']}"
                output += "\n"
            
            return output.strip()
        except Exception as e:
            return f"❌ Error listing tasks: {str(e)}"
    
    @function_tool
    def complete_task(task_id: int) -> str:
        """Mark a task as completed.
        
        Args:
            task_id: The ID of the task to complete
        """
        try:
            result = mcp_complete_task(user_id, task_id, session=session)
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ Error completing task: {str(e)}"
    
    @function_tool
    def delete_task(task_id: int) -> str:
        """Delete a task from the user's task list.
        
        Args:
            task_id: The ID of the task to delete
        """
        try:
            result = mcp_delete_task(user_id, task_id, session=session)
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ Error deleting task: {str(e)}"
    
    @function_tool
    def update_task(task_id: int, title: str = None, description: str = None) -> str:
        """Update a task's title or description.
        
        Args:
            task_id: The ID of the task to update
            title: New title for the task (optional)
            description: New description for the task (optional)
        """
        try:
            result = mcp_update_task(user_id, task_id, title, description, session=session)
            
            if result["success"]:
                return result["message"]
            else:
                return f"❌ {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ Error updating task: {str(e)}"
    
    # Create LiteLLM model for free OpenRouter models
    # DeepSeek R1 supports tool calling
    litellm_model = LitellmModel(
        model=f"openrouter/{settings.OPENAI_MODEL}",
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENAI_BASE_URL
    )
    
    # Create agent with tools
    agent = Agent(
        name="TaskManager",
        instructions="""You are a helpful task management assistant. You help users manage their todo list through natural language.

Available actions:
- Add tasks: When user mentions adding, creating, or remembering something
- List tasks: When user wants to see their tasks (can filter by status: all, pending, completed)
- Complete tasks: When user says a task is done or finished
- Delete tasks: When user wants to remove a task
- Update tasks: When user wants to change a task's title or description

Important guidelines:
- Always confirm actions with friendly responses
- Use emojis to make responses more engaging (✅ ⬜ 📋 🗑️ ✏️)
- If a task ID is mentioned, use it directly
- If user describes a task without ID, list tasks first to find the right one
- Be conversational and helpful
- Keep responses concise but informative
- When listing tasks, show status icons and descriptions""",
        
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
    """
    Run the task agent with a user message.
    
    Args:
        session: Database session
        user_id: User ID for task isolation
        message: User's message
        conversation_history: Previous conversation messages (optional)
        
    Returns:
        Dict with agent response and metadata
    """
    try:
        # Create agent
        agent = create_task_agent(session, user_id)
        
        # Run agent using OpenAI Agents SDK
        result = await Runner.run(agent, message)
        
        # Extract response
        response_text = result.final_output if hasattr(result, 'final_output') else str(result)
        
        # Extract tool calls from result
        tool_calls = []
        if hasattr(result, 'new_items'):
            for item in result.new_items:
                if hasattr(item, 'type') and item.type == 'tool_call':
                    tool_calls.append(item.name if hasattr(item, 'name') else 'unknown')
        
        return {
            "response": response_text,
            "tool_calls": list(set(tool_calls)),  # Remove duplicates
            "success": True
        }
        
    except Exception as e:
        return {
            "response": f"I encountered an error: {str(e)}. Please try again.",
            "tool_calls": [],
            "success": False,
            "error": str(e)
        }