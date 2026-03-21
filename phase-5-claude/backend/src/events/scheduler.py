"""Scheduler - reminder service logic merged into backend."""

import logging
import json
from datetime import datetime
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from aiokafka import AIOKafkaProducer

from ..config import settings

logger = logging.getLogger(__name__)

scheduler = None
producer = None
sent_reminders = set()


async def fetch_due_tasks() -> list:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://localhost:8000/api/internal/tasks/due-soon",
                headers={"x-internal-secret": settings.INTERNAL_SECRET},
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json().get("tasks", [])
    except Exception as e:
        logger.error(f"Failed to fetch due tasks: {e}")
    return []


async def publish_reminder(task: dict):
    global producer

    reminder_key = f"{task['id']}-{task.get('due_date', '')}"
    if reminder_key in sent_reminders:
        return

    try:
        event = {
            "task_id": task["id"],
            "user_id": str(task["user_id"]),
            "title": task["title"],
            "due_at": task.get("due_date"),
            "remind_at": datetime.utcnow().isoformat(),
        }
        await producer.send_and_wait(
            "reminders",
            value=json.dumps(event).encode("utf-8")
        )
        sent_reminders.add(reminder_key)
        logger.info(f"Reminder published for task #{task['id']}")
    except Exception as e:
        logger.error(f"Failed to publish reminder: {e}")


async def check_due_tasks():
    tasks = await fetch_due_tasks()
    if tasks:
        logger.info(f"{len(tasks)} tasks due soon")
        for task in tasks:
            await publish_reminder(task)


async def start_scheduler():
    global scheduler, producer

    producer = AIOKafkaProducer(
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        compression_type="gzip"
    )
    await producer.start()

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        check_due_tasks,
        trigger="interval",
        minutes=1,
        id="check_due_tasks",
        next_run_time=datetime.now(),
        misfire_grace_time=30,
        coalesce=True,
        max_instances=1
    )
    scheduler.start()
    logger.info("Reminder scheduler started")


async def stop_scheduler():
    global scheduler, producer
    if scheduler:
        scheduler.shutdown()
    if producer:
        await producer.stop()
    logger.info("Scheduler stopped")