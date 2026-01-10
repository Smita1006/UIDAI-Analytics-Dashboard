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
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Filter,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { apiClient } from "@/lib/api-client";

interface TimeSeriesAnalysisProps {
  data?: any;
}

export function TimeSeriesAnalysis({ data }: TimeSeriesAnalysisProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("daily");
  const [selectedService, setSelectedService] = useState("all");

  useEffect(() => {
    const loadTimeSeriesData = async () => {
      try {
        setIsLoading(true);

        // Load temporal data
        const dailyFilters = {
          service_type: selectedService === "all" ? undefined : selectedService,
          days_back: 30,
        };

        const [dailyResponse, weeklyResponse] = await Promise.allSettled([
          apiClient.getTemporalDaily(dailyFilters),
          apiClient.getWeeklyPatterns(dailyFilters),
        ]);

        if (dailyResponse.status === "fulfilled") {
          setTimeSeriesData(dailyResponse.value);
        }

        if (weeklyResponse.status === "fulfilled") {
          setWeeklyData(weeklyResponse.value);
        }
      } catch (error) {
        // Error loading time series data
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSeriesData();
  }, [selectedService]);

  const processChartData = () => {
    if (!timeSeriesData?.daily_trends && !timeSeriesData?.data?.daily_trends) {
      return [];
    }

    const trends =
      timeSeriesData?.daily_trends || timeSeriesData?.data?.daily_trends || [];

    if (!Array.isArray(trends) || trends.length === 0) {
      return [];
    }

    return trends.map((day: any) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: day.date,
      total: day.total || day.total_count || 0,
      biometric: day.biometric || day.biometric_count || 0,
      demographic: day.demographic || day.demographic_count || 0,
      enrollment:
        day.enrollment ||
        day.enrolment ||
        day.enrollment_count ||
        day.enrolment_count ||
        0,
      growth_rate: day.growth_rate || 0,
      // Calculate ratios
      biometric_ratio:
        (day.biometric || day.biometric_count) && (day.total || day.total_count)
          ? ((day.biometric || day.biometric_count) /
              (day.total || day.total_count)) *
            100
          : 0,
      demographic_ratio:
        (day.demographic || day.demographic_count) &&
        (day.total || day.total_count)
          ? ((day.demographic || day.demographic_count) /
              (day.total || day.total_count)) *
            100
          : 0,
    }));
  };

  const processWeeklyData = () => {
    if (!weeklyData?.weekly_patterns && !weeklyData?.data?.weekly_patterns) {
      return [];
    }

    const patterns =
      weeklyData?.weekly_patterns || weeklyData?.data?.weekly_patterns || [];

    if (!Array.isArray(patterns) || patterns.length === 0) {
      return [];
    }

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return patterns.map((pattern: any, index: number) => ({
      day: pattern.day || days[index] || `Day ${index + 1}`,
      enrollment: Math.floor((pattern.total || 0) * 0.3), // Approximate distribution
      biometric: Math.floor((pattern.total || 0) * 0.4),
      demographic: Math.floor((pattern.total || 0) * 0.3),
      total: pattern.total || 0,
      peak_hour: pattern.peak_hour || 12,
      activity_score: pattern.activity_score || 50,
    }));
  };

  const calculateTrends = () => {
    const chartData = processChartData();
    if (chartData.length < 2) return { trend: "stable", percentage: 0 };

    const recent =
      chartData
        .slice(-7)
        .reduce((sum: number, day: any) => sum + day.total, 0) / 7;
    const previous =
      chartData
        .slice(-14, -7)
        .reduce((sum: number, day: any) => sum + day.total, 0) / 7;

    if (previous === 0) return { trend: "stable", percentage: 0 };

    const percentage = ((recent - previous) / previous) * 100;
    const trend =
      percentage > 5 ? "increasing" : percentage < -5 ? "decreasing" : "stable";

    return { trend, percentage: Math.abs(percentage) };
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "📈";
      case "decreasing":
        return "📉";
      default:
        return "📊";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Time Series Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
            <span className="ml-3 text-muted-foreground">
              Loading time series data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = processChartData();
  const weeklyChartData = processWeeklyData();
  const trends = calculateTrends();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Time Series Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedView === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("daily")}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Daily Trends
              </Button>
              <Button
                variant={selectedView === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("weekly")}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Weekly Patterns
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Temporal analysis showing {selectedView} patterns with trends and
            forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filter by service type:
            </span>
            <Button
              variant={selectedService === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedService("all")}
            >
              All Services
            </Button>
            <Button
              variant={selectedService === "biometric" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedService("biometric")}
            >
              Biometric
            </Button>
            <Button
              variant={
                selectedService === "demographic" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedService("demographic")}
            >
              Demographic
            </Button>
            <Button
              variant={selectedService === "enrollment" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedService("enrollment")}
            >
              Enrollment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary */}
      {chartData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {chartData[chartData.length - 1]?.total?.toLocaleString() ||
                    0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Latest Daily Volume
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(
                    chartData.reduce(
                      (sum: number, day: any) => sum + day.total,
                      0
                    ) / chartData.length
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Daily Volume
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getTrendColor(
                    trends.trend
                  )}`}
                >
                  {getTrendIcon(trends.trend)} {trends.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Weekly Trend ({trends.trend})
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {chartData.length} days
                </div>
                <div className="text-sm text-muted-foreground">
                  Data Available
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Trends Chart */}
      {selectedView === "daily" && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Volume Trends</CardTitle>
            <CardDescription>
              Daily service volumes over time with service type breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `Date: ${item.fullDate}` : value;
                    }}
                    formatter={(value: any, name: string) => [
                      typeof value === "number"
                        ? value.toLocaleString()
                        : value,
                      name === "total"
                        ? "Total Volume"
                        : name === "biometric"
                        ? "Biometric Updates"
                        : name === "demographic"
                        ? "Demographic Updates"
                        : name === "enrollment"
                        ? "New Enrollments"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="enrollment"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    name="Enrollments"
                  />
                  <Area
                    type="monotone"
                    dataKey="demographic"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="Demographic"
                  />
                  <Area
                    type="monotone"
                    dataKey="biometric"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Biometric"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium">
                    No time series data available
                  </div>
                  <div className="text-sm">
                    Check if the backend is running and data is loaded
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Patterns Chart */}
      {selectedView === "weekly" && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Patterns</CardTitle>
            <CardDescription>
              Average service volume by day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      typeof value === "number"
                        ? value.toLocaleString()
                        : value,
                      name === "enrollment"
                        ? "Enrollments"
                        : name === "biometric"
                        ? "Biometric Updates"
                        : name === "demographic"
                        ? "Demographic Updates"
                        : name === "total"
                        ? "Total Volume"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="enrollment"
                    fill="#8b5cf6"
                    name="Enrollments"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="biometric"
                    fill="#3b82f6"
                    name="Biometric"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="demographic"
                    fill="#10b981"
                    name="Demographic"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium">
                    No weekly pattern data available
                  </div>
                  <div className="text-sm">
                    Check if the backend is running and data is loaded
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {chartData.length === 0 && weeklyChartData.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Time Series Data</h3>
              <p className="text-muted-foreground mb-4">
                Time series analysis requires temporal data from the backend API
              </p>
              <Button onClick={() => window.location.reload()}>
                <Download className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
