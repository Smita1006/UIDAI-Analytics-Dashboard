"""
VPS Memory Monitor for UIDAI Analytics Backend
This script monitors memory usage and automatically optimizes parameters
"""

import psutil
import logging
import time
import os
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VPSMemoryMonitor:
    def __init__(self):
        self.memory_threshold = 85  # Alert if memory usage > 85%
        self.critical_threshold = 95  # Critical if memory usage > 95%
        
    def check_memory(self):
        """Check current memory usage"""
        try:
            memory = psutil.virtual_memory()
            return {
                'percent': memory.percent,
                'available_gb': round(memory.available / (1024**3), 2),
                'total_gb': round(memory.total / (1024**3), 2),
                'used_gb': round(memory.used / (1024**3), 2)
            }
        except Exception as e:
            logger.error(f"Error checking memory: {e}")
            return None
    
    def get_recommendations(self, memory_percent):
        """Get optimization recommendations based on memory usage"""
        if memory_percent > self.critical_threshold:
            return {
                'level': 'CRITICAL',
                'actions': [
                    'Reduce DATA_SAMPLE_SIZE to 25000',
                    'Reduce MAX_CENTERS to 1000',
                    'Disable ML model caching',
                    'Force garbage collection'
                ],
                'env_vars': {
                    'DATA_SAMPLE_SIZE': '25000',
                    'MAX_CENTERS': '1000',
                    'CACHE_MAX_SIZE': '100'
                }
            }
        elif memory_percent > self.memory_threshold:
            return {
                'level': 'WARNING',
                'actions': [
                    'Reduce DATA_SAMPLE_SIZE to 50000',
                    'Reduce MAX_CENTERS to 2000',
                    'Clear old cache entries'
                ],
                'env_vars': {
                    'DATA_SAMPLE_SIZE': '50000',
                    'MAX_CENTERS': '2000',
                    'CACHE_MAX_SIZE': '250'
                }
            }
        else:
            return {
                'level': 'OK',
                'actions': ['Memory usage is normal'],
                'env_vars': {}
            }
    
    def monitor_and_optimize(self, check_interval=30):
        """Continuously monitor memory and apply optimizations"""
        logger.info(f"🔍 Starting VPS memory monitoring (check every {check_interval}s)")
        
        try:
            while True:
                memory_info = self.check_memory()
                if memory_info:
                    recommendations = self.get_recommendations(memory_info['percent'])
                    
                    logger.info(f"💾 Memory: {memory_info['percent']:.1f}% "
                              f"({memory_info['used_gb']}/{memory_info['total_gb']} GB)")
                    
                    if recommendations['level'] in ['WARNING', 'CRITICAL']:
                        logger.warning(f"⚠️ {recommendations['level']}: High memory usage detected")
                        
                        for action in recommendations['actions']:
                            logger.warning(f"  • {action}")
                        
                        # Auto-apply environment variables
                        for var, value in recommendations['env_vars'].items():
                            os.environ[var] = value
                            logger.info(f"🔧 Set {var}={value}")
                        
                        if recommendations['level'] == 'CRITICAL':
                            logger.critical("💥 CRITICAL memory usage - forcing garbage collection")
                            import gc
                            gc.collect()
                
                time.sleep(check_interval)
                
        except KeyboardInterrupt:
            logger.info("🛑 Memory monitoring stopped")
        except Exception as e:
            logger.error(f"❌ Error in memory monitoring: {e}")

def main():
    """Main function for standalone execution"""
    monitor = VPSMemoryMonitor()
    
    # Check current memory
    memory_info = monitor.check_memory()
    if memory_info:
        print(f"Current Memory Usage: {memory_info['percent']:.1f}%")
        print(f"Available: {memory_info['available_gb']} GB")
        print(f"Total: {memory_info['total_gb']} GB")
        
        recommendations = monitor.get_recommendations(memory_info['percent'])
        print(f"\nRecommendation Level: {recommendations['level']}")
        
        if recommendations['env_vars']:
            print("\nRecommended environment variables:")
            for var, value in recommendations['env_vars'].items():
                print(f"  export {var}={value}")
    
    # Start monitoring if requested
    if len(sys.argv) > 1 and sys.argv[1] == 'monitor':
        monitor.monitor_and_optimize()

if __name__ == "__main__":
    main()