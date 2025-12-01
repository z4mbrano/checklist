"""
Cache Infrastructure - Redis Cache-Aside Pattern

Implements distributed caching with Redis for high-performance read operations.

Architecture Pattern: Cache-Aside (Lazy Loading)
1. Application checks cache BEFORE database
2. Cache miss → Load from DB → Store in cache
3. Cache hit → Return cached data (skip DB)

Performance Impact:
- Reduces database load by 70-90% for read-heavy endpoints
- Sub-millisecond response times for cached data
- Scales horizontally with Redis cluster

Invalidation Strategy:
- TTL-based expiration (default: 60 seconds)
- Manual invalidation on write operations (UPDATE/DELETE)
- Pattern-based invalidation (e.g., clear all "project:*" keys)
"""
import json
import hashlib
from functools import wraps
from typing import Optional, Any, Callable, Union, List
from datetime import timedelta
import redis.asyncio as redis
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class CacheService:
    """
    Redis-based cache service with Cache-Aside pattern.
    
    Features:
    - Automatic serialization/deserialization (JSON)
    - Namespace support (avoid key collisions)
    - TTL management
    - Pattern-based invalidation
    - Async/await support
    
    Example:
        cache = CacheService(namespace="projects")
        await cache.set("project:1", project_data, ttl=300)
        data = await cache.get("project:1")
        await cache.invalidate("project:1")
    """
    
    def __init__(
        self,
        redis_url: str = None,
        namespace: str = "app",
        default_ttl: int = 60
    ):
        """
        Initialize cache service.
        
        Args:
            redis_url: Redis connection URL (default from settings)
            namespace: Key namespace to avoid collisions
            default_ttl: Default expiration time in seconds
        """
        self.redis_url = redis_url or settings.REDIS_URL
        self.namespace = namespace
        self.default_ttl = default_ttl
        self._client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Establish Redis connection (lazy initialization)."""
        if self._client is None:
            try:
                # redis.from_url is synchronous in redis-py 5.x
                self._client = redis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_timeout=5,
                    socket_connect_timeout=5
                )
                await self._client.ping()
                logger.info("redis_connected", namespace=self.namespace)
            except Exception as e:
                # Log error but don't crash - operate in no-cache mode
                logger.warning("redis_connection_failed_operating_without_cache", error=str(e))
                self._client = None
    
    async def disconnect(self):
        """Close Redis connection gracefully."""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("redis_disconnected", namespace=self.namespace)
    
    def _make_key(self, key: str) -> str:
        """Generate namespaced cache key."""
        return f"{self.namespace}:{key}"
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value (deserialized from JSON) or None if not found
        """
        try:
            await self.connect()
            if self._client is None:
                return None

            namespaced_key = self._make_key(key)
            value = await self._client.get(namespaced_key)
            
            if value is None:
                logger.debug("cache_miss", key=key)
                return None
            
            logger.debug("cache_hit", key=key)
            return json.loads(value)
            
        except json.JSONDecodeError as e:
            logger.error("cache_deserialize_failed", key=key, error=str(e))
            return None
        except Exception as e:
            logger.error("cache_get_failed", key=key, error=str(e))
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Store value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: self.default_ttl)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            await self.connect()
            if self._client is None:
                return False

            namespaced_key = self._make_key(key)
            expiration = ttl if ttl is not None else self.default_ttl
            
            serialized = json.dumps(value)
            await self._client.setex(
                namespaced_key,
                timedelta(seconds=expiration),
                serialized
            )
            
            logger.debug("cache_set", key=key, ttl=expiration)
            return True
            
        except (TypeError, ValueError) as e:
            logger.error("cache_serialize_failed", key=key, error=str(e))
            return False
        except Exception as e:
            logger.error("cache_set_failed", key=key, error=str(e))
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete single cache entry.
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if key existed and was deleted
        """
        try:
            await self.connect()
            if self._client is None:
                return False

            namespaced_key = self._make_key(key)
            result = await self._client.delete(namespaced_key)
            
            logger.debug("cache_delete", key=key, existed=bool(result))
            return bool(result)
            
        except Exception as e:
            logger.error("cache_delete_failed", key=key, error=str(e))
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern.
        
        Useful for invalidating related cache entries.
        
        Args:
            pattern: Redis pattern (e.g., "project:*" for all projects)
            
        Returns:
            Number of keys deleted
        """
        try:
            await self.connect()
            if self._client is None:
                return 0

            namespaced_pattern = self._make_key(pattern)
            
            # Find matching keys
            keys = []
            async for key in self._client.scan_iter(match=namespaced_pattern, count=100):
                keys.append(key)
            
            if not keys:
                logger.debug("cache_pattern_delete_no_match", pattern=pattern)
                return 0
            
            # Delete in batch
            deleted = await self._client.delete(*keys)
            logger.info("cache_pattern_delete", pattern=pattern, count=deleted)
            return deleted
            
        except Exception as e:
            logger.error("cache_pattern_delete_failed", pattern=pattern, error=str(e))
            return 0
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            await self.connect()
            if self._client is None:
                return False

            namespaced_key = self._make_key(key)
            return await self._client.exists(namespaced_key) > 0
        except Exception as e:
            logger.error("cache_exists_failed", key=key, error=str(e))
            return False
    
    async def get_ttl(self, key: str) -> Optional[int]:
        """Get remaining TTL for key in seconds."""
        try:
            await self.connect()
            if self._client is None:
                return None

            namespaced_key = self._make_key(key)
            ttl = await self._client.ttl(namespaced_key)
            return ttl if ttl > 0 else None
        except Exception as e:
            logger.error("cache_ttl_failed", key=key, error=str(e))
            return None


