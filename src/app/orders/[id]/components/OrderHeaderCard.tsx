"use client";

import Image from "next/image";

interface OrderHeaderCardProps {
  orderId: string;
  createdAt: string;
  status: string;
}

export default function OrderHeaderCard({ orderId, createdAt, status }: OrderHeaderCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1e43] via-[#102B5E] to-[#1e3e78] px-8 py-8 sm:px-10 border-b border-white/5">
      {/* Tech grid mesh background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      {/* Glowing radial circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-400/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          {/* Logo con sombra sutil y marco premium */}
          <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0 border border-white/10 hover:scale-105 transition-transform duration-300">
            <Image
              src="/lth-logo.png"
              alt="LTH Logo"
              width={84}
              height={33}
              className="object-contain"
            />
          </div>
          <div className="h-10 w-px bg-white/15 hidden sm:block" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none flex items-center gap-1.5">
              <span>DETALLE DE PEDIDO</span>
              <span className="text-red-500">•</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-blue-200/80 text-xs md:text-[13px] font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                Folio:{" "}
                <span className="text-white font-black">
                  {orderId?.substring(0, 10).toUpperCase() || "ORD-NEW"}
                </span>
              </span>
              <span className="text-blue-200/80 text-xs md:text-[13px] font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                Fecha:{" "}
                <span className="text-white font-black">
                  {new Date(createdAt).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Battery performance widget */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md">
          <div className="relative w-6 h-9 border-2 border-white/40 rounded-sm p-0.5 flex flex-col justify-end overflow-hidden shrink-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-white/40 -mt-1 rounded-t-xs" />
            <div className={`w-full rounded-xs transition-all duration-1000 ${
              status === "completed" ? "bg-emerald-500 h-full" :
              status === "cancelled" ? "bg-rose-500 h-1/5" :
              status === "in_transit" ? "bg-sky-500 h-3/4 animate-pulse" :
              status === "ready_for_pickup" ? "bg-purple-500 h-3/4 animate-pulse" :
              status === "preparing" ? "bg-blue-500 h-1/2 animate-pulse" :
              "bg-amber-500 h-1/4 animate-pulse"
            }`} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Rendimiento</p>
            <p className="text-sm font-black text-white uppercase italic tracking-tight leading-tight">
              {status === "completed" ? "Carga Completa" :
               status === "cancelled" ? "Anulado" :
               "Procesando"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
