#!/bin/bash

# VPS Memory Optimization Script for UIDAI Analytics
# This script sets environment variables for production VPS deployment

echo "🔧 Configuring VPS environment for UIDAI Analytics..."

# Python memory optimizations
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# FastAPI worker configuration for VPS
export WORKERS=1
export MAX_WORKERS=1

# Data processing limits for VPS
export VPS_MEMORY_LIMIT=1
export DATA_SAMPLE_SIZE=50000
export MAX_CENTERS=2000

# Pandas/NumPy optimizations
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
export NUMEXPR_NUM_THREADS=1

# Cache configuration for limited memory
export CACHE_MAX_SIZE=500
export CACHE_TTL_DEFAULT=1800

echo "✅ VPS environment configured"

# Optional: Add swap file if not exists (run as root)
if [ "$(id -u)" = "0" ]; then
    if [ ! -f /swapfile ]; then
        echo "💾 Creating 2GB swap file for VPS..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        echo "✅ Swap file created and activated"
    fi
fi

echo "🚀 Ready for VPS deployment"