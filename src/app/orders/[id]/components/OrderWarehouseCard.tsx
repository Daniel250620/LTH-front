"use client";

import { Building2 } from "lucide-react";
import { OrderWarehouse } from "@/store/useOrderStore";

interface OrderWarehouseCardProps {
  warehouse: OrderWarehouse | null;
}

export default function OrderWarehouseCard({ warehouse }: OrderWarehouseCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          <Building2 size={20} />
        </div>
        <div>
          <h3 className="font-black text-[#102B5E] uppercase tracking-widest text-xs md:text-[13px]">
            Emisor / Sucursal
          </h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Almacén de origen</p>
        </div>
      </div>
      <div className="space-y-1.5 pl-0.5">
        <p className="font-black text-xl text-[#102B5E] leading-tight">
          {warehouse?.name || "LTH - OAXACA"}
        </p>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {warehouse?.address || "Expertos en Acumuladores, Oaxaca de Juárez, México"}
        </p>
      </div>
    </div>
  );
}
