"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { renderToString } from "react-dom/server";

interface WhatsAppLocationProps {
 latitude: number;
 longitude: number;
 name?: string;
 address?: string;
 isOut?: boolean;
}

const WhatsAppLocation = ({
 latitude,
 longitude,
 name,
 address,
 isOut,
}: WhatsAppLocationProps) => {
 const position: [number, number] = [latitude, longitude];
 const [fetchedAddress, setFetchedAddress] = useState<string | null>(null);
 const [isLoadingAddress, setIsLoadingAddress] = useState(false);

 useEffect(() => {
  // Solo buscamos la dirección si no viene en los props
  if (!address && latitude && longitude) {
   const fetchAddress = async () => {
    setIsLoadingAddress(true);
    try {
     const response = await fetch(
      `/api/geocode?lat=${latitude}&lon=${longitude}`,
     );
     const data = await response.json();
     setFetchedAddress(data.display_name);
    } catch (error) {
     console.error("Error fetching address from Nominatim:", error);
    } finally {
     setIsLoadingAddress(false);
    }
   };
   fetchAddress();
  }
 }, [address, latitude, longitude]);

 // Icono personalizado con FontAwesome
 const locationIcon = L.divIcon({
  html: renderToString(
   <div
    style={{
     color: "#ef4444",
     fontSize: "32px",
     filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
     display: "flex",
     justifyContent: "center",
    }}
   >
    <FontAwesomeIcon icon={faLocationDot} />
   </div>,
  ),
  className: "custom-location-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
 });

 const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

 return (
  <div className="flex flex-col w-[260px] sm:w-[280px] -mt-3 -mx-3 lg:-mt-4 lg:-mx-4 mb-1">
   <div
    className={`relative h-[160px] w-full overflow-hidden cursor-pointer group ${isOut ? "rounded-tl-2xl rounded-tr-none" : "rounded-tr-2xl rounded-tl-none"}`}
    onClick={() => window.open(googleMapsUrl, "_blank")}
   >
    <MapContainer
     center={position}
     zoom={15}
     scrollWheelZoom={false}
     dragging={false}
     zoomControl={false}
     doubleClickZoom={false}
     touchZoom={false}
     boxZoom={false}
     keyboard={false}
     attributionControl={false}
     style={{ height: "100%", width: "100%", zIndex: 1 }}
    >
     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
     <Marker position={position} icon={locationIcon} />
    </MapContainer>

    {/* Overlay para capturar clics y evitar que se interactúe con el mapa */}
    <div className="absolute inset-0 z-1000 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
     <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-zinc-200">
      Abrir en Google Maps
     </div>
    </div>
   </div>

   <div
    className={`flex flex-col px-3 lg:px-4 mt-2 gap-1 ${isOut ? "text-right" : "text-left"}`}
   >
    <span
     className={`text-[10px] font-bold uppercase tracking-wider ${isOut ? "text-blue-200" : "text-zinc-400"}`}
    >
     📍 Ubicación compartida
    </span>

    {name && (
     <span
      className={`font-bold text-sm truncate ${isOut ? "text-white" : "text-[#19213d]"}`}
     >
      {name}
     </span>
    )}

    {(address || fetchedAddress) && (
     <span
      className={`text-xs leading-relaxed ${isOut ? "text-blue-100/90" : "text-zinc-600 font-medium italic"}`}
     >
      {address || fetchedAddress}
     </span>
    )}

    {isLoadingAddress && (
     <span
      className={`text-xs animate-pulse ${isOut ? "text-blue-100/50" : "text-zinc-400"}`}
     >
      Obteniendo dirección...
     </span>
    )}
   </div>
  </div>
 );
};

export default WhatsAppLocation;
