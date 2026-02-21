from fastapi import APIRouter, HTTPException, status, Depends, Response
from sqlmodel import Session, select
from datetime import timedelta
from typing import Optional
import uuid

from ..database import get_session
from ..models.user import User, UserCreate
from ..schemas.auth import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse
from ..utils.security import hash_password, verify_password, create_access_token
from ..config import settings

router = APIRouter()


@router.post("/auth/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: RegisterRequest, session: Session = Depends(get_session)):
    """
    Register a new user with name, email and password.
    """
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new user with name
    user = User(
        name=user_data.name,  # ✅ ADDED
        email=user_data.email,
        password_hash=hashed_password
    )

    # Add user to database
    session.add(user)
    session.commit()
    session.refresh(user)

    # Prepare response with name
    response = RegisterResponse(
        id=user.id,
        name=user.name,  # ✅ ADDED
        email=user.email,
        message="Account created successfully"
    )

    return response


@router.post("/auth/login", response_model=LoginResponse)
def login(
    user_data: LoginRequest,
    response: Response,
    session: Session = Depends(get_session)
):
    """
    Authenticate user and issue JWT token.
    """
    # Find user by email
    user = session.exec(select(User).where(User.email == user_data.email)).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    # Prepare response with name
    user_info = {
        "id": str(user.id),
        "name": user.name,  # ✅ ADDED
        "email": user.email
    }

    login_response = LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_info
    )

    return login_response