"""WebSocket manager for real-time notifications."""

import socketio
import logging
from typing import Dict, Set

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# Track connected users: {user_id: {session_ids}}
connected_users: Dict[str, Set[str]] = {}


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection."""
    user_id = auth.get('user_id') if auth else None
    
    if not user_id:
        logger.warning(f"Connection rejected - no user_id: {sid}")
        return False
    
    # Add user to connected users
    if user_id not in connected_users:
        connected_users[user_id] = set()
    connected_users[user_id].add(sid)
    
    logger.info(f"✅ User {user_id} connected (session: {sid})")
    await sio.emit('connected', {'message': 'Connected to notification service'}, room=sid)
    return True


@sio.event
async def disconnect(sid):
    """Handle client disconnect."""
    # Remove from connected users
    for user_id, sessions in connected_users.items():
        if sid in sessions:
            sessions.remove(sid)
            logger.info(f"❌ User {user_id} disconnected (session: {sid})")
            if not sessions:
                del connected_users[user_id]
            break


async def send_notification_to_user(user_id: str, notification: dict):
    """Send notification to all connected sessions of a user."""
    if user_id in connected_users:
        for session_id in connected_users[user_id]:
            try:
                await sio.emit('notification', notification, room=session_id)
                logger.info(f"📤 Sent notification to user {user_id} (session: {session_id})")
            except Exception as e:
                logger.error(f"Failed to send notification: {e}")
    else:
        logger.debug(f"User {user_id} not connected - notification skipped")


async def broadcast_task_update(user_id: str, task_data: dict):
    """Broadcast task update to user's connected clients."""
    await send_notification_to_user(user_id, {
        'type': 'task_update',
        'data': task_data
    })


# Create ASGI app
socket_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')