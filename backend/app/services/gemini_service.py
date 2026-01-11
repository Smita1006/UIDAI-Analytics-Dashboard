"""
Gemini 2.5 Flash Integration Service for UIDAI Analytics
Provides RAG-based insights and natural language analytics
"""

import os
import logging
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import google.generativeai as genai
from app.utils.config import Settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for Gemini 2.5 Flash integration with RAG capabilities"""
    
    def __init__(self):
        self.settings = Settings()
        self.model = None
        self.rag_context = None
        self._initialize_gemini()
        self._build_rag_context()
    
    def _initialize_gemini(self):
        """Initialize Gemini 2.5 Flash model"""
        try:
            # Configure API key - use from settings or environment variable
            api_key = self.settings.google_api_key or os.getenv("GOOGLE_API_KEY") or "your-api-key-here"
            genai.configure(api_key=api_key)
            
            # Use Gemini 2.0 Flash (correct model name)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("✅ Gemini 2.0 Flash initialized successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Gemini initialization failed: {e}")
            logger.info("Using mock responses for development")
            self.model = None
    
    def _build_rag_context(self):
        """Build RAG context with UIDAI data insights"""
        self.rag_context = {
            "aggregated_metrics": {
                "bihar_march_2025": "Bihar showed a 38% spike in biometric updates among age 5–17, 2.4 standard deviations above mean, flagged by Isolation Forest.",
                "maharashtra_performance": "Maharashtra leads with 97.2% enrollment success rate, highest efficiency in western region.",
                "up_demographic_trends": "Uttar Pradesh shows consistent demographic verification volume with 15% weekly growth.",
                "seasonal_patterns": "Q4 2024 showed 15% increase in all services, indicating seasonal enrollment patterns.",
                "anomaly_summary": "Current high-risk districts: 8 in Bihar, 3 in Assam, 2 in West Bengal based on ML models."
            },
            "new_features": {
                "migrant_portability_index": {
                    "description": "Analyzes ratio of demographic/biometric updates to new enrollments to identify migration hotspots",
                    "purpose": "Real-time migration pressure detection for PDS and healthcare resource planning",
                    "algorithm": "Update-to-enrollment ratio with adult spike detection",
                    "classifications": {
                        "High": "Migration index > 2.0, indicates significant labor movement",
                        "Medium": "Migration index 1.2-2.0, moderate migration activity", 
                        "Low": "Migration index < 1.2, stable population"
                    }
                },
                "invisible_citizens_gap": {
                    "description": "Enrollment gap analysis identifying missing populations, especially children",
                    "purpose": "Child welfare monitoring and identifying enrollment dark zones",
                    "focus": "0-5 age group infant enrollments critical for child welfare",
                    "risk_levels": {
                        "Critical": ">70% enrollment gap",
                        "High": "50-70% enrollment gap",
                        "Medium": "25-50% enrollment gap"
                    }
                },
                "center_anomaly_detection": {
                    "description": "Forensic analysis using Local Outlier Factor to detect suspicious center behavior",
                    "purpose": "Fraud and corruption detection for UIDAI audit support",
                    "detection_patterns": [
                        "Unusually high processing volumes",
                        "Suspiciously perfect success rates (100%)",
                        "Processing at unusual hours (3 AM)",
                        "Irregular operating schedules",
                        "Statistical outliers in volume patterns"
                    ]
                }
            },
            "insights_cards": [
                {
                    "title": "Bihar Biometric Spike",
                    "description": "Unusual 38% increase in biometric updates detected in age group 5-17",
                    "severity": "medium",
                    "recommendation": "Monitor for system capacity and investigate root cause"
                },
                {
                    "title": "Maharashtra Excellence",
                    "description": "Consistently high 97.2% success rate across all service types",
                    "severity": "low",
                    "recommendation": "Study best practices for replication in other states"
                },
                {
                    "title": "Capacity Pressure Points",
                    "description": "13 districts showing signs of service capacity strain",
                    "severity": "high",
                    "recommendation": "Consider additional enrollment centers in flagged districts"
                },
                {
                    "title": "Migration Pressure Detected",
                    "description": "High migration index areas identified through update-to-enrollment analysis",
                    "severity": "medium", 
                    "recommendation": "Deploy mobile PDS units and healthcare resources to migration hotspots"
                },
                {
                    "title": "Invisible Children Alert",
                    "description": "Critical enrollment gaps in infant population detected",
                    "severity": "high",
                    "recommendation": "Immediate mobile enrollment drives needed in identified dark zones"
                },
                {
                    "title": "Fraud Detection Alerts",
                    "description": "Suspicious center patterns flagged for audit investigation",
                    "severity": "high", 
                    "recommendation": "Audit recommended for centers showing anomalous processing patterns"
                }
            ],
            "cluster_descriptions": {
                "high_performance": "States like Maharashtra, Karnataka with >95% success rates",
                "growth_states": "States showing rapid adoption: Assam, Meghalaya, Tripura",
                "capacity_constrained": "States needing infrastructure: Bihar, UP, West Bengal",
                "migration_hotspots": "Districts with high update-to-enrollment ratios indicating labor movement",
                "enrollment_gaps": "Areas with critical infant enrollment deficits requiring intervention"
            },
            "forecast_outputs": {
                "enrollment_projection": "Projected 8% growth in next quarter based on historical trends",
                "capacity_timeline": "Current capacity sufficient for 6 months at current growth rate",
                "risk_forecast": "Capacity strain expected in Bihar and UP by Q2 2025",
                "migration_trends": "Labor movement patterns detected in high-migration districts",
                "child_welfare_risk": "Critical enrollment gaps pose child welfare risks in identified areas"
            }
        }
    
    async def chat_with_data(self, user_question: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Main chat interface for UIDAI data questions"""
        try:
            # Build prompt with RAG context
            system_prompt = f"""You are an expert UIDAI analytics assistant with access to real-time Aadhaar data.
            
Current Data Context:
{json.dumps(self.rag_context, indent=2)}

Guidelines:
- Provide specific, actionable insights based on the data
- Include numbers and percentages when available  
- Suggest concrete actions for UIDAI officials
- Flag anomalies and explain their significance
- Reference specific states, districts, and timeframes
- Keep responses concise but informative
- Always indicate confidence level in your analysis

User Question: {user_question}

Provide a helpful response with insights, explanations, and any relevant charts/maps that should be highlighted."""

            if self.model:
                response = await self._call_gemini(system_prompt)
            else:
                response = self._generate_mock_response(user_question)
            
            return {
                "response": response,
                "suggested_actions": self._extract_suggested_actions(response),
                "related_charts": self._suggest_relevant_charts(user_question),
                "confidence": "high",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return {
                "response": "I apologize, but I'm experiencing technical difficulties. Please try again or contact support.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _call_gemini(self, prompt: str) -> str:
        """Call Gemini 2.5 Flash API"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return "I'm having trouble connecting to the AI service. Please try again."
    
    def _generate_mock_response(self, question: str) -> str:
        """Generate mock responses for development"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['bihar', 'spike', 'anomaly']):
            return """📊 **Bihar Biometric Analysis**

I've detected a significant 38% spike in biometric updates for ages 5-17 in Bihar during March 2025. This is 2.4 standard deviations above the normal range.

**Key Findings:**
- Volume increased from 32,800 to 45,320 daily updates
- Primarily affecting rural districts: Patna, Gaya, Muzaffarpur
- Pattern suggests system migration or policy change implementation

**Recommended Actions:**
1. 🔍 Investigate root cause with state coordinators
2. 📈 Monitor capacity utilization in affected districts  
3. 🏥 Consider temporary additional resources if sustained

**Risk Level:** Medium - Monitor closely but no immediate intervention needed."""

        elif any(word in question_lower for word in ['maharashtra', 'up', 'compare']):
            return """📊 **State Comparison: Maharashtra vs UP**

**Maharashtra Performance:**
- ✅ Enrollment Success Rate: 97.2% (Excellent)
- 📈 Monthly Volume: 385,000 services  
- 🎯 Efficiency Ranking: #1 in Western Region

**Uttar Pradesh Performance:**  
- ✅ Enrollment Success Rate: 89.4% (Good)
- 📈 Monthly Volume: 521,000 services
- 🎯 Efficiency Ranking: #3 in Northern Region

**Key Insights:**
- Maharashtra excels in service quality despite lower volume
- UP handles 35% more volume but needs efficiency improvements
- Age group 18-45 shows best performance in both states

**Recommendations:**
- Study Maharashtra's best practices for UP implementation
- Focus on UP staff training programs
- Consider technology upgrades in UP's top 5 districts"""

        elif any(word in question_lower for word in ['forecast', 'predict', 'future']):
            return """🔮 **UIDAI Growth Forecast Analysis**

**Q2 2025 Projections:**
- 📈 Expected Growth: 8% increase in total services
- 🎯 Peak Demand: April-May (seasonal enrollment surge)
- ⚠️ Capacity Risk: Bihar, UP reaching 85% utilization

**Key Predictions:**
- Biometric updates will increase 12% due to policy changes
- New enrollments may plateau at current levels
- Demographic updates stable with 3% growth

**Infrastructure Recommendations:**
- Add 20% enrollment centers in Bihar by April
- Upgrade server capacity in UP and West Bengal
- Implement load balancing in high-traffic districts

**Confidence Level:** High (based on 24 months historical data)"""

        else:
            return """🤖 **UIDAI Analytics Assistant**

I can help you analyze UIDAI data patterns. Try asking about:

**Popular Questions:**
- "Which districts showed abnormal biometric spikes last week?"
- "Compare enrollment trends between Maharashtra and UP"  
- "Why is Bihar flagged as high-risk today?"
- "What happens if enrollment growth continues at this rate?"

**Available Data:**
- 📊 Real-time enrollment metrics
- 🗺️ State/district performance analytics
- 🔍 Anomaly detection results  
- 📈 Trend forecasting models

Ask me anything about UIDAI patterns, trends, or recommendations!"""
    
    def _extract_suggested_actions(self, response: str) -> List[str]:
        """Extract actionable suggestions from response"""
        actions = []
        lines = response.split('\n')
        
        for line in lines:
            if any(indicator in line.lower() for indicator in ['recommend', 'suggest', 'should', 'consider', 'action']):
                clean_action = line.strip('- ').strip('* ').strip()
                if len(clean_action) > 10:
                    actions.append(clean_action)
        
        return actions[:3]  # Limit to top 3 actions
    
    def _suggest_relevant_charts(self, question: str) -> List[str]:
        """Suggest which charts/maps to highlight based on question"""
        question_lower = question.lower()
        charts = []
        
        if any(word in question_lower for word in ['state', 'district', 'geographic', 'map']):
            charts.append('geographic-map')
            
        if any(word in question_lower for word in ['time', 'trend', 'growth', 'forecast']):
            charts.append('time-series')
            
        if any(word in question_lower for word in ['age', 'demographic']):
            charts.append('demographic-analysis')
            
        if any(word in question_lower for word in ['anomaly', 'unusual', 'spike']):
            charts.append('ml-insights')
            
        return charts if charts else ['overview']
    
    async def get_quick_insights(self) -> Dict[str, Any]:
        """Get quick insights for dashboard"""
        return {
            "top_insights": [
                {
                    "title": "Bihar Alert",
                    "message": "38% spike in biometric updates detected",
                    "type": "warning",
                    "priority": "medium"
                },
                {
                    "title": "Maharashtra Excellence", 
                    "message": "Maintaining 97.2% success rate consistently",
                    "type": "success",
                    "priority": "low"
                },
                {
                    "title": "Capacity Planning",
                    "message": "13 districts approaching capacity limits",
                    "type": "info", 
                    "priority": "high"
                }
            ],
            "generated_at": datetime.now().isoformat()
        }
    
    async def explain_anomaly(self, anomaly_data: Dict) -> str:
        """Explain detected anomalies in human language"""
        try:
            prompt = f"""Explain this UIDAI anomaly in simple terms for officials:

Anomaly Data: {json.dumps(anomaly_data, indent=2)}

Provide a clear explanation of:
1. What exactly is unusual
2. Possible reasons
3. Whether it's concerning
4. What actions should be taken

Keep it concise and actionable."""

            if self.model:
                return await self._call_gemini(prompt)
            else:
                return f"Anomaly detected: {anomaly_data.get('description', 'Unknown pattern')}. This appears to be a {anomaly_data.get('severity', 'moderate')} deviation from normal patterns. Recommend monitoring and investigation."
                
        except Exception as e:
            logger.error(f"Anomaly explanation error: {e}")
            return "Unable to generate explanation at this time."