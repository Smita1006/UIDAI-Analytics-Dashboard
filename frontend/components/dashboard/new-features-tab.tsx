"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Search,
  Eye,
  Shield,
  Building2,
  Baby,
  UserCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface NewFeaturesTabProps {
  data?: any;
}

interface MigrantData {
  state: string;
  district: string;
  migration_index: number;
  update_to_enrollment_ratio: number;
  new_enrollments: number;
  updates: number;
  migration_classification: string;
  adult_update_spike: boolean;
}

interface InvisibleCitizensData {
  state: string;
  district: string;
  pincode?: string;
  infant_enrollment_density: number;
  expected_population: number;
  actual_enrollments: number;
  gap_percentage: number;
  risk_level: string;
  age_group: string;
}

interface CenterAnomalyData {
  pincode: string;
  center_location: string;
  state: string;
  district: string;
  anomaly_type: string;
  anomaly_score: number;
  suspicious_pattern: string;
  processing_hours: string[];
  success_rate: number;
  volume_anomaly: boolean;
  timing_anomaly: boolean;
  risk_level: string;
}

export function NewFeaturesTab({ data }: NewFeaturesTabProps) {
  const [migrantData, setMigrantData] = useState<MigrantData[]>([]);
  const [invisibleData, setInvisibleData] = useState<InvisibleCitizensData[]>(
    []
  );
  const [anomalyData, setAnomalyData] = useState<CenterAnomalyData[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [loadingMigrant, setLoadingMigrant] = useState(false);
  const [loadingInvisible, setLoadingInvisible] = useState(false);
  const [loadingAnomaly, setLoadingAnomaly] = useState(false);

  const states = [
    "All States",
    "Andhra Pradesh",
    "Bihar",
    "Karnataka",
    "Maharashtra",
    "Uttar Pradesh",
    "West Bengal",
    "Tamil Nadu",
    "Gujarat",
    "Rajasthan",
  ];

  const fetchMigrantPortability = async (state?: string) => {
    setLoadingMigrant(true);
    try {
      const stateParam = state && state !== "All States" ? state : undefined;
      const response = await apiClient.getMigrantPortabilityIndex(stateParam);
      // The interceptor returns response.data.data when success=true
      setMigrantData(response?.data?.migration_analysis || []);
    } catch (error) {
      // Error handled silently
    }
    setLoadingMigrant(false);
  };

  const fetchInvisibleCitizens = async (state?: string) => {
    setLoadingInvisible(true);
    try {
      const stateParam = state && state !== "All States" ? state : undefined;
      const response = await apiClient.getInvisibleCitizensAnalysis(stateParam);
      // The interceptor returns response.data.data when success=true
      setInvisibleData(response?.data?.gap_analysis || []);
    } catch (error) {
      // Error handled silently
    }
    setLoadingInvisible(false);
  };

  const fetchCenterAnomalies = async (state?: string) => {
    setLoadingAnomaly(true);
    try {
      const stateParam = state && state !== "All States" ? state : undefined;
      const response = await apiClient.getCenterAnomalies(stateParam);
      // The interceptor returns response.data.data when success=true
      setAnomalyData(response?.data?.center_anomalies || []);
    } catch (error) {
      // Error handled silently
    }
    setLoadingAnomaly(false);
  };

  useEffect(() => {
    fetchMigrantPortability();
    fetchInvisibleCitizens();
    fetchCenterAnomalies();
  }, []);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const stateParam = state === "All States" ? undefined : state;
    fetchMigrantPortability(stateParam);
    fetchInvisibleCitizens(stateParam);
    fetchCenterAnomalies(stateParam);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getMigrationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Advanced Analytics Features
          </h2>
          <p className="text-gray-600">
            Cutting-edge insights from UIDAI data analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* 1. Migrant Portability Index */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">
                  Migrant Portability Index
                </CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  fetchMigrantPortability(
                    selectedState === "All States" ? undefined : selectedState
                  )
                }
                disabled={loadingMigrant}
              >
                {loadingMigrant ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
            <CardDescription>
              Migration pressure analysis based on update-to-enrollment ratios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMigrant ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Areas Analyzed: {migrantData.length}</span>
                  <span>
                    High Migration:{" "}
                    {
                      migrantData.filter(
                        (d) => d.migration_classification === "High"
                      ).length
                    }
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {migrantData.slice(0, 10).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {item.district}, {item.state}
                          </div>
                          <div className="text-xs text-gray-600">
                            Migration Index: {item.migration_index}
                          </div>
                          <div className="text-xs text-gray-600">
                            Ratio: {item.update_to_enrollment_ratio} | Updates:{" "}
                            {item.updates} | Enrollments: {item.new_enrollments}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            className={getMigrationColor(
                              item.migration_classification
                            )}
                          >
                            {item.migration_classification}
                          </Badge>
                          {item.adult_update_spike && (
                            <Badge variant="outline" className="text-xs">
                              Adult Spike
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Invisible Citizens Gap Analysis */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Invisible Citizens</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  fetchInvisibleCitizens(
                    selectedState === "All States" ? undefined : selectedState
                  )
                }
                disabled={loadingInvisible}
              >
                {loadingInvisible ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
            <CardDescription>
              Enrollment gap analysis for child welfare monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvisible ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Critical Areas:{" "}
                    {
                      invisibleData.filter((d) => d.risk_level === "Critical")
                        .length
                    }
                  </span>
                  <span>
                    High Risk:{" "}
                    {
                      invisibleData.filter((d) => d.risk_level === "High")
                        .length
                    }
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {invisibleData.slice(0, 10).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-1">
                            {item.district}, {item.state}
                            {item.age_group === "infant_0_5" && (
                              <Baby className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            Gap: {item.gap_percentage}% | Expected:{" "}
                            {item.expected_population}
                          </div>
                          <div className="text-xs text-gray-600">
                            Actual: {item.actual_enrollments} | Density:{" "}
                            {item.infant_enrollment_density}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div
                            className={`w-3 h-3 rounded-full ${getRiskColor(
                              item.risk_level
                            )}`}
                          ></div>
                          <Badge variant="outline" className="text-xs">
                            {item.risk_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Center Anomaly Detection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Center Anomalies</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  fetchCenterAnomalies(
                    selectedState === "All States" ? undefined : selectedState
                  )
                }
                disabled={loadingAnomaly}
              >
                {loadingAnomaly ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
            <CardDescription>
              Forensic analysis for fraud detection and center auditing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAnomaly ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Suspicious Centers:{" "}
                    {
                      anomalyData.filter((d) => d.risk_level === "Critical")
                        .length
                    }
                  </span>
                  <span>
                    Volume Anomalies:{" "}
                    {anomalyData.filter((d) => d.volume_anomaly).length}
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {anomalyData.slice(0, 10).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {item.pincode} - {item.center_location}
                          </div>
                          <div className="text-xs text-gray-600">
                            Pattern: {item.suspicious_pattern}
                          </div>
                          <div className="text-xs text-gray-600">
                            Score: {item.anomaly_score} | Success:{" "}
                            {(item.success_rate * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div
                            className={`w-3 h-3 rounded-full ${getRiskColor(
                              item.risk_level
                            )}`}
                          ></div>
                          <Badge variant="outline" className="text-xs">
                            {item.risk_level}
                          </Badge>
                          {(item.volume_anomaly || item.timing_anomaly) && (
                            <Badge variant="destructive" className="text-xs">
                              Anomaly
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Migration Insights Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Migration Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  High Migration Areas
                </span>
                <span className="font-medium">
                  {
                    migrantData.filter(
                      (d) => d.migration_classification === "High"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Adult Update Spikes
                </span>
                <span className="font-medium">
                  {migrantData.filter((d) => d.adult_update_spike).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Avg Migration Index
                </span>
                <span className="font-medium">
                  {migrantData.length > 0
                    ? (
                        migrantData.reduce(
                          (sum, d) => sum + d.migration_index,
                          0
                        ) / migrantData.length
                      ).toFixed(2)
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invisible Citizens Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Enrollment Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Critical Gaps</span>
                <span className="font-medium text-red-600">
                  {
                    invisibleData.filter((d) => d.risk_level === "Critical")
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Infant Focus Areas
                </span>
                <span className="font-medium">
                  {
                    invisibleData.filter((d) => d.age_group === "infant_0_5")
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Gap %</span>
                <span className="font-medium">
                  {invisibleData.length > 0
                    ? (
                        invisibleData.reduce(
                          (sum, d) => sum + d.gap_percentage,
                          0
                        ) / invisibleData.length
                      ).toFixed(1) + "%"
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Detection Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fraud Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">High Risk Centers</span>
                <span className="font-medium text-orange-600">
                  {
                    anomalyData.filter(
                      (d) =>
                        d.risk_level === "High" || d.risk_level === "Critical"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Volume Anomalies</span>
                <span className="font-medium">
                  {anomalyData.filter((d) => d.volume_anomaly).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Perfect Success Rates
                </span>
                <span className="font-medium">
                  {anomalyData.filter((d) => d.success_rate >= 0.99).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Statement */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Key Insights & Impact
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Migration Pressure
                </h4>
                <p className="text-blue-800">
                  Identified{" "}
                  {
                    migrantData.filter(
                      (d) => d.migration_classification === "High"
                    ).length
                  }{" "}
                  high-migration districts. Enable targeted PDS and healthcare
                  resource planning for labor mobility patterns.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">
                  Child Welfare
                </h4>
                <p className="text-orange-800">
                  {
                    invisibleData.filter(
                      (d) =>
                        d.risk_level === "Critical" &&
                        d.age_group === "infant_0_5"
                    ).length
                  }{" "}
                  critical infant enrollment gaps detected. Priority areas for
                  mobile enrollment drives and child welfare programs.
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">
                  Fraud Prevention
                </h4>
                <p className="text-red-800">
                  {
                    anomalyData.filter((d) => d.risk_level === "Critical")
                      .length
                  }{" "}
                  centers flagged for audit. Statistical anomalies suggest
                  potential operational irregularities requiring investigation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
