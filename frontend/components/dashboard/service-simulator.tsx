"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Play,
  BarChart3,
  MapPin,
  Clock,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  AlertTriangle,
  Calculator,
  Brain,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SimulationResults {
  results: Record<string, any>;
  summary: {
    total_new_centers: number;
    average_wait_time_reduction: number;
    average_success_improvement: number;
    estimated_cost: number;
    annual_benefits: number;
    implementation_timeline: string;
    roi_months: number;
    cost_per_center: number;
    benefit_breakdown: {
      time_efficiency_savings: number;
      quality_improvement_savings: number;
      additional_capacity_value: number;
    };
  };
  gemini_insights?: {
    ai_analysis: string;
    strategic_recommendations: string[];
    confidence_level: string;
    generated_at: string;
  };
}

interface BaselineData {
  states: Array<{
    name: string;
    current_centers: number;
    population_served: number;
    avg_wait_time: number;
    success_rate: number;
    capacity_utilization: number;
    risk_level: string;
  }>;
  service_types: string[];
  age_groups: string[];
  default_parameters: {
    center_increase_percent: number;
    cost_per_center: number;
    implementation_months: number;
  };
}

export function ServiceSimulator({ isOpen, onClose }: SimulatorProps) {
  const [centerIncrease, setCenterIncrease] = useState(20);
  const [selectedStates, setSelectedStates] = useState([
    "Bihar",
    "Uttar Pradesh",
  ]);
  const [serviceType, setServiceType] = useState("all");
  const [ageGroup, setAgeGroup] = useState("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] =
    useState<SimulationResults | null>(null);
  const [baselineData, setBaselineData] = useState<BaselineData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadBaselineData();
    }
  }, [isOpen]);

  const loadBaselineData = async () => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${API_BASE_URL}/api/simulator/baseline-data`
      );
      const result = await response.json();

      if (result.success) {
        setBaselineData(result.data);
      }
    } catch (error) {
      console.error("Failed to load baseline data:", error);
      toast({
        title: "Data Load Error",
        description: "Unable to load simulator baseline data",
        variant: "destructive",
      });
    }
  };

  const runSimulation = async () => {
    if (!baselineData) return;

    setIsSimulating(true);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const scenario = {
        center_increase_percent: centerIncrease,
        selected_states: selectedStates,
        service_type: serviceType,
        target_age_group: ageGroup,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/simulator/run-scenario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scenario),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSimulationResults(result.data);
        toast({
          title: "Simulation Complete",
          description: `Analyzed impact for ${selectedStates.length} states`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Failed",
        description: "Unable to complete simulation",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return (amount / 10000000).toFixed(1) + " Cr";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 100 }}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">
                    Service Load & Resource Allocation Simulator
                  </h2>
                  <p className="opacity-90">
                    Analyze the impact of adding enrollment centers
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Control Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Simulation Parameters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Center Increase Slider */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Center Increase: {centerIncrease}%
                    </label>
                    <Slider
                      value={[centerIncrease]}
                      onValueChange={(value) => setCenterIncrease(value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <Separator />

                  {/* State Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Selected States
                    </label>
                    {baselineData?.states.map((state) => (
                      <div
                        key={state.name}
                        className="flex items-center justify-between p-3 rounded-lg border mb-2"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedStates.includes(state.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStates([
                                  ...selectedStates,
                                  state.name,
                                ]);
                              } else {
                                setSelectedStates(
                                  selectedStates.filter((s) => s !== state.name)
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium">{state.name}</div>
                            <div className="text-sm text-gray-500">
                              {state.current_centers} centers •{" "}
                              {(state.population_served / 1000000).toFixed(1)}M
                              population
                            </div>
                          </div>
                        </div>
                        <Badge className={getRiskBadgeColor(state.risk_level)}>
                          {state.risk_level}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Service Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Service Type
                    </label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {baselineData?.service_types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age Group */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Target Age Group
                    </label>
                    <Select value={ageGroup} onValueChange={setAgeGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {baselineData?.age_groups.map((age) => (
                          <SelectItem key={age} value={age}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Run Simulation Button */}
                  <Button
                    onClick={runSimulation}
                    disabled={isSimulating || selectedStates.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isSimulating ? "Running Simulation..." : "Run Simulation"}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <div className="space-y-6">
                {/* Summary Cards */}
                {simulationResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {simulationResults.summary.total_new_centers}
                            </div>
                            <div className="text-sm text-gray-600">
                              New Centers
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              -
                              {
                                simulationResults.summary
                                  .average_wait_time_reduction
                              }
                              min
                            </div>
                            <div className="text-sm text-gray-600">
                              Wait Time Reduction
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              ₹
                              {formatCurrency(
                                simulationResults.summary.estimated_cost
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Investment Required
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-2xl font-bold">
                              {simulationResults.summary.roi_months} months
                            </div>
                            <div className="text-sm text-gray-600">
                              ROI Timeline
                            </div>
                            {simulationResults.summary.annual_benefits && (
                              <div className="text-xs text-green-600 mt-1">
                                Annual Benefits: ₹
                                {formatCurrency(
                                  simulationResults.summary.annual_benefits
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                {/* ROI Breakdown */}
                {simulationResults &&
                  simulationResults.summary.benefit_breakdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Calculator className="h-5 w-5" />
                            <span>ROI Calculation Breakdown</span>
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Detailed analysis of investment returns and annual
                            benefits
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-sm text-blue-600 font-medium mb-1">
                                Time Efficiency Savings
                              </div>
                              <div className="text-lg font-semibold text-blue-800">
                                ₹
                                {formatCurrency(
                                  simulationResults.summary.benefit_breakdown
                                    .time_efficiency_savings
                                )}
                              </div>
                              <div className="text-xs text-blue-600">
                                Reduced wait times = operational savings
                              </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-sm text-green-600 font-medium mb-1">
                                Quality Improvements
                              </div>
                              <div className="text-lg font-semibold text-green-800">
                                ₹
                                {formatCurrency(
                                  simulationResults.summary.benefit_breakdown
                                    .quality_improvement_savings
                                )}
                              </div>
                              <div className="text-xs text-green-600">
                                Higher success rates reduce rework costs
                              </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-sm text-purple-600 font-medium mb-1">
                                Additional Capacity Value
                              </div>
                              <div className="text-lg font-semibold text-purple-800">
                                ₹
                                {formatCurrency(
                                  simulationResults.summary.benefit_breakdown
                                    .additional_capacity_value
                                )}
                              </div>
                              <div className="text-xs text-purple-600">
                                Revenue from increased service capacity
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Total Annual Benefits:
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                ₹
                                {formatCurrency(
                                  simulationResults.summary.annual_benefits
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Total Investment:
                              </span>
                              <span className="text-lg font-bold text-red-600">
                                ₹
                                {formatCurrency(
                                  simulationResults.summary.estimated_cost
                                )}
                              </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  Payback Period:
                                </span>
                                <span className="text-xl font-bold text-blue-600">
                                  {simulationResults.summary.roi_months} months
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                {/* Gemini AI Insights */}
                {simulationResults && simulationResults.gemini_insights && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Brain className="h-5 w-5 text-blue-600" />
                          <span>AI Strategic Analysis</span>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${
                              simulationResults.gemini_insights
                                .confidence_level === "high"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {simulationResults.gemini_insights.confidence_level}{" "}
                            confidence
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Powered by Gemini AI - Advanced analysis of your
                          infrastructure expansion plan
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* AI Analysis */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                              <Brain className="h-4 w-4" />
                              <span>AI Analysis</span>
                            </h4>
                            <div className="text-sm text-blue-700 whitespace-pre-line">
                              {simulationResults.gemini_insights.ai_analysis}
                            </div>
                          </div>

                          {/* Strategic Recommendations */}
                          {simulationResults.gemini_insights
                            .strategic_recommendations?.length > 0 && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                                <Target className="h-4 w-4" />
                                <span>Strategic Recommendations</span>
                              </h4>
                              <div className="space-y-2">
                                {simulationResults.gemini_insights.strategic_recommendations.map(
                                  (rec, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2"
                                    >
                                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                        {index + 1}
                                      </div>
                                      <span className="text-sm text-green-700 flex-1">
                                        {rec}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Analysis timestamp */}
                          <div className="text-xs text-gray-500 text-center">
                            Analysis generated:{" "}
                            {new Date(
                              simulationResults.gemini_insights.generated_at
                            ).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Detailed Results */}
                {simulationResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Before vs After Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {Object.entries(simulationResults.results).map(
                            ([state, data]: [string, any]) => (
                              <div
                                key={state}
                                className="border rounded-lg p-4"
                              >
                                <h4 className="font-semibold mb-4 flex items-center justify-between">
                                  {state}
                                  <Badge variant="outline">
                                    +{data.improvements.additional_centers}{" "}
                                    centers
                                  </Badge>
                                </h4>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-600 mb-1">
                                      Capacity Utilization
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Before:</span>
                                        <span className="font-medium text-red-600">
                                          {data.before.utilization_percent}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={data.before.utilization_percent}
                                        className="h-2"
                                      />
                                      <div className="flex justify-between">
                                        <span>After:</span>
                                        <span className="font-medium text-green-600">
                                          {data.after.utilization_percent}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={data.after.utilization_percent}
                                        className="h-2"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-gray-600 mb-1">
                                      Wait Time (min)
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Before:</span>
                                        <span className="font-medium">
                                          {data.before.wait_time_minutes}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>After:</span>
                                        <span className="font-medium text-green-600">
                                          {data.after.wait_time_minutes}
                                        </span>
                                      </div>
                                      <div className="text-xs text-green-600">
                                        -{data.improvements.wait_time_reduction}{" "}
                                        min improvement
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-gray-600 mb-1">
                                      Success Rate
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Before:</span>
                                        <span className="font-medium">
                                          {data.before.success_rate}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>After:</span>
                                        <span className="font-medium text-green-600">
                                          {data.after.success_rate}%
                                        </span>
                                      </div>
                                      <div className="text-xs text-green-600">
                                        +
                                        {
                                          data.improvements
                                            .success_rate_improvement
                                        }
                                        % improvement
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Implementation Timeline */}
                {simulationResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Implementation Roadmap</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>
                              Phase 1: Site Selection & Approval (2 months)
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>
                              Phase 2: Infrastructure Setup (3 months)
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>
                              Phase 3: Staff Training & Deployment (2 months)
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>Phase 4: Testing & Go-Live (1 month)</span>
                          </div>

                          <Separator />

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">
                              Expected Outcomes
                            </h4>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                              <li>
                                Reduced citizen wait times by{" "}
                                {
                                  simulationResults.summary
                                    .average_wait_time_reduction
                                }{" "}
                                minutes on average
                              </li>
                              <li>
                                Increased service capacity by {centerIncrease}%
                                in selected states
                              </li>
                              <li>
                                Improved citizen satisfaction and service
                                accessibility
                              </li>
                              <li>
                                Better load distribution across enrollment
                                centers
                              </li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
