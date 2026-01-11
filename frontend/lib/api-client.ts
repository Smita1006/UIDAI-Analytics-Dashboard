import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Handle different response formats
    if (response.data?.success !== undefined) {
      if (response.data.success) {
        return response.data.data || response.data;
      }
      throw new Error(response.data.message || "API request failed");
    }
    // Fallback for responses without success field
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Network error";
    throw new Error(message);
  }
);

export const apiClient = {
  // Health check
  health: () => api.get("/health"),

  // Data summary
  getSummary: () => api.get("/api/summary"),
  getKPIs: () => api.get("/api/kpis"),

  // Geographic data
  getGeographicOverview: () => api.get("/api/geographic/overview"),
  getGeographicStates: () => api.get("/api/geographic/states"),
  getGeographicDistricts: (state?: string, limit = 100) => {
    const params = new URLSearchParams();
    if (state) params.append("state", state);
    params.append("limit", limit.toString());
    return api.get(`/api/geographic/districts?${params}`);
  },
  getHeatmapData: () => api.get("/api/geographic/heatmap"),

  // Temporal data
  getTemporalDaily: (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.service_type && filters.service_type !== "all") {
      // Map enrollment to enrolment for the backend API call
      const backendServiceType =
        filters.service_type === "enrollment"
          ? "enrolment"
          : filters.service_type;
      params.append("service_type", backendServiceType);
    }
    if (filters.days_back)
      params.append("days_back", filters.days_back.toString());

    return api.get(`/api/temporal/daily?${params}`);
  },
  getWeeklyPatterns: (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.service_type && filters.service_type !== "all") {
      // Map enrollment to enrolment for the backend API call
      const backendServiceType =
        filters.service_type === "enrollment"
          ? "enrolment"
          : filters.service_type;
      params.append("service_type", backendServiceType);
    }

    return api.get(`/api/temporal/weekly?${params}`);
  },

  // Demographics
  getAgeDistribution: () => api.get("/api/demographics/age-distribution"),
  getServicePreferences: () => api.get("/api/demographics/service-preferences"),

  // ML operations
  runClustering: (nClusters = 5) =>
    api.post(`/api/ml/clustering?n_clusters=${nClusters}`),
  detectAnomalies: (contamination = 0.1) =>
    api.post(`/api/ml/anomalies?contamination=${contamination}`),
  generateForecast: (days = 7) => api.post(`/api/ml/forecast?days=${days}`),

  // Insights and Analytics
  getComprehensiveInsights: () => api.get("/api/insights/comprehensive"),
  getPatternInsights: () => api.get("/api/insights/patterns"),
  getSystemRecommendations: () => api.get("/api/insights/recommendations"),
  getPhase5Documentation: () => api.get("/api/documentation/phase5"),
  getMethodologyDocs: () => api.get("/api/documentation/methodology"),

  // Metadata
  getStates: () => api.get("/api/metadata/states"),
  getDistricts: (state?: string) => {
    const params = state ? `?state=${encodeURIComponent(state)}` : "";
    return api.get(`/api/metadata/districts${params}`);
  },

  // Performance
  getPerformanceMetrics: () => api.get("/api/performance"),

  // NEW FEATURES - NEWFEATURES.md Implementation

  // Migrant Portability Analysis
  analyzeMigrantPortability: (params: {
    state_filter?: string;
    district_filter?: string;
    min_volume?: number;
  }) => api.post("/api/analytics/migrant-portability", params),

  // Invisible Citizens Gap Analysis
  analyzeInvisibleCitizens: (params: {
    state_filter?: string;
    age_group?: string;
    gap_threshold?: number;
  }) => api.post("/api/analytics/invisible-citizens", params),

  // Center-Level Anomaly Detection
  detectCenterAnomalies: (params: {
    state_filter?: string;
    anomaly_types?: string[];
    contamination?: number;
  }) => api.post("/api/analytics/center-anomalies", params),

  // New Features Overview
  getNewFeaturesSummary: () => api.get("/api/analytics/new-features-summary"),

  // New Features - Direct API calls
  getMigrantPortabilityIndex: (state?: string) => {
    const params = state ? `?state=${encodeURIComponent(state)}` : "";
    return api.get(`/api/new-features/migrant-portability${params}`);
  },

  getInvisibleCitizensAnalysis: (state?: string) => {
    const params = state ? `?state=${encodeURIComponent(state)}` : "";
    return api.get(`/api/new-features/invisible-citizens${params}`);
  },

  getCenterAnomalies: (state?: string) => {
    const params = state ? `?state=${encodeURIComponent(state)}` : "";
    return api.get(`/api/new-features/center-anomalies${params}`);
  },
};
