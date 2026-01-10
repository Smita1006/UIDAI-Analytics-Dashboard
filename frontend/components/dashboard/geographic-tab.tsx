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
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MapPin, BarChart3, Globe, Filter, Layers } from "lucide-react";
import { InteractiveMap } from "./interactive-map";
import { apiClient } from "@/lib/api-client";

interface GeographicTabProps {
  data?: any;
}

export function GeographicTab({ data }: GeographicTabProps) {
  const [statesData, setStatesData] = useState<any>(null);
  const [districtsData, setDistrictsData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState("states");
  const [showAllStates, setShowAllStates] = useState(false);

  useEffect(() => {
    const loadGeographicData = async () => {
      try {
        setIsLoading(true);

        const [statesResponse, heatmapResponse] = await Promise.allSettled([
          apiClient.getGeographicStates(),
          apiClient.getHeatmapData(),
        ]);

        if (statesResponse.status === "fulfilled") {
          setStatesData(statesResponse.value);
        }

        if (heatmapResponse.status === "fulfilled") {
          setHeatmapData(heatmapResponse.value);
        }
      } catch (error) {
        // Error loading geographic data
      } finally {
        setIsLoading(false);
      }
    };

    loadGeographicData();
  }, []);

  useEffect(() => {
    const loadDistrictsData = async () => {
      if (!selectedState) {
        setDistrictsData(null);
        return;
      }

      try {
        const response = await apiClient.getGeographicDistricts(
          selectedState,
          50
        );
        setDistrictsData(response);
      } catch (error) {
        // Error loading districts data
        setDistrictsData(null);
      }
    };

    loadDistrictsData();
  }, [selectedState]);

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 15) return "text-green-600";
    if (growth > 5) return "text-blue-600";
    if (growth > 0) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateRegionalInsights = () => {
    if (!statesData?.states) return [];

    const states = statesData.states;
    const totalVolume = states.reduce(
      (sum: number, state: any) => sum + (state.total_count || 0),
      0
    );

    // Group by regions (simplified)
    const regions = {
      "Western India": ["Maharashtra", "Gujarat", "Rajasthan", "Goa"],
      "Southern India": [
        "Karnataka",
        "Tamil Nadu",
        "Andhra Pradesh",
        "Kerala",
        "Telangana",
      ],
      "Northern India": [
        "Uttar Pradesh",
        "Delhi",
        "Punjab",
        "Haryana",
        "Himachal Pradesh",
      ],
      "Eastern India": ["West Bengal", "Bihar", "Odisha", "Jharkhand"],
      "Central India": ["Madhya Pradesh", "Chhattisgarh"],
    };

    return Object.entries(regions)
      .map(([regionName, stateList]) => {
        const regionStates = states.filter((state: any) =>
          stateList.includes(state.state)
        );
        const regionVolume = regionStates.reduce(
          (sum: number, state: any) => sum + (state.total_count || 0),
          0
        );
        const avgGrowth =
          regionStates.reduce(
            (sum: number, state: any) => sum + (state.growth_rate || 0),
            0
          ) / regionStates.length;

        return {
          region: regionName,
          states: regionStates.map((s: any) => s.state).join(", "),
          volume: regionVolume,
          volumePercentage:
            totalVolume > 0 ? (regionVolume / totalVolume) * 100 : 0,
          avgGrowth: avgGrowth || 0,
          stateCount: regionStates.length,
        };
      })
      .filter((region) => region.volume > 0)
      .sort((a, b) => b.volume - a.volume);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-muted-foreground">
          Loading geographic data...
        </span>
      </div>
    );
  }

  const regionalInsights = calculateRegionalInsights();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Geographic Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedView === "states" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedView("states");
                  setSelectedState(null);
                }}
              >
                <Layers className="h-4 w-4 mr-1" />
                States View
              </Button>
              <Button
                variant={selectedView === "districts" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("districts")}
                disabled={!selectedState}
              >
                Districts View
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Geographic distribution and performance analysis of UIDAI services
            across India
            {statesData?.states &&
              ` • ${statesData.states.length} states analyzed`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Interactive Map */}
      <InteractiveMap data={statesData} height="500px" />

      {/* States Performance Table */}
      {selectedView === "states" && statesData?.states && (
        <Card>
          <CardHeader>
            <CardTitle>State-wise Performance Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of service volume, growth, and operational
              metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div className="col-span-3">State</div>
                <div className="col-span-3">Service Volume</div>
                <div className="col-span-2">Growth Rate</div>
                <div className="col-span-2">Districts</div>
                <div className="col-span-2">Risk Level</div>
              </div>

              {statesData.states
                .slice(0, showAllStates ? undefined : 15)
                .map((state: any, index: number) => (
                  <div
                    key={state.name || index}
                    className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedState(state.name);
                      setSelectedView("districts");
                    }}
                  >
                    <div className="col-span-3">
                      <div className="font-medium">{state.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Rank #{index + 1}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="font-semibold">
                        {(state.total_count || 0).toLocaleString()}
                      </div>
                      <Progress
                        value={
                          ((state.total_count || 0) /
                            Math.max(
                              ...statesData.states.map(
                                (s: any) => s.total_count || 0
                              )
                            )) *
                          100
                        }
                        className="h-1 mt-1"
                      />
                    </div>

                    <div className="col-span-2">
                      <div
                        className={`font-semibold ${getGrowthColor(
                          state.growth_rate || 0
                        )}`}
                      >
                        {state.growth_rate
                          ? `+${state.growth_rate.toFixed(1)}%`
                          : "N/A"}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="font-medium">
                        {state.district_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        districts
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Badge
                        className={getRiskColor(state.risk_level || "Low")}
                      >
                        {state.risk_level || "Low"}
                      </Badge>
                    </div>
                  </div>
                ))}

              {statesData.states.length > 15 && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllStates(!showAllStates)}
                  >
                    {showAllStates
                      ? "Show Top 15 States"
                      : `View All ${statesData.states.length} States`}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Districts Table */}
      {selectedView === "districts" &&
        selectedState &&
        districtsData?.districts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Districts in {selectedState}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedView("states");
                    setSelectedState(null);
                  }}
                >
                  ← Back to States
                </Button>
              </CardTitle>
              <CardDescription>
                District-level analysis for {selectedState}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                  <div className="col-span-4">District</div>
                  <div className="col-span-3">Volume</div>
                  <div className="col-span-2">Growth</div>
                  <div className="col-span-3">Performance</div>
                </div>

                {districtsData.districts
                  .slice(0, 20)
                  .map((district: any, index: number) => (
                    <div
                      key={district.district}
                      className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div className="col-span-4">
                        <div className="font-medium">{district.district}</div>
                        <div className="text-xs text-muted-foreground">
                          {district.pincode_count || 0} pincodes
                        </div>
                      </div>

                      <div className="col-span-3">
                        <div className="font-semibold">
                          {(district.total_count || 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div
                          className={`font-semibold ${getGrowthColor(
                            district.growth_rate || 0
                          )}`}
                        >
                          {district.growth_rate
                            ? `${
                                district.growth_rate > 0 ? "+" : ""
                              }${district.growth_rate.toFixed(1)}%`
                            : "N/A"}
                        </div>
                      </div>

                      <div className="col-span-3">
                        <Progress
                          value={
                            ((district.total_count || 0) /
                              Math.max(
                                ...districtsData.districts.map(
                                  (d: any) => d.total_count || 0
                                )
                              )) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Regional Insights */}
      {regionalInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Regional Performance</span>
            </CardTitle>
            <CardDescription>
              Comparative analysis across major Indian regions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {regionalInsights.map((region) => (
              <div
                key={region.region}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{region.region}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {region.volumePercentage.toFixed(1)}% of total
                      </Badge>
                      <Badge
                        className={
                          region.avgGrowth > 10
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {region.avgGrowth.toFixed(1)}% growth
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    <strong>Volume:</strong> {region.volume.toLocaleString()} •
                    <strong>States:</strong> {region.stateCount}
                  </div>

                  <Progress value={region.volumePercentage} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Geographic Insights */}
      {heatmapData?.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Geographic Insights</span>
            </CardTitle>
            <CardDescription>
              Key patterns and trends identified in geographic data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heatmapData.insights.map((insight: string, index: number) => (
                <div
                  key={index}
                  className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"
                >
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!statesData?.states && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Geographic Data</h3>
              <p className="text-muted-foreground mb-4">
                Geographic analysis requires state and district data from the
                backend
              </p>
              <Button onClick={() => window.location.reload()}>
                <Filter className="h-4 w-4 mr-2" />
                Reload Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
