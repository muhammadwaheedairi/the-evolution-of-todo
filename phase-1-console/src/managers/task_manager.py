from typing import Dict, List, Optional

# Handle imports when running as a script vs as a module
try:
    # When running as part of the package
    from ..models.task import Task
except ImportError:
    # When running as a script
    import sys
    import os
    # Add src directory to path to allow imports
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from models.task import Task


class TaskManager:
    """
    Manages all tasks in the application with in-memory storage.

    [Task]: T-002
    [From]: specs/todo-app/spec.md §Functional Requirements, specs/todo-app/plan.md §Task Manager
    """

    def __init__(self):
        """
        Initialize the TaskManager with empty storage and ID counter.
        """
        self._tasks: Dict[int, Task] = {}
        self._next_id = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Add a new task with the given title and optional description.

        Args:
            title (str): Title of the task (required)
            description (str): Description of the task (optional)

        Returns:
            Task: The newly created task

        Raises:
            ValueError: If the title is empty
        """
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")

        task_id = self._next_id
        self._next_id += 1

        task = Task(task_id, title, description, completed=False)
        self._tasks[task_id] = task

        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Get a specific task by its ID.

        Args:
            task_id (int): ID of the task to retrieve

        Returns:
            Optional[Task]: The task if found, None otherwise
        """
        return self._tasks.get(task_id)

    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks sorted by ID.

        Returns:
            List[Task]: List of all tasks sorted by ID
        """
        return sorted(self._tasks.values(), key=lambda x: x.id)

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Optional[Task]:
        """
        Update an existing task with new title and/or description.

        Args:
            task_id (int): ID of the task to update
            title (Optional[str]): New title for the task (optional)
            description (Optional[str]): New description for the task (optional)

        Returns:
            Optional[Task]: The updated task if found, None otherwise

        Raises:
            ValueError: If the title is empty when provided
        """
        task = self.get_task(task_id)
        if task is None:
            return None

        # If a new title is provided, validate it
        if title is not None:
            if not title or not title.strip():
                raise ValueError("Title cannot be empty")
            task.title = title.strip()

        # If a new description is provided, update it
        if description is not None:
            task.description = description.strip() if description else ""

        return task

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by its ID.

        Args:
            task_id (int): ID of the task to delete

        Returns:
            bool: True if the task was deleted, False if it didn't exist
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def mark_task_complete(self, task_id: int) -> Optional[Task]:
        """
        Mark a task as complete.

        Args:
            task_id (int): ID of the task to mark as complete

        Returns:
            Optional[Task]: The updated task if found, None otherwise
        """
        task = self.get_task(task_id)
        if task is not None:
            task.completed = True
        return task

    def mark_task_incomplete(self, task_id: int) -> Optional[Task]:
        """
        Mark a task as incomplete.

        Args:
            task_id (int): ID of the task to mark as incomplete

        Returns:
            Optional[Task]: The updated task if found, None otherwise
        """
        task = self.get_task(task_id)
        if task is not None:
            task.completed = False
        return task

    def get_next_id(self) -> int:
        """
        Get the next available ID for a new task.

        Returns:
            int: The next available ID
        """
        return self._next_id