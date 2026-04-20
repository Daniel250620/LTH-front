"use client";

import { useParams } from "next/navigation";
import {
  Download,
  Phone,
  FileText,
  ArrowLeft,
  User,
  Truck,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuoteStore } from "@/store/useQuoteStore";
import { useEffect, useState } from "react";

export default function QuoteDetailPage() {
  const { id } = useParams();
  const { fetchQuoteById, selectedQuote, loading, error } = useQuoteStore();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!selectedQuote?.fileId || downloading) return;

    setDownloading(true);
    try {
      const res = await fetch(`/api/whatsapp/image/${selectedQuote.fileId}`);
      if (!res.ok) throw new Error("Error al obtener el archivo");

      const contentType = res.headers.get("content-type") || "";
      let extension = "pdf"; // Default to pdf since the button says "Descargar PDF"
      if (contentType.includes("word")) extension = "docx";
      else if (contentType.includes("excel") || contentType.includes("spreadsheet"))
        extension = "xlsx";
      else if (contentType.includes("jpeg") || contentType.includes("jpg"))
        extension = "jpg";
      else if (contentType.includes("png")) extension = "png";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Cotizacion-${selectedQuote.id.substring(0, 8)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("No se pudo descargar el archivo. Por favor intente de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuoteById(id as string);
  }, [id]);

 if (loading && !selectedQuote) {
  return (
   <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
     <div className="w-12 h-12 border-4 border-[#102B5E] border-t-transparent rounded-full animate-spin" />
     <p className="text-slate-500 font-medium">Cargando cotización...</p>
    </div>
   </div>
  );
 }

 if (error || !selectedQuote) {
  return (
   <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
    <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
     <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <FileText size={32} />
     </div>
     <h2 className="text-xl font-bold text-slate-800 mb-2">Error al cargar</h2>
     <p className="text-slate-500 mb-6">
      {error || "No se encontró la cotización solicitada."}
     </p>
     <Link
      href="/quotes"
      className="inline-flex items-center gap-2 bg-[#102B5E] text-white px-6 py-2.5 rounded-xl font-bold transition-all hover:bg-[#1a3d7a]"
     >
      <ArrowLeft size={18} />
      Volver a Cotizaciones
     </Link>
    </div>
   </div>
  );
 }

 const quote = selectedQuote;
 const subtotal = quote.details.total;

 return (
  <>
   <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-nav   { animation: fadeIn    0.35s ease-out forwards; }
        .anim-card  { animation: fadeInUp  0.45s ease-out forwards; }
        .anim-row   { opacity: 0; animation: fadeInUp 0.35s ease-out forwards; }
        .anim-row:nth-child(1) { animation-delay: 0.30s; }
        .anim-row:nth-child(2) { animation-delay: 0.40s; }
        .anim-row:nth-child(3) { animation-delay: 0.50s; }
        .anim-row:nth-child(4) { animation-delay: 0.60s; }
        .anim-total { opacity: 0; animation: fadeInUp 0.45s 0.55s ease-out forwards; }
      `}</style>

   <div className="min-h-screen bg-slate-50 pb-14">
    {/* ── Navigation ─────────────────────────────────────────────── */}
    <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between anim-nav">
     <Link
      href="/quotes"
      className="flex items-center gap-2 text-slate-500 hover:text-[#102B5E] transition-colors duration-200 font-medium text-sm group"
     >
      <ArrowLeft
       size={16}
       className="group-hover:-translate-x-1 transition-transform duration-200"
      />
      Volver a Cotizaciones
     </Link>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`flex items-center gap-2 bg-[#102B5E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-900/20 hover:bg-[#1a3d7a] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {downloading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        {downloading ? "Descargando..." : "Descargar PDF"}
      </button>
    </div>

    {/* ── Main Card ──────────────────────────────────────────────── */}
    <div className="max-w-6xl mx-auto px-6 anim-card">
     <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/70 overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#102B5E] px-8 py-7 sm:px-10">
       {/* decorative blobs */}
       <div className="absolute -top-14 -right-14 w-44 h-44 bg-blue-400 rounded-full opacity-10 blur-3xl pointer-events-none" />
       <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-[#e11d48] rounded-full opacity-10 blur-2xl pointer-events-none" />

       <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        {/* Logo + title */}
        <div className="flex items-center gap-5">
         <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0">
          <Image
           src="/lth-logo.png"
           alt="LTH Logo"
           width={88}
           height={35}
           className="object-contain"
          />
         </div>
         <div className="h-9 w-px bg-white/20 hidden sm:block" />
         <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">
           Cotización
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
           <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Folio:{" "}
            <span className="text-white">
             {quote.id?.substring(0, 10).toUpperCase() || "COT-NEW"}
            </span>
           </span>
           <span className="text-blue-600 text-xs">•</span>
           <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Fecha:{" "}
            <span className="text-white">
             {new Date(quote.createdAt).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
             })}
            </span>
           </span>
          </div>
         </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/25 px-4 py-1.5 rounded-full">
         <CheckCircle2 size={13} className="text-emerald-400" />
         <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
          Documento Válido
         </span>
        </div>
       </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8">
       {/* ── Info Grid ─────────────────────────────────────────── */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Emisor */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-200 transition-colors duration-200">
         <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
           <Building2 size={15} />
          </div>
          <h3 className="font-bold text-[#102B5E] uppercase tracking-widest text-[10px]">
           Emisor
          </h3>
         </div>
         <div className="space-y-1.5">
          <p className="font-black text-lg text-[#102B5E] leading-tight">
           {quote.warehouse?.name || "LTH - OAXACA"}
          </p>
          <p className="text-slate-500 text-sm leading-relaxed">
           {quote.warehouse?.address ||
            "Expertos en Acumuladores, Oaxaca de Juárez, México"}
          </p>
         </div>
        </div>

        {/* Cliente */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-200 transition-colors duration-200">
         <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 bg-blue-50 text-[#102B5E] rounded-lg flex items-center justify-center shrink-0">
           <User size={15} />
          </div>
          <h3 className="font-bold text-[#102B5E] uppercase tracking-widest text-[10px]">
           Preparado para
          </h3>
         </div>
         <div className="space-y-3">
          <div>
           <p className="font-black text-lg text-[#102B5E] leading-tight">
            {quote.name}
           </p>
           <span className="inline-block mt-1.5 text-[9px] font-bold text-[#102B5E] bg-blue-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {quote.customer?.client_number && (
             <div className="flex items-center gap-1.5 text-slate-400 text-xs pt-1">
              <Phone size={11} />
              {quote.customer.client_number}
             </div>
            )}
           </span>
          </div>
          <div className="flex items-start gap-2.5">
           <Truck size={13} className="text-slate-400 mt-0.5 shrink-0" />
           <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
             Método de Entrega
            </p>
            <p className="text-slate-600 font-bold text-sm leading-snug mb-2">
             {quote.details.deliveryMethod}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
             Dirección
            </p>
            <p className="text-slate-600 text-xs leading-snug">
             {quote.details.deliveryAddress || "Recoger en sucursal"}
            </p>
           </div>
          </div>
         </div>
        </div>
       </div>

       {/* ── Products Table ────────────────────────────────────── */}
       <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
         <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
          <FileText size={15} />
         </div>
         <h3 className="font-bold text-[#102B5E] uppercase tracking-widest text-[10px]">
          Detalle de Productos
         </h3>
        </div>

        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
          <thead>
           <tr className="bg-[#102B5E] text-white">
            <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest">
             SKU
            </th>
            <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest">
             Descripción
            </th>
            <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-widest">
             Cant
            </th>
            <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest">
             P. Unitario
            </th>
            <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest">
             Subtotal
            </th>
           </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
           {quote.details.items.map((product, idx) => (
            <tr
             key={idx}
             className="anim-row hover:bg-blue-50/40 transition-colors duration-150"
            >
             <td className="px-5 py-4 font-bold text-[#102B5E] text-sm">
              {product.sku}
             </td>
             <td className="px-5 py-4">
              <p className="text-slate-700 font-medium text-sm">
               {product.name}
              </p>
             </td>
             <td className="px-5 py-4 text-center font-bold text-slate-600 text-sm">
              {product.quantity}
             </td>
             <td className="px-5 py-4 text-right font-medium text-slate-500 text-sm">
              $
              {product.unitPrice.toLocaleString("es-MX", {
               minimumFractionDigits: 2,
              })}
             </td>
             <td className="px-5 py-4 text-right font-black text-[#102B5E] text-sm">
              $
              {product.subtotal.toLocaleString("es-MX", {
               minimumFractionDigits: 2,
              })}
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       </div>

       <div className="flex flex-col items-end anim-total">
        <div className="w-full sm:w-72 space-y-1.5">
         <div className="flex justify-between px-4 py-1.5 text-sm text-slate-500 font-medium">
          <span>Subtotal:</span>
          <span>
           ${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
         </div>
         <div className="flex justify-between px-4 py-1.5 text-sm text-slate-500 font-medium">
          <span>IVA (16%):</span>
          <span>Incluido</span>
         </div>
         <div className="h-px bg-slate-100 mx-2 my-1" />

         {/* Total box */}
         <div className="bg-[#102B5E] rounded-xl p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 w-20 h-full bg-[#e11d48] -skew-x-12 translate-x-10 opacity-20 group-hover:translate-x-6 transition-transform duration-500 pointer-events-none" />
          <div className="relative flex justify-between items-center">
           <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
             Total General
            </p>
            <p className="text-xs font-bold text-blue-300">MXN</p>
           </div>
           <p className="text-2xl font-black">
            $
            {parseFloat(quote.total).toLocaleString("es-MX", {
             minimumFractionDigits: 2,
            })}
           </p>
          </div>
         </div>
        </div>
       </div>

       {/* ── Footer legend ─────────────────────────────────────── */}
       <div className="mt-10 pt-6 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
         <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-medium italic">
           * Precios sujetos a cambios sin previo aviso.
          </p>
          <p className="text-[10px] text-slate-400 font-medium italic">
           * Esta cotización tiene una vigencia de 5 días naturales.
          </p>
         </div>
         <p className="text-[#102B5E] font-black text-sm uppercase tracking-tighter">
          Gracias por su preferencia
         </p>
        </div>
       </div>
      </div>
     </div>

     {/* Brand footer */}
     <div className="mt-8 flex flex-col items-center gap-2.5">
      <div className="w-10 h-0.5 bg-[#e11d48] rounded-full" />
      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
       LTH Oaxaca — Expertos en Acumuladores
      </p>
     </div>
    </div>
   </div>
  </>
 );
}
