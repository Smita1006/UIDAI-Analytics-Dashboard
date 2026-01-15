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
  Heart,
  Users,
  MapPin,
  TrendingUp,
  RefreshCw,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export function SocialImpactTab() {
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSocialImpact = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/social-impact/comprehensive");
      const data = await res.json();
      setImpactData(data.data);
    } catch (error) {
      // Error fetching social impact data
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSocialImpact();
  }, []);

  const getImpactColor = (level: string) => {
    if (level.includes("Excellent")) return "bg-green-600";
    if (level.includes("Good")) return "bg-blue-600";
    if (level.includes("Moderate")) return "bg-amber-600";
    return "bg-red-600";
  };

  const getImpactIcon = (level: string) => {
    if (level.includes("Excellent") || level.includes("Good")) return "✓";
    if (level.includes("Moderate")) return "○";
    return "⚠";
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Social Impact Analytics
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Comprehensive assessment of citizen reach and accessibility
          </p>
        </div>
        <Button 
          onClick={fetchSocialImpact} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Loading..." : "Refresh Data"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : impactData ? (
        <>
          {/* Overall Impact Score Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Heart className="w-6 h-6 text-red-500" />
                Overall Social Impact Score
              </CardTitle>
              <CardDescription>
                Comprehensive evaluation of UIDAI social impact across all metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="text-5xl md:text-6xl font-bold text-gray-900">
                  {impactData.overall_impact_score}
                  <span className="text-2xl md:text-3xl text-gray-500">/100</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={`${getImpactColor(impactData.impact_level)} text-white px-4 py-2 text-base md:text-lg w-fit`}>
                    {getImpactIcon(impactData.impact_level)} {impactData.impact_level}
                  </Badge>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    {impactData.executive_summary?.split('\n')[0] || 'Social impact assessment complete'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* Citizens Served Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  Citizens Served
                </CardTitle>
                <CardDescription>Total unique enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
                  {impactData.citizens_served.total_citizens_served.toLocaleString()}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">National Coverage</span>
                    <span className="font-semibold text-gray-900">
                      {impactData.citizens_served.coverage_percent.toFixed(4)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Daily Average</span>
                    <span className="font-semibold text-gray-900">
                      {impactData.citizens_served.daily_average_enrollments.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rural vs Urban Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Rural vs Urban Accessibility
                </CardTitle>
                <CardDescription>Geographic distribution analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-medium text-gray-700">Rural</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      {impactData.accessibility.rural_percent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-blue-700" />
                      <span className="text-sm font-medium text-gray-700">Urban</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      {impactData.accessibility.urban_percent}%
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gap Status</span>
                      <Badge 
                        variant={Math.abs(impactData.accessibility.accessibility_gap_percent) < 5 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {impactData.accessibility.gap_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Score Card */}
            <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Accessibility Score
                </CardTitle>
                <CardDescription>Rural-urban balance metric</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-purple-900 mb-3">
                  {impactData.accessibility.accessibility_score}
                  <span className="text-xl md:text-2xl text-gray-500">/100</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${impactData.accessibility.accessibility_score}%` }}
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-700">
                    {impactData.accessibility.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Section */}
          {impactData.accessibility.gap_status !== "Balanced" && (
            <Card className="border-l-4 border-l-amber-500 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Priority Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      {impactData.accessibility.recommendation}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Target: Align rural-urban distribution with India&apos;s demographic ratio (65% rural, 35% urban)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Deploy mobile enrollment units to underserved rural districts
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No social impact data available</p>
            <Button 
              onClick={fetchSocialImpact}
              variant="outline"
              className="mt-4"
            >
              Load Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
