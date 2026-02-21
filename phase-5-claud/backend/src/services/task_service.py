"""Task service layer with business logic including search, filter, and sort."""

from sqlmodel import Session, select, or_, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import json

from ..models.task import Task, TaskCreate, TaskUpdate
from ..events.publisher import kafka_publisher
from ..events.schemas import TaskEvent, TaskEventData


class TaskService:
    """Service class for task-related operations."""

    @staticmethod
    def get_tasks_by_user_id(
        session: Session, 
        user_id: UUID,
        priority: Optional[str] = None,
        tags: Optional[List[str]] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[Task]:
        """Get all tasks for a user with filtering, search, and sorting."""
        statement = select(Task).where(Task.user_id == user_id)
        
        # Filter by priority
        if priority and priority != "all":
            statement = statement.where(Task.priority == priority)
        
        # Filter by tags
        if tags:
            for tag in tags:
                statement = statement.where(Task.tags.like(f'%"{tag}"%'))
        
        # Search in title and description
        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern)
                )
            )
        
        # Sort - Handle NULL values in due_date
        sort_column = getattr(Task, sort_by, Task.created_at)
        
        if sort_by == "due_date":
            # Put tasks without due dates at the end
            if sort_order == "asc":
                statement = statement.order_by(sort_column.asc().nullslast())
            else:
                statement = statement.order_by(sort_column.desc().nullslast())
        else:
            # Normal sorting for other columns
            if sort_order == "asc":
                statement = statement.order_by(sort_column.asc())
            else:
                statement = statement.order_by(sort_column.desc())
        
        tasks = session.exec(statement).all()
        return list(tasks)

    @staticmethod
    def get_task_by_id_and_user_id(session: Session, task_id: int, user_id: UUID) -> Optional[Task]:
        """Get a specific task by its ID and user ID."""
        statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        task = session.exec(statement).first()
        return task

    @staticmethod
    def _calculate_next_occurrence(due_date: datetime, recurrence_pattern: str) -> datetime:
        """Calculate next occurrence based on recurrence pattern."""
        if recurrence_pattern == "daily":
            return due_date + timedelta(days=1)
        elif recurrence_pattern == "weekly":
            return due_date + timedelta(weeks=1)
        elif recurrence_pattern == "monthly":
            return due_date + timedelta(days=30)
        return due_date

    @staticmethod
    def create_task(session: Session, user_id: UUID, task_create: TaskCreate) -> Task:
        """Create a new task for a user."""
        # Calculate next occurrence if recurring
        next_occurrence = None
        if task_create.recurrence_pattern and task_create.due_date:
            next_occurrence = TaskService._calculate_next_occurrence(
                task_create.due_date, 
                task_create.recurrence_pattern
            )

        task = Task(
            user_id=user_id,
            title=task_create.title,
            description=task_create.description,
            completed=False,
            due_date=task_create.due_date,
            recurrence_pattern=task_create.recurrence_pattern,
            next_occurrence_date=next_occurrence,
            priority=task_create.priority,
            tags=task_create.tags
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
        if task_update.due_date is not None:
            task.due_date = task_update.due_date
        if task_update.recurrence_pattern is not None:
            task.recurrence_pattern = task_update.recurrence_pattern
            if task.due_date and task_update.recurrence_pattern:
                task.next_occurrence_date = TaskService._calculate_next_occurrence(
                    task.due_date, 
                    task_update.recurrence_pattern
                )
        if task_update.priority is not None:
            task.priority = task_update.priority
        if task_update.tags is not None:
            task.tags = task_update.tags

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def update_task_completion(session: Session, task_id: int, user_id: UUID, completed: bool) -> Optional[Task]:
        """Update the completion status of a task. Create next occurrence for recurring tasks."""
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return None

        task.completed = completed
        task.updated_at = datetime.utcnow()

        # If completing a recurring task, create next occurrence
        if completed and task.recurrence_pattern and task.due_date:
            next_due = TaskService._calculate_next_occurrence(task.due_date, task.recurrence_pattern)
            
            # Create new task for next occurrence
            new_task = Task(
                user_id=task.user_id,
                title=task.title,
                description=task.description,
                completed=False,
                due_date=next_due,
                recurrence_pattern=task.recurrence_pattern,
                next_occurrence_date=TaskService._calculate_next_occurrence(next_due, task.recurrence_pattern),
                priority=task.priority,
                tags=task.tags
            )
            session.add(new_task)

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
    async def publish_task_event(task: Task, event_type: str):
        """Publish task event to Kafka."""
        try:
            event = TaskEvent(
                event_type=event_type,
                task_id=task.id,
                user_id=str(task.user_id),
                task_data=TaskEventData(
                    title=task.title,
                    description=task.description,
                    priority=task.priority,
                    tags=task.tags,
                    due_date=task.due_date.isoformat() if task.due_date else None,
                    recurrence_pattern=task.recurrence_pattern,
                    completed=task.completed
                ),
                timestamp=datetime.utcnow().isoformat()
            )
            await kafka_publisher.publish_task_event(event)
        except Exception as e:
            print(f"⚠️ Failed to publish Kafka event: {e}")

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
    
    @staticmethod
    def get_tasks_with_due_dates(session: Session, user_id: UUID) -> List[Task]:
        """Get all tasks with due dates for a user (for reminders)."""
        statement = select(Task)\
            .where(Task.user_id == user_id)\
            .where(Task.due_date.isnot(None))\
            .where(Task.completed == False)\
            .order_by(Task.due_date.asc())
        
        tasks = session.exec(statement).all()
        return list(tasks)

    # ========== MCP-COMPATIBLE METHODS ==========

    @staticmethod
    def create_task_simple(
        session: Session,
        user_id: str,
        title: str,
        description: str = "",
        due_date: Optional[datetime] = None,
        recurrence: Optional[str] = None,
        priority: str = "medium",
        tags: Optional[str] = None
    ) -> Task:
        """MCP-compatible task creation with simple string parameters."""
        task_create = TaskCreate(
            title=title, 
            description=description or "",
            due_date=due_date,
            recurrence_pattern=recurrence,
            priority=priority,
            tags=tags
        )
        return TaskService.create_task(session, UUID(user_id), task_create)

    @staticmethod
    def get_tasks_by_status(
        session: Session,
        user_id: str,
        status: str = "all",
        priority: Optional[str] = None,
        tags: Optional[List[str]] = None,
        search: Optional[str] = None
    ) -> List[Task]:
        """Get tasks filtered by status, priority, tags, with search."""
        user_uuid = UUID(user_id)

        if status == "pending":
            tasks = TaskService.get_pending_tasks_for_user(session, user_uuid)
        elif status == "completed":
            tasks = TaskService.get_completed_tasks_for_user(session, user_uuid)
        else:
            tasks = TaskService.get_tasks_by_user_id(session, user_uuid)
        
        # Apply additional filters
        if priority and priority != "all":
            tasks = [t for t in tasks if t.priority == priority]
        
        if tags:
            tasks = [t for t in tasks if t.tags and any(tag in t.tags for tag in tags)]
        
        if search:
            search_lower = search.lower()
            tasks = [t for t in tasks if 
                    (search_lower in t.title.lower()) or 
                    (t.description and search_lower in t.description.lower())]
        
        return tasks

    @staticmethod
    def update_task_simple(
        session: Session,
        user_id: str,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        due_date: Optional[datetime] = None,
        recurrence: Optional[str] = None,
        priority: Optional[str] = None,
        tags: Optional[str] = None
    ) -> Optional[Task]:
        """MCP-compatible task update with simple parameters."""
        task_update = TaskUpdate(
            title=title, 
            description=description,
            due_date=due_date,
            recurrence_pattern=recurrence,
            priority=priority,
            tags=tags
        )
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