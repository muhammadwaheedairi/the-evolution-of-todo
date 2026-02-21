"""
Message Service for Todo AI Chatbot
Manages message storage and retrieval with proper user isolation.
"""

from sqlmodel import Session, select
from datetime import datetime
from uuid import UUID
from typing import List

from ..models.conversation import Message, MessageRole


class MessageService:
    """
    Service class for message-related operations.
    Contains business logic for message management with proper user isolation.
    """

    @staticmethod
    def save_message(
        session: Session,
        conversation_id: int,
        role: MessageRole,
        content: str,
        user_id: UUID
    ) -> Message:
        """
        Save a new message to the database.

        Args:
            session: Database session
            conversation_id: ID of the conversation to save message to
            role: Role of the message sender ("user" or "assistant")
            content: Content of the message
            user_id: ID of the user associated with the message

        Returns:
            Created message object
        """
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=role,
            content=content
        )

        session.add(message)
        session.commit()
        session.refresh(message)

        return message

    @staticmethod
    def get_conversation_history(
        session: Session,
        conversation_id: int
    ) -> List[Message]:
        """
        Fetch all messages for a conversation, ordered by creation time.

        Args:
            session: Database session
            conversation_id: ID of the conversation to get history for

        Returns:
            List of messages in chronological order
        """
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc())

        messages = session.exec(statement).all()
        return messages

    @staticmethod
    def get_messages_by_user_in_conversation(
        session: Session,
        conversation_id: int,
        user_id: UUID
    ) -> List[Message]:
        """
        Get all messages for a specific conversation that belong to a user.

        Args:
            session: Database session
            conversation_id: ID of the conversation
            user_id: ID of the user

        Returns:
            List of messages belonging to the user in that conversation
        """
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).where(
            Message.user_id == user_id
        ).order_by(Message.created_at.asc())

        messages = session.exec(statement).all()
        return messages

    @staticmethod
    def delete_messages_for_conversation(
        session: Session,
        conversation_id: int
    ) -> bool:
        """
        Delete all messages for a specific conversation.

        Args:
            session: Database session
            conversation_id: ID of the conversation to delete messages for

        Returns:
            True if deletion was successful
        """
        # Get all messages in the conversation
        messages = MessageService.get_conversation_history(session, conversation_id)

        for message in messages:
            session.delete(message)

        session.commit()
        return True