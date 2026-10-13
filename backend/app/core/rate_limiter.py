"""In-memory sliding window rate limiter for protecting advisor endpoints."""

import time
from collections import defaultdict
from typing import Dict, List


class SlidingWindowRateLimiter:
    """In-memory per-user sliding window rate limiter."""

    def __init__(self, max_requests: int = 30, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        """Check if request is permitted under rate limit window and record timestamp."""
        now = time.time()
        window_start = now - self.window_seconds

        # Clean timestamps older than the active window
        timestamps = [t for t in self._history[key] if t > window_start]
        self._history[key] = timestamps

        if len(timestamps) >= self.max_requests:
            return False

        self._history[key].append(now)
        return True

    def reset(self, key: str) -> None:
        """Reset rate limiter history for a given key (used in testing)."""
        if key in self._history:
            del self._history[key]


# Global rate limiter instance for AI Advisor endpoint
advisor_rate_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)
