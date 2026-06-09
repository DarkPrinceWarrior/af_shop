import logging

import httpx
from sqlmodel import Session

from app.core.config import settings
from app.core.db import engine
from app.models import Order, TelegramSettings

logger = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)


def _enum_value(value: object) -> str:
    return str(getattr(value, "value", value))


def resolve_telegram_config(session: Session) -> tuple[str | None, str | None, str]:
    """Return (bot_token, owner_chat_id, source).

    DB settings take precedence over environment variables. An existing but
    disabled DB row turns notifications off explicitly. ``source`` is one of
    ``"db"``, ``"env"`` or ``"none"``.
    """
    row = session.get(TelegramSettings, 1)
    if row is not None:
        if not row.enabled:
            return None, None, "none"
        if row.bot_token and row.owner_chat_id:
            return row.bot_token, row.owner_chat_id, "db"
    if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_OWNER_CHAT_ID:
        return settings.TELEGRAM_BOT_TOKEN, settings.TELEGRAM_OWNER_CHAT_ID, "env"
    return None, None, "none"


def send_telegram_message(bot_token: str, chat_id: str, text: str) -> None:
    """Send a single message. Raises httpx errors on failure."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    with httpx.Client(timeout=10) as client:
        response = client.post(url, json={"chat_id": chat_id, "text": text})
        response.raise_for_status()


def _format_order_message(order: Order) -> str:
    lines = [
        f"New order: {order.order_number}",
        f"Customer: {order.customer_name}",
        f"Phone: {order.customer_phone}",
    ]
    if order.customer_telegram:
        lines.append(f"Telegram: {order.customer_telegram}")
    lines.extend(
        [
            f"Currency: {_enum_value(order.currency)}",
            f"Subtotal: {order.subtotal}",
            f"Delivery: {order.delivery_fee}",
            f"Total: {order.total}",
            "Items:",
        ]
    )
    for item in order.items:
        lines.append(
            f"- {item.product_name_en} x {item.quantity}: {item.line_total}"
        )
    if order.customer_comment:
        lines.append(f"Comment: {order.customer_comment}")
    return "\n".join(lines)


def send_order_notification(order: Order) -> None:
    with Session(engine) as session:
        bot_token, chat_id, _source = resolve_telegram_config(session)
    if not bot_token or not chat_id:
        logger.info("Telegram notification skipped: settings are not configured")
        return

    try:
        send_telegram_message(bot_token, chat_id, _format_order_message(order))
        logger.info("Telegram order notification sent for %s", order.order_number)
    except httpx.HTTPStatusError as error:
        logger.warning(
            "Telegram order notification failed for %s with status %s",
            order.order_number,
            error.response.status_code,
        )
    except httpx.RequestError:
        logger.warning(
            "Telegram order notification failed for %s due to request error",
            order.order_number,
        )
