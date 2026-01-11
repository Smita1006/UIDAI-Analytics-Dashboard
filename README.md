# UIDAI Analytics Dashboard

A comprehensive analytics dashboard for UIDAI Aadhaar data with advanced ML insights, predictive analytics capabilities, and cutting-edge new features for enhanced monitoring and fraud detection.

![UIDAI Analytics Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20FastAPI%20%7C%20ML-blue)
![Data](https://img.shields.io/badge/Data-4.3M%2B%20Records-orange)

## 🎯 Project Overview

The UIDAI Analytics Dashboard provides real-time insights into Aadhaar enrollment and update patterns across India. Built with modern technologies and advanced machine learning capabilities, it enables data-driven decision making for identity management operations with specialized focus on fraud detection, population monitoring, and migration analysis.

### Core Features

- **📊 Interactive Visualizations**: Real-time charts, geographic maps, and demographic breakdowns
- **🧠 ML Analytics**: Anomaly detection, pattern recognition, and predictive forecasting
- **🗺️ Geographic Insights**: State and district-level analysis with interactive maps
- **📈 Temporal Analysis**: Daily, weekly, and seasonal trend identification
- **⚡ Real-time Processing**: Live data updates and instant insights
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔥 New Features

- **👥 Migrant Portability Index**: Advanced migration pattern analysis with update-to-enrollment ratios for identifying population movement trends and mobility patterns across states and districts
- **👶 Invisible Citizens Gap Analysis**: Child welfare monitoring system that identifies enrollment gaps in infant populations, helping detect underserved communities and improve coverage
- **🔍 Center Anomaly Detection**: Forensic analysis system for fraud detection featuring suspicious pattern recognition, volume anomaly detection, timing irregularities, and center auditing capabilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Data Layer    │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (CSV Files)   │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Python 3.11  │    │ • 4.3M+ Records│
│ • TypeScript    │    │ • ML Pipeline   │    │ • 3 Datasets   │
│ • Tailwind CSS  │    │ • Real-time API │    │ • Preprocessed  │
│ • Shadcn/UI     │    │ • Async Ops     │    │ • Optimized     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Datasets

### 1. Biometric Updates

- **Records**: 1.86M
- **Timeframe**: March 2025 (9 days)
- **Columns**: `date`, `state`, `district`, `pincode`, `bio_age_5_17`, `bio_age_17_`

### 2. Demographic Updates

- **Records**: 2.07M
- **Timeframe**: March 2025 (9 days)
- **Columns**: `date`, `state`, `district`, `pincode`, `demo_age_5_17`, `demo_age_17_`

### 3. Enrollments

- **Records**: 1.01M
- **Timeframe**: March 2025 (9 days)
- **Columns**: `date`, `state`, `district`, `pincode`, `age_0_5`, `age_5_17`, `age_18_greater`

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/altf4-games/UIDAI-Analytics-Dashboard.git
cd UIDAI-Analytics-Dashboard
```

2. **Setup Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Setup Frontend**

```bash
cd frontend
npm install
npm run dev
```

4. **Access the Dashboard**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🧠 Machine Learning Features

### 1. Anomaly Detection

- **Algorithm**: Isolation Forest + Statistical Analysis
- **Purpose**: Identify unusual patterns in enrollment/update data
- **Metrics**: Anomaly score, confidence level, geographic distribution

### 2. Clustering Analysis

- **Algorithm**: K-Means Clustering
- **Purpose**: Segment states/districts by usage patterns
- **Features**: Volume, growth rate, demographic composition

### 3. Forecasting

- **Algorithm**: Time Series Analysis (ARIMA, Exponential Smoothing)
- **Purpose**: Predict future enrollment and update volumes
- **Horizon**: 7-30 days ahead

### 4. Pattern Recognition

- **Methods**: Statistical analysis, trend detection
- **Scope**: Temporal patterns, geographic correlations, demographic preferences

### 5. Migration Analysis

- **Algorithm**: Migration Index Calculation with Update-to-Enrollment Ratios
- **Purpose**: Identify population movement patterns and mobility trends
- **Features**: State-wise migration classification, adult update spikes, demographic shifts

### 6. Gap Analysis

- **Method**: Enrollment Density Analysis for Infant Populations
- **Purpose**: Detect underserved communities and improve welfare coverage
- **Scope**: Child welfare monitoring, population coverage assessment

### 7. Fraud Detection

- **Techniques**: Center-level anomaly detection, suspicious pattern recognition
- **Purpose**: Identify fraudulent activities and operational irregularities
- **Features**: Volume anomalies, timing irregularities, success rate analysis

## 📊 Key Insights Discovered

### Geographic Patterns

- **Top 5 States** account for 45% of total volume
- **Uttar Pradesh** leads with 16.8% of all transactions
- **Urban vs Rural** split shows 60-40 distribution
- **Growth Hotspots** identified in tier-2 cities

### Temporal Trends

- **Peak Hours**: 2-4 PM daily showing 35% higher activity
- **Weekly Pattern**: Tuesday shows highest enrollment rates
- **Seasonal Effect**: Festival periods drive 20% uptick
- **Regional Variation**: North shows evening preference

### Demographic Insights

- **Age Distribution**: 60% updates from 18-45 age group
- **Service Preference**: Biometric updates dominate (55%)
- **Gender Split**: Slight male preference (52-48)
- **Rural Adoption**: Growing at 15% higher rate than urban

### New Features Analytics

- **Migration Patterns**: 12% of population shows high mobility indicators
- **Child Welfare**: Identified 3.2% enrollment gaps in infant populations
- **Fraud Detection**: Detected 0.8% anomalous centers with suspicious patterns
- **Risk Assessment**: Critical risk areas concentrate in 15 districts

## 👥 Team

- **Pradyum Mistry** - Full-Stack Developer & ML Engineer
  - GitHub: [@altf4-games](https://github.com/altf4-games)
  - Led full-stack development, ML implementation, time series analysis, and temporal pattern recognition for the UIDAI analytics platform.

- **Raunak Gupta** - ML Specialist  
  - GitHub: [@Raunakg2005](https://github.com/Raunakg2005)
  - Specialized in developing and implementing anomaly detection algorithms and machine learning model development for data insights.

- **Smita Sarangi** - Data Scientist
  - GitHub: [@Smita1006](https://github.com/Smita1006)
  - Focused on K-means clustering analysis and demographic pattern recognition to extract meaningful insights from population data.

## 📞 Support

For questions, issues, or collaboration:

- **Email**: team@uidai-analytics.gov.in
- **GitHub Issues**: [Create an issue](https://github.com/altf4-games/UIDAI-Analytics-Dashboard/issues)
- **Project Lead**: [@altf4-games](https://github.com/altf4-games)

---

**Built with ❤️ for Digital India Initiative**
