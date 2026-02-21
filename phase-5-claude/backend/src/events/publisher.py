"""Kafka event publisher."""

import json
import asyncio
from typing import Dict, Any, Optional
from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError
import logging

from .schemas import TaskEvent, ReminderEvent, TaskUpdateEvent

logger = logging.getLogger(__name__)


class KafkaPublisher:
    """Kafka event publisher service."""
    
    def __init__(self, bootstrap_servers: str = "taskflow-redpanda:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.producer: Optional[AIOKafkaProducer] = None
        self._started = False
        
    async def start(self):
        """Initialize Kafka producer."""
        if self._started:
            return
            
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                compression_type="gzip",
                max_request_size=1048576  # 1MB
            )
            await self.producer.start()
            self._started = True
            logger.info(f"✅ Kafka producer started: {self.bootstrap_servers}")
        except KafkaError as e:
            logger.error(f"❌ Failed to start Kafka producer: {e}")
            # Don't raise - allow app to start even if Kafka is down
    
    async def stop(self):
        """Stop Kafka producer."""
        if self.producer and self._started:
            await self.producer.stop()
            self._started = False
            logger.info("Kafka producer stopped")
    
    async def publish_task_event(self, event: TaskEvent):
        """Publish task event to task-events topic."""
        await self._publish("task-events", event.model_dump())
    
    async def publish_reminder(self, event: ReminderEvent):
        """Publish reminder event to reminders topic."""
        await self._publish("reminders", event.model_dump())
    
    async def publish_task_update(self, event: TaskUpdateEvent):
        """Publish real-time update to task-updates topic."""
        await self._publish("task-updates", event.model_dump())
    
    async def _publish(self, topic: str, data: Dict[str, Any]):
        """Internal publish method."""
        if not self._started:
            await self.start()
        
        try:
            if self.producer:
                await self.producer.send_and_wait(topic, data)
                logger.info(f"📤 Published to {topic}: {data.get('event_type', data.get('action'))}")
        except KafkaError as e:
            logger.error(f"❌ Failed to publish to {topic}: {e}")
            # Don't raise - allow app to continue even if Kafka fails


# Global publisher instance
kafka_publisher = KafkaPublisher()