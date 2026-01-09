"""
In-memory cache manager for API responses
"""

import time
import logging
from typing import Any, Optional, Dict
import threading

logger = logging.getLogger(__name__)

class CacheManager:
    """Thread-safe in-memory cache for API responses"""
    
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self._lock = threading.RLock()
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'evictions': 0
        }
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self._lock:
            if key not in self.cache:
                self.stats['misses'] += 1
                return None
            
            entry = self.cache[key]
            
            # Check if expired
            if entry['expires_at'] < time.time():
                del self.cache[key]
                self.stats['misses'] += 1
                return None
            
            # Update access time
            entry['accessed_at'] = time.time()
            self.stats['hits'] += 1
            
            logger.debug(f"Cache hit for key: {key}")
            return entry['data']
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        """Set value in cache with TTL in seconds"""
        with self._lock:
            # Evict expired entries if cache is getting full
            if len(self.cache) >= self.max_size:
                self._evict_expired()
                
                # If still full, evict least recently used
                if len(self.cache) >= self.max_size:
                    self._evict_lru()
            
            self.cache[key] = {
                'data': value,
                'created_at': time.time(),
                'accessed_at': time.time(),
                'expires_at': time.time() + ttl
            }
            
            self.stats['sets'] += 1
            logger.debug(f"Cache set for key: {key} (TTL: {ttl}s)")
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self._lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        with self._lock:
            self.cache.clear()
            logger.info("Cache cleared")
    
    def _evict_expired(self) -> None:
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self.cache.items()
            if entry['expires_at'] < current_time
        ]
        
        for key in expired_keys:
            del self.cache[key]
            self.stats['evictions'] += 1
        
        if expired_keys:
            logger.debug(f"Evicted {len(expired_keys)} expired cache entries")
    
    def _evict_lru(self) -> None:
        """Remove least recently used entry"""
        if not self.cache:
            return
        
        # Find least recently accessed entry
        lru_key = min(
            self.cache.keys(),
            key=lambda k: self.cache[k]['accessed_at']
        )
        
        del self.cache[lru_key]
        self.stats['evictions'] += 1
        logger.debug(f"Evicted LRU cache entry: {lru_key}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            total_requests = self.stats['hits'] + self.stats['misses']
            hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                'size': len(self.cache),
                'max_size': self.max_size,
                'hit_rate': round(hit_rate, 2),
                'total_hits': self.stats['hits'],
                'total_misses': self.stats['misses'],
                'total_sets': self.stats['sets'],
                'total_evictions': self.stats['evictions']
            }
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Get approximate memory usage"""
        with self._lock:
            import sys
            
            total_size = sys.getsizeof(self.cache)
            for key, entry in self.cache.items():
                total_size += sys.getsizeof(key) + sys.getsizeof(entry)
                total_size += sys.getsizeof(entry['data'])
            
            return {
                'cache_size_bytes': total_size,
                'cache_size_mb': round(total_size / (1024 * 1024), 2),
                'entry_count': len(self.cache)
            }