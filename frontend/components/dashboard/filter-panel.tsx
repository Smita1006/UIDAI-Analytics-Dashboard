"use client";

import { useState } from "react";
import { Calendar, Filter, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDashboardStore } from "@/store/dashboard-store";

export function FilterPanel() {
  const { filters, updateFilters, clearFilters } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    updateFilters({ dateRange: range });
  };

  const handleStateFilter = (state: string) => {
    const currentStates = filters.selectedStates || [];
    const newStates = currentStates.includes(state)
      ? currentStates.filter((s) => s !== state)
      : [...currentStates, state];
    updateFilters({ selectedStates: newStates });
  };

  const handleServiceFilter = (service: string) => {
    const currentServices = filters.selectedServices || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service];
    updateFilters({ selectedServices: newServices });
  };

  const activeFilterCount =
    (filters.selectedStates?.length || 0) +
    (filters.selectedServices?.length || 0) +
    (filters.dateRange ? 1 : 0);

  const topStates = [
    "Maharashtra",
    "Uttar Pradesh",
    "Bihar",
    "West Bengal",
    "Madhya Pradesh",
  ];
  const serviceTypes = ["biometric", "demographic", "enrollment"];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Date Range</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={
                filters.dateRange?.start === "2025-03-01"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleDateRangeChange({
                  start: "2025-03-01",
                  end: "2025-03-09",
                })
              }
            >
              All Data
            </Button>
            <Button
              variant={
                filters.dateRange?.start === "2025-03-07"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleDateRangeChange({
                  start: "2025-03-07",
                  end: "2025-03-09",
                })
              }
            >
              Last 3 Days
            </Button>
          </div>
        </div>

        <Separator />

        {/* State Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Top States</span>
          </div>
          <div
            className={`grid gap-2 ${
              isExpanded ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {topStates.slice(0, isExpanded ? 5 : 3).map((state) => (
              <Button
                key={state}
                variant={
                  (filters.selectedStates || []).includes(state)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleStateFilter(state)}
                className="justify-start"
              >
                {state}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Service Type Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">Service Types</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {serviceTypes.map((service) => (
              <Button
                key={service}
                variant={
                  (filters.selectedServices || []).includes(service)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleServiceFilter(service)}
                className="justify-start capitalize"
              >
                {service}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
