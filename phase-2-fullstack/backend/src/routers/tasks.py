from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from ..database import get_session
from ..models.task import Task
from ..models.user import User
from ..schemas.task import TaskResponse, TaskCreate, TaskUpdate, TaskUpdateStatus, TaskListResponse
from ..middleware.auth import get_current_user, verify_user_id_in_url_matches_authenticated_user
from ..services.task_service import TaskService

router = APIRouter()


@router.get("/{user_id}/tasks", response_model=TaskListResponse)
def list_tasks(
    user_id: UUID,
    current_user: User = Depends(verify_user_id_in_url_matches_authenticated_user),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the authenticated user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Get tasks for the authenticated user
    tasks = TaskService.get_tasks_by_user_id(session, current_user.id)

    # Convert Task models to TaskResponse models
    task_responses = [TaskResponse.model_validate(task) for task in tasks]
    
    return TaskListResponse(tasks=task_responses)


@router.post("/{user_id}/tasks", response_model=TaskResponse)
def create_task(
    user_id: UUID,
    task_create: TaskCreate,
    current_user: User = Depends(verify_user_id_in_url_matches_authenticated_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Create task associated with the authenticated user
    task = TaskService.create_task(session, current_user.id, task_create)

    return task


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: UUID,
    task_id: int,
    current_user: User = Depends(verify_user_id_in_url_matches_authenticated_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Get the task and verify it belongs to the authenticated user
    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: UUID,
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(verify_user_id_in_url_matches_authenticated_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific task by ID.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Get the task and verify it belongs to the authenticated user
    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update the task
    updated_task = TaskService.update_task(session, task_id, current_user.id, task_update)

    return updated_task


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
def update_task_completion(
    user_id: UUID,
    task_id: int,
    task_update: TaskUpdateStatus,
    current_user: User = Depends(verify_user_id_in_url_matches_authenticated_user),
    session: Session = Depends(get_session)
):
    """
    Update task completion status.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Get the task and verify it belongs to the authenticated user
    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update the task completion status
    task.completed = task_update.completed
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: UUID,
    task_id: int,
    current_user: User = Depends(verify_user_id_in_url_matches_authenticated_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task by ID.
    """
    # Verify that the user_id in the URL matches the authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    # Get the task and verify it belongs to the authenticated user
    task = TaskService.get_task_by_id_and_user_id(session, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Delete the task
    TaskService.delete_task(session, task_id, current_user.id)

    return None  # 204 No Content