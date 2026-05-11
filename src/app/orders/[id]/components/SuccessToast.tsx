"use client";

import { CheckCircle2 } from "lucide-react";

interface SuccessToastProps {
 show: boolean;
}

export default function SuccessToast({ show }: SuccessToastProps) {
 return (
  <div
   className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-emerald-500/20 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm transition-all duration-500 transform ${
    show
     ? "opacity-100 translate-y-0 scale-100"
     : "opacity-0 translate-y-10 scale-95 pointer-events-none"
   }`}
  >
   <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/15">
    <CheckCircle2 size={20} className="animate-bounce" />
   </div>
   <div className="flex-1 min-w-0">
    <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
     ¡Actualización Exitosa!
    </p>
    <p className="text-[11px] text-slate-300 font-bold leading-normal mt-0.5">
     El estado de la orden ha sido modificado y sincronizado en tiempo real.
    </p>
   </div>
  </div>
 );
}
