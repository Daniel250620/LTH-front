"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, FileText } from "lucide-react";

interface OrderHeaderProps {
  quoteId: string | null;
  orderId: string;
  downloading: boolean;
  onDownload: () => void;
}

export default function OrderHeader({
  quoteId,
  orderId,
  downloading,
  onDownload,
}: OrderHeaderProps) {
  return (
    <div className="w-full max-w-7xl lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row gap-4 items-center justify-between anim-nav">
      <Link
        href="/orders"
        className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-150 text-slate-500 hover:text-[#102B5E] hover:border-slate-300 px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 font-bold text-sm group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform duration-200"
        />
        Volver a Pedidos
      </Link>

      <button
        onClick={onDownload}
        disabled={downloading}
        className={`flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 active:translate-y-px active:scale-[0.99] transition-all duration-200 relative overflow-hidden group/pdfbtn ${downloading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {downloading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <FileText size={15} className="group-hover/pdfbtn:scale-110 transition-transform" />
        )}
        <span>{downloading ? "Generando..." : "Descargar PDF"}</span>
        {!downloading && (
          <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/15 -skew-x-12"
               style={{ animation: 'shine 2.5s ease-in-out infinite' }} />
        )}
      </button>
    </div>
  );
}
