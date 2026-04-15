import React from "react";
import { 
  Box, 
  MapPin, 
  Truck, 
  ChevronRight, 
  Clock, 
  Package, 
  CheckCircle2,
  Building2
} from "lucide-react";
import { Transfer } from "@/store/useTransferStore";

interface TransferCardProps {
  transfer: Transfer;
  onAction?: (transfer: Transfer) => void;
}

export const TransferCard: React.FC<TransferCardProps> = ({ transfer, onAction }) => {
  const { id, fromWarehouse, toWarehouse, items, createdAt, status } = transfer;

  // Simple relative time formatter
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) return `Hace ${diffInMins} min${diffInMins !== 1 ? 's' : ''}`;
    if (diffInHours < 24) return `Hace ${diffInHours} hr${diffInHours !== 1 ? 's' : ''}`;
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  };

  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 hover:shadow-md hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-zinc-400 font-bold text-sm">#{id}</span>
        <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
          <Clock size={10} />
          {formatTimeAgo(createdAt)}
        </div>
      </div>

      {/* Warehouses Flow */}
      <div className="relative pl-6 space-y-4 mb-4">
        {/* Connection Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-px border-l border-dashed border-zinc-200" />

        {/* Origin */}
        <div className="relative flex items-center gap-3">
          <div className="absolute -left-[1.35rem] p-1 bg-white border border-zinc-100 rounded-full text-zinc-400 group-hover:text-amber-500 transition-colors">
            <Building2 size={12} />
          </div>
          <p className="text-zinc-600 text-sm font-medium leading-tight truncate">
            {fromWarehouse.name}
          </p>
        </div>

        {/* Destination */}
        <div className="relative flex items-center gap-3">
          <div className="absolute -left-[1.35rem] p-1 bg-white border border-zinc-100 rounded-full text-zinc-400 group-hover:text-blue-500 transition-colors">
            <MapPin size={12} />
          </div>
          <p className="text-zinc-800 text-sm font-bold leading-tight truncate">
            {toWarehouse.name}
          </p>
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full mb-4" />

      {/* Footer / Stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Package size={14} className="text-zinc-400" />
          <span className="text-xs font-medium">{totalPieces} pzas.</span>
        </div>

        {status === "pending" && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(transfer);
            }}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors"
          >
            Autorizar <ChevronRight size={14} />
          </button>
        )}

        {status === "in_transit" && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(transfer);
            }}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors"
          >
            Recibir <CheckCircle2 size={14} />
          </button>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} />
            Entregado
          </div>
        )}
      </div>
    </div>
  );
};
