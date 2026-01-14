"use client";

import { useEffect, useRef, useState } from "react";

interface LeafletMapWrapperProps {
  mapData: any[];
  selectedLayer: string;
  height: string;
  getMarkerSize: (volume: number) => number;
  getMarkerColor: (value: any) => string;
  getRiskColor: (risk: string) => string;
}

export function LeafletMapWrapper({
  mapData,
  selectedLayer,
  height,
  getMarkerSize,
  getMarkerColor,
  getRiskColor,
}: LeafletMapWrapperProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    // Import Leaflet dynamically
    import("leaflet").then((L) => {
      // Check if map already exists on this container
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Clear any existing map
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = "";
      }

      // Create new map
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: true,
      });

      mapRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add markers
      mapData?.forEach((state: any) => {
        const value =
          selectedLayer === "volume"
            ? state.volume
            : selectedLayer === "growth"
            ? state.growth
            : state.risk;

        L.circleMarker([state.lat, state.lng], {
          radius: getMarkerSize(state.volume),
          fillColor: getMarkerColor(value),
          color: getMarkerColor(value),
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6,
        })
          .bindPopup(
            `
            <div style="padding: 8px; min-width: 192px;">
              <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">${state.name}</h3>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Volume:</span>
                  <span style="font-weight: 500;">${state.volume.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Growth:</span>
                  <span style="font-weight: 500;">${state.growth.toFixed(1)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Risk:</span>
                  <span style="font-weight: 500;">${state.risk}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Districts:</span>
                  <span style="font-weight: 500;">${state.districts}</span>
                </div>
              </div>
            </div>
          `
          )
          .bindTooltip(
            `<strong>${state.name}</strong><br/>${
              selectedLayer === "volume"
                ? `Volume: ${state.volume.toLocaleString()}`
                : selectedLayer === "growth"
                ? `Growth: ${state.growth.toFixed(1)}%`
                : `Risk: ${state.risk}`
            }`,
            { direction: "top", offset: [0, -10], opacity: 0.9 }
          )
          .addTo(map);
      });
    });

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isClient, mapData, selectedLayer, getMarkerSize, getMarkerColor]);

  if (!isClient) {
    return <div style={{ height, width: "100%" }} />;
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", position: "relative" }}
    />
  );
}
