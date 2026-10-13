import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from .logging import logger, request_id_ctx_var


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Middleware for injecting unique request ID and logging request lifecycle."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract existing X-Request-ID or generate new UUID
        request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        token = request_id_ctx_var.set(request_id)

        start_time = time.perf_counter()
        logger.info(f"--> {request.method} {request.url.path}")

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            response.headers["X-Request-ID"] = request_id
            logger.info(
                f"<-- {request.method} {request.url.path} | Status: {response.status_code} | Time: {duration_ms:.2f}ms"
            )
            return response
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.exception(
                f"<-- {request.method} {request.url.path} FAILED | Time: {duration_ms:.2f}ms | Error: {str(exc)}"
            )
            raise exc
        finally:
            request_id_ctx_var.reset(token)
