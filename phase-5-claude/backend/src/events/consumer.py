"""Kafka consumer - notification service logic merged into backend."""

import asyncio
import json
import logging
import httpx
from email.message import EmailMessage
import aiosmtplib
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError
from datetime import datetime

from ..config import settings
from .websocket import send_notification_to_user

logger = logging.getLogger(__name__)

consumer = None
consumer_task = None


async def fetch_user_email(user_id: str) -> dict:
    """Fetch user email from backend internal API."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://localhost:8000/api/internal/users/{user_id}/email",
                headers={"x-internal-secret": settings.INTERNAL_SECRET},
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch user email: {e}")
    return None


async def send_email_reminder(user_email: str, user_name: str, task_title: str, due_at: str):
    """Send email reminder via Gmail SMTP."""
    try:
        message = EmailMessage()
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = user_email
        message["Subject"] = f"⏰ Reminder: {task_title}"

        body = f"""
Hi {user_name},

This is a friendly reminder about your upcoming task:

📋 Task: {task_title}
⏰ Due: {due_at}

Don't forget to complete it on time!

Best regards,
TaskFlow Team
        """
        message.set_content(body)

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=False,
            start_tls=True
        )
        logger.info(f"📧 Email reminder sent to {user_email} for task '{task_title}'")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to send email: {e}")
        return False


async def process_task_event(event: dict):
    """Process task events - send browser notifications only."""
    event_type = event.get("event_type")
    task_data = event.get("task_data", {})
    task_id = event.get("task_id")
    user_id = event.get("user_id")

    logger.info(f"📬 Received {event_type} event for task #{task_id}: {task_data.get('title')}")

    # Send WebSocket notification to user (browser)
    await send_notification_to_user(user_id, {
        "type": "task_update",
        "event": event_type,
        "task_id": task_id,
        "title": task_data.get("title"),
        "message": f"Task {event_type}: {task_data.get('title')}"
    })

    if event_type == "created" and task_data.get("due_date"):
        logger.info(f"📅 Task has due date: {task_data['due_date']} - Scheduling reminder")

    if event_type == "completed":
        logger.info(f"✅ Task completed - Canceling any pending reminders")


async def process_reminder_event(event: dict):
    """Process reminder events - send EMAIL only (not browser notification)."""
    task_id = event.get("task_id")
    title = event.get("title")
    due_at = event.get("due_at")
    user_id = event.get("user_id")

    logger.info(f"⏰ REMINDER: Task #{task_id} '{title}' is due at {due_at}")

    # Fetch user email from backend
    user_data = await fetch_user_email(user_id)

    if not user_data:
        logger.error(f"❌ Could not fetch email for user {user_id}")
        return

    user_email = user_data.get("email")
    user_name = user_data.get("name", "User")

    # Send email reminder
    success = await send_email_reminder(user_email, user_name, title, due_at)

    if success:
        logger.info(f"✅ Reminder email sent to {user_email} for task #{task_id}")
    else:
        logger.error(f"❌ Failed to send reminder email for task #{task_id}")


async def consume_kafka():
    """Kafka consumer loop."""
    global consumer
    topics = ["task-events", "reminders"]

    try:
        consumer = AIOKafkaConsumer(
            *topics,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id="backend-notification-consumer",
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )

        await consumer.start()
        logger.info(f"✅ Kafka consumer started: {settings.KAFKA_BOOTSTRAP_SERVERS}")
        logger.info(f"📡 Listening to topics: {topics}")

        async for message in consumer:
            try:
                topic = message.topic
                event = message.value

                if topic == "task-events":
                    await process_task_event(event)
                elif topic == "reminders":
                    await process_reminder_event(event)

            except Exception as e:
                logger.error(f"❌ Error processing message: {e}")

    except KafkaError as e:
        logger.error(f"❌ Kafka error: {e}")
    finally:
        if consumer:
            await consumer.stop()
            logger.info("Kafka consumer stopped")


async def start_kafka_consumer():
    """Start consumer as background task."""
    global consumer_task
    consumer_task = asyncio.create_task(consume_kafka())
    logger.info("✅ Kafka consumer background task created")


async def stop_kafka_consumer():
    """Stop consumer gracefully."""
    global consumer_task
    if consumer_task:
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            pass
    logger.info("Kafka consumer stopped")