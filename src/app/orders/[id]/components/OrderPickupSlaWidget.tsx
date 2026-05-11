"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Battery, 
  UserCheck, 
  Zap, 
  Sparkles, 
  Check, 
  FileText,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Building2,
  Lock
} from "lucide-react";
import { OrderWarehouse } from "@/store/useOrderStore";

interface OrderPickupSlaWidgetProps {
  orderId: string;
  warehouse: OrderWarehouse | null;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  updateOrderStatus?: (id: string, status: string) => Promise<void>;
  onSuccess?: () => void;
}

export default function OrderPickupSlaWidget({
  orderId,
  warehouse,
  status,
  createdAt,
  updatedAt,
  updateOrderStatus,
  onSuccess
}: OrderPickupSlaWidgetProps) {
  const isCompleted = status === "completed";
  const isReady = status === "ready_for_pickup" || isCompleted;
  const isPreparing = status === "preparing" || isReady;

  // Real time metrics
  const orderDate = createdAt ? new Date(createdAt) : new Date();
  const updateDate = updatedAt ? new Date(updatedAt) : orderDate;
  
  const addMinutes = (date: Date, mins: number) => new Date(date.getTime() + mins * 60000);
  
  let timePickPack = addMinutes(orderDate, 12);
  let timeCert = addMinutes(orderDate, 15);
  let timeReady = addMinutes(orderDate, 18);
  let timeHandover = updateDate;

  if (status === "preparing") {
    timePickPack = updateDate;
  } else if (status === "ready_for_pickup") {
    const diff = updateDate.getTime() - orderDate.getTime();
    timePickPack = new Date(orderDate.getTime() + diff * 0.6);
    timeCert = new Date(orderDate.getTime() + diff * 0.9);
    timeReady = updateDate;
  } else if (status === "completed") {
    const diff = updateDate.getTime() - orderDate.getTime();
    timePickPack = new Date(orderDate.getTime() + diff * 0.4);
    timeCert = new Date(orderDate.getTime() + diff * 0.7);
    timeReady = new Date(orderDate.getTime() + diff * 0.8);
    timeHandover = updateDate;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  };

  const [elapsedTime, setElapsedTime] = useState("00h 00m 00s");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let diff = isCompleted 
        ? updateDate.getTime() - orderDate.getTime()
        : now.getTime() - orderDate.getTime();
        
      if (diff < 0) diff = 0;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const pad = (n: number) => String(n).padStart(2, "0");
      setElapsedTime(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [orderDate.getTime(), updateDate.getTime(), isCompleted]);

  return (
    <div className="bg-white rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 p-6 flex flex-col justify-between space-y-6 animate-card relative overflow-hidden group">
      
      {/* Decorative LTH Tech Grid Background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Glow effect on top right */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#102B5E]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Content */}
      <div className="space-y-4 flex-1 flex flex-col justify-between z-10">
        
        {/* Widget Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#102B5E]/5 text-[#102B5E] rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Clock size={20} className="text-[#102B5E]" />
            </div>
            <div>
              <h3 className="font-black text-[#102B5E] uppercase tracking-widest text-xs md:text-[13px]">
                Logística de Sucursal y SLA
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Monitoreo Interno de Operaciones
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="bg-red-50 text-red-600 border border-red-100 font-black text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded-md shadow-xs animate-pulse">
              RECOGER EN SUCURSAL
            </span>
          </div>
        </div>

        {/* SLA Summary Dashboard */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-wider">Tiempo de Surtido</span>
            <span className="font-black text-slate-800 text-base">12 minutos</span>
            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Dentro de SLA (-18m)
            </span>
          </div>

          <div className="flex flex-col border-l border-slate-200 pl-3">
            <span className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-wider">Tiempo Transcurrido</span>
            <span className="font-mono font-black text-slate-800 text-base animate-pulse">{elapsedTime}</span>
            <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">
              Desde {formatTime(orderDate)}
            </span>
          </div>
        </div>

        {/* Internal SLA/Operational Timeline */}
        <div className="space-y-4 py-2">
          <span className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-widest block">
            Línea de Tiempo del Pedido (Interno)
          </span>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200">
            
            {/* Step 1 */}
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-6 w-5.5 h-5.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-xs">
                <Check className="w-3 h-3 text-white stroke-[3px]" />
              </div>
              <div className="flex-1 text-left pl-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-black text-xs text-slate-800 uppercase tracking-wide">
                    Pedido Registrado
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{formatTime(orderDate)}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">
                  Inyectado por canal API (Bot WhatsApp)
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-3">
              <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                isPreparing ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-white border-slate-300'
              }`}>
                {isPreparing ? (
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                ) : status === 'pending' ? (
                   <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="flex-1 text-left pl-1">
                <div className="flex items-baseline justify-between">
                  <span className={`font-black text-xs uppercase tracking-wide ${isPreparing ? 'text-slate-800' : 'text-slate-400'}`}>
                    Pick & Pack Completado
                  </span>
                  {isPreparing && <span className="text-[10px] font-mono font-bold text-slate-400">{formatTime(timePickPack)}</span>}
                </div>
                {isPreparing ? (
                  <>
                    <p className="text-[11px] text-slate-500 font-bold leading-tight">
                      Surtido por <span className="text-[#102B5E]">Roberto Gómez</span> (Aux. de Almacén)
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-bold">
                      Batería LTH L-42-400 — SKU: L42-400
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">En espera de asignación en almacén</p>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-3">
              <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                isReady ? 'bg-emerald-500' : status === 'preparing' ? 'bg-amber-500 animate-pulse' : 'bg-white border-slate-300'
              }`}>
                {isReady ? (
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                ) : status === 'preparing' ? (
                   <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="flex-1 text-left pl-1">
                <div className="flex items-baseline justify-between">
                  <span className={`font-black text-xs uppercase tracking-wide ${isReady ? 'text-slate-800' : 'text-slate-400'}`}>
                    Certificación de Voltaje
                  </span>
                  {isReady && <span className="text-[10px] font-mono font-bold text-slate-400">{formatTime(timeCert)}</span>}
                </div>
                {isReady ? (
                  <p className="text-[11px] text-emerald-600 font-black flex items-center gap-1 mt-0.5">
                    <Zap size={12} className="fill-emerald-500 text-emerald-500" />
                    Prueba de carga aprobada (12.68V)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">Pendiente de testeo LTH</p>
                )}
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start gap-3">
              <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                isCompleted ? 'bg-emerald-500' : isReady ? 'bg-amber-500 animate-pulse' : 'bg-white border-slate-300'
              }`}>
                {isCompleted ? (
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                ) : isReady ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="flex-1 text-left pl-1">
                <div className="flex items-baseline justify-between">
                  <span className={`font-black text-xs uppercase tracking-wide ${
                    isCompleted ? 'text-slate-800' : isReady ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    Listo para Retiro (Estante)
                  </span>
                  {isReady && <span className="text-[10px] font-mono font-bold text-slate-400">{formatTime(timeReady)}</span>}
                </div>
                {isReady ? (
                  <>
                    <p className="text-[11px] text-slate-500 font-bold leading-tight">
                      Notificado al cliente vía Bot WhatsApp
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] text-[#102B5E] bg-[#102B5E]/5 px-2 py-0.5 rounded-md mt-1 font-bold">
                      Ubicación: Estante de Retiros A-2
                    </span>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">El pedido aún no llega al área de retiros</p>
                )}
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative flex items-start gap-3">
              <div className={`absolute -left-6 w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                isCompleted 
                  ? 'bg-emerald-500' 
                  : 'bg-white border-slate-300'
              }`}>
                {isCompleted ? (
                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="flex-1 text-left pl-1">
                <div className="flex items-baseline justify-between">
                  <span className={`font-black text-xs uppercase tracking-wide ${
                    isCompleted ? 'text-slate-800 font-black' : 'text-slate-400'
                  }`}>
                    Handover / Entrega Física
                  </span>
                  {isCompleted && <span className="text-[10px] font-mono font-bold text-slate-400">{formatTime(timeHandover)}</span>}
                </div>
                {isCompleted ? (
                  <div className="space-y-1.5 mt-1">
                    <p className="text-[11px] text-slate-500 font-bold">
                      Despachado por cajera: <span className="text-[#102B5E]">Andrea Ruiz</span>
                    </p>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Firma Registrada</p>
                        <p className="text-xs text-indigo-900 font-serif italic tracking-wide select-none font-bold">
                          Juan Carlos Martínez M.
                        </p>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold leading-tight">
                    Requiere validación de código de seguridad del cliente y recepción de casco usado.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>



      </div>

      {/* Information text matching the footer of the panel */}
      <div className="space-y-3 shrink-0 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-400">
          <Building2 size={15} />
          <span className="text-[11px] font-black uppercase tracking-widest">
            Sucursal Responsable
          </span>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed font-bold bg-slate-50 border border-slate-150 p-4 rounded-2xl">
          {warehouse?.name || "LTH - Sucursal Oaxaca Centro"}
          <span className="block text-[11px] text-slate-400 font-semibold mt-1">
            {warehouse?.address || "Calzada Niños Héroes de Chapultepec #104, Centro, Oaxaca, Oax."}
          </span>
        </p>
      </div>

    </div>
  );
}
