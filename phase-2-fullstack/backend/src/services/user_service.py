from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
import uuid

from ..models.user import User, UserCreate, UserRead, UserUpdate, UserLogin
from ..utils.security import hash_password, verify_password


class UserService:
    """
    Service class for user-related operations.
    Contains business logic for user management.
    """

    @staticmethod
    def create_user(session: Session, user_create: UserCreate) -> UserRead:
        """
        Create a new user in the database.

        Args:
            session: Database session
            user_create: User creation data

        Returns:
            Created user data
        """
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == user_create.email)).first()
        if existing_user:
            raise ValueError("A user with this email already exists")

        # Hash the password
        hashed_password = hash_password(user_create.password)

        # Create new user
        user = User(
            email=user_create.email,
            password_hash=hashed_password
        )

        # Add user to database
        session.add(user)
        session.commit()
        session.refresh(user)

        # Return user data
        return UserRead(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    @staticmethod
    def get_user_by_id(session: Session, user_id: UUID) -> Optional[UserRead]:
        """
        Get a user by their ID.

        Args:
            session: Database session
            user_id: User ID to search for

        Returns:
            User data if found, None otherwise
        """
        user = session.get(User, user_id)
        if user:
            return UserRead(
                id=user.id,
                email=user.email,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
        return None

    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """
        Get a user by their email.

        Args:
            session: Database session
            email: Email to search for

        Returns:
            User object if found, None otherwise
        """
        user = session.exec(select(User).where(User.email == email)).first()
        return user

    @staticmethod
    def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password.

        Args:
            session: Database session
            email: User's email
            password: User's password

        Returns:
            User object if authentication successful, None otherwise
        """
        user = UserService.get_user_by_email(session, email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def update_user(session: Session, user_id: UUID, user_update: UserUpdate) -> Optional[UserRead]:
        """
        Update user information.

        Args:
            session: Database session
            user_id: ID of the user to update
            user_update: Updated user data

        Returns:
            Updated user data if successful, None otherwise
        """
        user = session.get(User, user_id)
        if not user:
            return None

        # Update email if provided
        if user_update.email is not None:
            # Check if new email is already taken
            existing_user = session.exec(
                select(User).where(User.email == user_update.email)
            ).first()

            if existing_user and existing_user.id != user_id:
                raise ValueError("A user with this email already exists")

            user.email = user_update.email

        # Update password if provided
        if user_update.password is not None:
            user.password_hash = hash_password(user_update.password)

        session.add(user)
        session.commit()
        session.refresh(user)

        return UserRead(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    @staticmethod
    def delete_user(session: Session, user_id: UUID) -> bool:
        """
        Delete a user by their ID.

        Args:
            session: Database session
            user_id: ID of the user to delete

        Returns:
            True if deletion successful, False otherwise
        """
        user = session.get(User, user_id)
        if not user:
            return False

        session.delete(user)
        session.commit()
        return True

    @staticmethod
    def validate_email_format(email: str) -> bool:
        """
        Validate email format using a basic regex.

        Args:
            email: Email to validate

        Returns:
            True if email format is valid, False otherwise
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Validate password strength.

        Args:
            password: Password to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        return True, ""