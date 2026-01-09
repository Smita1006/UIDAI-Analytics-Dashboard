"""
Production FastAPI Backend for UIDAI Analytics
Optimized for 4GB RAM VPS with 2vCores
"""

import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, date

import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
from contextlib import asynccontextmanager

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.models.api_models import *
from app.utils.cache import CacheManager
from app.utils.config import Settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
data_service: Optional[DataService] = None
ml_service: Optional[MLService] = None
cache_manager: Optional[CacheManager] = None
settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    global data_service, ml_service, cache_manager
    
    logger.info("🚀 Starting UIDAI Analytics API...")
    
    try:
        # Initialize cache
        cache_manager = CacheManager()
        
        # Initialize data service
        data_service = DataService()
        await data_service.initialize()
        
        # Initialize ML service
        ml_service = MLService(data_service)
        await ml_service.initialize()
        
        logger.info("✅ All services initialized successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    finally:
        logger.info("🔄 Shutting down services...")

app = FastAPI(
    title="UIDAI Analytics API",
    description="Production-ready analytics API for UIDAI Aadhaar data with ML insights",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
        "https://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://127.0.0.1:3000",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "services": {
            "data_service": data_service is not None,
            "ml_service": ml_service is not None,
            "cache": cache_manager is not None
        }
    }

@app.get("/", response_model=APIResponse)
async def root():
    """API root endpoint"""
    return APIResponse(
        success=True,
        data={
            "message": "UIDAI Analytics API v2.0.0",
            "documentation": "/docs",
            "health": "/health"
        }
    )

# Data Summary Endpoints
@app.get("/api/summary", response_model=APIResponse)
async def get_data_summary():
    """Get overall data summary with caching"""
    try:
        # Try cache first
        cached_data = cache_manager.get("summary")
        if cached_data:
            logger.info("📊 Serving summary from cache")
            return APIResponse(success=True, data=cached_data)
        
        # Generate fresh summary
        summary = await data_service.get_summary()
        
        # Cache for 1 hour
        cache_manager.set("summary", summary, ttl=3600)
        
        return APIResponse(success=True, data=summary)
        
    except Exception as e:
        logger.error(f"Error getting summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/kpis", response_model=APIResponse)
async def get_kpis():
    """Get key performance indicators"""
    try:
        cached_kpis = cache_manager.get("kpis")
        if cached_kpis:
            return APIResponse(success=True, data=cached_kpis)
        
        kpis = await data_service.calculate_kpis()
        cache_manager.set("kpis", kpis, ttl=1800)  # 30 min cache
        
        return APIResponse(success=True, data=kpis)
        
    except Exception as e:
        logger.error(f"Error calculating KPIs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Geographic Data Endpoints
@app.get("/api/geographic/states", response_model=APIResponse)
async def get_geographic_states():
    """Get state-level geographic data"""
    try:
        cached_data = cache_manager.get("geo_states")
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        states_data = await data_service.get_geographic_summary("state")
        cache_manager.set("geo_states", states_data, ttl=3600)
        
        return APIResponse(success=True, data=states_data)
        
    except Exception as e:
        logger.error(f"Error getting state data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/geographic/districts", response_model=APIResponse)
async def get_geographic_districts(
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(100, ge=1, le=500, description="Limit results")
):
    """Get district-level geographic data"""
    try:
        cache_key = f"geo_districts_{state}_{limit}"
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        districts_data = await data_service.get_geographic_summary("district", state, limit)
        cache_manager.set(cache_key, districts_data, ttl=1800)
        
        return APIResponse(success=True, data=districts_data)
        
    except Exception as e:
        logger.error(f"Error getting district data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/geographic/heatmap", response_model=APIResponse)
async def get_heatmap_data():
    """Get optimized heatmap data for frontend"""
    try:
        cached_data = cache_manager.get("heatmap_data")
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        heatmap_data = await data_service.get_heatmap_data()
        cache_manager.set("heatmap_data", heatmap_data, ttl=3600)
        
        return APIResponse(success=True, data=heatmap_data)
        
    except Exception as e:
        logger.error(f"Error generating heatmap data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Temporal Data Endpoints
@app.get("/api/temporal/daily", response_model=APIResponse)
async def get_daily_trends(
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    days_back: int = Query(30, ge=1, le=90, description="Days to look back")
):
    """Get daily temporal trends"""
    try:
        cache_key = f"daily_trends_{service_type}_{days_back}"
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        daily_data = await data_service.get_temporal_data("daily", service_type, days_back)
        cache_manager.set(cache_key, daily_data, ttl=1800)
        
        return APIResponse(success=True, data=daily_data)
        
    except Exception as e:
        logger.error(f"Error getting daily trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/temporal/weekly", response_model=APIResponse)
async def get_weekly_patterns():
    """Get weekly pattern analysis"""
    try:
        cached_data = cache_manager.get("weekly_patterns")
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        weekly_data = await data_service.get_weekly_patterns()
        cache_manager.set("weekly_patterns", weekly_data, ttl=3600)
        
        return APIResponse(success=True, data=weekly_data)
        
    except Exception as e:
        logger.error(f"Error getting weekly patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Demographics Endpoints
@app.get("/api/demographics/age-distribution", response_model=APIResponse)
async def get_age_distribution():
    """Get age group distribution analysis"""
    try:
        cached_data = cache_manager.get("age_distribution")
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        age_data = await data_service.get_age_distribution()
        cache_manager.set("age_distribution", age_data, ttl=3600)
        
        return APIResponse(success=True, data=age_data)
        
    except Exception as e:
        logger.error(f"Error getting age distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/demographics/service-preferences", response_model=APIResponse)
async def get_service_preferences():
    """Get service preferences by demographics"""
    try:
        cached_data = cache_manager.get("service_preferences")
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        preferences_data = await data_service.get_service_preferences()
        cache_manager.set("service_preferences", preferences_data, ttl=3600)
        
        return APIResponse(success=True, data=preferences_data)
        
    except Exception as e:
        logger.error(f"Error getting service preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ML Endpoints
@app.post("/api/ml/clustering", response_model=APIResponse)
async def run_clustering(
    background_tasks: BackgroundTasks,
    n_clusters: int = Query(5, ge=2, le=10, description="Number of clusters")
):
    """Run geographic clustering analysis"""
    try:
        cache_key = f"clustering_{n_clusters}"
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        clustering_results = await ml_service.run_clustering(n_clusters)
        cache_manager.set(cache_key, clustering_results, ttl=7200)  # 2 hour cache
        
        return APIResponse(success=True, data=clustering_results)
        
    except Exception as e:
        logger.error(f"Error running clustering: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/anomalies", response_model=APIResponse)
async def detect_anomalies(
    contamination: float = Query(0.1, ge=0.01, le=0.3, description="Contamination rate")
):
    """Run anomaly detection"""
    try:
        cache_key = f"anomalies_{contamination}"
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        anomaly_results = await ml_service.detect_anomalies(contamination)
        cache_manager.set(cache_key, anomaly_results, ttl=3600)
        
        return APIResponse(success=True, data=anomaly_results)
        
    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/forecast", response_model=APIResponse)
async def generate_forecast(
    days: int = Query(7, ge=1, le=30, description="Days to forecast")
):
    """Generate volume forecasting"""
    try:
        cache_key = f"forecast_{days}"
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return APIResponse(success=True, data=cached_data)
        
        forecast_results = await ml_service.generate_forecast(days)
        cache_manager.set(cache_key, forecast_results, ttl=3600)
        
        return APIResponse(success=True, data=forecast_results)
        
    except Exception as e:
        logger.error(f"Error generating forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Utility Endpoints
@app.get("/api/states", response_model=APIResponse)
@app.get("/api/metadata/states", response_model=APIResponse)
async def get_states():
    """Get list of available states"""
    try:
        states = await data_service.get_states()
        return APIResponse(success=True, data={"states": states})
        
    except Exception as e:
        logger.error(f"Error getting states: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metadata/districts", response_model=APIResponse)
async def get_districts(state: Optional[str] = Query(None)):
    """Get list of districts, optionally filtered by state"""
    try:
        districts = await data_service.get_districts(state)
        return APIResponse(success=True, data={"districts": districts})
        
    except Exception as e:
        logger.error(f"Error getting districts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Performance monitoring
@app.get("/api/performance", response_model=APIResponse)
async def get_performance_metrics():
    """Get API performance metrics"""
    try:
        metrics = {
            "memory_usage": cache_manager.get_memory_usage(),
            "cache_stats": cache_manager.get_stats(),
            "uptime": datetime.now().isoformat(),
            "active_connections": "N/A"
        }
        
        return APIResponse(success=True, data=metrics)
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ML Model Performance & Accuracy
@app.get("/api/ml/performance", response_model=APIResponse)
async def get_ml_model_performance():
    """Get comprehensive ML model performance metrics and accuracy scores"""
    try:
        performance = await ml_service.get_model_performance()
        return APIResponse(
            success=True, 
            data=performance,
            message="ML model performance metrics calculated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting ML performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ml/improvements", response_model=APIResponse)
async def get_ml_improvements():
    """Get detailed recommendations for improving ML model accuracy"""
    try:
        recommendations = await ml_service.get_improvement_recommendations()
        return APIResponse(
            success=True,
            data=recommendations,
            message="Improvement recommendations generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/save-models", response_model=APIResponse)
async def save_ml_models():
    """Save all trained ML models to disk (PKL files) for persistence"""
    try:
        result = await ml_service.save_all_models()
        return APIResponse(
            success=result['success'],
            data=result,
            message="Models saved successfully" if result['success'] else "Error saving models"
        )
        
    except Exception as e:
        logger.error(f"Error saving models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/load-models", response_model=APIResponse)
async def load_ml_models():
    """Load previously saved ML models from disk"""
    try:
        result = await ml_service.load_saved_models()
        return APIResponse(
            success=result['success'],
            data=result,
            message=f"Loaded {result.get('total_count', 0)} models" if result['success'] else "Error loading models"
        )
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable in production
        workers=1,     # Single worker for 4GB RAM
        log_level="info",
        access_log=True
    )