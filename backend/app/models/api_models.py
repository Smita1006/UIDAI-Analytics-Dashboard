"""
Pydantic models for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime

class APIResponse(BaseModel):
    """Standard API response format"""
    success: bool
    data: Any
    message: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class DataSummary(BaseModel):
    """Data summary response model"""
    total_records: int
    date_range: Dict[str, str]
    unique_states: int
    unique_districts: int
    service_types: List[str]

class KPIData(BaseModel):
    """KPI response model"""
    total_volume: int
    daily_average: int
    peak_day_volume: int
    states_covered: int
    districts_covered: int
    service_distribution: Dict[str, int]
    young_vs_adult_ratio: Dict[str, int]

class GeographicData(BaseModel):
    """Geographic data response model"""
    state: str
    district: Optional[str] = None
    total_volume: int
    young_count: int
    adult_count: int
    young_ratio: float
    adult_ratio: float

class TemporalData(BaseModel):
    """Temporal data response model"""
    date: str
    service_type: str
    total_count: int

class ClusterData(BaseModel):
    cluster_id: int
    center: List[float]
    size: int
    states: List[str]
    avg_volume: float

class MigrantPortabilityData(BaseModel):
    """Migrant Portability Index response model"""
    state: str
    district: str
    migration_index: float
    update_to_enrollment_ratio: float
    new_enrollments: int
    updates: int
    migration_classification: str  # 'High', 'Medium', 'Low'
    adult_update_spike: bool

class InvisibleCitizensData(BaseModel):
    """Invisible Citizens Gap Analysis response model"""
    state: str
    district: str
    pincode: Optional[str] = None
    infant_enrollment_density: float
    expected_population: int
    actual_enrollments: int
    gap_percentage: float
    risk_level: str  # 'Critical', 'High', 'Medium', 'Low'
    age_group: str

class CenterAnomalyData(BaseModel):
    """Center Anomaly Detection response model"""
    pincode: str
    center_location: str
    state: str
    district: str
    anomaly_type: str
    anomaly_score: float
    suspicious_pattern: str
    processing_hours: List[str]
    success_rate: float
    volume_anomaly: bool
    timing_anomaly: bool
    risk_level: str  # 'Critical', 'High', 'Medium', 'Low'
    """Clustering result model"""
    state: str
    district: str
    cluster: int
    cluster_name: str
    total_volume: int
    young_ratio: float
    adult_ratio: float
    volume_consistency: float

class AnomalyData(BaseModel):
    """Anomaly detection result model"""
    date: str
    state: str
    district: str
    total_count: int
    young_ratio: float
    anomaly_score: int
    volume_deviation: float
    is_anomaly: bool

class ForecastData(BaseModel):
    """Forecast result model"""
    date: str
    predicted_volume: float
    lower_bound: float
    upper_bound: float
    confidence_interval: float

class RiskData(BaseModel):
    """Risk score result model"""
    state: str
    district: str
    total_volume: int
    risk_score: float
    risk_category: str
    volume_variability: float
    service_frequency: int

# Request models for ML operations
class ClusteringRequest(BaseModel):
    """Clustering request parameters"""
    n_clusters: int = Field(default=5, ge=2, le=10)

class AnomalyRequest(BaseModel):
    """Anomaly detection request parameters"""
    contamination: float = Field(default=0.1, ge=0.01, le=0.3)

class ForecastRequest(BaseModel):
    """Forecasting request parameters"""
    days: int = Field(default=7, ge=1, le=30)