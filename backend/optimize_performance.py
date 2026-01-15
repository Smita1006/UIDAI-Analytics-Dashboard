"""
Quick Performance Optimization Script
Run this to dramatically improve API performance
"""

import subprocess
import sys
import os
from pathlib import Path

def optimize_performance():
    print("🚀 UIDAI Analytics Performance Optimizer")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("app/main.py").exists():
        print("❌ Please run this script from the backend directory")
        return
    
    print("1. 🧹 Clearing old cache and models...")
    
    # Clear old cache
    cache_dir = Path("data/cache")
    if cache_dir.exists():
        for file in cache_dir.glob("*"):
            if file.is_file():
                file.unlink()
        print("   ✅ Cache cleared")
    
    # Clear old models
    models_dir = Path("data/models")
    if models_dir.exists():
        for file in models_dir.glob("*.pkl"):
            file.unlink()
        print("   ✅ Old models cleared")
    
    print("\n2. 🔄 Pre-warming system (this may take a few minutes)...")
    
    try:
        # Run the pre-warming script
        result = subprocess.run([
            sys.executable, "pre_warm_system.py"
        ], capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print("   ✅ System pre-warming completed successfully!")
            print("   🎯 All models are now cached for fast response")
        else:
            print(f"   ⚠️ Pre-warming had some issues:")
            print(f"   {result.stderr}")
    except Exception as e:
        print(f"   ❌ Error during pre-warming: {e}")
    
    print("\n3. 📊 Performance Tips:")
    print("   • Models are now cached - no more training on each request")
    print("   • API responses are cached for 24 hours")
    print("   • Data is stored in optimized Parquet format")
    print("   • Check /api/performance for real-time metrics")
    
    print("\n✨ Optimization complete! Your API should now be much faster.")
    print("💡 Run this script again if you update your data or models.")

if __name__ == "__main__":
    optimize_performance()