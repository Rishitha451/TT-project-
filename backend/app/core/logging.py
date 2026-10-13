import logging
import sys
from contextvars import ContextVar
from typing import Optional

# Request ID context variable for correlation tracking
request_id_ctx_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


class RequestIdFilter(logging.Filter):
    """Injects current correlation request ID into log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx_var.get() or "N/A"
        return True


def setup_logging(debug: bool = True) -> logging.Logger:
    """Configures structured application logging."""
    logger = logging.getLogger("ai_finance_advisor")
    logger.setLevel(logging.DEBUG if debug else logging.INFO)

    # Avoid duplicate handlers if reloaded
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG if debug else logging.INFO)
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [req_id:%(request_id)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
        handler.setFormatter(formatter)
        handler.addFilter(RequestIdFilter())
        logger.addHandler(handler)

    return logger


logger = setup_logging()
