import re
from typing import Optional
from pydantic import EmailStr


def validate_email_format(email: str) -> bool:
    """
    Validate email format using a standard regex pattern.

    Args:
        email: Email address to validate

    Returns:
        True if email format is valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_email_with_pydantic(email: str) -> EmailStr:
    """
    Validate email using Pydantic's EmailStr type.

    Args:
        email: Email address to validate

    Returns:
        EmailStr if valid

    Raises:
        ValueError: If email format is invalid
    """
    # This will raise a ValueError if the email is invalid
    return EmailStr.validate(email)


def validate_password_strength(password: str, min_length: int = 8) -> tuple[bool, Optional[str]]:
    """
    Validate password strength based on common criteria.

    Args:
        password: Password to validate
        min_length: Minimum password length (default: 8)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters long"

    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"

    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"

    return True, None


def validate_username(username: str, min_length: int = 3, max_length: int = 20) -> tuple[bool, Optional[str]]:
    """
    Validate username format and length.

    Args:
        username: Username to validate
        min_length: Minimum username length (default: 3)
        max_length: Maximum username length (default: 20)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(username) < min_length:
        return False, f"Username must be at least {min_length} characters long"

    if len(username) > max_length:
        return False, f"Username must be no more than {max_length} characters long"

    # Check for valid characters (letters, numbers, underscores, hyphens)
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"

    return True, None


def validate_title(title: str, min_length: int = 1, max_length: int = 200) -> tuple[bool, Optional[str]]:
    """
    Validate title length and format.

    Args:
        title: Title to validate
        min_length: Minimum title length (default: 1)
        max_length: Maximum title length (default: 200)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(title) < min_length:
        return False, f"Title must be at least {min_length} character(s) long"

    if len(title) > max_length:
        return False, f"Title must be no more than {max_length} characters long"

    return True, None


def validate_description(description: Optional[str], max_length: int = 1000) -> tuple[bool, Optional[str]]:
    """
    Validate description length if provided.

    Args:
        description: Description to validate (can be None)
        max_length: Maximum description length (default: 1000)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if description is None:
        return True, None

    if len(description) > max_length:
        return False, f"Description must be no more than {max_length} characters long"

    return True, None


def sanitize_input(input_str: str, max_length: int = 1000) -> str:
    """
    Sanitize user input by removing potentially harmful characters.

    Args:
        input_str: Input string to sanitize
        max_length: Maximum allowed length (default: 1000)

    Returns:
        Sanitized string
    """
    # Truncate to max length
    if len(input_str) > max_length:
        input_str = input_str[:max_length]

    # Remove potentially harmful characters (basic sanitization)
    # This is a basic example; for production use, consider using a proper HTML sanitizer
    sanitized = input_str.replace('<script', '&lt;script').replace('javascript:', 'javascript_')

    return sanitized


def validate_user_id(user_id: str) -> tuple[bool, Optional[str]]:
    """
    Validate user ID format (UUID).

    Args:
        user_id: User ID to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    import uuid
    try:
        uuid.UUID(user_id)
        return True, None
    except ValueError:
        return False, "Invalid user ID format. Must be a valid UUID."


def validate_task_id(task_id: int) -> tuple[bool, Optional[str]]:
    """
    Validate task ID format.

    Args:
        task_id: Task ID to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(task_id, int) or task_id <= 0:
        return False, "Task ID must be a positive integer"

    return True, None