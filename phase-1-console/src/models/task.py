from datetime import datetime
from typing import Optional


class Task:
    """
    Represents a task in the todo application.

    [Task]: T-001
    [From]: specs/todo-app/spec.md §Task Data Model, specs/todo-app/plan.md §Task Model
    """

    def __init__(self, task_id: int, title: str, description: str = "", completed: bool = False):
        """
        Initialize a new Task instance.

        Args:
            task_id (int): Unique identifier for the task
            title (str): Title of the task (required)
            description (str): Description of the task (optional)
            completed (bool): Completion status of the task (default: False)
        """
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")

        self.id = task_id
        self.title = title.strip()
        self.description = description.strip() if description else ""
        self.completed = completed
        self.created = datetime.now()

    def __str__(self) -> str:
        """
        Return a string representation of the task for display purposes.

        Returns:
            str: Formatted string representation of the task
        """
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.id}. {self.title}"

    def __repr__(self) -> str:
        """
        Return a detailed string representation of the task.

        Returns:
            str: Detailed string representation of the task
        """
        return (f"Task(id={self.id}, title='{self.title}', description='{self.description}', "
                f"completed={self.completed}, created={self.created})")

    def to_dict(self) -> dict:
        """
        Convert the task to a dictionary representation.

        Returns:
            dict: Dictionary representation of the task
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created": self.created.isoformat()
        }

    def get_status_indicator(self) -> str:
        """
        Get a status indicator for the task.

        Returns:
            str: Status indicator ('✓' for completed, '○' for incomplete)
        """
        return "✓" if self.completed else "○"

    def get_status_text(self) -> str:
        """
        Get a text representation of the task status.

        Returns:
            str: Status text ('Complete' or 'Incomplete')
        """
        return "Complete" if self.completed else "Incomplete"