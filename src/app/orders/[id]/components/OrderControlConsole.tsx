"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Sliders,
  Building2,
  Truck,
  CheckCircle2,
  ShieldAlert,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface OrderControlConsoleProps {
  orderId: string;
  currentStatus: string;
  deliveryMethod?: string;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  onSuccess: () => void;
}

const STATUSES_LIST = [
  { id: "pending", label: "Pendiente", color: "amber", icon: Clock, desc: "Recibido en espera" },
  { id: "preparing", label: "Preparación", color: "blue", icon: Sliders, desc: "Alistando productos" },
  { id: "ready_for_pickup", label: "Listo Sucursal", color: "purple", icon: Building2, desc: "Disponible en sucursal" },
  { id: "in_transit", label: "En Camino", color: "sky", icon: Truck, desc: "Reparto en ruta" },
  { id: "completed", label: "Completado", color: "emerald", icon: CheckCircle2, desc: "Entrega concretada" },
  { id: "cancelled", label: "Cancelado", color: "rose", icon: ShieldAlert, desc: "Pedido anulado" },
];

export default function OrderControlConsole({
  orderId,
  currentStatus,
  deliveryMethod,
  updateOrderStatus,
  onSuccess,
}: OrderControlConsoleProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Synchronize local status select with loaded order status
  useEffect(() => {
    if (currentStatus) {
      setSelectedStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleUpdateStatus = async () => {
    if (!orderId || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar estado", {
        description: (err as Error).message || "Hubo un error al actualizar el estado de la orden.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter statuses based on delivery method
  const filteredStatuses = STATUSES_LIST.filter((statusItem) => {
    if (statusItem.id === "ready_for_pickup") {
      return deliveryMethod === "pickup";
    }
    if (statusItem.id === "in_transit") {
      return deliveryMethod === "delivery";
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 p-6 space-y-5 flex flex-col justify-between shrink-0 animate-card">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
          <Sliders size={18} />
        </div>
        <div>
          <h3 className="font-black text-[#102B5E] uppercase tracking-widest text-xs md:text-[13px]">
            Consola de Despacho
          </h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Sincronizar Estatus</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
          Seleccionar Nuevo Estado
        </label>

        {/* Grid of clickable visual states */}
        <div className="grid grid-cols-2 gap-2.5">
          {filteredStatuses.map((statusItem) => {
            const StatusIcon = statusItem.icon;
            const isSelected = selectedStatus === statusItem.id;
            const isCurrent = currentStatus === statusItem.id;
            
            let activeClass = "";
            if (isSelected) {
              if (statusItem.color === "amber") activeClass = "bg-amber-500/10 border-amber-500 text-amber-600 shadow-xs";
              else if (statusItem.color === "blue") activeClass = "bg-blue-500/10 border-blue-500 text-blue-600 shadow-xs";
              else if (statusItem.color === "purple") activeClass = "bg-purple-500/10 border-purple-500 text-purple-600 shadow-xs";
              else if (statusItem.color === "sky") activeClass = "bg-sky-500/10 border-sky-500 text-sky-600 shadow-xs";
              else if (statusItem.color === "emerald") activeClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-xs";
              else if (statusItem.color === "rose") activeClass = "bg-rose-500/10 border-rose-500 text-rose-600 shadow-xs";
            } else {
              activeClass = "bg-slate-50 hover:bg-slate-100/60 border-slate-200 text-slate-600 hover:text-slate-800";
            }
            
            return (
              <button
                key={statusItem.id}
                onClick={() => setSelectedStatus(statusItem.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group/statusbtn ${activeClass}`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-slate-900 text-[9px] text-white font-black px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Actual
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <StatusIcon size={14} className={`transition-transform group-hover/statusbtn:scale-110 ${
                    isSelected ? "" : "text-slate-400"
                  }`} />
                  <span className="text-xs md:text-sm font-black leading-none">{statusItem.label}</span>
                </div>
                <span className="text-[10px] md:text-xs text-slate-400 font-medium leading-none">{statusItem.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3.5 flex gap-2.5 items-start">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            El cambio de estado modifica el progreso del pedido. El cliente recibirá una notificación por WhatsApp al guardar cambios.
          </p>
        </div>

        {/* Operational apply change button */}
        <button
          onClick={handleUpdateStatus}
          disabled={updatingStatus || selectedStatus === currentStatus}
          className={`w-full font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 ${
            selectedStatus === currentStatus 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50"
              : "bg-gradient-to-r from-[#102B5E] to-[#1e3e78] text-white hover:shadow-lg hover:shadow-blue-900/20 active:translate-y-px active:scale-[0.99] border border-blue-800/10 group/updatebtn"
          }`}
        >
          {updatingStatus ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Actualizando...</span>
            </>
          ) : (
            <>
              <Sliders size={15} className={`transition-transform duration-300 ${
                selectedStatus === currentStatus ? "" : "group-hover/updatebtn:rotate-12"
              }`} />
              <span>Aplicar Cambio</span>
            </>
          )}
          {selectedStatus !== currentStatus && (
            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/10 -skew-x-12"
                 style={{ animation: 'shine 2.5s ease-in-out infinite' }} />
          )}
        </button>
      </div>
    </div>
  );
}
