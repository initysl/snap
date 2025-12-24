from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
import os

# Redis client (async)
async def init_limiter():
    """
    Initialize FastAPI Limiter with Redis.
    Call this in your app startup event.
    """
    redis_client = await redis.from_url(
        os.getenv("REDIS_URL", "redis://localhost:6379"),
        encoding="utf-8",
        decode_responses=True
    )
    await FastAPILimiter.init(redis_client)

# Rate limit dependency
rate_limit = RateLimiter(times=100, seconds=60)  # 100 requests per minute