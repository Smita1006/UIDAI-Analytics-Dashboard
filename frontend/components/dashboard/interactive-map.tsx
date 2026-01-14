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
import { MapPin, Layers } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import dynamic from "next/dynamic";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Dynamically import the map wrapper with no SSR
const LeafletMapWrapper = dynamic(
  () => import("./leaflet-map-wrapper").then((mod) => mod.LeafletMapWrapper),
  { ssr: false }
);

interface InteractiveMapProps {
  data?: any;
  height?: string;
}

export function InteractiveMap({
  data,
  height = "500px",
}: InteractiveMapProps) {
  const [mapData, setMapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState("volume");

  // Indian state coordinates (approximates)
  const stateCoordinates = {
    "Andhra Pradesh": [15.9129, 79.74],
    "Arunachal Pradesh": [28.218, 94.7278],
    Assam: [26.2006, 92.9376],
    Bihar: [25.0961, 85.3131],
    Chhattisgarh: [21.2787, 81.8661],
    Goa: [15.2993, 74.124],
    Gujarat: [23.0225, 72.5714],
    Haryana: [29.0588, 76.0856],
    "Himachal Pradesh": [31.1048, 77.1734],
    Jharkhand: [23.6102, 85.2799],
    Karnataka: [15.3173, 75.7139],
    Kerala: [10.8505, 76.2711],
    "Madhya Pradesh": [22.9734, 78.6569],
    Maharashtra: [19.7515, 75.7139],
    Manipur: [24.6637, 93.9063],
    Meghalaya: [25.467, 91.3662],
    Mizoram: [23.1645, 92.9376],
    Nagaland: [26.1584, 94.5624],
    Odisha: [20.9517, 85.0985],
    Punjab: [31.1471, 75.3412],
    Rajasthan: [27.0238, 74.2179],
    Sikkim: [27.533, 88.5122],
    "Tamil Nadu": [11.1271, 78.6569],
    Telangana: [18.1124, 79.0193],
    Tripura: [23.9408, 91.9882],
    "Uttar Pradesh": [26.8467, 80.9462],
    Uttarakhand: [30.0668, 79.0193],
    "West Bengal": [22.9868, 87.855],
    Delhi: [28.7041, 77.1025],
    "Jammu and Kashmir": [34.0837, 74.7973],
    Ladakh: [34.1526, 77.577],
  } as const;

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true);

        // Try to get geographic data from API
        const geoResponse = await apiClient.getGeographicOverview();

        if (geoResponse?.data?.states) {
          // Map API data to coordinates
          const mappedData = geoResponse.data.states.map((state: any) => {
            const coords =
              stateCoordinates[state.name as keyof typeof stateCoordinates];

            return {
              name: state.name,
              volume: state.volume || 0,
              growth: state.growth || 0,
              risk: state.risk || "low",
              districts: state.districts || 1,
              lat: coords?.[0] || 20,
              lng: coords?.[1] || 78,
            };
          });

          setMapData(mappedData);
        } else {
          // Generate sample data with coordinates if API data not available
          const sampleStates = [
            "Maharashtra",
            "Uttar Pradesh",
            "Gujarat",
            "Karnataka",
            "Tamil Nadu",
            "West Bengal",
            "Rajasthan",
            "Madhya Pradesh",
            "Bihar",
            "Haryana",
          ];

          const sampleData = sampleStates.map((stateName, index) => {
            const coords =
              stateCoordinates[stateName as keyof typeof stateCoordinates];
            return {
              name: stateName,
              volume: Math.floor(Math.random() * 500000) + 100000,
              growth: Math.random() * 20 + 5,
              risk: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
              districts: Math.floor(Math.random() * 30) + 5,
              lat: coords?.[0] || 20,
              lng: coords?.[1] || 78,
            };
          });

          setMapData(sampleData);
        }
      } catch (error) {
        // Error loading map data
        setMapData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, []);

  const getMarkerColor = (value: any): string => {
    if (selectedLayer === "volume") {
      if (value > 400000) return "#dc2626";
      if (value > 200000) return "#f97316";
      if (value > 100000) return "#fbbf24";
      return "#22c55e";
    }

    if (selectedLayer === "growth") {
      if (value > 15) return "#22c55e";
      if (value > 10) return "#fbbf24";
      if (value > 5) return "#f97316";
      return "#dc2626";
    }

    if (selectedLayer === "risk") {
      switch (value?.toLowerCase()) {
        case "high":
          return "#dc2626";
        case "medium":
          return "#f97316";
        case "low":
          return "#22c55e";
        default:
          return "#6b7280";
      }
    }
    
    return "#6b7280"; // default fallback
  };

  const getMarkerSize = (value: any) => {
    if (selectedLayer === "volume") {
      if (value > 400000) return 25;
      if (value > 200000) return 20;
      if (value > 100000) return 15;
      return 10;
    }
    return 15;
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Interactive India Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner />
            <span className="ml-3 text-muted-foreground">
              Loading map data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Interactive India Map - UIDAI Services</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedLayer === "volume" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayer("volume")}
            >
              <Layers className="h-4 w-4 mr-1" />
              Volume
            </Button>
            <Button
              variant={selectedLayer === "growth" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayer("growth")}
            >
              Growth
            </Button>
            <Button
              variant={selectedLayer === "risk" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayer("risk")}
            >
              Risk
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Geographic distribution showing {selectedLayer} across Indian states
          {mapData && ` • ${mapData.length} states mapped`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border">
          {typeof window !== "undefined" && mapData && (
            <LeafletMapWrapper
              mapData={mapData}
              selectedLayer={selectedLayer}
              height={height}
              getMarkerSize={getMarkerSize}
              getMarkerColor={getMarkerColor}
              getRiskColor={getRiskColor}
            />
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium">Legend:</span>
            {selectedLayer === "volume" && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Low (&lt;100K)</span>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Medium (100K-200K)</span>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs">High (200K-400K)</span>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Very High (&gt;400K)</span>
              </div>
            )}
            {selectedLayer === "growth" && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">&lt;5%</span>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs">5-10%</span>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">10-15%</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">&gt;15%</span>
              </div>
            )}
            {selectedLayer === "risk" && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Low Risk</span>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs">Medium Risk</span>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">High Risk</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Click markers for detailed information
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
