"""Conversation service for managing chat history."""

from sqlmodel import Session, select
from typing import List, Dict, Optional
from datetime import datetime


class ConversationService:
    """Service for managing conversation metadata and history."""

    # In-memory storage for lightweight conversation tracking
    _conversations: Dict[str, List[Dict[str, str]]] = {}

    @staticmethod
    def save_message(
        session: Session,
        user_id: str,
        role: str,
        content: str
    ) -> None:
        """
        Save a message to conversation history.

        Args:
            session: Database session (for future persistence)
            user_id: User ID
            role: Message role ("user" or "assistant")
            content: Message content
        """
        conversation_id = f"user_{user_id}"

        if conversation_id not in ConversationService._conversations:
            ConversationService._conversations[conversation_id] = []

        ConversationService._conversations[conversation_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Keep only last 50 messages to prevent memory bloat
        if len(ConversationService._conversations[conversation_id]) > 50:
            ConversationService._conversations[conversation_id] = \
                ConversationService._conversations[conversation_id][-50:]

    @staticmethod
    def get_conversation_history(
        session: Session,
        user_id: str,
        limit: int = 20
    ) -> List[Dict[str, str]]:
        """
        Get conversation history for a user.

        Args:
            session: Database session
            user_id: User ID
            limit: Maximum number of messages to return

        Returns:
            List of messages with role and content
        """
        conversation_id = f"user_{user_id}"

        if conversation_id not in ConversationService._conversations:
            return []

        messages = ConversationService._conversations[conversation_id][-limit:]

        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in messages
        ]

    @staticmethod
    def clear_conversation(
        session: Session,
        user_id: str
    ) -> None:
        """
        Clear conversation history for a user.

        Args:
            session: Database session
            user_id: User ID
        """
        conversation_id = f"user_{user_id}"

        if conversation_id in ConversationService._conversations:
            del ConversationService._conversations[conversation_id]