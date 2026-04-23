"use client";

import React, { useState } from "react";
import { Download, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

interface WhatsAppImageProps {
  mediaId?: string;
  url?: string;
  alt?: string;
  onOpenModal?: (data: { type: "image"; src: string; fileName?: string }) => void;
}

export default function WhatsAppImage({
  mediaId,
  url,
  alt = "WhatsApp Image",
  onOpenModal,
}: WhatsAppImageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const imageUrl = url || (mediaId ? `/api/whatsapp/image/${mediaId}` : "");

  if (!imageUrl) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 text-red-500 rounded-lg text-[10px] lg:text-sm max-w-[200px]">
        [Error: No se proporcionó imagen]
      </div>
    );
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = mediaId ? `imagen_whatsapp_${mediaId}.jpg` : "imagen_lth.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenModal && imageUrl) {
      onOpenModal({
        type: "image",
        src: imageUrl,
        fileName: mediaId ? `imagen_whatsapp_${mediaId}.jpg` : "imagen_lth.jpg",
      });
    } else {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      className="group relative w-[220px] h-[220px] lg:w-[280px] lg:h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-zinc-100 bg-zinc-50"
      onClick={handleOpen}
    >
      {loading && (
        <div className="absolute inset-0 bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 z-10">
          <Loader2 size={24} className="animate-spin mb-2 opacity-50" />
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">Cargando...</span>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 bg-red-50/80 flex flex-col items-center justify-center text-red-400 z-10 border border-red-100 rounded-2xl">
          <AlertCircle size={24} className="mb-2 opacity-60" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-center px-4 opacity-80">
            Fallo al cargar
          </span>
        </div>
      ) : (
        <>
          <img
            src={imageUrl}
            alt={alt}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
          />
          
          {/* Overlay oscuro en hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Botones de acción (Aparecen sobre el overlay en hover) */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleOpen}
              className="p-2 lg:p-2.5 rounded-full bg-white/90 text-[#19213d] hover:bg-white hover:scale-105 transition-all shadow-md backdrop-blur-sm"
              title="Abrir imagen completa"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 lg:p-2.5 rounded-full bg-[#19213d]/90 text-white hover:bg-[#19213d] hover:scale-105 transition-all shadow-md backdrop-blur-sm"
              title="Descargar imagen"
            >
              <Download size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
