"use client";

import { ShieldAlert } from "lucide-react";

export default function OrderCancelledAlert() {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3.5 items-start animate-pulse">
      <div className="w-11 h-11 bg-rose-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-rose-500/10">
        <ShieldAlert size={22} />
      </div>
      <div>
        <p className="font-black text-base text-rose-800 uppercase tracking-tight">Este pedido ha sido Cancelado</p>
        <p className="text-sm text-rose-600 font-semibold leading-relaxed mt-0.5">
          El flujo operativo de esta orden se encuentra suspendido. No se generarán entregas ni cobros adicionales vinculados a este registro.
        </p>
      </div>
    </div>
  );
}
