"""Task service layer with business logic."""

from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ..models.task import Task, TaskCreate, TaskUpdate


class TaskService:
    """Service class for task-related operations."""

    @staticmethod
    def get_tasks_by_user_id(session: Session, user_id: UUID) -> List[Task]:
        """Get all tasks for a specific user."""
        statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        tasks = session.exec(statement).all()
        return list(tasks)

    @staticmethod
    def get_task_by_id_and_user_id(session: Session, task_id: int, user_id: UUID) -> Optional[Task]:
        """Get a specific task by its ID and user ID."""
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        task = session.exec(statement).first()
        return task

    @staticmethod
    def create_task(session: Session, user_id: UUID, task_create: TaskCreate) -> Task:
        """Create a new task for a user."""
        task = Task(
            user_id=user_id,
            title=task_create.title,
            description=task_create.description,
            completed=False
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def update_task(session: Session, task_id: int, user_id: UUID, task_update: TaskUpdate) -> Optional[Task]:
        """Update a task if it belongs to the specified user."""
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return None

        if task_update.title is not None:
            task.title = task_update.title
        if task_update.description is not None:
            task.description = task_update.description

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def update_task_completion(session: Session, task_id: int, user_id: UUID, completed: bool) -> Optional[Task]:
        """Update the completion status of a task."""
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return None

        task.completed = completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: int, user_id: UUID) -> bool:
        """Delete a task if it belongs to the specified user."""
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return False

        session.delete(task)
        session.commit()

        return True

    @staticmethod
    def count_user_tasks(session: Session, user_id: UUID) -> int:
        """Count the number of tasks for a user."""
        statement = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(statement).all()
        return len(list(tasks))

    @staticmethod
    def get_completed_tasks_for_user(session: Session, user_id: UUID) -> List[Task]:
        """Get all completed tasks for a user."""
        statement = select(Task)\
            .where(Task.user_id == user_id)\
            .where(Task.completed == True)\
            .order_by(Task.updated_at.desc())

        completed_tasks = session.exec(statement).all()
        return list(completed_tasks)

    @staticmethod
    def get_pending_tasks_for_user(session: Session, user_id: UUID) -> List[Task]:
        """Get all pending (not completed) tasks for a user."""
        statement = select(Task)\
            .where(Task.user_id == user_id)\
            .where(Task.completed == False)\
            .order_by(Task.created_at.desc())

        pending_tasks = session.exec(statement).all()
        return list(pending_tasks)

    # ========== MCP-COMPATIBLE METHODS FOR PHASE 3 ==========

    @staticmethod
    def create_task_simple(
        session: Session,
        user_id: str,
        title: str,
        description: str = ""
    ) -> Task:
        """MCP-compatible task creation with simple string parameters."""
        task_create = TaskCreate(title=title, description=description or "")
        return TaskService.create_task(session, UUID(user_id), task_create)

    @staticmethod
    def get_tasks_by_status(
        session: Session,
        user_id: str,
        status: str = "all"
    ) -> List[Task]:
        """Get tasks filtered by status (all/pending/completed)."""
        user_uuid = UUID(user_id)

        if status == "pending":
            return TaskService.get_pending_tasks_for_user(session, user_uuid)
        elif status == "completed":
            return TaskService.get_completed_tasks_for_user(session, user_uuid)
        else:
            return TaskService.get_tasks_by_user_id(session, user_uuid)

    @staticmethod
    def update_task_simple(
        session: Session,
        user_id: str,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[Task]:
        """MCP-compatible task update with simple parameters."""
        task_update = TaskUpdate(title=title, description=description)
        return TaskService.update_task(session, task_id, UUID(user_id), task_update)

    @staticmethod
    def complete_task_simple(
        session: Session,
        user_id: str,
        task_id: int
    ) -> Optional[Task]:
        """MCP-compatible task completion."""
        return TaskService.update_task_completion(session, task_id, UUID(user_id), True)

    @staticmethod
    def delete_task_simple(
        session: Session,
        user_id: str,
        task_id: int
    ) -> bool:
        """MCP-compatible task deletion."""
        return TaskService.delete_task(session, task_id, UUID(user_id))