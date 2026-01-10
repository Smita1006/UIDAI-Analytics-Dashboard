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

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Leaflet imports with dynamic loading
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMarkerColor = (value: any) => {
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
        <div
          style={{ height, width: "100%" }}
          className="rounded-lg overflow-hidden border"
        >
          {typeof window !== "undefined" && (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapData?.map((state: any, index: number) => {
                const value =
                  selectedLayer === "volume"
                    ? state.volume
                    : selectedLayer === "growth"
                    ? state.growth
                    : state.risk;

                return (
                  <CircleMarker
                    key={index}
                    center={[state.lat, state.lng]}
                    radius={getMarkerSize(state.volume)}
                    fillColor={getMarkerColor(value)}
                    color={getMarkerColor(value)}
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <div className="p-2 min-w-48">
                        <h3 className="font-semibold text-lg mb-2">
                          {state.name}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Volume:
                            </span>
                            <span className="font-medium">
                              {state.volume.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Growth:
                            </span>
                            <span className="font-medium">
                              {state.growth.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Risk:</span>
                            <Badge className={getRiskColor(state.risk)}>
                              {state.risk}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Districts:
                            </span>
                            <span className="font-medium">
                              {state.districts}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>

                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <span className="font-medium">{state.name}</span>
                      <br />
                      {selectedLayer === "volume" &&
                        `Volume: ${state.volume.toLocaleString()}`}
                      {selectedLayer === "growth" &&
                        `Growth: ${state.growth.toFixed(1)}%`}
                      {selectedLayer === "risk" && `Risk: ${state.risk}`}
                    </Tooltip>
                  </CircleMarker>
                );
              }) || (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000]">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No geographic data available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Run data analysis to populate the map
                    </p>
                  </div>
                </div>
              )}
            </MapContainer>
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
