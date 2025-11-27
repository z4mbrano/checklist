"""
Structured Logging Configuration

Provides JSON-formatted logs with contextual information for better observability.
Uses structlog for structured logging with automatic context propagation.

Architecture Decision:
- JSON output for production (machine-readable, works with log aggregators)
- Pretty console output for development (human-readable)
- Request ID correlation via context variables
- Security: Never log sensitive data (passwords, tokens)
"""
import logging
import sys
from typing import Any, Dict
from contextvars import ContextVar

import structlog
from pythonjsonlogger import jsonlogger

from app.core.config import settings

# Context variable for request ID correlation across async boundaries
request_id_ctx_var: ContextVar[str] = ContextVar("request_id", default="")
user_id_ctx_var: ContextVar[str] = ContextVar("user_id", default="")


def add_correlation_ids(logger: Any, method_name: str, event_dict: Dict) -> Dict:
    """
    Processor to add correlation IDs from context variables to log entries.
    Enables distributed tracing across service boundaries.
    """
    request_id = request_id_ctx_var.get("")
    user_id = user_id_ctx_var.get("")
    
    if request_id:
        event_dict["request_id"] = request_id
    if user_id:
        event_dict["user_id"] = user_id
    
    return event_dict


def configure_logging() -> None:
    """
    Configure structured logging for the application.
    
    Production: JSON logs to stdout (cloud-native, works with log aggregators)
    Development: Pretty console output for easier debugging
    """
    # Determine log level from environment
    log_level = logging.DEBUG if settings.debug else logging.INFO
    
    # Configure standard library logging (used by uvicorn, sqlalchemy, etc)
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )
    
    # Structlog processors pipeline
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        add_correlation_ids,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]
    
    if settings.environment == "development":
        # Development: Pretty console output
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer()
        ]
    else:
        # Production: JSON output for log aggregators (ELK, Datadog, etc)
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer()
        ]
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> structlog.BoundLogger:
    """
    Get a structured logger instance.
    
    Usage:
        logger = get_logger(__name__)
        logger.info("user_login", user_id=123, ip_address="192.168.1.1")
        logger.error("payment_failed", order_id=456, amount=99.99, reason="card_declined")
    
    Args:
        name: Logger name (typically __name__ of the module)
    
    Returns:
        Configured structlog logger with automatic context propagation
    """
    return structlog.get_logger(name)


def set_request_context(request_id: str, user_id: str = "") -> None:
    """
    Set correlation IDs for the current request context.
    Should be called by middleware at the start of each request.
    
    Args:
        request_id: Unique identifier for this request (UUID)
        user_id: Authenticated user ID (optional, empty for anonymous requests)
    """
    request_id_ctx_var.set(request_id)
    if user_id:
        user_id_ctx_var.set(user_id)


def clear_request_context() -> None:
    """Clear correlation IDs after request processing."""
    request_id_ctx_var.set("")
    user_id_ctx_var.set("")


# Initialize logging on module import
configure_logging()

# Export convenience function
logger = get_logger(__name__)
