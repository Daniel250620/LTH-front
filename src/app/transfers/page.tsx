"use client";

import React, { useEffect } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import { TransferCard } from "@/components/TransferCard";

const statuses = [
 { id: "pending", label: "Por Autorizar", color: "bg-amber-500" },
 { id: "in_transit", label: "En Tránsito", color: "bg-blue-500" },
 { id: "completed", label: "Completadas", color: "bg-emerald-500" },
] as const;

export default function TransfersPage() {
 const { columns, loading, fetchTransfers, updateTransferStatus } = useTransferStore();

 useEffect(() => {
  // Initial fetch for each column
  statuses.forEach((status) => {
   fetchTransfers({ status: status.id, page: 1, limit: 10 });
  });
 }, [fetchTransfers]);

 const handleLoadMore = (status: (typeof statuses)[number]["id"]) => {
  const colData = columns[status];
  if (colData.page < colData.totalPages) {
   fetchTransfers({ status, page: colData.page + 1, limit: 10 }, true);
  }
 };

 const handleAction = async (transfer: any) => {
  let nextStatus = "";
  if (transfer.status === "pending") nextStatus = "in_transit";
  else if (transfer.status === "in_transit") nextStatus = "completed";

  if (nextStatus) {
   await updateTransferStatus(transfer.id, transfer.status, nextStatus);
  }
 };

 return (
  <div className="flex-1 p-5 lg:p-8 mx-auto w-full max-w-[1600px] flex flex-col h-[calc(100vh-64px)]">
   {/* Kanban Board */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
    {statuses.map((status) => (
     <div
      key={status.id}
      className="flex flex-col h-full bg-zinc-100/70 rounded-3xl border border-zinc-200 p-5"
     >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6 px-1">
       <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
        <h2 className="font-extrabold text-[#19213d]">{status.label}</h2>
        <span className="bg-zinc-200/50 text-zinc-600 text-[11px] font-black px-2 py-0.5 rounded-full">
         {columns[status.id].total}
        </span>
       </div>
      </div>

      {/* Column Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent pb-4">
       {columns[status.id].data.map((transfer) => (
        <TransferCard
         key={transfer.id}
         transfer={transfer}
         onAction={handleAction}
        />
       ))}

       {loading[status.id] && (
        <div className="flex justify-center p-4">
         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
       )}

       {!loading[status.id] &&
        columns[status.id].page < columns[status.id].totalPages && (
         <button
          onClick={() => handleLoadMore(status.id)}
          className="w-full py-3 text-zinc-400 hover:text-blue-600 text-xs font-bold transition-colors"
         >
          Cargar más...
         </button>
        )}

       {columns[status.id].data.length === 0 && !loading[status.id] && (
        <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
         <PackageIcon className="text-zinc-300 mb-2" size={32} />
         <p className="text-xs font-bold text-zinc-400">Sin movimientos</p>
        </div>
       )}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

function PackageIcon({
 className,
 size,
}: {
 className?: string;
 size?: number;
}) {
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   width={size || 24}
   height={size || 24}
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   className={className}
  >
   <path d="M16.5 9.4 7.5 4.21" />
   <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
   <polyline points="3.29 7 12 12 20.71 7" />
   <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
 );
}
