"use client";

import React, { useState } from "react";

import Image from "next/image";

interface WhatsAppImageProps {
  mediaId: string;
  alt?: string;
}

export default function WhatsAppImage({
  mediaId,
  alt = "WhatsApp Image",
}: WhatsAppImageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const imageUrl = `/api/whatsapp/image/${mediaId}`;

  if (!mediaId) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 text-red-500 rounded-lg text-sm max-w-xs">
        [Error: mediaId no proporcionado]
      </div>
    );
  }

  return (
    <div className="relative w-[220px] h-[220px] lg:w-[280px] lg:h-[280px]">
      {loading && (
        <div className="absolute inset-0 bg-zinc-200/50 animate-pulse rounded-lg flex items-center justify-center text-zinc-400 text-[10px] lg:text-sm z-10 text-center px-2">
          Cargando imagen...
        </div>
      )}

      {error ? (
        <div className="p-3 bg-red-50 border border-red-200 text-red-500 rounded-lg text-[10px] lg:text-sm">
          [Error: No se pudo cargar la imagen]
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className={`w-full h-full rounded-lg shadow-sm object-cover transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
}
