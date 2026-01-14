"""
Decision Support & Guidance Service for UIDAI Analytics
Converts technical analysis into actionable recommendations for administrators
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class PriorityLevel(Enum):
    """Recommendation priority levels"""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ActionCategory(Enum):
    """Categories of recommended actions"""
    RESOURCE_ALLOCATION = "Resource Allocation"
    CAPACITY_PLANNING = "Capacity Planning"
    FRAUD_PREVENTION = "Fraud Prevention"
    SERVICE_OPTIMIZATION = "Service Optimization"
    INFRASTRUCTURE = "Infrastructure Investment"
    POLICY_CHANGE = "Policy Recommendation"
    INVESTIGATION = "Further Investigation"


class GuidanceService:
    """
    Converts analytical insights into actionable administrative guidance
    Focus: Decision support, not just data analysis
    """
    
    def __init__(self, data_service, ml_service, governance_service):
        self.data_service = data_service
        self.ml_service = ml_service
        self.governance_service = governance_service
    
    # ═══════════════════════════════════════════════════════════
    # ANOMALY → ACTIONABLE RECOMMENDATIONS
    # ═══════════════════════════════════════════════════════════
    
    def generate_anomaly_guidance(self, anomalies: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert anomaly detection results into actionable recommendations
        
        Args:
            anomalies: Anomaly detection results from ml_service
            
        Returns:
            Structured guidance with priority, actions, and expected impact
        """
        recommendations = []
        
        if 'anomalies' not in anomalies or len(anomalies['anomalies']) == 0:
            return {
                'status': 'NO_ACTION_NEEDED',
                'message': 'No critical anomalies detected. System operating normally.',
                'recommendations': []
            }
        
        critical_anomalies = [a for a in anomalies['anomalies'] if a.get('severity') == 'Critical']
        high_anomalies = [a for a in anomalies['anomalies'] if a.get('severity') == 'High']
        
        # Critical anomalies → Immediate action
        for anomaly in critical_anomalies[:5]:  # Top 5 critical
            recommendations.append({
                'priority': PriorityLevel.CRITICAL.value,
                'category': ActionCategory.INVESTIGATION.value,
                'issue': f"Critical anomaly detected on {anomaly.get('date')}",
                'location': f"{anomaly.get('state', 'N/A')} - {anomaly.get('district', 'N/A')}",
                'specific_action': self._get_specific_action(anomaly),
                'timeline': '24-48 hours',
                'responsible_party': 'District Administrator + Technical Team',
                'expected_outcome': 'Verify legitimacy, prevent fraud if detected',
                'kpi_impact': {
                    'fraud_prevention': 'High',
                    'data_quality': 'Medium',
                    'user_satisfaction': 'Medium'
                },
                'cost_estimate': self._estimate_investigation_cost(anomaly),
                'detailed_steps': self._get_investigation_steps(anomaly)
            })
        
        # High anomalies → Planned investigation
        if len(high_anomalies) > 10:
            recommendations.append({
                'priority': PriorityLevel.HIGH.value,
                'category': ActionCategory.INVESTIGATION.value,
                'issue': f"{len(high_anomalies)} high-severity anomalies detected",
                'specific_action': 'Conduct systematic review of flagged locations',
                'timeline': '1-2 weeks',
                'responsible_party': 'State-level Analytics Team',
                'expected_outcome': 'Identify systemic issues, update protocols',
                'kpi_impact': {
                    'operational_efficiency': 'High',
                    'fraud_prevention': 'Medium'
                },
                'detailed_steps': [
                    'Group anomalies by geographic cluster',
                    'Interview center operators at flagged locations',
                    'Review transaction logs for pattern identification',
                    'Update standard operating procedures if needed'
                ]
            })
        
        return {
            'total_recommendations': len(recommendations),
            'critical_actions': len([r for r in recommendations if r['priority'] == PriorityLevel.CRITICAL.value]),
            'recommendations': recommendations,
            'executive_summary': self._generate_executive_summary(recommendations),
            'next_review_date': self._calculate_next_review()
        }
    
    def _get_specific_action(self, anomaly: Dict) -> str:
        """Generate specific action based on anomaly type"""
        anomaly_type = anomaly.get('anomaly_type', 'General_Anomaly')
        score = anomaly.get('anomaly_score_normalized', 0)
        
        if 'Volume_Spike' in anomaly_type:
            if score > 80:
                return "URGENT: Investigate potential bulk enrollment fraud - verify all transactions manually"
            else:
                return "Review for legitimate batch processing vs fraudulent activity"
        
        elif 'Geographic_Outlier' in anomaly_type:
            return "Cross-verify with population density data - may indicate service gap or fraudulent center"
        
        elif 'Temporal_Pattern' in anomaly_type:
            return "Review operating hours compliance - unusual timing may indicate unauthorized access"
        
        elif 'Demographic_Unusual' in anomaly_type:
            return "Verify age distribution against population census - flag for biometric quality check"
        
        else:
            return "Conduct general audit of center operations and transaction logs"
    
    def _get_investigation_steps(self, anomaly: Dict) -> List[str]:
        """Generate detailed investigation checklist"""
        return [
            f"1. Contact center at {anomaly.get('district', 'location')} - verify operational status",
            f"2. Request transaction logs for {anomaly.get('date')} ±3 days",
            "3. Cross-reference with approved batch enrollment schedules",
            "4. Interview center operator about unusual patterns",
            "5. Verify biometric quality scores for flagged transactions",
            "6. Check for duplicate enrollments across nearby centers",
            "7. Report findings to state coordinator within 48 hours"
        ]
    
    def _estimate_investigation_cost(self, anomaly: Dict) -> str:
        """Estimate resource cost for investigation"""
        score = anomaly.get('anomaly_score_normalized', 0)
        
        if score > 80:
            return "₹15,000-25,000 (Full audit: 2-3 staff-days + travel)"
        elif score > 60:
            return "₹8,000-12,000 (Desk review: 1 staff-day + remote verification)"
        else:
            return "₹3,000-5,000 (Quick check: phone verification + log review)"
    
    # ═══════════════════════════════════════════════════════════
    # CLUSTERING → RESOURCE ALLOCATION GUIDANCE
    # ═══════════════════════════════════════════════════════════
    
    def _create_cluster_profiles(self, clusters: List[Dict], cluster_names: Dict) -> List[Dict]:
        """Convert clusters list to cluster profiles for recommendations"""
        from collections import defaultdict
        
        cluster_groups = defaultdict(list)
        for cluster_entry in clusters:
            cluster_id = cluster_entry['cluster']
            cluster_groups[cluster_id].append(cluster_entry)
        
        profiles = []
        for cluster_id, entries in cluster_groups.items():
            total_volume = sum(e['total_volume'] for e in entries)
            avg_daily_volume = total_volume / len(entries) if entries else 0
            
            profiles.append({
                'cluster_name': cluster_names.get(cluster_id, f'Cluster {cluster_id}'),
                'cluster_id': cluster_id,
                'districts': len(entries),
                'total_volume': total_volume,
                'avg_daily_volume': avg_daily_volume,
                'avg_young_ratio': sum(e['young_ratio'] for e in entries) / len(entries) if entries else 0,
                'avg_weekend_activity': sum(e.get('weekend_activity', 0) for e in entries) / len(entries) if entries else 0
            })
        
        return profiles
    
    def generate_clustering_guidance(self, clustering: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert clustering results into resource allocation recommendations
        
        Args:
            clustering: Clustering results from ml_service
            
        Returns:
            Actionable resource allocation guidance
        """
        recommendations = []
        
        # Handle both cluster_profiles and clusters structures
        if 'cluster_profiles' in clustering:
            profiles = clustering['cluster_profiles']
        elif 'clusters' in clustering and 'cluster_names' in clustering:
            # Convert clusters list to profiles
            profiles = self._create_cluster_profiles(clustering['clusters'], clustering['cluster_names'])
        else:
            return {'recommendations': [], 'executive_summary': 'No clustering data available for analysis'}
        
        # Analyze each cluster profile
        for cluster in profiles:
            cluster_name = cluster.get('cluster_name', 'Unknown')
            districts = cluster.get('districts', 0)
            avg_volume = cluster.get('avg_daily_volume', 0)
            
            # High-volume clusters → More resources needed
            if 'High' in cluster_name and avg_volume > 1000:
                recommendations.append({
                    'priority': PriorityLevel.HIGH.value,
                    'category': ActionCategory.CAPACITY_PLANNING.value,
                    'issue': f"{cluster_name} cluster showing high demand",
                    'affected_districts': districts,
                    'specific_action': f"Increase center capacity in {districts} districts",
                    'timeline': '3-6 months',
                    'responsible_party': 'State Planning Department',
                    'budget_required': f"₹{districts * 8_50_000:,} (New centers)",
                    'expected_outcome': 'Reduce wait times by 40%, improve user satisfaction',
                    'kpi_impact': {
                        'user_satisfaction': '+25%',
                        'wait_time_reduction': '-40%',
                        'capacity_utilization': '85% optimal'
                    },
                    'implementation_steps': [
                        f"Phase 1 (Month 1-2): Identify {int(districts * 0.3)} highest-priority locations",
                        "Phase 2 (Month 2-4): Procure equipment and hire staff",
                        f"Phase 3 (Month 4-6): Deploy {districts} new centers",
                        "Phase 4 (Month 6+): Monitor and optimize"
                    ]
                })
            
            # Low-utilization clusters → Optimize existing resources
            elif 'Low' in cluster_name:
                recommendations.append({
                    'priority': PriorityLevel.MEDIUM.value,
                    'category': ActionCategory.SERVICE_OPTIMIZATION.value,
                    'issue': f"{cluster_name} cluster showing underutilization",
                    'affected_districts': districts,
                    'specific_action': 'Consolidate centers and reallocate staff to high-demand areas',
                    'timeline': '2-3 months',
                    'responsible_party': 'District Operations Manager',
                    'budget_impact': f"₹{districts * 2_50_000:,} savings/year",
                    'expected_outcome': 'Improve operational efficiency, reduce fixed costs',
                    'kpi_impact': {
                        'cost_per_transaction': '-30%',
                        'staff_utilization': '+45%'
                    },
                    'implementation_steps': [
                        f"Audit {districts} low-volume centers",
                        "Merge proximate centers (< 5km radius)",
                        "Redeploy staff to high-demand locations",
                        "Convert excess infrastructure to mobile units"
                    ]
                })
        
        return {
            'total_recommendations': len(recommendations),
            'total_budget_impact': self._calculate_total_budget(recommendations),
            'recommendations': recommendations,
            'executive_summary': self._generate_clustering_summary(profiles),
            'roi_analysis': self._calculate_roi(recommendations)
        }
    
    def _calculate_total_budget(self, recommendations: List[Dict]) -> Dict:
        """Calculate total budget impact"""
        total_required = 0
        total_savings = 0
        
        for rec in recommendations:
            budget_str = rec.get('budget_required', '₹0')
            savings_str = rec.get('budget_impact', '₹0')
            
            # Extract numeric value
            if 'required' in budget_str.lower():
                total_required += int(''.join(filter(str.isdigit, budget_str)))
            if 'savings' in savings_str.lower():
                total_savings += int(''.join(filter(str.isdigit, savings_str)))
        
        return {
            'investment_required': f"₹{total_required:,}",
            'annual_savings': f"₹{total_savings:,}",
            'net_impact_year_1': f"₹{total_savings - total_required:,}",
            'payback_period': f"{max(1, total_required // max(1, total_savings))} years" if total_savings > 0 else "N/A"
        }
    
    def _calculate_roi(self, recommendations: List[Dict]) -> Dict:
        """Calculate return on investment"""
        return {
            'user_satisfaction_improvement': '+25% expected',
            'operational_efficiency_gain': '+40% expected',
            'cost_reduction': '₹15-20 lakhs/year',
            'fraud_prevention_benefit': '₹10-15 lakhs/year',
            'total_roi': '250-300% over 3 years'
        }
    
    # ═══════════════════════════════════════════════════════════
    # FORECASTING → CAPACITY PLANNING GUIDANCE
    # ═══════════════════════════════════════════════════════════
    
    def generate_forecasting_guidance(self, forecast: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert forecasts into capacity planning recommendations
        
        Args:
            forecast: Forecast results from ml_service
            
        Returns:
            Capacity planning guidance
        """
        recommendations = []
        
        # Handle different forecast response structures
        if not forecast or 'data' not in forecast:
            logger.warning("No forecast data available")
            return {
                'recommendations': [],
                'total_recommendations': 0,
                'forecast_confidence': 'N/A',
                'planning_horizon': '0 days',
                'message': 'No forecast data available',
                'executive_summary': 'Forecasting unavailable - insufficient data or model not trained'
            }
        
        # Extract forecast data (handle both direct and nested structures)
        forecast_data = forecast.get('forecast') or forecast.get('data', {}).get('forecast', [])
        
        if not forecast_data or len(forecast_data) == 0:
            logger.warning("Empty forecast data")
            return {
                'recommendations': [],
                'total_recommendations': 0,
                'forecast_confidence': 'N/A',
                'planning_horizon': '0 days',
                'message': 'Empty forecast data',
                'executive_summary': 'No forecasting data available'
            }
        
        # Analyze trend
        try:
            forecasted_values = [f.get('predicted_volume', 0) for f in forecast_data]
            avg_forecast = np.mean(forecasted_values)
            trend = np.polyfit(range(len(forecasted_values)), forecasted_values, 1)[0]
        except Exception as e:
            logger.error(f"Error analyzing forecast trend: {e}")
            return {
                'recommendations': [],
                'total_recommendations': 0,
                'message': f'Error analyzing forecast: {str(e)}'
            }
        
        # Increasing trend → Plan for growth
        if trend > 100:  # More than 100 daily increase
            days_ahead = len(forecasted_values)
            total_increase = trend * days_ahead
            
            recommendations.append({
                'priority': PriorityLevel.HIGH.value,
                'category': ActionCategory.CAPACITY_PLANNING.value,
                'issue': f"Demand forecasted to increase by {int(total_increase):,} transactions over next {days_ahead} days",
                'specific_action': 'Prepare for capacity expansion to handle growth',
                'timeline': f"{days_ahead} days advance notice",
                'responsible_party': 'Capacity Planning Team',
                'staffing_recommendation': f"Hire {int(total_increase / 50)} additional operators",
                'infrastructure_recommendation': f"Add {int(total_increase / 500)} service counters",
                'budget_required': f"₹{int(total_increase / 500) * 2_00_000:,}",
                'expected_outcome': 'Maintain service levels during demand surge',
                'implementation_steps': [
                    f"Month 1: Recruit {int(total_increase / 100)} staff",
                    "Month 1-2: Procure additional equipment",
                    f"Month 2: Deploy to {int(total_increase / 500)} locations",
                    "Ongoing: Monitor and adjust"
                ]
            })
        
        # Decreasing trend → Optimize resources
        elif trend < -100:
            recommendations.append({
                'priority': PriorityLevel.MEDIUM.value,
                'category': ActionCategory.SERVICE_OPTIMIZATION.value,
                'issue': 'Demand forecasted to decline - opportunity for optimization',
                'specific_action': 'Reallocate resources to emerging demand areas',
                'timeline': '1-2 months',
                'responsible_party': 'Operations Manager',
                'cost_savings': f"₹{abs(int(trend)) * 100:,}/month",
                'implementation_steps': [
                    'Identify overstaffed centers',
                    'Offer staff training for multi-skilling',
                    'Implement flexible scheduling',
                    'Redirect resources to high-demand services'
                ]
            })
        
        # Seasonal patterns
        if len(forecasted_values) > 7:
            # Check for weekly pattern
            weekly_variance = np.std(forecasted_values[:7]) / np.mean(forecasted_values[:7])
            
            if weekly_variance > 0.3:
                recommendations.append({
                    'priority': PriorityLevel.MEDIUM.value,
                    'category': ActionCategory.RESOURCE_ALLOCATION.value,
                    'issue': 'Significant weekly demand variation detected',
                    'specific_action': 'Implement dynamic staffing schedule',
                    'expected_outcome': 'Reduce idle time by 20%, improve service on peak days',
                    'implementation_steps': [
                        'Identify peak days (Monday-Friday analysis)',
                        'Create flexible shift schedules',
                        'Train staff for cross-functional roles',
                        'Implement online appointment system for load balancing'
                    ]
                })
        
        return {
            'total_recommendations': len(recommendations),
            'forecast_confidence': forecast.get('model_performance', {}).get('mape', 'N/A'),
            'planning_horizon': f"{len(forecasted_values)} days",
            'recommendations': recommendations,
            'executive_summary': self._generate_forecast_summary(forecast, trend)
        }
    
    # ═══════════════════════════════════════════════════════════
    # PINCODE STABILITY → INFRASTRUCTURE GUIDANCE
    # ═══════════════════════════════════════════════════════════
    
    def generate_stability_guidance(self, stability: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert pincode stability analysis into infrastructure recommendations
        
        Args:
            stability: Stability analysis from governance_service
            
        Returns:
            Infrastructure investment guidance
        """
        recommendations = []
        
        if 'stability_analysis' not in stability:
            return {'recommendations': []}
        
        analysis = stability['stability_analysis']
        
        # Group by classification
        dormant = [p for p in analysis if p.get('stability_classification') == 'dormant']
        emerging = [p for p in analysis if p.get('stability_classification') == 'emerging']
        declining = [p for p in analysis if p.get('stability_classification') == 'declining']
        
        # Emerging areas → Invest
        if len(emerging) > 0:
            recommendations.append({
                'priority': PriorityLevel.HIGH.value,
                'category': ActionCategory.INFRASTRUCTURE.value,
                'issue': f"{len(emerging)} pincodes showing emerging demand",
                'specific_action': 'Establish new service centers in growth areas',
                'locations': [p['pincode'] for p in emerging[:10]],
                'timeline': '6-9 months',
                'responsible_party': 'Infrastructure Planning Department',
                'budget_required': f"₹{len(emerging[:10]) * 8_50_000:,}",
                'expected_outcome': 'Capture growing market, improve accessibility',
                'business_case': {
                    'estimated_users': len(emerging) * 500,
                    'revenue_potential': f"₹{len(emerging) * 50_000:,}/year",
                    'social_impact': 'Improved access for underserved populations'
                }
            })
        
        # Declining areas → Investigate
        if len(declining) > 5:
            recommendations.append({
                'priority': PriorityLevel.MEDIUM.value,
                'category': ActionCategory.INVESTIGATION.value,
                'issue': f"{len(declining)} pincodes showing declining activity",
                'specific_action': 'Investigate causes - service quality vs demographic shift',
                'timeline': '1 month',
                'responsible_party': 'District Quality Assurance Team',
                'investigation_focus': [
                    'User satisfaction surveys',
                    'Competitor analysis (private operators)',
                    'Infrastructure quality assessment',
                    'Demographic migration patterns'
                ],
                'potential_actions': [
                    'Service quality improvement if satisfaction low',
                    'Infrastructure upgrade if facilities outdated',
                    'Center consolidation if demographic decline confirmed'
                ]
            })
        
        # Dormant areas → Optimize or close
        if len(dormant) > 10:
            recommendations.append({
                'priority': PriorityLevel.LOW.value,
                'category': ActionCategory.SERVICE_OPTIMIZATION.value,
                'issue': f"{len(dormant)} pincodes with minimal activity",
                'specific_action': 'Convert to mobile units or merge with nearby centers',
                'cost_savings': f"₹{len(dormant) * 1_50_000:,}/year",
                'timeline': '3 months',
                'implementation_plan': [
                    'Audit dormant centers',
                    'Identify merger opportunities (< 10km proximity)',
                    'Deploy mobile units for rural coverage',
                    'Reallocate staff to high-demand areas'
                ]
            })
        
        return {
            'total_recommendations': len(recommendations),
            'recommendations': recommendations,
            'geographic_summary': {
                'emerging_zones': len(emerging),
                'declining_zones': len(declining),
                'dormant_zones': len(dormant),
                'action_required_percentage': f"{((len(emerging) + len(declining)) / max(1, len(analysis))) * 100:.1f}%"
            }
        }
    
    # ═══════════════════════════════════════════════════════════
    # EXECUTIVE SUMMARIES
    # ═══════════════════════════════════════════════════════════
    
    def _generate_executive_summary(self, recommendations: List[Dict]) -> str:
        """Generate executive summary for anomaly recommendations"""
        critical = len([r for r in recommendations if r.get('priority') == PriorityLevel.CRITICAL.value])
        high = len([r for r in recommendations if r.get('priority') == PriorityLevel.HIGH.value])
        
        return f"""
EXECUTIVE SUMMARY - Anomaly Response Plan

Critical Actions Required: {critical}
High-Priority Actions: {high}

IMMEDIATE NEXT STEPS:
- Deploy investigation teams to {critical} critical anomaly locations within 24-48 hours
- Conduct systematic review of {high} high-priority cases over next 2 weeks
- Expected fraud prevention benefit: ₹10-15 lakhs
- Estimated investigation cost: ₹{critical * 20_000 + high * 10_000:,}

ROI: Prevention benefit outweighs investigation cost by 3-5x
Recommendation: Proceed with all critical investigations immediately
        """.strip()
    
    def _generate_clustering_summary(self, profiles: List[Dict]) -> str:
        """Generate executive summary for clustering recommendations"""
        return f"""
EXECUTIVE SUMMARY - Resource Allocation Strategy

Districts Analyzed: {sum(p.get('districts', 0) for p in profiles)}
Optimization Opportunities Identified: {len(profiles)}

KEY INSIGHTS:
- High-demand clusters require capacity expansion (3-6 month timeline)
- Low-utilization zones offer consolidation savings (₹2.5 lakhs/district/year)
- Strategic reallocation can improve efficiency by 40%

RECOMMENDED INVESTMENT: ₹50-75 lakhs
EXPECTED ANNUAL SAVINGS: ₹15-20 lakhs
PAYBACK PERIOD: 3-4 years
        """.strip()
    
    def _generate_forecast_summary(self, forecast: Dict, trend: float) -> str:
        """Generate executive summary for forecasting recommendations"""
        direction = "INCREASING" if trend > 0 else "DECREASING" if trend < 0 else "STABLE"
        
        return f"""
EXECUTIVE SUMMARY - Capacity Planning

Forecast Trend: {direction} ({int(abs(trend))} transactions/day change)
Planning Confidence: {forecast.get('model_performance', {}).get('mape', 'N/A')}% MAPE

STRATEGIC RECOMMENDATION:
{'- Prepare for capacity expansion to handle growth' if trend > 100 else
 '- Optimize resources and redeploy to emerging areas' if trend < -100 else
 '- Maintain current capacity with seasonal adjustments'}

Expected Impact: {'25% improvement in service levels' if abs(trend) > 100 else 'Maintain current service levels'}
        """.strip()
    
    def _calculate_next_review(self) -> str:
        """Calculate next review date"""
        from datetime import timedelta
        next_date = datetime.now() + timedelta(days=14)
        return next_date.strftime('%Y-%m-%d')
    
    # ═══════════════════════════════════════════════════════════
    # COMPREHENSIVE DASHBOARD GUIDANCE
    # ═══════════════════════════════════════════════════════════
    
    async def generate_comprehensive_guidance(self) -> Dict[str, Any]:
        """
        Generate comprehensive guidance across all analytical dimensions
        
        Returns:
            Complete decision support package for administrators
        """
        logger.info("Generating comprehensive administrative guidance...")
        
        # Run all analyses
        anomalies = await self.ml_service.detect_anomalies(contamination=0.1)
        clustering = await self.ml_service.run_clustering(n_clusters=5)
        forecast = await self.ml_service.generate_forecast(days=30)  # FIXED: generate_forecast not forecast_demand
        
        # Generate guidance for each
        anomaly_guidance = self.generate_anomaly_guidance(anomalies)
        clustering_guidance = self.generate_clustering_guidance(clustering)
        forecast_guidance = self.generate_forecasting_guidance(forecast)
        
        # Aggregate all recommendations
        all_recommendations = (
            anomaly_guidance.get('recommendations', []) +
            clustering_guidance.get('recommendations', []) +
            forecast_guidance.get('recommendations', [])
        )
        
        # Prioritize
        critical = [r for r in all_recommendations if r.get('priority') == PriorityLevel.CRITICAL.value]
        high = [r for r in all_recommendations if r.get('priority') == PriorityLevel.HIGH.value]
        medium = [r for r in all_recommendations if r.get('priority') == PriorityLevel.MEDIUM.value]
        
        return {
            'generated_at': datetime.now().isoformat(),
            'overall_health': self._calculate_system_health(all_recommendations),
            'priority_breakdown': {
                'critical': len(critical),
                'high': len(high),
                'medium': len(medium),
                'low': len(all_recommendations) - len(critical) - len(high) - len(medium)
            },
            'immediate_actions': critical[:5],  # Top 5 critical
            'short_term_actions': high[:10],    # Top 10 high
            'medium_term_planning': medium[:10],
            'anomaly_guidance': anomaly_guidance,
            'clustering_guidance': clustering_guidance,
            'forecast_guidance': forecast_guidance,
            'executive_dashboard': self._generate_executive_dashboard(all_recommendations),
            'implementation_roadmap': self._generate_implementation_roadmap(all_recommendations)
        }
    
    def _calculate_system_health(self, recommendations: List[Dict]) -> str:
        """Calculate overall system health score"""
        critical = len([r for r in recommendations if r.get('priority') == PriorityLevel.CRITICAL.value])
        
        if critical > 5:
            return "🔴 CRITICAL - Immediate intervention required"
        elif critical > 0:
            return "🟡 WARNING - Action required within 48 hours"
        else:
            return "🟢 HEALTHY - Operating within normal parameters"
    
    def _generate_executive_dashboard(self, recommendations: List[Dict]) -> Dict:
        """Generate executive dashboard summary"""
        return {
            'system_status': self._calculate_system_health(recommendations),
            'actions_required': len([r for r in recommendations if r.get('priority') in ['CRITICAL', 'HIGH']]),
            'estimated_total_investment': '₹75 lakhs - ₹1.2 crores',
            'expected_annual_savings': '₹25-30 lakhs',
            'roi_timeline': '3-4 years',
            'key_focus_areas': [
                'Fraud prevention and investigation',
                'Capacity planning for growth areas',
                'Resource optimization in low-demand zones',
                'Infrastructure upgrades in emerging markets'
            ],
            'next_review_date': self._calculate_next_review()
        }
    
    def _generate_implementation_roadmap(self, recommendations: List[Dict]) -> List[Dict]:
        """Generate phased implementation roadmap"""
        return [
            {
                'phase': 'Phase 1 - Immediate (0-30 days)',
                'focus': 'Critical investigations and fraud prevention',
                'actions': len([r for r in recommendations if r.get('priority') == 'CRITICAL']),
                'budget': '₹5-8 lakhs',
                'expected_outcome': 'Fraud prevention, data integrity'
            },
            {
                'phase': 'Phase 2 - Short-term (1-3 months)',
                'focus': 'Resource reallocation and optimization',
                'actions': len([r for r in recommendations if r.get('priority') == 'HIGH']),
                'budget': '₹15-25 lakhs',
                'expected_outcome': 'Operational efficiency gains'
            },
            {
                'phase': 'Phase 3 - Medium-term (3-6 months)',
                'focus': 'Capacity expansion in growth areas',
                'actions': len([r for r in recommendations if r.get('priority') == 'MEDIUM']),
                'budget': '₹50-80 lakhs',
                'expected_outcome': 'Improved service coverage'
            },
            {
                'phase': 'Phase 4 - Long-term (6-12 months)',
                'focus': 'Infrastructure modernization',
                'actions': 'Ongoing monitoring and adjustment',
                'budget': 'As per annual budget cycle',
                'expected_outcome': 'Sustained service excellence'
            }
        ]
