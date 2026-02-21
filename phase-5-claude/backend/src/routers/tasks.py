from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from uuid import UUID

from ..database import get_session
from ..models.task import Task
from ..models.user import User
from ..schemas.task import TaskResponse, TaskCreate, TaskUpdate, TaskUpdateStatus, TaskListResponse
from ..middleware.auth import get_current_user
from ..services.task_service import TaskService

router = APIRouter()


@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: UUID,
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
    search: Optional[str] = None,  # 🆕 Added search
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all tasks for the authenticated user with filtering and sorting."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Handle status filtering
    if status_filter == "pending":
        tasks = TaskService.get_pending_tasks_for_user(session, current_user.id)
    elif status_filter == "completed":
        tasks = TaskService.get_completed_tasks_for_user(session, current_user.id)
    else:
        tasks = TaskService.get_tasks_by_user_id(
            session, 
            current_user.id,
            priority=priority,
            sort_by=sort_by or "created_at",
            sort_order=sort_order or "desc",
            search=search  # 🆕 Pass search to service
        )

    task_responses = [TaskResponse.model_validate(task) for task in tasks]
    return TaskListResponse(tasks=task_responses)

@router.post("/{user_id}/tasks", response_model=TaskResponse)
async def create_task(
    user_id: UUID,
    task_create: TaskCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task for the authenticated user."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Create task
    task = TaskService.create_task(session, current_user.id, task_create)
    
    # Publish Kafka event in background
    background_tasks.add_task(TaskService.publish_task_event, task, "created")

    return task


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: UUID,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific task by ID."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: UUID,
    task_id: int,
    task_update: TaskUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a specific task by ID."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update task
    updated_task = TaskService.update_task(session, task_id, current_user.id, task_update)
    
    # Publish Kafka event in background
    background_tasks.add_task(TaskService.publish_task_event, updated_task, "updated")

    return updated_task


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def update_task_completion(
    user_id: UUID,
    task_id: int,
    task_update: TaskUpdateStatus,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update task completion status. Auto-creates next occurrence for recurring tasks."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Check if task is recurring BEFORE completion
    old_task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)
    is_recurring = old_task and old_task.recurrence_pattern and old_task.due_date and task_update.completed
    
    # Complete the task
    task = TaskService.update_task_completion(session, task_id, current_user.id, task_update.completed)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Publish completed event
    background_tasks.add_task(TaskService.publish_task_event, task, "completed")
    
    # If recurring, find and publish event for newly created task
    if is_recurring:
        # Get the newly created task (latest task with same title and user_id)
        new_task = session.exec(
            select(Task)
            .where(Task.user_id == current_user.id)
            .where(Task.title == task.title)
            .where(Task.completed == False)
            .where(Task.id != task_id)
            .order_by(Task.created_at.desc())
        ).first()
        
        if new_task:
            background_tasks.add_task(TaskService.publish_task_event, new_task, "created")

    return task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: UUID,
    task_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a specific task by ID."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish Kafka event BEFORE deletion
    background_tasks.add_task(TaskService.publish_task_event, task, "deleted")
    
    # Delete task
    TaskService.delete_task(session, task_id, current_user.id)

    return None

    