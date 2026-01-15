"""
Disk-based cache manager for API responses
"""

import time
import logging
import os
import pickle
import threading
from pathlib import Path
from typing import Any, Optional, Dict

logger = logging.getLogger(__name__)

class CacheManager:
    """Thread-safe disk-based cache for API responses"""
    
    def __init__(self, cache_dir: str = "cache", max_size: int = 1000):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.max_size = max_size
        self._lock = threading.RLock()
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'evictions': 0
        }
        # Load existing metadata
        self.metadata_file = self.cache_dir / "metadata.pkl"
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> Dict[str, Dict[str, Any]]:
        """Load cache metadata from disk"""
        try:
            if self.metadata_file.exists():
                with open(self.metadata_file, 'rb') as f:
                    return pickle.load(f)
        except Exception as e:
            logger.warning(f"Failed to load cache metadata: {e}")
        return {}
    
    def _save_metadata(self) -> None:
        """Save cache metadata to disk"""
        try:
            with open(self.metadata_file, 'wb') as f:
                pickle.dump(self.metadata, f)
        except Exception as e:
            logger.error(f"Failed to save cache metadata: {e}")
    
    def _get_cache_file(self, key: str) -> Path:
        """Get cache file path for key"""
        safe_key = key.replace('/', '_').replace('\\', '_').replace(':', '_')
        return self.cache_dir / f"{safe_key}.pkl"
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self._lock:
            if key not in self.metadata:
                self.stats['misses'] += 1
                return None
            
            entry_meta = self.metadata[key]
            
            # Check if expired
            if entry_meta['expires_at'] < time.time():
                self._delete_cache_entry(key)
                self.stats['misses'] += 1
                return None
            
            # Load data from disk
            cache_file = self._get_cache_file(key)
            try:
                if cache_file.exists():
                    with open(cache_file, 'rb') as f:
                        data = pickle.load(f)
                    
                    # Update access time in metadata
                    self.metadata[key]['accessed_at'] = time.time()
                    self._save_metadata()
                    
                    self.stats['hits'] += 1
                    logger.debug(f"Cache hit for key: {key}")
                    return data
                else:
                    # File missing, remove from metadata
                    self._delete_cache_entry(key)
                    self.stats['misses'] += 1
                    return None
            except Exception as e:
                logger.error(f"Failed to load cache entry {key}: {e}")
                self._delete_cache_entry(key)
                self.stats['misses'] += 1
                return None
    
    def _delete_cache_entry(self, key: str) -> None:
        """Delete cache entry from disk and metadata"""
        try:
            cache_file = self._get_cache_file(key)
            if cache_file.exists():
                cache_file.unlink()
            if key in self.metadata:
                del self.metadata[key]
        except Exception as e:
            logger.error(f"Failed to delete cache entry {key}: {e}")
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        """Set value in cache with TTL in seconds"""
        with self._lock:
            # Evict expired entries if cache is getting full
            if len(self.metadata) >= self.max_size:
                self._evict_expired()
                
                # If still full, evict least recently used
                if len(self.metadata) >= self.max_size:
                    self._evict_lru()
            
            # Save data to disk
            cache_file = self._get_cache_file(key)
            try:
                with open(cache_file, 'wb') as f:
                    pickle.dump(value, f)
                
                # Update metadata
                self.metadata[key] = {
                    'created_at': time.time(),
                    'accessed_at': time.time(),
                    'expires_at': time.time() + ttl
                }
                self._save_metadata()
                
                self.stats['sets'] += 1
                logger.debug(f"Cache set for key: {key} (TTL: {ttl}s)")
            except Exception as e:
                logger.error(f"Failed to save cache entry {key}: {e}")
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self._lock:
            if key in self.metadata:
                self._delete_cache_entry(key)
                self._save_metadata()
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        with self._lock:
            # Remove all cache files
            for cache_file in self.cache_dir.glob("*.pkl"):
                if cache_file.name != "metadata.pkl":
                    try:
                        cache_file.unlink()
                    except Exception as e:
                        logger.error(f"Failed to delete {cache_file}: {e}")
            
            # Clear metadata
            self.metadata.clear()
            self._save_metadata()
            logger.info("Disk cache cleared")
    
    def _evict_expired(self) -> None:
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [
            key for key, entry_meta in self.metadata.items()
            if entry_meta['expires_at'] < current_time
        ]
        
        for key in expired_keys:
            self._delete_cache_entry(key)
            self.stats['evictions'] += 1
        
        if expired_keys:
            self._save_metadata()
            logger.debug(f"Evicted {len(expired_keys)} expired cache entries")
    
    def _evict_lru(self) -> None:
        """Remove least recently used entry"""
        if not self.metadata:
            return
        
        # Find least recently accessed entry
        lru_key = min(
            self.metadata.keys(),
            key=lambda k: self.metadata[k]['accessed_at']
        )
        
        self._delete_cache_entry(lru_key)
        self._save_metadata()
        self.stats['evictions'] += 1
        logger.debug(f"Evicted LRU cache entry: {lru_key}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            total_requests = self.stats['hits'] + self.stats['misses']
            hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                'size': len(self.metadata),
                'max_size': self.max_size,
                'hit_rate': round(hit_rate, 2),
                'total_hits': self.stats['hits'],
                'total_misses': self.stats['misses'],
                'total_sets': self.stats['sets'],
                'total_evictions': self.stats['evictions'],
                'cache_type': 'disk-based'
            }
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Get approximate disk usage"""
        with self._lock:
            total_size = 0
            file_count = 0
            
            try:
                # Calculate total size of cache files
                for cache_file in self.cache_dir.glob("*.pkl"):
                    total_size += cache_file.stat().st_size
                    file_count += 1
            except Exception as e:
                logger.error(f"Failed to calculate cache disk usage: {e}")
            
            return {
                'cache_size_bytes': total_size,
                'cache_size_mb': round(total_size / (1024 * 1024), 2),
                'entry_count': len(self.metadata),
                'file_count': file_count,
                'cache_directory': str(self.cache_dir)
            }
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