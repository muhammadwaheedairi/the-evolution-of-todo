"""Notification Service - Consumes Kafka events and sends notifications."""

import httpx
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any
from email.message import EmailMessage
import aiosmtplib

from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:19092")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "notification-service")
TOPICS = ["task-events", "reminders"]
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "internal-service-secret-2026")

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "taskflow.reminders@gmail.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "TaskFlow Reminders")

# Global consumer
consumer = None
consumer_task = None


async def fetch_user_email(user_id: str) -> dict:
    """Fetch user email from backend."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/internal/users/{user_id}/email",
                headers={"x-internal-secret": INTERNAL_SECRET},
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
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = user_email
        message["Subject"] = f"⏰ Reminder: {task_title}"
        
        # Email body
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
        
        # Send via Gmail SMTP
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        logger.info(f"📧 Email reminder sent to {user_email} for task '{task_title}'")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send email: {e}")
        return False


async def process_task_event(event: Dict[str, Any]):
    """Process task events - send browser notifications only."""
    event_type = event.get("event_type")
    task_data = event.get("task_data", {})
    task_id = event.get("task_id")
    user_id = event.get("user_id")
    
    logger.info(f"📬 Received {event_type} event for task #{task_id}: {task_data.get('title')}")
    
    # Send WebSocket notification to user (browser)
    await send_websocket_notification(user_id, {
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


async def process_reminder_event(event: Dict[str, Any]):
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


async def send_websocket_notification(user_id: str, notification: dict):
    """Send notification via backend WebSocket (browser notifications only)."""
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{BACKEND_URL}/api/notifications/send",
                json={
                    "user_id": user_id,
                    "notification": notification
                },
                timeout=5.0
            )
    except Exception as e:
        logger.error(f"Failed to send WebSocket notification: {e}")


async def consume_kafka():
    """Kafka consumer loop."""
    global consumer
    
    try:
        consumer = AIOKafkaConsumer(
            *TOPICS,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id=KAFKA_GROUP_ID,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )
        
        await consumer.start()
        logger.info(f"✅ Kafka consumer started: {KAFKA_BOOTSTRAP_SERVERS}")
        logger.info(f"📡 Listening to topics: {TOPICS}")
        
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan."""
    global consumer_task
    
    # Startup
    logger.info("🚀 Starting Notification Service...")
    logger.info(f"📧 Email sender: {SMTP_FROM_EMAIL}")
    
    # Start Kafka consumer in background
    consumer_task = asyncio.create_task(consume_kafka())
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Notification Service...")
    
    # Stop consumer
    if consumer_task:
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            pass


# Create FastAPI app
app = FastAPI(
    title="Notification Service",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
def read_root():
    return {
        "service": "notification-service",
        "status": "running",
        "topics": TOPICS,
        "email_enabled": bool(SMTP_USER and SMTP_PASSWORD)
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "kafka_connected": consumer is not None,
        "smtp_configured": bool(SMTP_USER and SMTP_PASSWORD),
        "timestamp": datetime.utcnow().isoformat()
    }