"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  Target,
  MapPin,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Pie,
} from "recharts";
import { useApiData } from "@/hooks/use-api-data";
import { apiClient } from "@/lib/api-client";

interface OverviewTabProps {
  data?: any;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { summary, kpis, loading, error } = useApiData();
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);

  useEffect(() => {
    const loadGeographicData = async () => {
      try {
        const response = await apiClient.getGeographicOverview();
        setGeoData(response);
      } catch (error) {
        console.error("Error loading geographic data:", error);
      } finally {
        setIsLoadingGeo(false);
      }
    };

    loadGeographicData();
  }, []);

  if (loading || isLoadingGeo) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-muted-foreground">Loading overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  const summaryData = summary || {};
  const kpisData = kpis || {};
  const geoOverview = geoData || {};

  const getServiceDistribution = () => {
    const bio = kpisData.biometric_updates || 0;
    const demo = kpisData.demographic_updates || 0;
    const enrollment = kpisData.new_enrollments || 0;

    return [
      { name: "Biometric Updates", value: bio, color: "#3b82f6" },
      { name: "Demographic Updates", value: demo, color: "#10b981" },
      { name: "New Enrollments", value: enrollment, color: "#f59e0b" },
    ].filter((item) => item.value > 0);
  };

  const getTopStates = () => {
    if (!geoOverview.states) return [];

    return geoOverview.states.slice(0, 5).map((state: any) => ({
      name: state.name,
      volume: state.volume,
      risk: state.risk,
    }));
  };

  const generateInsights = () => {
    const insights = [];

    // Total activity insight
    const totalTransactions = kpisData.total_transactions || 0;
    if (totalTransactions > 0) {
      insights.push({
        title: "Total Activity",
        value: totalTransactions.toLocaleString(),
        description: `Across ${summaryData.unique_states || 0} states`,
        icon: BarChart3,
      });
    }

    // Geographic distribution insight
    const totalStates = geoOverview.total_states || 0;
    if (totalStates > 0) {
      insights.push({
        title: "Geographic Coverage",
        value: `${totalStates} States`,
        description: `${
          geoOverview.summary?.high_risk_states || 0
        } high-risk areas`,
        icon: MapPin,
      });
    }

    // Service preference insight
    const serviceDistribution = getServiceDistribution();
    const topService = serviceDistribution.reduce(
      (max, service) => (service.value > max.value ? service : max),
      serviceDistribution[0] || { name: "N/A", value: 0 }
    );

    if (topService.name !== "N/A") {
      const percentage =
        totalTransactions > 0
          ? (topService.value / totalTransactions) * 100
          : 0;
      insights.push({
        title: "Most Popular Service",
        value: topService.name.replace(" Updates", ""),
        description: `${percentage.toFixed(1)}% of all transactions`,
        icon: Target,
      });
    }

    // Daily average insight
    const dailyAverage = kpisData.daily_average || 0;
    if (dailyAverage > 0) {
      insights.push({
        title: "Daily Average",
        value: dailyAverage.toLocaleString(),
        description: `Over ${summaryData.days_of_data || 0} days`,
        icon: Calendar,
      });
    }

    return insights;
  };

  const serviceDistribution = getServiceDistribution();
  const topStates = getTopStates();
  const insights = generateInsights();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(kpisData.total_transactions || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {summaryData.days_of_data || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Biometric Updates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(kpisData.biometric_updates || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(kpisData.bio_ratio || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Demographic Updates
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(kpisData.demographic_updates || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(kpisData.demo_ratio || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Enrollments
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(kpisData.new_enrollments || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(kpisData.enrollment_ratio || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
            <CardDescription>Breakdown of transaction types</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), ""]}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top States */}
        <Card>
          <CardHeader>
            <CardTitle>Top States by Volume</CardTitle>
            <CardDescription>
              States with highest transaction volumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topStates.length > 0 ? (
              <div className="space-y-4">
                {topStates.map((state, index) => (
                  <div
                    key={state.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium">{state.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {state.volume.toLocaleString()} transactions
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        state.risk === "high"
                          ? "text-red-700 border-red-300"
                          : state.risk === "medium"
                          ? "text-yellow-700 border-yellow-300"
                          : "text-green-700 border-green-300"
                      }
                    >
                      {state.risk}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No state data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Automatically generated insights from your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {insight.title}
                      </span>
                    </div>
                    <div className="text-xl font-bold mb-1">
                      {insight.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No insights available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
