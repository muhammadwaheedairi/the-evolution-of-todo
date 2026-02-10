"""MCP tool implementations - wrappers around task service."""

from sqlmodel import Session
from typing import Dict, Any, Optional

from ..services.task_service import TaskService
from .server import mcp_server
from .config import MCP_SERVER_CONFIG


def add_task(user_id: str, title: str, description: str = "", session: Session = None) -> Dict[str, Any]:
    """
    MCP Tool: Create a new task.

    Args:
        user_id: User ID (UUID as string)
        title: Task title
        description: Task description (optional)
        session: Database session (injected)

    Returns:
        Standardized MCP response
    """
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        # Call existing service (already commits internally)
        task = TaskService.create_task_simple(session, user_id, title, description)

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "message": f"✅ Created task #{task.id}: '{task.title}'"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def list_tasks(user_id: str, status: str = "all", session: Session = None) -> Dict[str, Any]:
    """
    MCP Tool: List tasks filtered by status.

    Args:
        user_id: User ID (UUID as string)
        status: Filter status ("all", "pending", "completed")
        session: Database session (injected)

    Returns:
        Standardized MCP response with task list
    """
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        # Call existing service
        tasks = TaskService.get_tasks_by_status(session, user_id, status)

        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed
            }
            for task in tasks
        ]

        return {
            "success": True,
            "tasks": task_list,
            "count": len(task_list),
            "status_filter": status
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def complete_task(user_id: str, task_id: int, session: Session = None) -> Dict[str, Any]:
    """
    MCP Tool: Mark a task as completed.

    Args:
        user_id: User ID (UUID as string)
        task_id: Task ID to complete
        session: Database session (injected)

    Returns:
        Standardized MCP response
    """
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        # Call existing service (already commits internally)
        task = TaskService.complete_task_simple(session, user_id, task_id)

        if not task:
            return {
                "success": False,
                "error": f"Task #{task_id} not found or doesn't belong to you"
            }

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "message": f"✅ Marked task #{task.id} as completed: '{task.title}'"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_task(user_id: str, task_id: int, session: Session = None) -> Dict[str, Any]:
    """
    MCP Tool: Delete a task permanently.

    Args:
        user_id: User ID (UUID as string)
        task_id: Task ID to delete
        session: Database session (injected)

    Returns:
        Standardized MCP response
    """
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        # Call existing service (already commits internally)
        success = TaskService.delete_task_simple(session, user_id, task_id)

        if not success:
            return {
                "success": False,
                "error": f"Task #{task_id} not found or doesn't belong to you"
            }

        return {
            "success": True,
            "task_id": task_id,
            "message": f"🗑️ Deleted task #{task_id}"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    session: Session = None
) -> Dict[str, Any]:
    """
    MCP Tool: Update task details.

    Args:
        user_id: User ID (UUID as string)
        task_id: Task ID to update
        title: New title (optional)
        description: New description (optional)
        session: Database session (injected)

    Returns:
        Standardized MCP response
    """
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        if not title and not description:
            return {
                "success": False,
                "error": "Please provide either title or description to update"
            }

        # Call existing service (already commits internally)
        task = TaskService.update_task_simple(session, user_id, task_id, title, description)

        if not task:
            return {
                "success": False,
                "error": f"Task #{task_id} not found or doesn't belong to you"
            }

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "message": f"✏️ Updated task #{task.id}: '{task.title}'"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# Register all tools with MCP server
def register_all_tools():
    """Register all MCP tools with the server."""
    tools_config = MCP_SERVER_CONFIG["tools"]

    mcp_server.register_tool("add_task", add_task, tools_config[0]["input_schema"])
    mcp_server.register_tool("list_tasks", list_tasks, tools_config[1]["input_schema"])
    mcp_server.register_tool("complete_task", complete_task, tools_config[2]["input_schema"])
    mcp_server.register_tool("delete_task", delete_task, tools_config[3]["input_schema"])
    mcp_server.register_tool("update_task", update_task, tools_config[4]["input_schema"])


# Auto-register on import
register_all_tools()