"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Map,
  TrendingUp,
  Users,
  Brain,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  MessageCircle,
  Shield,
  Heart,
  Lightbulb,
} from "lucide-react";

// Import our custom components
import { DashboardHeader } from "@/components/dashboard/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { GeographicTab } from "@/components/dashboard/geographic-tab";
import { TemporalTab } from "@/components/dashboard/temporal-tab";
import { DemographicTab } from "@/components/dashboard/demographic-tab";
import { MLInsightsTab } from "@/components/dashboard/ml-insights-tab";
import { NewFeaturesTab } from "@/components/dashboard/new-features-tab";
import { GovernanceTab } from "@/components/dashboard/governance-tab";
import { SocialImpactTab } from "@/components/dashboard/social-impact-tab";
import { DecisionSupportTab } from "@/components/dashboard/decision-support-tab";
import { GeminiChatBot } from "@/components/dashboard/gemini-chat-bot";
import { ServiceSimulator } from "@/components/dashboard/service-simulator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useApiData } from "@/hooks/use-api-data";
import { useDashboardStore } from "@/store/dashboard-store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [highlightedChart, setHighlightedChart] = useState<string | null>(null);

  const { filters, updateFilters, clearFilters } = useDashboardStore();

  const { summary, kpis, states, loading, error, refreshData } = useApiData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleChartHighlight = (chartType: string) => {
    // Auto-switch to relevant tab based on chart type
    if (chartType === "geographic-map") {
      setActiveTab("geographic");
    } else if (chartType === "time-series") {
      setActiveTab("temporal");
    } else if (chartType === "demographic-analysis") {
      setActiveTab("demographic");
    } else if (chartType === "ml-insights") {
      setActiveTab("ml-insights");
    }

    setHighlightedChart(chartType);
    setTimeout(() => setHighlightedChart(null), 3000); // Clear highlight after 3 seconds
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "geographic", label: "Geographic", icon: Map },
    { id: "temporal", label: "Temporal", icon: TrendingUp },
    { id: "demographic", label: "Demographics", icon: Users },
    { id: "ml-insights", label: "ML Insights", icon: Brain },
    { id: "decision-support", label: "Decision Support", icon: Lightbulb },
    { id: "governance", label: "Governance", icon: Shield },
    { id: "social-impact", label: "Social Impact", icon: Heart },
    { id: "new-features", label: "New Features", icon: AlertTriangle },
  ];

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading UIDAI Analytics Dashboard...
          </p>
          <p className="mt-2 text-sm text-gray-500">Processing 2M+ records</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader />

      <main className="container mx-auto p-6 space-y-6">
        {/* Status Bar */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live Data
            </Badge>
            {summary?.data?.date_range && (
              <Badge variant="outline">
                {summary.data.date_range.start} to {summary.data.date_range.end}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants}>
          <KPICards
            totalRecords={kpis?.data?.total_records}
            activeStates={kpis?.data?.active_states}
            avgDailyVolume={kpis?.data?.avg_daily_volume}
            completionRate={kpis?.data?.completion_rate}
          />
        </motion.div>

        {/* Main Dashboard */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Advanced Analytics</h2>
                  <p className="text-sm text-gray-600">Comprehensive insights across 9 analytical dimensions</p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsSimulatorOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all px-6"
                size="lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Simulator
              </Button>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-white" />
                <h2 className="text-base font-semibold text-white">Analytics</h2>
              </div>
              
              <Button
                onClick={() => setIsSimulatorOpen(true)}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Settings className="h-4 w-4 mr-1.5" />
                Simulator
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 overflow-hidden">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 w-full gap-1.5 sm:gap-2 bg-transparent p-0 h-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 lg:gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:data-[state=active]:bg-blue-50 sm:data-[state=active]:text-blue-700 bg-gray-50 hover:bg-gray-100 py-2 sm:py-3 px-1.5 sm:px-2 rounded-md sm:rounded-lg transition-all h-auto"
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4 lg:w-4 shrink-0 flex-shrink-0" />
                      <span className="text-[9px] sm:text-xs lg:text-sm font-medium leading-tight text-center break-words line-clamp-2 w-full">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Contents */}
            <div className="bg-white rounded-lg shadow-sm border">
              <TabsContent value="overview" className="p-6 space-y-6">
                <OverviewTab data={summary} />
              </TabsContent>

              <TabsContent value="geographic" className="p-6 space-y-6">
                <GeographicTab data={summary} />
              </TabsContent>

              <TabsContent value="temporal" className="p-6 space-y-6">
                <TemporalTab data={summary} />
              </TabsContent>

              <TabsContent value="demographic" className="p-6 space-y-6">
                <DemographicTab data={summary} />
              </TabsContent>

              <TabsContent value="ml-insights" className="p-6 space-y-6">
                <MLInsightsTab />
              </TabsContent>

              <TabsContent value="decision-support" className="p-6 space-y-6">
                <DecisionSupportTab />
              </TabsContent>

              <TabsContent value="governance" className="p-6 space-y-6">
                <GovernanceTab />
              </TabsContent>

              <TabsContent value="social-impact" className="p-6 space-y-6">
                <SocialImpactTab />
              </TabsContent>

              <TabsContent value="new-features" className="p-6 space-y-6">
                <NewFeaturesTab data={summary} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>

        {/* Error Handling */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error loading data</span>
            </div>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">UIDAI Analytics Dashboard</span>
              <span className="ml-2">v2.0.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Built for UIDAI Hackathon 2026</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Data-driven insights for better governance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Gemini Chat Bot */}
      <GeminiChatBot onHighlightChart={handleChartHighlight} />

      {/* Service Simulator */}
      <ServiceSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </motion.div>
  );
}
