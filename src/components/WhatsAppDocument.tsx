"use client";

import React, { useEffect, useState } from "react";
import {
 FileText,
 Download,
 Loader2,
 AlertCircle,
 ExternalLink,
} from "lucide-react";

interface WhatsAppDocumentProps {
 fileId: string;
 /** Dirección del mensaje para adaptar colores: "in" (burbuja blanca) | "out" (burbuja oscura) */
 direction?: "in" | "out";
 onOpenModal?: (data: {
  type: "document";
  src: string;
  fileName?: string;
 }) => void;
}

interface FileData {
 id: string;
 name: string;
 extension: string;
 url: string;
}

export default function WhatsAppDocument({
 fileId,
 direction = "out",
 onOpenModal,
}: WhatsAppDocumentProps) {
 const [fileData, setFileData] = useState<FileData | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(false);

 // Limpiar el object URL cuando el componente se desmonte
 useEffect(() => {
  return () => {
   if (fileData?.url) {
    URL.revokeObjectURL(fileData.url);
   }
  };
 }, [fileData?.url]);

 const handleDownloadOrOpen = async (
  action: "open" | "download",
  e: React.MouseEvent,
 ) => {
  e.stopPropagation();
  e.preventDefault();

  if (!fileId || loading) return;

  // Si ya tenemos el archivo cacheado en fileData, lo usamos directo
  if (fileData?.url) {
   if (action === "open") {
    if (onOpenModal) {
     onOpenModal({
      type: "document",
      src: fileData.url,
      fileName: `${fileData.name}.${fileData.extension}`,
     });
    } else {
     window.open(fileData.url, "_blank", "noopener,noreferrer");
    }
   } else {
    const a = document.createElement("a");
    a.href = fileData.url;
    a.download = `${fileData.name}.${fileData.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
   }
   return;
  }

  setLoading(true);
  setError(false);

  try {
   const res = await fetch(`/api/whatsapp/image/${fileId}`);
   if (!res.ok) throw new Error("Failed to fetch document");

   const contentType = res.headers.get("content-type") || "";
   let extension = "archivo";
   if (contentType.includes("pdf")) extension = "pdf";
   else if (contentType.includes("word")) extension = "docx";
   else if (
    contentType.includes("excel") ||
    contentType.includes("spreadsheet")
   )
    extension = "xlsx";
   else if (contentType.includes("jpeg") || contentType.includes("jpg"))
    extension = "jpg";
   else if (contentType.includes("png")) extension = "png";

   const blob = await res.blob();
   const url = URL.createObjectURL(blob);

   const newFileData = {
    id: fileId,
    name: "Documento",
    extension,
    url,
   };

   setFileData(newFileData);
   setLoading(false);

   if (action === "open") {
    if (onOpenModal) {
     onOpenModal({
      type: "document",
      src: url,
      fileName: `${newFileData.name}.${newFileData.extension}`,
     });
    } else {
     window.open(url, "_blank", "noopener,noreferrer");
    }
   } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${newFileData.name}.${newFileData.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
   }
  } catch (err) {
   console.error(err);
   setError(true);
   setLoading(false);
  }
 };

 const isOut = direction === "out";

 return (
  <div
   onClick={(e) => handleDownloadOrOpen("open", e)}
   className={`cursor-pointer group flex items-center gap-3 p-3 pr-4 rounded-xl border transition-all duration-200 min-w-[220px] max-w-[280px] no-underline relative ${
    isOut
     ? "bg-white/10 border-white/20 hover:bg-white/20"
     : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
   }`}
   title="Abrir documento"
  >
   {/* Ícono del tipo de archivo */}
   <div
    className={`p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${
     isOut ? "bg-red-400/20" : "bg-red-50"
    }`}
   >
    <FileText size={22} className={isOut ? "text-red-300" : "text-red-500"} />
   </div>

   {/* Nombre y extensión */}
   <div className="flex-1 min-w-0">
    <p
     className={`text-sm font-semibold truncate ${
      isOut ? "text-white" : "text-[#19213d]"
     }`}
    >
     {fileData?.name || "Documento"}
    </p>
    <p
     className={`text-[10px] font-medium uppercase tracking-wide ${
      isOut ? "text-white/50" : "text-zinc-400"
     }`}
    >
     {fileData?.extension || "ARCHIVO"}
     {error && (
      <span className="ml-2 text-red-400 normal-case">Error al descargar</span>
     )}
    </p>
   </div>

   {/* Acciones */}
   <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
    {loading ? (
     <span className="p-1.5 rounded-lg">
      <Loader2
       size={16}
       className={`animate-spin ${isOut ? "text-white/70" : "text-zinc-500"}`}
      />
     </span>
    ) : (
     <>
      <span
       className={`p-1.5 rounded-lg ${
        isOut ? "hover:bg-white/20" : "hover:bg-zinc-200"
       }`}
       title="Abrir"
       onClick={(e) => handleDownloadOrOpen("open", e)}
      >
       <ExternalLink
        size={14}
        className={isOut ? "text-white/70" : "text-zinc-500"}
       />
      </span>
      <span
       className={`p-1.5 rounded-lg transition-colors ${
        isOut ? "hover:bg-white/20" : "hover:bg-zinc-200"
       }`}
       title="Descargar"
       onClick={(e) => handleDownloadOrOpen("download", e)}
      >
       <Download
        size={14}
        className={isOut ? "text-white/70" : "text-zinc-500"}
       />
      </span>
     </>
    )}
   </div>
  </div>
 );
}
