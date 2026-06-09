import json
import logging

import redis.asyncio as aioredis
from fastapi import WebSocket

from app.core.config import settings

logger = logging.getLogger(__name__)

ORDERS_CHANNEL = "shop_meraj.orders"


class OrderConnectionManager:
    """Manages admin order WebSocket clients.

    With a single worker the in-memory list is enough. When ``REDIS_URL`` is set,
    broadcasts are published to a Redis channel and a per-process subscriber
    fans them out to that process's local clients, so realtime delivery works
    across multiple workers / replicas.
    """

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []
        self._redis: aioredis.Redis | None = None

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def _local_broadcast(self, message: dict[str, str]) -> None:
        disconnected: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:  # noqa: BLE001 - drop any dead/broken socket
                disconnected.append(connection)
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast(self, message: dict[str, str]) -> None:
        if settings.REDIS_URL:
            try:
                if self._redis is None:
                    self._redis = aioredis.from_url(settings.REDIS_URL)
                await self._redis.publish(ORDERS_CHANNEL, json.dumps(message))
                return
            except Exception:
                logger.warning("Redis publish failed; falling back to local broadcast")
        await self._local_broadcast(message)

    async def run_subscriber(self) -> None:
        """Forward Redis channel messages to this process's local clients."""
        if not settings.REDIS_URL:
            return
        try:
            redis = aioredis.from_url(settings.REDIS_URL)
            pubsub = redis.pubsub()
            await pubsub.subscribe(ORDERS_CHANNEL)
            async for raw in pubsub.listen():
                if raw.get("type") != "message":
                    continue
                try:
                    message = json.loads(raw["data"])
                except (ValueError, TypeError):
                    continue
                await self._local_broadcast(message)
        except Exception:
            logger.exception("Order realtime subscriber stopped")


order_connection_manager = OrderConnectionManager()
