"""
Production Data Service for UIDAI Analytics
Memory-optimized for large datasets
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class DataService:
    """Production data service optimized for 2M+ records"""
    
    def __init__(self):
        self.data_path = Path("../dataset")
        self.processed_path = Path("data/processed")
        self.unified_data: Optional[pd.DataFrame] = None
        self.metadata: Dict = {}
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def initialize(self):
        """Initialize data service with memory optimization"""
        logger.info("🔄 Initializing data service...")
        
        try:
            # Create processed directory
            self.processed_path.mkdir(parents=True, exist_ok=True)
            
            # Load or process data
            await self._load_or_process_data()
            
            # Generate metadata
            await self._generate_metadata()
            
            logger.info(f"✅ Data service initialized with {len(self.unified_data):,} records")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize data service: {e}")
            raise
    
    async def _load_or_process_data(self):
        """Load processed data or process raw data if needed"""
        processed_file = self.processed_path / "unified_optimized.parquet"
        
        if processed_file.exists():
            logger.info("📂 Loading processed data from parquet...")
            self.unified_data = await asyncio.get_event_loop().run_in_executor(
                self.executor, pd.read_parquet, processed_file
            )
        else:
            logger.info("⚙️ Processing raw data...")
            await self._process_raw_data()
            
            # Save optimized format
            await asyncio.get_event_loop().run_in_executor(
                self.executor, 
                lambda: self.unified_data.to_parquet(processed_file, engine='pyarrow', compression='snappy')
            )
    
    async def _process_raw_data(self):
        """Process raw CSV files with memory optimization"""
        try:
            datasets = {}
            
            # Process each dataset type
            for dataset_type in ['biometric', 'demographic', 'enrolment']:
                logger.info(f"📊 Processing {dataset_type} data...")
                
                file_pattern = f"api_data_aadhar_{dataset_type}/*.csv"
                files = list(self.data_path.glob(file_pattern))
                
                if not files:
                    logger.warning(f"⚠️ No files found for {dataset_type}")
                    continue
                
                # Read and concatenate files with chunking for memory efficiency
                chunks = []
                for file in files:
                    logger.info(f"  📄 Reading {file.name}")
                    chunk = await asyncio.get_event_loop().run_in_executor(
                        self.executor,
                        lambda f: pd.read_csv(f, dtype={'pincode': 'string'}),
                        file
                    )
                    chunks.append(chunk)
                
                # Concatenate and optimize
                df = pd.concat(chunks, ignore_index=True)
                df = await self._optimize_dataset(df, dataset_type)
                datasets[dataset_type] = df
                
                logger.info(f"  ✅ {dataset_type}: {len(df):,} records")
            
            # Create unified dataset
            self.unified_data = await self._create_unified_dataset(datasets)
            
        except Exception as e:
            logger.error(f"❌ Error processing raw data: {e}")
            raise
    
    async def _optimize_dataset(self, df: pd.DataFrame, dataset_type: str) -> pd.DataFrame:
        """Optimize individual dataset for memory and performance"""
        
        # Convert date column
        df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
        
        # Optimize string columns
        df['state'] = df['state'].astype('category')
        df['district'] = df['district'].astype('category')
        
        # Remove duplicates
        initial_len = len(df)
        df = df.drop_duplicates()
        if len(df) < initial_len:
            logger.info(f"    🧹 Removed {initial_len - len(df):,} duplicates")
        
        # Dataset-specific optimizations
        if dataset_type == 'biometric':
            df['total_count'] = df['bio_age_5_17'] + df['bio_age_17_']
            df['young_count'] = df['bio_age_5_17']
            df['adult_count'] = df['bio_age_17_']
            
        elif dataset_type == 'demographic':
            df['total_count'] = df['demo_age_5_17'] + df['demo_age_17_']
            df['young_count'] = df['demo_age_5_17']
            df['adult_count'] = df['demo_age_17_']
            
        elif dataset_type == 'enrolment':
            df['total_count'] = df['age_0_5'] + df['age_5_17'] + df['age_18_greater']
            df['young_count'] = df['age_0_5'] + df['age_5_17']
            df['adult_count'] = df['age_18_greater']
        
        # Add service type
        df['service_type'] = dataset_type
        
        # Convert numeric columns to optimal types
        numeric_cols = ['total_count', 'young_count', 'adult_count']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], downcast='unsigned')
        
        return df
    
    async def _create_unified_dataset(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Create unified dataset with common schema"""
        
        # Common columns
        common_cols = ['date', 'state', 'district', 'pincode', 'total_count', 'young_count', 'adult_count', 'service_type']
        
        unified_chunks = []
        for name, df in datasets.items():
            # Select common columns
            chunk = df[common_cols].copy()
            unified_chunks.append(chunk)
        
        # Concatenate all datasets
        unified = pd.concat(unified_chunks, ignore_index=True)
        
        # Add derived features
        unified['day_of_week'] = unified['date'].dt.day_name().astype('category')
        unified['week_number'] = unified['date'].dt.isocalendar().week.astype('uint8')
        unified['month'] = unified['date'].dt.month.astype('uint8')
        unified['is_weekend'] = unified['date'].dt.weekday >= 5
        
        # Calculate ratios
        unified['young_ratio'] = unified['young_count'] / (unified['total_count'] + 1)
        unified['adult_ratio'] = unified['adult_count'] / (unified['total_count'] + 1)
        
        # Sort by date for time series analysis
        unified = unified.sort_values('date').reset_index(drop=True)
        
        logger.info(f"✅ Created unified dataset: {len(unified):,} records")
        return unified
    
    async def _generate_metadata(self):
        """Generate metadata for quick access"""
        if self.unified_data is None:
            return
        
        self.metadata = {
            'total_records': len(self.unified_data),
            'date_range': {
                'start': self.unified_data['date'].min(),
                'end': self.unified_data['date'].max()
            },
            'unique_states': self.unified_data['state'].nunique(),
            'unique_districts': self.unified_data['district'].nunique(),
            'service_types': self.unified_data['service_type'].unique().tolist(),
            'memory_usage_mb': round(self.unified_data.memory_usage(deep=True).sum() / 1024**2, 2)
        }
        
        logger.info(f"📊 Dataset metadata: {self.metadata['memory_usage_mb']}MB in memory")
    
    # API Methods for Frontend
    
    async def get_summary(self) -> Dict[str, Any]:
        """Get data summary for dashboard"""
        return {
            'total_records': self.metadata['total_records'],
            'date_range': {
                'start': self.metadata['date_range']['start'].strftime('%Y-%m-%d'),
                'end': self.metadata['date_range']['end'].strftime('%Y-%m-%d')
            },
            'unique_states': self.metadata['unique_states'],
            'unique_districts': self.metadata['unique_districts'],
            'service_types': self.metadata['service_types']
        }
    
    async def calculate_kpis(self) -> Dict[str, Any]:
        """Calculate key performance indicators"""
        df = self.unified_data
        
        # Run calculations in thread pool
        kpis = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._calculate_kpis_sync, df
        )
        
        return kpis
    
    def _calculate_kpis_sync(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Synchronous KPI calculation"""
        return {
            'total_volume': int(df['total_count'].sum()),
            'daily_average': int(df.groupby('date')['total_count'].sum().mean()),
            'peak_day_volume': int(df.groupby('date')['total_count'].sum().max()),
            'states_covered': int(df['state'].nunique()),
            'districts_covered': int(df['district'].nunique()),
            'service_distribution': df.groupby('service_type')['total_count'].sum().to_dict(),
            'young_vs_adult_ratio': {
                'young_total': int(df['young_count'].sum()),
                'adult_total': int(df['adult_count'].sum())
            }
        }
    
    async def get_geographic_summary(
        self, 
        level: str = "state", 
        filter_state: Optional[str] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get geographic aggregation"""
        df = self.unified_data
        
        if filter_state:
            df = df[df['state'] == filter_state]
        
        # Run aggregation in thread pool
        result = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._aggregate_geographic_sync, df, level, limit
        )
        
        return result
    
    async def get_summary(self) -> Dict[str, Any]:
        """Get comprehensive data summary"""
        df = self.unified_data
        
        # Calculate summary stats
        total_records = len(df)
        biometric_records = len(df[df['service_type'] == 'biometric'])
        demographic_records = len(df[df['service_type'] == 'demographic'])
        enrollment_records = len(df[df['service_type'] == 'enrolment'])
        
        # Date range
        start_date = df['date'].min().strftime('%Y-%m-%d') if not df.empty else 'N/A'
        end_date = df['date'].max().strftime('%Y-%m-%d') if not df.empty else 'N/A'
        
        # State and district counts
        unique_states = df['state'].nunique()
        unique_districts = df['district'].nunique()
        
        return {
            'total_records': total_records,
            'biometric_updates': biometric_records,
            'demographic_updates': demographic_records,
            'enrollments': enrollment_records,
            'start_date': start_date,
            'end_date': end_date,
            'unique_states': unique_states,
            'unique_districts': unique_districts,
            'days_of_data': (pd.to_datetime(end_date) - pd.to_datetime(start_date)).days + 1 if start_date != 'N/A' else 0
        }
    
    async def get_age_distribution(self) -> Dict[str, Any]:
        """Get age group distribution across all services"""
        df = self.unified_data
        
        # Calculate age group totals
        young_total = df['young_count'].sum()
        adult_total = df['adult_count'].sum()
        total_count = df['total_count'].sum()
        
        age_groups = {
            '5-17 years': {
                'count': int(young_total),
                'percentage': (young_total / total_count * 100) if total_count > 0 else 0
            },
            '18+ years': {
                'count': int(adult_total),
                'percentage': (adult_total / total_count * 100) if total_count > 0 else 0
            }
        }
        
        # Add 0-5 years for enrollment data
        if 'child_count' in df.columns:
            child_total = df['child_count'].sum()
            total_with_children = total_count + child_total
            age_groups['0-5 years'] = {
                'count': int(child_total),
                'percentage': (child_total / total_with_children * 100) if total_with_children > 0 else 0
            }
            # Recalculate percentages
            age_groups['5-17 years']['percentage'] = (young_total / total_with_children * 100) if total_with_children > 0 else 0
            age_groups['18+ years']['percentage'] = (adult_total / total_with_children * 100) if total_with_children > 0 else 0
        
        return {
            'age_groups': age_groups,
            'total_analyzed': int(total_count)
        }
    
    async def get_service_preferences(self) -> Dict[str, Any]:
        """Get service preferences by age groups"""
        df = self.unified_data
        
        # Group by service type and calculate age distributions
        service_prefs = {}
        
        for service_type in df['service_type'].unique():
            service_df = df[df['service_type'] == service_type]
            
            young_count = service_df['young_count'].sum()
            adult_count = service_df['adult_count'].sum()
            total_service = service_df['total_count'].sum()
            
            service_prefs[service_type] = {
                'young_preference': (young_count / total_service * 100) if total_service > 0 else 0,
                'adult_preference': (adult_count / total_service * 100) if total_service > 0 else 0,
                'total_volume': int(total_service)
            }
        
        # By age analysis
        by_age = {
            'young': {},
            'adult': {}
        }
        
        total_young = df['young_count'].sum()
        total_adult = df['adult_count'].sum()
        
        for service_type in df['service_type'].unique():
            service_df = df[df['service_type'] == service_type]
            
            young_in_service = service_df['young_count'].sum()
            adult_in_service = service_df['adult_count'].sum()
            
            by_age['young'][service_type] = int(young_in_service)
            by_age['adult'][service_type] = int(adult_in_service)
        
        return {
            'by_service': service_prefs,
            'by_age': by_age,
            'summary': {
                'total_young': int(total_young),
                'total_adult': int(total_adult)
            }
        }

    def _aggregate_geographic_sync(self, df: pd.DataFrame, level: str, limit: int) -> List[Dict[str, Any]]:
        """Synchronous geographic aggregation"""
        if level == "state":
            group_cols = ['state']
        else:
            group_cols = ['state', 'district']
        
        agg_data = df.groupby(group_cols).agg({
            'total_count': 'sum',
            'young_count': 'sum',
            'adult_count': 'sum'
        }).reset_index()
        
        # Calculate ratios
        agg_data['young_ratio'] = agg_data['young_count'] / (agg_data['total_count'] + 1)
        agg_data['adult_ratio'] = agg_data['adult_count'] / (agg_data['total_count'] + 1)
        
        # Sort by total volume and limit
        agg_data = agg_data.sort_values('total_count', ascending=False).head(limit)
        
        return agg_data.to_dict('records')
    
    async def get_temporal_data(
        self, 
        granularity: str = "daily", 
        service_type: Optional[str] = None, 
        days_back: int = 30
    ) -> List[Dict[str, Any]]:
        """Get temporal trends data"""
        df = self.unified_data
        
        # Filter by service type if specified
        if service_type:
            df = df[df['service_type'] == service_type]
        
        # Filter by date range
        end_date = df['date'].max()
        start_date = end_date - pd.Timedelta(days=days_back)
        df = df[df['date'] >= start_date]
        
        # Run temporal aggregation in thread pool
        result = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._aggregate_temporal_sync, df, granularity
        )
        
        return result
    
    def _aggregate_temporal_sync(self, df: pd.DataFrame, granularity: str) -> List[Dict[str, Any]]:
        """Synchronous temporal aggregation"""
        if granularity == "daily":
            temporal_data = df.groupby(['date', 'service_type'])['total_count'].sum().reset_index()
            temporal_data['date_str'] = temporal_data['date'].dt.strftime('%Y-%m-%d')
            
            return temporal_data[['date_str', 'service_type', 'total_count']].rename(
                columns={'date_str': 'date'}
            ).to_dict('records')
        
        # Add other granularities as needed
        return []
    
    async def get_weekly_patterns(self) -> Dict[str, Any]:
        """Get day-of-week patterns"""
        df = self.unified_data
        
        result = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._analyze_weekly_patterns_sync, df
        )
        
        return result
    
    def _analyze_weekly_patterns_sync(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Synchronous weekly pattern analysis"""
        # Day of week analysis
        dow_data = df.groupby('day_of_week')['total_count'].sum().reindex([
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ]).fillna(0)
        
        # Service type by day of week
        service_dow = df.groupby(['day_of_week', 'service_type'])['total_count'].sum().unstack(fill_value=0)
        
        return {
            'day_of_week_totals': dow_data.to_dict(),
            'service_by_dow': service_dow.to_dict('index')
        }
    
    async def get_age_distribution(self) -> Dict[str, Any]:
        """Get age group distribution analysis"""
        df = self.unified_data
        
        result = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._analyze_age_distribution_sync, df
        )
        
        return result
    
    def _analyze_age_distribution_sync(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Synchronous age distribution analysis"""
        # Overall age distribution
        total_young = df['young_count'].sum()
        total_adult = df['adult_count'].sum()
        
        # Age distribution by service type
        service_age = df.groupby('service_type').agg({
            'young_count': 'sum',
            'adult_count': 'sum'
        })
        
        # Age distribution by state (top 10 states)
        state_totals = df.groupby('state')['total_count'].sum().sort_values(ascending=False).head(10)
        top_states = state_totals.index.tolist()
        
        state_age = df[df['state'].isin(top_states)].groupby('state').agg({
            'young_count': 'sum',
            'adult_count': 'sum'
        })
        
        return {
            'overall': {
                'young_total': int(total_young),
                'adult_total': int(total_adult),
                'young_percentage': round(total_young / (total_young + total_adult) * 100, 1)
            },
            'by_service': service_age.to_dict('index'),
            'by_top_states': state_age.to_dict('index')
        }
    
    async def get_service_preferences(self) -> Dict[str, Any]:
        """Get service preferences analysis"""
        df = self.unified_data
        
        result = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._analyze_service_preferences_sync, df
        )
        
        return result
    
    def _analyze_service_preferences_sync(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Synchronous service preferences analysis"""
        # Service type distribution
        service_dist = df.groupby('service_type')['total_count'].sum()
        
        # Service preferences by age group
        age_service = df.groupby('service_type').agg({
            'young_count': 'sum',
            'adult_count': 'sum',
            'total_count': 'sum'
        })
        
        age_service['young_percentage'] = (age_service['young_count'] / age_service['total_count'] * 100).round(1)
        age_service['adult_percentage'] = (age_service['adult_count'] / age_service['total_count'] * 100).round(1)
        
        return {
            'service_distribution': service_dist.to_dict(),
            'age_preferences': age_service.to_dict('index')
        }
    
    async def get_heatmap_data(self) -> Dict[str, Any]:
        """Get optimized heatmap data for frontend maps"""
        df = self.unified_data
        
        result = await asyncio.get_event_loop().run_in_executor(
            self.executor, self._generate_heatmap_data_sync, df
        )
        
        return result
    
    def _generate_heatmap_data_sync(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate heatmap data optimized for frontend"""
        # State-level aggregation for map coloring
        state_data = df.groupby('state').agg({
            'total_count': 'sum',
            'young_count': 'sum',
            'adult_count': 'sum'
        }).reset_index()
        
        state_data['young_ratio'] = state_data['young_count'] / (state_data['total_count'] + 1)
        
        # Top districts for markers
        district_data = df.groupby(['state', 'district']).agg({
            'total_count': 'sum',
            'young_count': 'sum',
            'adult_count': 'sum'
        }).reset_index()
        
        top_districts = district_data.sort_values('total_count', ascending=False).head(50)
        
        return {
            'states': state_data.to_dict('records'),
            'top_districts': top_districts.to_dict('records')
        }
    
    async def get_states(self) -> List[str]:
        """Get list of states"""
        return sorted(self.unified_data['state'].unique().tolist())
    
    async def get_districts(self, state: Optional[str] = None) -> List[str]:
        """Get list of districts, optionally filtered by state"""
        df = self.unified_data
        
        if state:
            df = df[df['state'] == state]
        
        return sorted(df['district'].unique().tolist())