# ========================================
# Decorator for Caching Function Results
# ========================================

def cache(
    ttl: int = 60,
    namespace: str = "app",
    key_builder: Optional[Callable] = None
):
    """
    Decorator for caching function results with Cache-Aside pattern.
    
    Args:
        ttl: Time to live in seconds
        namespace: Cache namespace
        key_builder: Custom function to build cache key from args
        
    Example:
        @cache(ttl=300, namespace="projects")
        async def get_project_by_id(project_id: int):
            # This will be cached for 5 minutes
            return await db.query(...).first()
        
        # Manual invalidation when project is updated:
        cache_service = CacheService(namespace="projects")
        await cache_service.delete(f"get_project_by_id:{project_id}")
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Default: function_name:hash(args,kwargs)
                key_parts = f"{func.__name__}:{str(args)}:{str(kwargs)}"
                key_hash = hashlib.md5(key_parts.encode()).hexdigest()[:16]
                cache_key = f"{func.__name__}:{key_hash}"
            
            # Try to get from cache
            cache_service = CacheService(namespace=namespace, default_ttl=ttl)
            cached_value = await cache_service.get(cache_key)
            
            if cached_value is not None:
                logger.debug(
                    "cache_decorator_hit",
                    function=func.__name__,
                    key=cache_key
                )
                return cached_value
            
            # Cache miss - execute function
            logger.debug(
                "cache_decorator_miss",
                function=func.__name__,
                key=cache_key
            )
            result = await func(*args, **kwargs)
            
            # Store in cache
            await cache_service.set(cache_key, result, ttl=ttl)
            
            return result
        
        return wrapper
    return decorator


# ========================================
# Global Cache Instance (Singleton)
# ========================================

_global_cache: Optional[CacheService] = None


def get_cache_service(namespace: str = "app") -> CacheService:
    """
    Get global cache service instance (singleton per namespace).
    
    Usage in FastAPI:
        from fastapi import Depends
        from app.core.cache import get_cache_service
        
        @router.get("/projects/{id}")
        async def get_project(
            id: int,
            cache: CacheService = Depends(get_cache_service)
        ):
            cached = await cache.get(f"project:{id}")
            if cached:
                return cached
            # ... fetch from DB and cache
    """
    return CacheService(namespace=namespace)


# ========================================
# Cache Invalidation Helpers
# ========================================

async def invalidate_project_cache(project_id: int):
    """Invalidate all cache entries related to a project."""
    cache = CacheService(namespace="projects")
    await cache.delete(f"project:{project_id}")
    await cache.delete(f"project:detail:{project_id}")
    logger.info("project_cache_invalidated", project_id=project_id)


async def invalidate_projects_list_cache():
    """Invalidate project list caches (when new project created)."""
    cache = CacheService(namespace="projects")
    await cache.delete_pattern("list:*")
    await cache.delete_pattern("statistics:*")
    logger.info("projects_list_cache_invalidated")


async def invalidate_user_cache(user_id: int):
    """Invalidate all cache entries related to a user."""
    cache = CacheService(namespace="users")
    await cache.delete(f"user:{user_id}")
    await cache.delete(f"user:projects:{user_id}")
    logger.info("user_cache_invalidated", user_id=user_id)
