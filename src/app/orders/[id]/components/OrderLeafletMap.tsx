"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToString } from "react-dom/server";
import { MapPin } from "lucide-react";

interface OrderLeafletMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  deliveryMethod: string;
}

// Map Controller to dynamically handle panning and zooming of the Leaflet Map
function MapController({ latitude, longitude, zoom }: { latitude: number; longitude: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], zoom, {
      animate: true,
      duration: 1.2,
    });
  }, [latitude, longitude, zoom, map]);

  return null;
}

export default function OrderLeafletMap({
  latitude,
  longitude,
  zoom,
  deliveryMethod,
}: OrderLeafletMapProps) {
  const position: [number, number] = [latitude, longitude];
  const isDelivery = deliveryMethod === "delivery";
  const markerColor = isDelivery ? "#E11D48" : "#102B5E";

  // Create a stunning premium pulsing div icon with Tailwind animations
  const customMarkerIcon = L.divIcon({
    html: renderToString(
      <div className="relative flex items-center justify-center w-12 h-12 -translate-x-1.5 -translate-y-1.5">
        {/* Rapid Outer Ring Wave */}
        <div 
          className="absolute w-12 h-12 rounded-full opacity-35 animate-ping" 
          style={{ backgroundColor: markerColor, animationDuration: "2s" }} 
        />
        {/* Soft Glowing Pulsing Core */}
        <div 
          className="absolute w-8 h-8 rounded-full opacity-20 animate-pulse" 
          style={{ backgroundColor: markerColor }} 
        />
        {/* Main Solid Pin Core */}
        <div 
          className="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white text-white transition-all transform hover:scale-110 duration-200 shrink-0" 
          style={{ backgroundColor: markerColor }}
        >
          <MapPin size={16} className="fill-white/10" />
        </div>
      </div>
    ),
    className: "custom-glowing-leaflet-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  return (
    <div className="w-full h-full relative">
      {/* Localized styles to create the silver/slate design and style Leaflet's zoom buttons */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Silver slate filter for Leaflet tiles */
        .premium-slate-tiles .leaflet-tile {
          filter: grayscale(100%) brightness(1.02) contrast(0.9) opacity(0.95);
        }
        
        /* Smooth zoom transition */
        .leaflet-zoom-animated {
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }

        /* Customize leaflet attribution to be clean and minimal */
        .premium-slate-tiles .leaflet-control-attribution {
          font-family: monospace;
          font-size: 8px !important;
          background: rgba(255, 255, 255, 0.8) !important;
          color: #94a3b8 !important;
          border-top-left-radius: 8px;
          border: 1px solid #f1f5f9;
          border-right: none;
          border-bottom: none;
          padding: 2px 6px !important;
        }
      `}} />

      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={false} // Disable Leaflet's native +/- buttons so we use our custom-styled ones
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        className="premium-slate-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customMarkerIcon} />
        <MapController latitude={latitude} longitude={longitude} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
