from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ..models.task import Task, TaskCreate, TaskUpdate
from ..models.user import User


class TaskService:
    """
    Service class for task-related operations.
    Contains business logic for task management with proper user isolation.
    """

    @staticmethod
    def get_tasks_by_user_id(session: Session, user_id: UUID) -> List[Task]:
        """
        Get all tasks for a specific user.

        Args:
            session: Database session
            user_id: ID of the user whose tasks to retrieve

        Returns:
            List of tasks belonging to the user
        """
        # Query tasks filtered by user_id for data isolation
        statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        tasks = session.exec(statement).all()
        return tasks

    @staticmethod
    def get_task_by_id_and_user_id(session: Session, task_id: int, user_id: UUID) -> Optional[Task]:
        """
        Get a specific task by its ID and user ID.

        Args:
            session: Database session
            task_id: ID of the task to retrieve
            user_id: ID of the user who owns the task

        Returns:
            Task if found and belongs to user, None otherwise
        """
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        task = session.exec(statement).first()
        return task

    @staticmethod
    def create_task(session: Session, user_id: UUID, task_create: TaskCreate) -> Task:
        """
        Create a new task for a user.

        Args:
            session: Database session
            user_id: ID of the user creating the task
            task_create: Task creation data

        Returns:
            Created task object
        """
        task = Task(
            user_id=user_id,
            title=task_create.title,
            description=task_create.description,
            completed=False  # New tasks are not completed by default
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def update_task(session: Session, task_id: int, user_id: UUID, task_update: TaskUpdate) -> Optional[Task]:
        """
        Update a task if it belongs to the specified user.

        Args:
            session: Database session
            task_id: ID of the task to update
            user_id: ID of the user who owns the task
            task_update: Task update data

        Returns:
            Updated task if successful, None if task not found or doesn't belong to user
        """
        # Get the task and verify it belongs to the user
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return None

        # Update only the fields that are provided in task_update
        # TaskUpdate schema only has title and description, not completed
        if task_update.title is not None:
            task.title = task_update.title
        if task_update.description is not None:
            task.description = task_update.description

        # Update the timestamp
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def update_task_completion(session: Session, task_id: int, user_id: UUID, completed: bool) -> Optional[Task]:
        """
        Update the completion status of a task.

        Args:
            session: Database session
            task_id: ID of the task to update
            user_id: ID of the user who owns the task
            completed: New completion status

        Returns:
            Updated task if successful, None if task not found or doesn't belong to user
        """
        # Get the task and verify it belongs to the user
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return None

        # Update completion status
        task.completed = completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: int, user_id: UUID) -> bool:
        """
        Delete a task if it belongs to the specified user.

        Args:
            session: Database session
            task_id: ID of the task to delete
            user_id: ID of the user who owns the task

        Returns:
            True if task was deleted, False if task not found or doesn't belong to user
        """
        # Get the task and verify it belongs to the user
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
        """
        Count the number of tasks for a user.

        Args:
            session: Database session
            user_id: ID of the user

        Returns:
            Number of tasks belonging to the user
        """
        statement = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(statement).all()
        return len(tasks)

    @staticmethod
    def get_completed_tasks_for_user(session: Session, user_id: UUID) -> List[Task]:
        """
        Get all completed tasks for a user.

        Args:
            session: Database session
            user_id: ID of the user

        Returns:
            List of completed tasks belonging to the user
        """
        statement = select(Task)\
            .where(Task.user_id == user_id)\
            .where(Task.completed == True)\
            .order_by(Task.updated_at.desc())

        completed_tasks = session.exec(statement).all()
        return completed_tasks

    @staticmethod
    def get_pending_tasks_for_user(session: Session, user_id: UUID) -> List[Task]:
        """
        Get all pending (not completed) tasks for a user.

        Args:
            session: Database session
            user_id: ID of the user

        Returns:
            List of pending tasks belonging to the user
        """
        statement = select(Task)\
            .where(Task.user_id == user_id)\
            .where(Task.completed == False)\
            .order_by(Task.created_at.desc())

        pending_tasks = session.exec(statement).all()
        return pending_tasks