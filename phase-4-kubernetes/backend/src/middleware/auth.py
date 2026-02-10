from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
import jwt
from ..database import get_session
from ..models.user import User
from ..config import settings
from ..utils.security import verify_access_token


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Get the current authenticated user from the JWT token in the Authorization header.

    Args:
        credentials: HTTP authorization credentials from the Authorization header
        session: Database session

    Returns:
        The authenticated User object

    Raises:
        HTTPException: If the token is invalid, expired, or the user doesn't exist
    """
    token = credentials.credentials

    # Verify the JWT token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID from the token payload
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = session.get(User, UUID(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def verify_user_id_in_url_matches_authenticated_user(
    url_user_id: str,
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verify that the user_id in the URL matches the authenticated user's ID.
    This is crucial for user data isolation.

    Args:
        url_user_id: The user ID from the URL path parameter
        current_user: The currently authenticated user

    Returns:
        The authenticated User object if IDs match

    Raises:
        HTTPException: If the user_id in the URL doesn't match the authenticated user's ID
    """
    if str(current_user.id) != url_user_id:
        # According to the spec, return 404 instead of 403 for unauthorized access
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    return current_user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get the current active user, ensuring they are active.
    This can be extended to check for user status (e.g., banned, deactivated).

    Args:
        current_user: The currently authenticated user

    Returns:
        The authenticated User object if active
    """
    # Additional checks can be added here, such as:
    # - Check if user account is activated
    # - Check if user is banned
    # - Check if user has required permissions

    # For now, just return the current user
    return current_user