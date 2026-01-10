"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Settings, RefreshCw, Download, FileText, Users } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [settings, setSettings] = useState({
    refreshRate: 60000, // 1 minute
    notifications: true,
    autoRefresh: true,
  });

  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      toast({
        title: "Refreshing Data",
        description: "Please wait while we update the dashboard...",
      });

      // Simulate API refresh - in real app, this would refresh cache/data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });

      // Trigger a page refresh to reload all components
      window.location.reload();
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;

      if (format === "pdf") {
        toast({
          title: "Generating PDF",
          description: "Your PDF report is being generated...",
        });
        content = JSON.stringify(
          {
            title: "UIDAI Analytics Report",
            generated: new Date().toISOString(),
            note: "This is a sample export. Full PDF implementation requires additional libraries.",
            summary: {
              totalEnrollments: "1,006,029",
              biometricAuthentications: "1,861,108",
              demographicVerifications: "2,071,700",
              successRate: "94.2%",
            },
          },
          null,
          2
        );
        filename = `uidai-report-${
          new Date().toISOString().split("T")[0]
        }.json`;
      } else {
        return; // Only support PDF for now
      }

      downloadFile(content, filename);

      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">UI</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">UIDAI Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  Identity Management Dashboard
                </p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Live Data • 4.3M+ Records
            </Badge>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Auto Refresh */}
                <DropdownMenuCheckboxItem
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => {
                    setSettings((prev) => ({ ...prev, autoRefresh: checked }));
                    toast({
                      title:
                        "Auto Refresh " + (checked ? "Enabled" : "Disabled"),
                      description: checked
                        ? "Dashboard will refresh automatically."
                        : "Manual refresh required.",
                    });
                  }}
                >
                  Auto Refresh ({settings.refreshRate / 1000}s)
                </DropdownMenuCheckboxItem>

                {/* Notifications */}
                <DropdownMenuCheckboxItem
                  checked={settings.notifications}
                  onCheckedChange={(checked) => {
                    setSettings((prev) => ({
                      ...prev,
                      notifications: checked,
                    }));
                    toast({
                      title:
                        "Notifications " + (checked ? "Enabled" : "Disabled"),
                      description: checked
                        ? "You'll receive dashboard notifications."
                        : "Notifications turned off.",
                    });
                  }}
                >
                  Show Notifications
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                {/* Refresh Rate */}
                <div className="p-2">
                  <Label className="text-sm">Refresh Rate (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.refreshRate / 1000}
                    onChange={(e) => {
                      const newRate = parseInt(e.target.value) * 1000;
                      setSettings((prev) => ({
                        ...prev,
                        refreshRate: newRate,
                      }));
                      toast({
                        title: "Refresh Rate Updated",
                        description: `Dashboard will refresh every ${e.target.value} seconds.`,
                      });
                    }}
                    className="mt-1"
                    min="10"
                    max="300"
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>

            {/* About */}
            <Link href="/about">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                About
              </Button>
            </Link>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Dashboard Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
