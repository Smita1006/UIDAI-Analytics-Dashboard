"""
Production ML Service for UIDAI Analytics
Memory-efficient ML operations for large datasets
"""

import logging
import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from scipy import stats
import joblib
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class MLService:
    """Production ML service optimized for large datasets"""
    
    def __init__(self, data_service):
        self.data_service = data_service
        self.models = {}
        self.scalers = {}
        self.model_path = Path("data/models")
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def initialize(self):
        """Initialize ML service"""
        logger.info("🤖 Initializing ML service...")
        
        try:
            # Create models directory
            self.model_path.mkdir(parents=True, exist_ok=True)
            
            # Pre-train some models for faster response
            await self._pretrain_models()
            
            logger.info("✅ ML service initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize ML service: {e}")
            raise
    
    async def _pretrain_models(self):
        """Pre-train commonly used models"""
        try:
            # Check if models already exist
            clustering_model_path = self.model_path / "geographic_clustering_5.pkl"
            
            if not clustering_model_path.exists():
                logger.info("🔄 Pre-training geographic clustering model...")
                await self.run_clustering(n_clusters=5, save_model=True)
                
        except Exception as e:
            logger.warning(f"⚠️ Could not pre-train models: {e}")
    
    async def run_clustering(self, n_clusters: int = 5, save_model: bool = False) -> Dict[str, Any]:
        """Run geographic clustering analysis"""
        try:
            logger.info(f"🎯 Running geographic clustering with {n_clusters} clusters...")
            
            # Get data from data service
            df = self.data_service.unified_data
            
            # Run clustering in thread pool
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor, self._run_clustering_sync, df, n_clusters, save_model
            )
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in clustering: {e}")
            raise
    
    def _run_clustering_sync(self, df: pd.DataFrame, n_clusters: int, save_model: bool) -> Dict[str, Any]:
        """Synchronous clustering implementation"""
        # Aggregate by district for clustering
        district_features = df.groupby(['state', 'district']).agg({
            'total_count': ['sum', 'mean', 'std'],
            'young_count': 'sum',
            'adult_count': 'sum'
        }).fillna(0)
        
        # Flatten column names
        district_features.columns = ['_'.join(col).strip() if col[1] else col[0] 
                                   for col in district_features.columns]
        
        # Calculate additional features
        district_features['young_ratio'] = (
            district_features['young_count_sum'] / 
            (district_features['total_count_sum'] + 1)
        )
        district_features['adult_ratio'] = (
            district_features['adult_count_sum'] / 
            (district_features['total_count_sum'] + 1)
        )
        district_features['volume_consistency'] = (
            district_features['total_count_std'] / 
            (district_features['total_count_mean'] + 1)
        )
        
        # Select features for clustering
        feature_cols = [
            'total_count_sum', 'total_count_mean', 
            'young_ratio', 'adult_ratio', 'volume_consistency'
        ]
        features = district_features[feature_cols].fillna(0)
        
        # Use MiniBatchKMeans for large datasets (memory efficient)
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Store scaler
        self.scalers[f'clustering_{n_clusters}'] = scaler
        
        # Perform clustering
        kmeans = MiniBatchKMeans(
            n_clusters=n_clusters, 
            random_state=42, 
            batch_size=1000,
            n_init=3,  # Reduced for speed
            max_iter=100
        )
        cluster_labels = kmeans.fit_predict(features_scaled)
        
        # Calculate silhouette score on a sample for large datasets
        if len(features_scaled) > 1000:
            sample_indices = np.random.choice(len(features_scaled), 1000, replace=False)
            sample_features = features_scaled[sample_indices]
            sample_labels = cluster_labels[sample_indices]
            silhouette_avg = silhouette_score(sample_features, sample_labels)
        else:
            silhouette_avg = silhouette_score(features_scaled, cluster_labels)
        
        # Add results to dataframe
        district_features['cluster'] = cluster_labels
        district_features['cluster_name'] = district_features['cluster'].map({
            0: 'High Volume Centers',
            1: 'Moderate Activity', 
            2: 'Low Volume Rural',
            3: 'Youth-Focused Areas',
            4: 'Consistent Service Areas'
        })
        
        # Store model
        self.models[f'clustering_{n_clusters}'] = kmeans
        
        if save_model:
            model_path = self.model_path / f"geographic_clustering_{n_clusters}.pkl"
            joblib.dump({
                'model': kmeans,
                'scaler': scaler,
                'features': feature_cols
            }, model_path)
        
        # Generate cluster summary
        cluster_summary = district_features.groupby('cluster').agg({
            'total_count_sum': ['mean', 'count'],
            'young_ratio': 'mean',
            'adult_ratio': 'mean',
            'volume_consistency': 'mean'
        }).round(3)
        
        # Convert results for API response
        clusters_list = []
        for (state, district), row in district_features.iterrows():
            clusters_list.append({
                'state': state,
                'district': district,
                'cluster': int(row['cluster']),
                'cluster_name': row.get('cluster_name', f'Cluster {row["cluster"]}'),
                'total_volume': int(row['total_count_sum']),
                'young_ratio': round(float(row['young_ratio']), 3),
                'adult_ratio': round(float(row['adult_ratio']), 3),
                'volume_consistency': round(float(row['volume_consistency']), 3)
            })
        
        return {
            'clusters': clusters_list,
            'summary': {
                'n_clusters': n_clusters,
                'silhouette_score': round(silhouette_avg, 3),
                'total_districts': len(clusters_list),
                'cluster_sizes': district_features['cluster'].value_counts().to_dict()
            },
            'cluster_stats': cluster_summary.to_dict('index')
        }
    
    async def detect_anomalies(self, contamination: float = 0.1) -> Dict[str, Any]:
        """Run anomaly detection on service patterns"""
        try:
            logger.info(f"🚨 Running anomaly detection with {contamination} contamination...")
            
            df = self.data_service.unified_data
            
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor, self._detect_anomalies_sync, df, contamination
            )
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in anomaly detection: {e}")
            raise
    
    def _detect_anomalies_sync(self, df: pd.DataFrame, contamination: float) -> Dict[str, Any]:
        """Synchronous anomaly detection implementation"""
        # Prepare daily aggregate data
        daily_data = df.groupby(['date', 'state', 'district']).agg({
            'total_count': 'sum',
            'young_count': 'sum',
            'adult_count': 'sum'
        }).reset_index()
        
        # Feature engineering for anomaly detection
        daily_data['young_ratio'] = daily_data['young_count'] / (daily_data['total_count'] + 1)
        daily_data['adult_ratio'] = daily_data['adult_count'] / (daily_data['total_count'] + 1)
        
        # Calculate rolling statistics for each district
        daily_data = daily_data.sort_values(['state', 'district', 'date'])
        daily_data['volume_7day_avg'] = (
            daily_data.groupby(['state', 'district'])['total_count']
            .transform(lambda x: x.rolling(window=7, min_periods=1).mean())
        )
        daily_data['volume_deviation'] = abs(
            daily_data['total_count'] - daily_data['volume_7day_avg']
        )
        
        # Prepare features for anomaly detection
        features = ['total_count', 'young_ratio', 'adult_ratio', 'volume_deviation']
        feature_data = daily_data[features].fillna(0)
        
        # Method 1: Statistical outliers (Z-score)
        z_scores = np.abs(stats.zscore(feature_data, axis=0, nan_policy='omit'))
        daily_data['z_score_anomaly'] = (z_scores > 3).any(axis=1)
        
        # Method 2: IQR-based outliers
        Q1 = daily_data['total_count'].quantile(0.25)
        Q3 = daily_data['total_count'].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        daily_data['iqr_anomaly'] = (
            (daily_data['total_count'] < lower_bound) | 
            (daily_data['total_count'] > upper_bound)
        )
        
        # Method 3: Isolation Forest (on a sample for large datasets)
        if len(feature_data) > 10000:
            sample_size = 10000
            sample_indices = np.random.choice(len(feature_data), sample_size, replace=False)
            sample_features = feature_data.iloc[sample_indices]
            
            isolation_forest = IsolationForest(
                contamination=contamination, 
                random_state=42,
                n_estimators=50  # Reduced for speed
            )
            sample_predictions = isolation_forest.fit_predict(sample_features)
            
            # Apply model to full dataset
            full_predictions = isolation_forest.predict(feature_data)
            daily_data['isolation_anomaly'] = full_predictions == -1
        else:
            isolation_forest = IsolationForest(contamination=contamination, random_state=42)
            daily_data['isolation_anomaly'] = isolation_forest.fit_predict(feature_data) == -1
        
        # Combine anomaly signals
        daily_data['anomaly_score'] = (
            daily_data['z_score_anomaly'].astype(int) +
            daily_data['iqr_anomaly'].astype(int) +
            daily_data['isolation_anomaly'].astype(int)
        )
        daily_data['is_anomaly'] = daily_data['anomaly_score'] >= 2
        
        # Store model
        self.models['anomaly_detector'] = isolation_forest if 'isolation_forest' in locals() else None
        
        # Get anomalies for response
        anomalies = daily_data[daily_data['is_anomaly'] == True].copy()
        
        # Convert to API response format
        anomaly_list = []
        for _, row in anomalies.head(200).iterrows():  # Limit for API response
            anomaly_list.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'state': row['state'],
                'district': row['district'],
                'total_count': int(row['total_count']),
                'young_ratio': round(float(row['young_ratio']), 3),
                'anomaly_score': int(row['anomaly_score']),
                'volume_deviation': round(float(row['volume_deviation']), 1),
                'is_anomaly': True
            })
        
        # Summary statistics
        anomaly_by_state = anomalies['state'].value_counts().head(10).to_dict()
        anomaly_by_method = {
            'z_score': int(daily_data['z_score_anomaly'].sum()),
            'iqr': int(daily_data['iqr_anomaly'].sum()),
            'isolation_forest': int(daily_data['isolation_anomaly'].sum()),
            'combined': int(daily_data['is_anomaly'].sum())
        }
        
        return {
            'anomalies': anomaly_list,
            'summary': {
                'total_anomalies': int(daily_data['is_anomaly'].sum()),
                'anomaly_rate': round(float(daily_data['is_anomaly'].mean()), 4),
                'contamination_used': contamination,
                'total_records_analyzed': len(daily_data)
            },
            'by_state': anomaly_by_state,
            'by_method': anomaly_by_method
        }
    
    async def generate_forecast(self, days: int = 7) -> Dict[str, Any]:
        """Generate time series forecasting"""
        try:
            logger.info(f"📈 Generating {days}-day forecast...")
            
            df = self.data_service.unified_data
            
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor, self._generate_forecast_sync, df, days
            )
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in forecasting: {e}")
            raise
    
    def _generate_forecast_sync(self, df: pd.DataFrame, days: int) -> Dict[str, Any]:
        """Synchronous forecasting implementation"""
        # Aggregate daily volumes
        daily_volumes = df.groupby('date')['total_count'].sum().sort_index()
        
        # Simple exponential smoothing for forecasting
        # Calculate trend and seasonality components
        values = daily_volumes.values
        
        # Simple moving average forecast
        window_size = min(7, len(values) // 2)
        if len(values) < 2:
            raise ValueError("Insufficient data for forecasting")
        
        # Calculate trend
        recent_values = values[-window_size:]
        trend = (recent_values[-1] - recent_values[0]) / (len(recent_values) - 1)
        
        # Generate forecasts
        last_value = values[-1]
        forecasts = []
        forecast_dates = pd.date_range(
            start=daily_volumes.index[-1] + pd.Timedelta(days=1),
            periods=days
        )
        
        for i in range(days):
            # Simple trend-based forecast with some randomness dampening
            forecast_value = last_value + (trend * (i + 1))
            
            # Add some bounds
            forecast_value = max(forecast_value, 0)
            
            forecasts.append(forecast_value)
        
        # Calculate prediction intervals using historical volatility
        historical_std = np.std(values)
        
        # Build forecast response
        forecast_list = []
        historical_list = []
        
        for i, (date, forecast) in enumerate(zip(forecast_dates, forecasts)):
            # Prediction intervals get wider over time
            uncertainty = historical_std * (1 + i * 0.1)
            
            forecast_list.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_volume': round(float(forecast), 0),
                'lower_bound': round(float(max(forecast - 1.96 * uncertainty, 0)), 0),
                'upper_bound': round(float(forecast + 1.96 * uncertainty), 0),
                'confidence_interval': 0.95
            })
        
        # Add recent historical data for context
        recent_historical = daily_volumes.tail(14)
        for date, volume in recent_historical.items():
            historical_list.append({
                'date': date.strftime('%Y-%m-%d'),
                'actual_volume': int(volume)
            })
        
        # Calculate forecast metrics
        avg_prediction = np.mean(forecasts)
        trend_direction = "increasing" if trend > 0 else "decreasing" if trend < 0 else "stable"
        
        return {
            'forecast': forecast_list,
            'historical': historical_list,
            'summary': {
                'forecast_days': days,
                'average_prediction': round(float(avg_prediction), 0),
                'trend_direction': trend_direction,
                'daily_trend': round(float(trend), 1),
                'confidence_level': 0.95,
                'model_type': 'trend_based'
            },
            'metadata': {
                'historical_data_points': len(daily_volumes),
                'last_actual_date': daily_volumes.index[-1].strftime('%Y-%m-%d'),
                'last_actual_volume': int(daily_volumes.iloc[-1])
            }
        }
    
    async def calculate_risk_scores(self) -> Dict[str, Any]:
        """Calculate risk scores for districts"""
        try:
            logger.info("⚠️ Calculating district risk scores...")
            
            df = self.data_service.unified_data
            
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor, self._calculate_risk_scores_sync, df
            )
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error calculating risk scores: {e}")
            raise
    
    def _calculate_risk_scores_sync(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Synchronous risk score calculation"""
        # Aggregate by district
        district_stats = df.groupby(['state', 'district']).agg({
            'total_count': ['sum', 'std', 'count'],
            'young_count': 'sum',
            'adult_count': 'sum'
        }).reset_index()
        
        # Flatten column names
        district_stats.columns = ['state', 'district'] + [
            '_'.join(col).strip() if col[1] else col[0] 
            for col in district_stats.columns[2:]
        ]
        
        # Calculate risk factors
        district_stats['volume_variability'] = (
            district_stats['total_count_std'] / 
            (district_stats['total_count_sum'] + 1)
        )
        district_stats['service_frequency'] = district_stats['total_count_count']
        district_stats['volume_rank'] = district_stats['total_count_sum'].rank(ascending=False)
        
        # Normalize risk factors (0-1 scale)
        if len(district_stats) > 1:
            district_stats['variability_risk'] = (
                (district_stats['volume_variability'] - district_stats['volume_variability'].min()) /
                (district_stats['volume_variability'].max() - district_stats['volume_variability'].min())
            ).fillna(0)
            
            district_stats['frequency_risk'] = (
                1 - (district_stats['service_frequency'] - district_stats['service_frequency'].min()) /
                (district_stats['service_frequency'].max() - district_stats['service_frequency'].min())
            ).fillna(0)
        else:
            district_stats['variability_risk'] = 0
            district_stats['frequency_risk'] = 0
        
        # Combine risk factors
        district_stats['composite_risk_score'] = (
            0.4 * district_stats['variability_risk'] +
            0.3 * district_stats['frequency_risk'] +
            0.3 * (district_stats['volume_rank'] / len(district_stats))
        )
        
        # Risk categories
        district_stats['risk_category'] = pd.cut(
            district_stats['composite_risk_score'],
            bins=[0, 0.3, 0.6, 1.0],
            labels=['Low Risk', 'Medium Risk', 'High Risk']
        )
        
        # Convert to API response format
        risk_list = []
        for _, row in district_stats.iterrows():
            risk_list.append({
                'state': row['state'],
                'district': row['district'],
                'total_volume': int(row['total_count_sum']),
                'risk_score': round(float(row['composite_risk_score']), 3),
                'risk_category': str(row['risk_category']),
                'volume_variability': round(float(row['volume_variability']), 3),
                'service_frequency': int(row['service_frequency'])
            })
        
        # Summary statistics
        risk_distribution = district_stats['risk_category'].value_counts().to_dict()
        
        return {
            'risk_scores': risk_list,
            'summary': {
                'total_districts': len(risk_list),
                'average_risk_score': round(float(district_stats['composite_risk_score'].mean()), 3),
                'risk_distribution': risk_distribution,
                'high_risk_count': risk_distribution.get('High Risk', 0)
            }
        }