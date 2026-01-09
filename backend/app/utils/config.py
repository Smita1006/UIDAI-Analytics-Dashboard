"""
Configuration settings for the API
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    api_title: str = "UIDAI Analytics API"
    api_version: str = "2.0.0"
    debug: bool = False
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 1
    
    # Data Configuration
    data_path: str = "../DATA"
    processed_data_path: str = "data/processed"
    models_path: str = "data/models"
    
    # Cache Configuration
    cache_ttl_summary: int = 3600  # 1 hour
    cache_ttl_kpis: int = 1800     # 30 minutes
    cache_ttl_geographic: int = 1800
    cache_ttl_temporal: int = 1800
    cache_ttl_ml: int = 7200       # 2 hours
    cache_max_size: int = 1000
    
    # Performance Configuration
    max_threads: int = 2
    chunk_size: int = 10000
    
    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()