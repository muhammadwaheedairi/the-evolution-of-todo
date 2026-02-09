"""Chat endpoint for AI-powered task management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from ..database import get_session
from ..models.user import User
from ..middleware.auth import get_current_user
from ..schemas.chat import ChatRequest, ChatResponse
from ..utils.agent import run_agent_with_mcp_tools
from ..services.conversation_service import ConversationService


router = APIRouter()


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: UUID,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),  # ✅ Fixed
    session: Session = Depends(get_session)
):
    """Send a message to the AI assistant for task management."""
    
    # Verify user_id matches authenticated user
    if str(current_user.id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )

    try:
        conversation_id = f"user_{str(user_id)}"
        history = ConversationService.get_conversation_history(session, str(user_id))

        # Run agent
        result = await run_agent_with_mcp_tools(
            session=session,
            user_id=str(user_id),
            message=request.message,
            conversation_history=history
        )

        # Save messages
        ConversationService.save_message(session, str(user_id), "user", request.message)
        ConversationService.save_message(session, str(user_id), "assistant", result["response"])

        return ChatResponse(
            conversation_id=conversation_id,
            response=result["response"],
            tool_calls=result.get("tool_calls", [])
        )

    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="I encountered an error processing your request. Please try again."
        )


@router.get("/{user_id}/conversations/history")
async def get_conversation_history(
    user_id: UUID,
    current_user: User = Depends(get_current_user),  # ✅ Fixed
    session: Session = Depends(get_session)
):
    """Get conversation history."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    history = ConversationService.get_conversation_history(session, str(user_id))
    return {"conversation_id": f"user_{str(user_id)}", "messages": history}


@router.delete("/{user_id}/conversations/clear")
async def clear_conversation_history(
    user_id: UUID,
    current_user: User = Depends(get_current_user),  # ✅ Fixed
    session: Session = Depends(get_session)
):
    """Clear conversation history."""
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    ConversationService.clear_conversation(session, str(user_id))
    return {"message": "Conversation history cleared successfully"}