"""
Performance monitoring utilities for tracking API response times
"""

import time
import logging
from functools import wraps
from typing import Dict, List
import asyncio

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Monitor and track API performance metrics"""
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
        self.slow_requests: List[Dict] = []
        self.threshold_ms = 1000  # 1 second threshold for slow requests
    
    def track_time(self, operation_name: str):
        """Decorator to track execution time of operations"""
        def decorator(func):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    execution_time = (time.time() - start_time) * 1000  # Convert to ms
                    self._record_metric(operation_name, execution_time)
                    return result
                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    self._record_metric(f"{operation_name}_error", execution_time)
                    raise
            
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    execution_time = (time.time() - start_time) * 1000
                    self._record_metric(operation_name, execution_time)
                    return result
                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    self._record_metric(f"{operation_name}_error", execution_time)
                    raise
            
            return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
        return decorator
    
    def _record_metric(self, operation: str, duration_ms: float):
        """Record performance metric"""
        if operation not in self.metrics:
            self.metrics[operation] = []
        
        self.metrics[operation].append(duration_ms)
        
        # Keep only last 100 measurements
        if len(self.metrics[operation]) > 100:
            self.metrics[operation] = self.metrics[operation][-100:]
        
        # Track slow requests
        if duration_ms > self.threshold_ms:
            self.slow_requests.append({
                'operation': operation,
                'duration_ms': duration_ms,
                'timestamp': time.time()
            })
            logger.warning(f"⚠️ Slow request detected: {operation} took {duration_ms:.1f}ms")
            
            # Keep only last 50 slow requests
            if len(self.slow_requests) > 50:
                self.slow_requests = self.slow_requests[-50:]
    
    def get_stats(self) -> Dict:
        """Get performance statistics"""
        stats = {}
        for operation, times in self.metrics.items():
            if times:
                stats[operation] = {
                    'count': len(times),
                    'avg_ms': sum(times) / len(times),
                    'min_ms': min(times),
                    'max_ms': max(times),
                    'recent_avg_ms': sum(times[-10:]) / min(len(times), 10)
                }
        
        return {
            'operation_stats': stats,
            'slow_requests_count': len(self.slow_requests),
            'recent_slow_requests': self.slow_requests[-10:] if self.slow_requests else []
        }
    
    def log_summary(self):
        """Log performance summary"""
        stats = self.get_stats()
        logger.info("📊 Performance Summary:")
        
        for operation, data in stats['operation_stats'].items():
            avg_ms = data['avg_ms']
            count = data['count']
            status = "🟢" if avg_ms < 500 else "🟡" if avg_ms < 1000 else "🔴"
            logger.info(f"  {status} {operation}: {avg_ms:.1f}ms avg ({count} calls)")
        
        if stats['slow_requests_count'] > 0:
            logger.warning(f"⚠️ {stats['slow_requests_count']} slow requests detected")

# Global performance monitor instance
performance_monitor = PerformanceMonitor()