"""
Startup optimization script to pre-warm models and cache
This should be run once during deployment to optimize performance
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.utils.cache import CacheManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def pre_warm_system():
    """Pre-warm all models and cache common queries"""
    logger.info("🚀 Starting system pre-warming...")
    
    try:
        # Initialize services
        logger.info("1. Initializing services...")
        cache_manager = CacheManager(cache_dir="data/cache")
        data_service = DataService()
        await data_service.initialize()
        
        ml_service = MLService(data_service)
        await ml_service.initialize()
        
        # Pre-train and save all models
        logger.info("2. Pre-training all ML models...")
        
        # Train clustering models for different cluster counts
        for n_clusters in [3, 4, 5, 6, 7, 8]:
            logger.info(f"   Training clustering model with {n_clusters} clusters...")
            await ml_service.run_clustering(n_clusters=n_clusters, save_model=True)
        
        # Train anomaly detection models
        logger.info("   Training anomaly detection models...")
        for contamination in [0.05, 0.1, 0.15, 0.2]:
            await ml_service.detect_anomalies(contamination=contamination)
        
        # Generate and cache forecasts
        logger.info("   Generating forecasts...")
        for days in [7, 14, 30, 60]:
            forecast = await ml_service.generate_forecast(days=days)
            cache_manager.set(f"forecast_{days}_days", forecast, ttl=86400)
        
        # Pre-cache common data queries
        logger.info("3. Pre-caching common data queries...")
        
        # Cache summary data
        summary = await data_service.get_summary()
        cache_manager.set("summary", summary, ttl=86400)
        
        # Cache state and district data
        states = await data_service.get_states()
        cache_manager.set("states", states, ttl=86400)
        
        districts = await data_service.get_districts()
        cache_manager.set("districts", districts, ttl=86400)
        
        # Cache demographic data
        age_dist = await data_service.get_age_distribution()
        cache_manager.set("age_distribution", age_dist, ttl=86400)
        
        logger.info("✅ System pre-warming completed successfully!")
        logger.info("🎯 All models trained and cached. API will now respond much faster!")
        
    except Exception as e:
        logger.error(f"❌ Error during pre-warming: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(pre_warm_system())