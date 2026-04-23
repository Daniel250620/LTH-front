"use client";

import React, { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";

export type MediaModalData = {
 type: "image" | "document";
 src: string;
 fileName?: string;
};

interface MediaModalProps {
 data: MediaModalData | null;
 onClose: () => void;
}

export default function MediaModal({ data, onClose }: MediaModalProps) {
 const [scale, setScale] = useState(1);
 const [position, setPosition] = useState({ x: 0, y: 0 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

 useEffect(() => {
  if (data) {
   document.body.style.overflow = "hidden";
   setScale(1);
   setPosition({ x: 0, y: 0 });
  } else {
   document.body.style.overflow = "auto";
  }
  return () => {
   document.body.style.overflow = "auto";
  };
 }, [data]);

 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
 }, [onClose]);

 if (!data) return null;

 const handleDownload = (e: React.MouseEvent) => {
  e.stopPropagation();
  const a = document.createElement("a");
  a.href = data.src;
  a.download =
   data.fileName || (data.type === "image" ? "imagen.jpg" : "documento.pdf");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
 };

 const handleWheel = (e: React.WheelEvent) => {
  if (data.type !== "image") return;
  e.preventDefault();
  const zoomSensitivity = 0.001;
  const delta = -e.deltaY * zoomSensitivity;
  setScale((prev) => Math.min(Math.max(1, prev + delta), 4));
 };

 const handleMouseDown = (e: React.MouseEvent) => {
  if (scale <= 1 || data.type !== "image") return;
  setIsDragging(true);
  setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
 };

 const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging || scale <= 1) return;
  setPosition({
   x: e.clientX - dragStart.x,
   y: e.clientY - dragStart.y,
  });
 };

 const handleMouseUp = () => {
  setIsDragging(false);
 };

 const zoomIn = (e: React.MouseEvent) => {
  e.stopPropagation();
  setScale((prev) => Math.min(prev + 0.5, 4));
 };

 const zoomOut = (e: React.MouseEvent) => {
  e.stopPropagation();
  setScale((prev) => {
   const newScale = Math.max(1, prev - 0.5);
   if (newScale === 1) setPosition({ x: 0, y: 0 });
   return newScale;
  });
 };

 const modalContent = (
  <div
   className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
   onClick={onClose}
  >
   <div className="absolute top-4 right-4 flex gap-3 z-50">
    <button
     onClick={handleDownload}
     className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
     title="Descargar"
    >
     <Download size={24} />
    </button>
    <button
     onClick={onClose}
     className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
     title="Cerrar"
    >
     <X size={24} />
    </button>
   </div>

   {data.type === "image" && (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-50 bg-black/50 p-2 rounded-full backdrop-blur-md">
     <button
      onClick={zoomOut}
      className="p-2 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-50"
      disabled={scale <= 1}
     >
      <ZoomOut size={24} />
     </button>
     <button
      onClick={zoomIn}
      className="p-2 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-50"
      disabled={scale >= 4}
     >
      <ZoomIn size={24} />
     </button>
    </div>
   )}

   <div
    className={`relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center overflow-hidden ${data.type === "document" ? "pt-16 pb-4 px-4" : "p-4"}`}
    onClick={(e) => e.stopPropagation()}
    onWheel={handleWheel}
   >
    {data.type === "image" ? (
     <img
      src={data.src}
      alt={data.fileName || "Imagen expandida"}
      className={`max-w-full max-h-full object-contain transition-transform duration-200 ease-out ${isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : ""}`}
      style={{
       transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      draggable={false}
     />
    ) : (
     <iframe
      src={data.src}
      className="w-full h-full bg-white rounded-xl shadow-2xl"
      title={data.fileName || "Documento PDF"}
     />
    )}
   </div>
  </div>
 );

 if (typeof document !== "undefined") {
  return createPortal(modalContent, document.body);
 }

 return null;
}
