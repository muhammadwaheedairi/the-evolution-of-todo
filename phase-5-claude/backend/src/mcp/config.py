"""MCP server configuration."""

from typing import Dict, Any

MCP_SERVER_CONFIG: Dict[str, Any] = {
    "name": "todo-mcp-server",
    "version": "1.0.0",
    "description": "MCP server for task management operations",
    "tools": [
        {
            "name": "add_task",
            "description": "Create a new task with optional due date and recurrence",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID (UUID)"},
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description (optional)"},
                    "due_date_str": {"type": "string", "description": "Due date (e.g., 'tomorrow', '2026-02-20', 'next week')"},
                    "recurrence_str": {"type": "string", "description": "Recurrence pattern: 'daily', 'weekly', 'monthly'"}
                },
                "required": ["user_id", "title"]
            }
        },
        {
            "name": "list_tasks",
            "description": "List tasks filtered by status",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID (UUID)"},
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by status"
                    }
                },
                "required": ["user_id"]
            }
        },
        {
            "name": "complete_task",
            "description": "Mark a task as completed. Auto-creates next occurrence for recurring tasks.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID (UUID)"},
                    "task_id": {"type": "integer", "description": "Task ID to complete"}
                },
                "required": ["user_id", "task_id"]
            }
        },
        {
            "name": "delete_task",
            "description": "Delete a task permanently",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID (UUID)"},
                    "task_id": {"type": "integer", "description": "Task ID to delete"}
                },
                "required": ["user_id", "task_id"]
            }
        },
        {
            "name": "update_task",
            "description": "Update task details including due date and recurrence",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID (UUID)"},
                    "task_id": {"type": "integer", "description": "Task ID to update"},
                    "title": {"type": "string", "description": "New title (optional)"},
                    "description": {"type": "string", "description": "New description (optional)"},
                    "due_date_str": {"type": "string", "description": "New due date (optional)"},
                    "recurrence_str": {"type": "string", "description": "New recurrence pattern (optional)"}
                },
                "required": ["user_id", "task_id"]
            }
        }
    ]
}