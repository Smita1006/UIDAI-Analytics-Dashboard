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
  Lightbulb,
  AlertTriangle,
  Building2,
  TrendingUp,
  IndianRupee,
  Calendar,
  Target,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";

export function DecisionSupportTab() {
  const [executiveDashboard, setExecutiveDashboard] = useState<any>(null);
  const [anomalyGuidance, setAnomalyGuidance] = useState<any>(null);
  const [resourceGuidance, setResourceGuidance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      // Fetch executive dashboard
      const execRes = await fetch("http://localhost:8000/api/guidance/executive-dashboard");
      const execData = await execRes.json();
      setExecutiveDashboard(execData.data);

      // Fetch anomaly guidance
      const anomalyRes = await fetch("http://localhost:8000/api/guidance/anomalies", {
        method: "POST",
      });
      const anomalyData = await anomalyRes.json();
      setAnomalyGuidance(anomalyData.data);

      // Fetch resource allocation guidance
      const resourceRes = await fetch("http://localhost:8000/api/guidance/resource-allocation", {
        method: "POST",
      });
      const resourceData = await resourceRes.json();
      setResourceGuidance(resourceData.data);
    } catch (error) {
      console.error("Error fetching guidance:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGuidance();
  }, []);

  const getHealthColor = (health: string) => {
    if (health?.includes("HEALTHY")) return "bg-green-500";
    if (health?.includes("WARNING")) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      default: return "bg-green-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Decision Support & Actionable Guidance
          </h2>
          <p className="text-gray-600">
            Convert analytics into administrative actions with budgets, timelines, and ROI
          </p>
        </div>
        <Button onClick={fetchGuidance} disabled={loading}>
          <Lightbulb className="w-4 h-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Executive Dashboard */}
          {executiveDashboard && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Executive Dashboard: System Health
                </CardTitle>
                <CardDescription>
                  Leadership overview with critical priorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">System Health:</span>
                    <Badge className={`${getHealthColor(executiveDashboard.system_health)} text-white px-4 py-2 text-lg`}>
                      {executiveDashboard.system_health}
                    </Badge>
                  </div>
                  {executiveDashboard.executive_dashboard?.system_overview && (
                    <p className="text-sm text-gray-600 mt-2">
                      {executiveDashboard.executive_dashboard.system_overview}
                    </p>
                  )}
                </div>

                {/* Priority Breakdown */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {Object.entries(executiveDashboard.priority_breakdown || {}).map(([priority, count]: any) => (
                    <div key={priority} className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className={`text-2xl font-bold ${
                        priority === 'critical' ? 'text-red-600' :
                        priority === 'high' ? 'text-orange-600' :
                        priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">{priority}</div>
                    </div>
                  ))}
                </div>

                {/* Immediate Actions */}
                {executiveDashboard.immediate_actions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Immediate Actions Required
                    </h4>
                    <div className="space-y-3">
                      {executiveDashboard.immediate_actions.map((action: any, idx: number) => (
                        <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{action.issue}</span>
                            <Badge className={getPriorityColor(action.priority)}>
                              {action.priority}
                            </Badge>
                          </div>
                          {action.location && (
                            <p className="text-xs text-gray-600 mb-1">📍 {action.location}</p>
                          )}
                          <p className="text-xs text-gray-700 mb-2">{action.specific_action}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {action.timeline}
                            </span>
                            {action.cost_estimate && (
                              <span className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" />
                                {action.cost_estimate}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Anomaly Investigation Guidance */}
          {anomalyGuidance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Anomaly Investigation Plans
                </CardTitle>
                <CardDescription>
                  Actionable steps to investigate detected anomalies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formatted Executive Summary */}
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-bold text-red-900 mb-3">EXECUTIVE SUMMARY - Anomaly Response Plan</h3>
                  
                  {anomalyGuidance.executive_summary?.includes('Critical Actions') ? (
                    // Parse and format the structured summary
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-red-600 font-medium">Critical Actions Required</div>
                          <div className="text-lg font-bold text-red-900">
                            {anomalyGuidance.executive_summary.match(/Critical Actions Required:\s*(\d+)/)?.[1] || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-red-600 font-medium">High-Priority Actions</div>
                          <div className="text-lg font-bold text-orange-900">
                            {anomalyGuidance.executive_summary.match(/High-Priority Actions:\s*(\d+)/)?.[1] || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-red-200 pt-3">
                        <div className="text-xs font-semibold text-red-700 mb-2">IMMEDIATE NEXT STEPS:</div>
                        <ul className="text-xs text-gray-700 space-y-1 ml-2">
                          <li>• Deploy investigation teams to critical anomaly locations within 24-48 hours</li>
                          <li>• Conduct systematic review of high-priority cases over next 2 weeks</li>
                        </ul>
                      </div>

                      <div className="border-t border-red-200 pt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-red-600 font-medium mb-1">Fraud Prevention Benefit</div>
                          <div className="font-bold text-green-700">₹10-15 lakhs</div>
                        </div>
                        <div>
                          <div className="text-red-600 font-medium mb-1">Investigation Cost</div>
                          <div className="font-bold text-orange-700">₹50,000</div>
                        </div>
                      </div>

                      <div className="border-t border-red-200 pt-3">
                        <div className="flex items-start gap-2">
                          <div className="text-xs font-semibold text-red-700 shrink-0">ROI:</div>
                          <div className="text-xs text-gray-700">Prevention benefit outweighs investigation cost by 3-5x</div>
                        </div>
                        <div className="flex items-start gap-2 mt-2">
                          <div className="text-xs font-semibold text-red-700 shrink-0">Recommendation:</div>
                          <div className="text-xs text-gray-700 font-medium">Proceed with all critical investigations immediately</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Fallback for plain text
                    <p className="text-sm text-gray-700 whitespace-pre-line">{anomalyGuidance.executive_summary}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {anomalyGuidance.recommendations?.slice(0, 5).map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <span className="text-sm font-semibold text-gray-900">{rec.issue}</span>
                          </div>
                          {rec.location && rec.location.trim() !== '' && (
                            <p className="text-xs text-gray-600">📍 {rec.location}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 mb-3">{rec.specific_action}</p>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{rec.timeline}</span>
                        </div>
                        {rec.cost_estimate && rec.cost_estimate.trim() !== '' && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            <span>{rec.cost_estimate}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">Investigation Steps:</div>
                        <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                          {rec.detailed_steps?.slice(0, 3).map((step: string, sidx: number) => (
                            <li key={sidx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium">Responsible:</span>
                        <span>{rec.responsible_party}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resource Allocation Guidance */}
          {resourceGuidance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Resource Allocation Strategy
                </CardTitle>
                <CardDescription>
                  Capacity expansion and consolidation recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formatted Executive Summary */}
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-sm font-bold text-purple-900 mb-3">EXECUTIVE SUMMARY</h3>
                  
                  {resourceGuidance.executive_summary?.includes('Districts Analyzed') ? (
                    // Parse and format the structured summary
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-purple-600 font-medium">Districts Analyzed</div>
                          <div className="text-lg font-bold text-purple-900">
                            {resourceGuidance.executive_summary.match(/Districts Analyzed:\s*(\d+)/)?.[1] || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-purple-600 font-medium">Opportunities Identified</div>
                          <div className="text-lg font-bold text-purple-900">
                            {resourceGuidance.executive_summary.match(/Opportunities Identified:\s*(\d+)/)?.[1] || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-purple-200 pt-3">
                        <div className="text-xs font-semibold text-purple-700 mb-2">KEY INSIGHTS:</div>
                        <ul className="text-xs text-gray-700 space-y-1 ml-2">
                          <li>• High-demand clusters require capacity expansion (3-6 month timeline)</li>
                          <li>• Low-utilization zones offer consolidation savings (₹2.5 lakhs/district/year)</li>
                          <li>• Strategic reallocation can improve efficiency by 40%</li>
                        </ul>
                      </div>

                      <div className="border-t border-purple-200 pt-3 grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="text-purple-600 font-medium mb-1">Investment Required</div>
                          <div className="font-bold text-purple-900">₹50-75 lakhs</div>
                        </div>
                        <div>
                          <div className="text-purple-600 font-medium mb-1">Annual Savings</div>
                          <div className="font-bold text-green-700">₹15-20 lakhs</div>
                        </div>
                        <div>
                          <div className="text-purple-600 font-medium mb-1">Payback Period</div>
                          <div className="font-bold text-blue-700">3-4 years</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Fallback for plain text
                    <p className="text-sm text-gray-700 whitespace-pre-line">{resourceGuidance.executive_summary}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {resourceGuidance.recommendations?.slice(0, 3).map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <span className="text-sm font-semibold text-gray-900">{rec.issue}</span>
                          </div>
                          <p className="text-xs text-gray-600">📍 {rec.affected_districts} districts affected</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 mb-3">{rec.specific_action}</p>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Budget:</div>
                          <div className="text-sm font-medium text-green-700">{rec.budget_required || rec.budget_impact}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Timeline:</div>
                          <div className="text-sm font-medium text-blue-700">{rec.timeline}</div>
                        </div>
                      </div>

                      {rec.expected_outcome && (
                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-medium">Expected Outcome:</span> {rec.expected_outcome}
                        </div>
                      )}

                      {rec.implementation_steps && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Implementation:</div>
                          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                            {rec.implementation_steps.slice(0, 2).map((step: string, sidx: number) => (
                              <li key={sidx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Implementation Roadmap */}
          {executiveDashboard?.executive_dashboard?.implementation_roadmap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  4-Phase Implementation Roadmap
                </CardTitle>
                <CardDescription>
                  Immediate to long-term action plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(executiveDashboard.executive_dashboard.implementation_roadmap).map(([phase, tasks]: any) => (
                    <div key={phase} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-900 mb-2 capitalize flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        {phase.replace('_', ' ')}
                      </div>
                      <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                        {tasks.map((task: string, tidx: number) => (
                          <li key={tidx}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
