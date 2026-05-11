"use client";

import { Wrench } from "lucide-react";

interface OrderTechnicianCardProps {
  needsTechnician: boolean;
}

export default function OrderTechnicianCard({ needsTechnician }: OrderTechnicianCardProps) {
  return (
    <div className={`md:col-span-2 rounded-2xl p-6 border transition-all duration-300 group ${
      needsTechnician 
        ? "bg-gradient-to-br from-rose-50/50 to-red-50/30 border-red-200 hover:border-red-300 shadow-xs"
        : "bg-slate-50/50 border-slate-150 hover:border-slate-200"
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110 ${
          needsTechnician 
            ? "bg-red-500 text-white animate-pulse" 
            : "bg-slate-200 text-slate-500"
        }`}>
          <Wrench size={20} />
        </div>
        <div>
          <h3 className={`font-black uppercase tracking-widest text-xs md:text-[13px] ${
            needsTechnician ? "text-red-700" : "text-slate-500"
          }`}>
            Soporte Especializado de Instalación
          </h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Instalador Técnico LTH</p>
        </div>
      </div>
      
      {needsTechnician ? (
        <div className="space-y-1 pl-1">
          <p className="font-black text-sm text-red-700 leading-tight">
            REQUIERE TÉCNICO EN SITIO
          </p>
          <p className="text-sm text-red-600/80 leading-normal font-semibold">
            Este pedido cuenta con el servicio de Diagnóstico y Cambio de Acumulador profesional. El despachador debe coordinar el envío junto con un instalador calificado LTH.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5 pl-1">
          <p className="font-extrabold text-sm text-slate-600 leading-tight">
            Solo entrega regular
          </p>
          <p className="text-sm text-slate-400 leading-normal font-semibold">
            No se ha solicitado instalador para esta orden. El acumulador se entregará en mano para instalación por cuenta del receptor.
          </p>
        </div>
      )}
    </div>
  );
}
