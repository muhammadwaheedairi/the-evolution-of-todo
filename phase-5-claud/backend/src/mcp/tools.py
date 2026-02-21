"""MCP tool implementations with priority, tags, search, filter support."""

from sqlmodel import Session
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_date
import json

from ..services.task_service import TaskService
from .server import mcp_server
from .config import MCP_SERVER_CONFIG


def _parse_natural_date(date_str: str) -> Optional[datetime]:
    """Parse natural language date strings to datetime."""
    if not date_str:
        return None
    
    date_str_lower = date_str.lower().strip()
    
    if date_str_lower in ["today", "tonight"]:
        return datetime.now().replace(hour=23, minute=59, second=0)
    elif date_str_lower == "tomorrow":
        return datetime.now().replace(hour=23, minute=59, second=0) + timedelta(days=1)
    elif "next week" in date_str_lower:
        return datetime.now().replace(hour=23, minute=59, second=0) + timedelta(weeks=1)
    elif "next month" in date_str_lower:
        return datetime.now().replace(hour=23, minute=59, second=0) + timedelta(days=30)
    
    try:
        return parse_date(date_str)
    except:
        return None


def _parse_recurrence(text: str) -> Optional[str]:
    """Parse natural language recurrence patterns."""
    if not text:
        return None
    
    text_lower = text.lower().strip()
    
    if "daily" in text_lower or "every day" in text_lower:
        return "daily"
    elif "weekly" in text_lower or "every week" in text_lower:
        return "weekly"
    elif "monthly" in text_lower or "every month" in text_lower:
        return "monthly"
    
    return None


def _parse_priority(text: str) -> str:
    """Parse priority from text."""
    if not text:
        return "medium"
    
    text_lower = text.lower()
    
    if "high" in text_lower or "urgent" in text_lower or "important" in text_lower:
        return "high"
    elif "low" in text_lower:
        return "low"
    else:
        return "medium"


def _parse_tags(text: str) -> Optional[str]:
    """Parse tags from text and return as JSON string."""
    if not text:
        return None
    
    # Simple approach: split by spaces and create tags
    tags = []
    words = text.lower().split()
    
    # Remove common words
    stop_words = ["tagged", "tag", "tags", "with", "as", "and", "the"]
    
    for word in words:
        # Handle hashtags
        if word.startswith("#"):
            tags.append(word[1:].strip(",.!?"))
        # Regular words (exclude stop words)
        elif word not in stop_words:
            clean_word = word.strip(",.!?")
            if clean_word and len(clean_word) > 1:
                tags.append(clean_word)
    
    return json.dumps(tags) if tags else None

def add_task(
    user_id: str, 
    title: str, 
    description: str = "", 
    due_date_str: str = None,
    recurrence_str: str = None,
    priority_str: str = None,  # NEW
    tags_str: str = None,  # NEW
    session: Session = None
) -> Dict[str, Any]:
    """MCP Tool: Create a new task with all features."""
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        # Parse all parameters
        due_date = _parse_natural_date(due_date_str) if due_date_str else None
        recurrence = _parse_recurrence(recurrence_str) if recurrence_str else None
        priority = _parse_priority(priority_str) if priority_str else "medium"
        tags = _parse_tags(tags_str) if tags_str else None

        # Create task
        task = TaskService.create_task_simple(
            session, user_id, title, description, due_date, recurrence, priority, tags
        )

        response_parts = [f"✅ Created task #{task.id}: '{task.title}'"]
        
        if task.priority != "medium":
            priority_emoji = "🔴" if task.priority == "high" else "🟢"
            response_parts.append(f"{priority_emoji} Priority: {task.priority}")
        
        if task.tags:
            response_parts.append(f"🏷️ Tags: {task.tags}")
        
        if task.due_date:
            response_parts.append(f"📅 Due: {task.due_date.strftime('%Y-%m-%d %H:%M')}")
        
        if task.recurrence_pattern:
            response_parts.append(f"🔄 Repeats: {task.recurrence_pattern}")

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "priority": task.priority,
            "tags": task.tags,
            "message": " | ".join(response_parts)
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def list_tasks(
    user_id: str, 
    status: str = "all",
    priority: str = None,  # NEW
    tags: str = None,  # NEW
    search: str = None,  # NEW
    session: Session = None
) -> Dict[str, Any]:
    """MCP Tool: List tasks with filtering and search."""
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        # Parse tags if provided
        tags_list = json.loads(tags) if tags else None

        # Get filtered tasks
        tasks = TaskService.get_tasks_by_status(
            session, user_id, status, priority, tags_list, search
        )

        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": task.priority,
                "tags": task.tags,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "recurrence_pattern": task.recurrence_pattern
            }
            for task in tasks
        ]

        return {
            "success": True,
            "tasks": task_list,
            "count": len(task_list),
            "status_filter": status,
            "priority_filter": priority,
            "search_query": search
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def complete_task(user_id: str, task_id: int, session: Session = None) -> Dict[str, Any]:
    """MCP Tool: Mark a task as completed."""
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        task = TaskService.complete_task_simple(session, user_id, task_id)

        if not task:
            return {"success": False, "error": f"Task #{task_id} not found"}

        response_parts = [f"✅ Marked task #{task.id} as completed: '{task.title}'"]
        
        if task.recurrence_pattern:
            response_parts.append(f"🔄 Next occurrence created")

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "was_recurring": bool(task.recurrence_pattern),
            "message": " | ".join(response_parts)
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_task(user_id: str, task_id: int, session: Session = None) -> Dict[str, Any]:
    """MCP Tool: Delete a task permanently."""
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        success = TaskService.delete_task_simple(session, user_id, task_id)

        if not success:
            return {"success": False, "error": f"Task #{task_id} not found"}

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
    due_date_str: Optional[str] = None,
    recurrence_str: Optional[str] = None,
    priority_str: Optional[str] = None,  # NEW
    tags_str: Optional[str] = None,  # NEW
    session: Session = None
) -> Dict[str, Any]:
    """MCP Tool: Update task details."""
    try:
        if not user_id:
            return {"success": False, "error": "user_id is required"}

        if not any([title, description, due_date_str, recurrence_str, priority_str, tags_str]):
            return {"success": False, "error": "Please provide at least one field to update"}

        # Parse new values
        due_date = _parse_natural_date(due_date_str) if due_date_str else None
        recurrence = _parse_recurrence(recurrence_str) if recurrence_str else None
        priority = _parse_priority(priority_str) if priority_str else None
        tags = _parse_tags(tags_str) if tags_str else None

        # Update task
        task = TaskService.update_task_simple(
            session, user_id, task_id, title, description, due_date, recurrence, priority, tags
        )

        if not task:
            return {"success": False, "error": f"Task #{task_id} not found"}

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "message": f"✏️ Updated task #{task.id}: '{task.title}'"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# Register all tools
def register_all_tools():
    """Register all MCP tools with the server."""
    tools_config = MCP_SERVER_CONFIG["tools"]

    mcp_server.register_tool("add_task", add_task, tools_config[0]["input_schema"])
    mcp_server.register_tool("list_tasks", list_tasks, tools_config[1]["input_schema"])
    mcp_server.register_tool("complete_task", complete_task, tools_config[2]["input_schema"])
    mcp_server.register_tool("delete_task", delete_task, tools_config[3]["input_schema"])
    mcp_server.register_tool("update_task", update_task, tools_config[4]["input_schema"])


register_all_tools()