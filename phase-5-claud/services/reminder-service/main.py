"""
Reminder Service - Monitors due dates and sends reminders via Kafka.
- Polls DB every minute for tasks due soon
- Publishes reminder events to Kafka 'reminders' topic
- Notification service consumes and sends browser notifications
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import List

import httpx
from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Config
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:19092")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "reminder-service")
DATABASE_URL = os.getenv("DATABASE_URL")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8001")
CHECK_INTERVAL_MINUTES = int(os.getenv("CHECK_INTERVAL_MINUTES", "1"))
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "internal-service-secret-2026")

# Globals
producer = None
consumer = None
scheduler = None

# Track already-sent reminders (in-memory, resets on restart)
sent_reminders = set()


async def fetch_due_tasks() -> List[dict]:
    """Fetch tasks due in the next 30 minutes from backend."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/internal/tasks/due-soon",
                headers={"x-internal-secret": INTERNAL_SECRET},  # 🆕 ADD HEADER
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json().get("tasks", [])
            else:
                logger.error(f"❌ Backend returned {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"❌ Failed to fetch due tasks: {e}")
    return []
    
async def publish_reminder(task: dict):
    """Publish reminder event to Kafka."""
    global producer

    reminder_key = f"{task['id']}-{task.get('due_date', '')}"
    if reminder_key in sent_reminders:
        return  # Already sent

    try:
        event = {
            "task_id": task["id"],
            "user_id": str(task["user_id"]),
            "title": task["title"],
            "due_at": task.get("due_date"),
            "remind_at": datetime.utcnow().isoformat(),
            "message": f"⏰ Task due soon: {task['title']}"
        }

        await producer.send_and_wait(
            "reminders",
            value=json.dumps(event).encode("utf-8")
        )

        sent_reminders.add(reminder_key)
        logger.info(f"📤 Reminder sent for task #{task['id']}: {task['title']}")

    except Exception as e:
        logger.error(f"❌ Failed to publish reminder: {e}")


async def check_due_tasks():
    """Main job - runs every minute to check due tasks."""
    logger.info("🔍 Checking for due tasks...")
    tasks = await fetch_due_tasks()

    if not tasks:
        logger.info("✅ No tasks due soon")
        return

    logger.info(f"⚠️ Found {len(tasks)} tasks due soon")
    for task in tasks:
        await publish_reminder(task)


async def consume_task_events():
    """Listen for task-events to track new tasks with due dates."""
    global consumer

    try:
        consumer = AIOKafkaConsumer(
            "task-events",
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id=f"{KAFKA_GROUP_ID}-events",
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            auto_offset_reset="latest",
        )
        await consumer.start()
        logger.info("📡 Listening to task-events topic...")

        async for message in consumer:
            event = message.value
            event_type = event.get("event_type")
            task_data = event.get("task_data", {})
            task_id = event.get("task_id")

            # If task deleted/completed - remove from sent reminders
            if event_type in ["deleted", "completed"]:
                keys_to_remove = {k for k in sent_reminders if k.startswith(f"{task_id}-")}
                sent_reminders.difference_update(keys_to_remove)
                logger.info(f"🗑️ Cleared reminders for task #{task_id}")

            # If task created/updated with due date - log it
            if event_type in ["created", "updated"] and task_data.get("due_date"):
                logger.info(f"📅 Task #{task_id} has due date: {task_data['due_date']} - Will remind!")

    except Exception as e:
        logger.error(f"❌ Consumer error: {e}")
    finally:
        if consumer:
            await consumer.stop()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown."""
    global producer, scheduler

    logger.info("🚀 Starting Reminder Service...")

    # Start Kafka producer
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        compression_type="gzip"
    )
    await producer.start()
    logger.info("✅ Kafka producer started")

    # Start scheduler - check every minute
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        check_due_tasks,
        trigger="interval",
        minutes=CHECK_INTERVAL_MINUTES,
        id="check_due_tasks",
        next_run_time=datetime.now(),
        misfire_grace_time=30,
        coalesce=True,
        max_instances=1
    )
    scheduler.start()
    logger.info(f"⏰ Scheduler started - checking every {CHECK_INTERVAL_MINUTES} minute(s)")

    # Start Kafka consumer in background
    consumer_task = asyncio.create_task(consume_task_events())

    yield

    # Shutdown
    logger.info("🛑 Shutting down Reminder Service...")
    scheduler.shutdown()
    consumer_task.cancel()
    await producer.stop()


app = FastAPI(
    title="Reminder Service",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
def root():
    return {
        "service": "reminder-service",
        "status": "running",
        "check_interval_minutes": CHECK_INTERVAL_MINUTES
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "kafka_connected": producer is not None,
        "scheduler_running": scheduler.running if scheduler else False,
        "sent_reminders_count": len(sent_reminders),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.delete("/reminders/clear")
def clear_reminders():
    """Clear sent reminders cache (for testing)."""
    sent_reminders.clear()
    return {"status": "cleared"}