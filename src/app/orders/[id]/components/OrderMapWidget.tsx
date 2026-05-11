"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Map, MapPin, Navigation, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { OrderWarehouse } from "@/store/useOrderStore";

// Dynamically import Leaflet Map to avoid SSR (Server Side Rendering) issues in Next.js
const OrderLeafletMap = dynamic(
  () => import("./OrderLeafletMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 z-10">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-xs text-slate-400 uppercase tracking-widest font-black animate-pulse">Cargando Mapa...</span>
      </div>
    )
  }
);

interface OrderMapWidgetProps {
  latitude: number | string | null;
  longitude: number | string | null;
  deliveryMethod: string;
  deliveryAddressText: string | null;
  warehouse: OrderWarehouse | null;
}

export default function OrderMapWidget({
  latitude,
  longitude,
  deliveryMethod,
  deliveryAddressText,
  warehouse,
}: OrderMapWidgetProps) {
  // Safe coordinates parsing to prevent runtime errors
  const lat = latitude ? parseFloat(latitude as string) : null;
  const lng = longitude ? parseFloat(longitude as string) : null;
  const hasCoords = lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng);

  const [zoom, setZoom] = useState(15);
  const [resolvedCoords, setResolvedCoords] = useState<[number, number] | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<"idle" | "loading" | "resolved" | "failed">("idle");

  const isDelivery = deliveryMethod === "delivery";

  // Client-side forward geocoding effect (Address -> GPS coords)
  useEffect(() => {
    if (hasCoords) {
      setResolvedCoords([lat!, lng!]);
      setGeocodingStatus("resolved");
      return;
    }

    const queryText =
      deliveryMethod === "delivery"
        ? deliveryAddressText
        : warehouse?.address || warehouse?.name;

    if (!queryText) {
      setGeocodingStatus("failed");
      return;
    }

    const geocodeAddress = async () => {
      setGeocodingStatus("loading");
      
      // Try Photon (Komoot) first: fast, no API key, CORS support
      try {
        const photonUrl = `https://photon.komoot.io/api?q=${encodeURIComponent(queryText)}&limit=1`;
        const res = await fetch(photonUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const [lon, l] = data.features[0].geometry.coordinates;
            setResolvedCoords([l, lon]);
            setGeocodingStatus("resolved");
            return;
          }
        }
      } catch (error) {
        console.warn("Photon geocoding failed, trying Nominatim fallback...", error);
      }

      // Try Nominatim (OpenStreetMap) fallback
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryText)}&format=json&limit=1`;
        const res = await fetch(nominatimUrl, {
          headers: {
            "User-Agent": "LTH-Order-Tracking-Widget"
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setResolvedCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setGeocodingStatus("resolved");
            return;
          }
        }
      } catch (error) {
        console.error("Nominatim geocoding failed as well:", error);
      }

      setGeocodingStatus("failed");
    };

    // Small delay to ensure smooth user transition
    const timer = setTimeout(() => {
      geocodeAddress();
    }, 300);

    return () => clearTimeout(timer);
  }, [hasCoords, lat, lng, deliveryMethod, deliveryAddressText, warehouse]);

  const getGoogleMapsLink = () => {
    if (resolvedCoords) {
      return `https://www.google.com/maps/search/?api=1&query=${resolvedCoords[0]},${resolvedCoords[1]}`;
    }
    const queryText =
      deliveryMethod === "delivery"
        ? deliveryAddressText
        : warehouse?.address || warehouse?.name;

    if (queryText) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryText)}`;
    }
    return "https://maps.google.com";
  };

  return (
    <div className="bg-white rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 p-6 flex-1 flex flex-col justify-between space-y-5 animate-card">
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        
        {/* Widget Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 shrink-0">
          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <Map size={20} />
          </div>
          <div>
            <h3 className="font-black text-[#102B5E] uppercase tracking-widest text-xs md:text-[13px]">
              {deliveryMethod === "delivery"
                ? "Ubicación de Envío"
                : "Punto de Recogida"}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Coordinación de Entrega
            </p>
          </div>
        </div>

        {/* Interactive Leaflet Map Container */}
        <div className="relative flex-1 min-h-[260px] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner group/map">
          
          {/* Dynamic Loading Overlay with Radar Aesthetic */}
          {geocodingStatus === "loading" && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
              <div className="relative flex items-center justify-center w-16 h-16">
                <div className="absolute inset-0 rounded-full border border-teal-500/10" />
                <div className="absolute inset-2 rounded-full border border-teal-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-teal-400 animate-spin" />
                <Loader2 className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
              <span className="mt-4 text-[10px] text-teal-400 font-mono uppercase tracking-widest font-black animate-pulse">
                Geolocalizando dirección...
              </span>
            </div>
          )}

          {/* Failed / Missing Location Fallback */}
          {geocodingStatus === "failed" && (
            <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-50 border border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                <AlertCircle size={24} />
              </div>
              <h4 className="font-black text-[#102B5E] text-sm uppercase tracking-wide">
                Ubicación no encontrada
              </h4>
              <p className="text-xs text-slate-400 leading-normal mt-1 max-w-[180px] font-semibold">
                No pudimos geolocalizar la dirección en el mapa interactivo. Puedes abrirla en Google Maps.
              </p>
            </div>
          )}

          {/* Render Active Interactive Map */}
          {geocodingStatus === "resolved" && resolvedCoords && (
            <OrderLeafletMap
              latitude={resolvedCoords[0]}
              longitude={resolvedCoords[1]}
              zoom={zoom}
              deliveryMethod={deliveryMethod}
            />
          )}

          {/* Map Top Status Badge */}
          {geocodingStatus === "resolved" && (
            <div className={`absolute top-3 left-3 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-md z-[1000] animate-pulse ${
              isDelivery ? 'bg-rose-500 shadow-rose-500/20' : 'bg-[#102B5E] shadow-blue-900/20'
            }`}>
              {isDelivery ? "ENTREGA DE CARGA" : "RECOGER EN SUCURSAL"}
            </div>
          )}

          {/* Coordinates overlay panel (bottom-left) */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-slate-700 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-md z-[1000] flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              geocodingStatus === "resolved" ? 'bg-emerald-500' : geocodingStatus === "loading" ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            {geocodingStatus === "resolved" && resolvedCoords ? (
              <span>
                GPS: {resolvedCoords[0].toFixed(4)}, {resolvedCoords[1].toFixed(4)}
                {hasCoords ? " (BASE)" : " (ESTIMADA)"}
              </span>
            ) : geocodingStatus === "loading" ? (
              <span>PROCESANDO GPS...</span>
            ) : (
              <span>MODO DIRECCIÓN</span>
            )}
          </div>

          {/* Premium Zoom Controllers (bottom-right) */}
          {geocodingStatus === "resolved" && (
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-[1000]">
              <button 
                onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
                className="w-6 h-6 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-black text-xs rounded-md flex items-center justify-center border border-slate-200 shadow-sm hover:shadow-md active:scale-90 transition-all cursor-pointer"
                title="Acercar"
              >
                +
              </button>
              <button 
                onClick={() => setZoom(prev => Math.max(prev - 1, 10))}
                className="w-6 h-6 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-black text-xs rounded-md flex items-center justify-center border border-slate-200 shadow-sm hover:shadow-md active:scale-90 transition-all cursor-pointer"
                title="Alejar"
              >
                −
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Text & Maps Redirection Link */}
      <div className="space-y-3 shrink-0 pt-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Dirección Registrada
        </p>
        <p className="text-slate-600 text-sm leading-relaxed font-bold bg-slate-50 border border-slate-150 p-4 rounded-2xl max-h-[100px] overflow-y-auto">
          {deliveryMethod === "delivery"
            ? deliveryAddressText || "No registrada"
            : warehouse?.address || "Retiro en Oficina Sucursal"}
        </p>

        <a
          href={getGoogleMapsLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#102B5E] text-white hover:bg-[#1e3e78] hover:shadow-md font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group/mapbtn border border-blue-900/20"
        >
          <Navigation
            size={14}
            className="text-red-400 group-hover/mapbtn:rotate-12 transition-transform"
          />
          Abrir en Google Maps
          <ExternalLink size={12} className="opacity-60" />
        </a>
      </div>
    </div>
  );
}
