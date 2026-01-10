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
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Users,
  Baby,
  GraduationCap,
  User,
  PieChart,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
} from "recharts";
import { apiClient } from "@/lib/api-client";

interface DemographicTabProps {
  data?: any;
}

export function DemographicTab({ data }: DemographicTabProps) {
  const [ageDistribution, setAgeDistribution] = useState<any>(null);
  const [servicePreferences, setServicePreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDemographicData = async () => {
      try {
        setIsLoading(true);

        const [ageResponse, serviceResponse] = await Promise.allSettled([
          apiClient.getAgeDistribution(),
          apiClient.getServicePreferences(),
        ]);

        if (ageResponse.status === "fulfilled") {
          setAgeDistribution(ageResponse.value);
        }

        if (serviceResponse.status === "fulfilled") {
          setServicePreferences(serviceResponse.value);
        }
      } catch (error) {
        // Error loading demographic data
      } finally {
        setIsLoading(false);
      }
    };

    loadDemographicData();
  }, []);

  const getAgeGroupIcon = (ageGroup: string) => {
    if (ageGroup.includes("0") || ageGroup.includes("5")) return Baby;
    if (ageGroup.includes("17") || ageGroup.includes("teen"))
      return GraduationCap;
    return User;
  };

  const getAgeGroupColor = (index: number) => {
    const colors = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b"];
    return colors[index % colors.length];
  };

  const prepareAgeChartData = () => {
    const overall = ageDistribution?.overall || ageDistribution?.data?.overall;
    if (!overall) {
      return [];
    }

    return [
      {
        name: "Young (5-17)",
        value: overall.young_count || overall.young_total || 0,
        percentage: overall.young_percentage || 0,
        color: getAgeGroupColor(0),
      },
      {
        name: "Adult (18+)",
        value: overall.adult_count || overall.adult_total || 0,
        percentage:
          overall.adult_percentage || 100 - (overall.young_percentage || 0),
        color: getAgeGroupColor(1),
      },
    ];
  };

  const prepareServicePreferenceData = () => {
    // Check for data in multiple possible locations
    let preferences =
      servicePreferences?.age_preferences ||
      servicePreferences?.data?.age_preferences ||
      servicePreferences;

    // If we got the raw servicePreferences data and it has biometric/demographic/enrolment directly
    if (preferences && preferences.biometric && preferences.demographic) {
      // Use it directly
    } else if (!preferences || typeof preferences !== "object") {
      return [];
    }

    // Handle the case where enrolment is used instead of enrollment
    const processedPreferences = { ...preferences };
    if (preferences.enrolment && !preferences.enrollment) {
      processedPreferences.enrollment = preferences.enrolment;
    }

    return Object.entries(processedPreferences)
      .map(([service, data]: [string, any]) => {
        // Skip if data is not an object with the expected structure
        if (
          !data ||
          typeof data !== "object" ||
          (!data.young_count && typeof data.young_count !== "number")
        ) {
          return null;
        }

        return {
          service: service
            .replace("_", " ")
            .replace(/enrolment/i, "enrollment")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          young: data.young_count || 0,
          adult: data.adult_count || 0,
          total: data.total_count || 0,
          young_percentage: data.young_percentage || 0,
          adult_percentage: data.adult_percentage || 0,
        };
      })
      .filter((item) => item !== null); // Filter out null entries
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-muted-foreground">
          Loading demographic data...
        </span>
      </div>
    );
  }

  const ageChartData = prepareAgeChartData();
  const servicePreferenceData = prepareServicePreferenceData();

  return (
    <div className="space-y-6">
      {/* Age Distribution Overview */}
      {ageDistribution?.overall && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Age Distribution Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Age Group Distribution</span>
              </CardTitle>
              <CardDescription>
                Service usage breakdown by age demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <Baby className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Young Adults</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">
                          {(
                            ageDistribution.overall.young_total || 0
                          ).toLocaleString()}
                        </span>
                        <Badge variant="outline">
                          {(
                            ageDistribution.overall.young_percentage || 0
                          ).toFixed(1)}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={ageDistribution.overall.young_percentage || 0}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Adults</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">
                          {(
                            ageDistribution.overall.adult_total || 0
                          ).toLocaleString()}
                        </span>
                        <Badge variant="outline">
                          {(
                            100 -
                            (ageDistribution.overall.young_percentage || 0)
                          ).toFixed(1)}
                          %
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        100 - (ageDistribution.overall.young_percentage || 0)
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Age Distribution Breakdown</span>
              </CardTitle>
              <CardDescription>
                Visual representation of age group proportions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ageChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={ageChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ percentage }: any) =>
                          `${percentage.toFixed(1)}%`
                        }
                      >
                        {ageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          value.toLocaleString(),
                          "Count",
                        ]}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No age distribution data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Preferences by Age */}
      {servicePreferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Service Preferences by Age Group</span>
            </CardTitle>
            <CardDescription>
              How different age groups prefer different UIDAI services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {servicePreferenceData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={servicePreferenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        value.toLocaleString(),
                        name === "young"
                          ? "Young (5-17)"
                          : name === "adult"
                          ? "Adult (18+)"
                          : name,
                      ]}
                    />
                    <Legend />

                    <Bar dataKey="young" fill="#3b82f6" name="Young (5-17)" />
                    <Bar dataKey="adult" fill="#8b5cf6" name="Adult (18+)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No service preference data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Service Preferences */}
      {servicePreferences?.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Demographic Insights</span>
            </CardTitle>
            <CardDescription>
              Key patterns and trends in demographic service usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servicePreferences.insights.map(
                (insight: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"
                  >
                    <p className="text-sm text-blue-800">{insight}</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Usage Patterns */}
      {servicePreferences?.age_preferences && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(servicePreferences.age_preferences).map(
            ([service, data]: [string, any]) => (
              <Card key={service}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize">
                    {service.replace("_", " ")}
                  </CardTitle>
                  <CardDescription>
                    Total: {(data.total_count || 0).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Young Adults</span>
                        <span className="font-medium">
                          {(data.young_count || 0).toLocaleString()} (
                          {(data.young_percentage || 0).toFixed(1)}%)
                        </span>
                      </div>
                      <Progress
                        value={data.young_percentage || 0}
                        className="h-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Adults</span>
                        <span className="font-medium">
                          {(data.adult_count || 0).toLocaleString()} (
                          {(data.adult_percentage || 0).toFixed(1)}%)
                        </span>
                      </div>
                      <Progress
                        value={data.adult_percentage || 0}
                        className="h-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {(ageDistribution?.summary || servicePreferences?.summary) && (
        <div className="grid gap-4 md:grid-cols-4">
          {ageDistribution?.summary?.most_active_age_group && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    Age{" "}
                    {ageDistribution.summary.most_active_age_group.replace(
                      "_",
                      "-"
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Most Active Group
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {servicePreferences?.summary?.preferred_service && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {servicePreferences.summary.preferred_service.replace(
                      "_",
                      " "
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Most Popular Service
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {ageDistribution?.summary?.youth_percentage && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {ageDistribution.summary.youth_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Youth (5-17) Share
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {servicePreferences?.summary?.diversity_index && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {servicePreferences.summary.diversity_index.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Service Diversity
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Data State */}
      {!ageDistribution && !servicePreferences && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Demographic Data</h3>
              <p className="text-muted-foreground mb-4">
                Demographic analysis requires age and service preference data
              </p>
              <Button onClick={() => window.location.reload()}>
                <Users className="h-4 w-4 mr-2" />
                Reload Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
