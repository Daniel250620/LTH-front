"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
 Search,
 Download,
 FileText,
 Calendar,
 MapPin,
 ChevronDown,
 ChevronUp,
 Loader2,
 Eye,
} from "lucide-react";
import { useQuoteStore } from "@/store/useQuoteStore";
import { useWarehouseStore } from "@/store/useWarehouseStore";

interface SortHeaderProps {
 label: string;
 field: string;
 currentSort: string;
 currentOrder: "asc" | "desc";
 onSort: (field: string) => void;
}

function SortHeader({
 label,
 field,
 currentSort,
 currentOrder,
 onSort,
}: SortHeaderProps) {
 return (
  <th
   className="px-6 py-4 cursor-pointer group hover:bg-zinc-50 transition-colors"
   onClick={() => onSort(field)}
  >
   <div className="flex items-center gap-1.5">
    <span>{label}</span>
    <div
     className={`transition-opacity ${currentSort === field ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
    >
     {currentSort === field && currentOrder === "desc" ? (
      <ChevronDown size={14} className="text-[#19213d]" />
     ) : (
      <ChevronUp
       size={14}
       className={currentSort === field ? "text-[#19213d]" : ""}
      />
     )}
    </div>
   </div>
  </th>
 );
}

export default function QuotesPage() {
 const router = useRouter();
 const { quotes, total, limit, offset, loading, fetchQuotes } = useQuoteStore();
 const { warehouses, fetchWarehouses } = useWarehouseStore();

 const [search, setSearch] = useState("");
 const [warehouseFilter, setWarehouseFilter] = useState("");
 const [sortField, setSortField] = useState("createdAt");
 const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

 // Cargar almacenes al inicio
 useEffect(() => {
  fetchWarehouses();
 }, [fetchWarehouses]);

 // Debounce para la búsqueda, filtrado por almacén y ordenamiento
 useEffect(() => {
  const timer = setTimeout(() => {
   fetchQuotes({
    search,
    warehouseId: warehouseFilter || undefined,
    sort: sortField,
    order: sortOrder,
    offset: 0, // Reset a página 1 cuando cambia el filtro
   });
  }, 400);

  return () => clearTimeout(timer);
 }, [search, warehouseFilter, sortField, sortOrder, fetchQuotes]);

 const handlePageChange = useCallback(
  (newOffset: number) => {
   fetchQuotes({
    search,
    warehouseId: warehouseFilter || undefined,
    sort: sortField,
    order: sortOrder,
    offset: newOffset,
   });
  },
  [search, warehouseFilter, sortField, sortOrder, fetchQuotes],
 );

 const handleSort = (field: string) => {
  if (sortField === field) {
   setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
   setSortField(field);
   setSortOrder("asc");
  }
 };

 const currentPage = Math.floor(offset / limit) + 1;
 const totalPages = Math.max(1, Math.ceil(total / limit));

 return (
  <div className="space-y-6">
   {/* Toolbar */}
   <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent pt-4">
    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
     <div className="relative w-full sm:w-[360px]">
      <input
       type="text"
       placeholder="Buscar por cliente, sucursal o folio..."
       className="w-full bg-white border text-zinc-600 border-zinc-200 placeholder:text-zinc-400 p-3 pl-10 rounded-xl text-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm hover:border-zinc-300"
       value={search}
       onChange={(e) => setSearch(e.target.value)}
      />
      <Search
       size={18}
       className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
     </div>

     <div className="relative w-full sm:w-[280px]">
      <MapPin
       size={18}
       className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
      />
      <select
       className="w-full bg-white border border-zinc-200 text-zinc-600 p-3 pl-10 pr-10 rounded-xl text-sm appearance-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm hover:border-zinc-300 cursor-pointer"
       value={warehouseFilter}
       onChange={(e) => setWarehouseFilter(e.target.value)}
      >
       <option value="">Todas las sucursales</option>
       <option value="unassigned">Sin sucursal asignada</option>
       {warehouses.map((wh) => (
        <option key={wh.id} value={wh.id}>
         {wh.name}
        </option>
       ))}
      </select>
      <ChevronDown
       size={16}
       className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
      />
     </div>
    </div>
   </div>

   {/* Main Content Table */}
   <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden min-h-[400px] relative">
    <div className="px-6 py-4 border-b border-zinc-50 flex items-center justify-between">
     <div className="flex items-center gap-3">
      <p className="text-xs font-bold text-zinc-400">
       <span className="text-[#19213d]">{total}</span> cotizaciones encontradas
      </p>
      {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse">
      <thead>
       <tr className="bg-[#fcfdfe] text-zinc-400 uppercase text-[10px] font-black tracking-widest">
        <SortHeader
         label="Cliente"
         field="cliente"
         currentSort={sortField}
         currentOrder={sortOrder}
         onSort={handleSort}
        />
        <SortHeader
         label="Sucursal"
         field="sucursal"
         currentSort={sortField}
         currentOrder={sortOrder}
         onSort={handleSort}
        />
        <SortHeader
         label="Fecha"
         field="fecha"
         currentSort={sortField}
         currentOrder={sortOrder}
         onSort={handleSort}
        />
        <SortHeader
         label="Total"
         field="total"
         currentSort={sortField}
         currentOrder={sortOrder}
         onSort={handleSort}
        />
        <th className="px-6 py-4 text-center">Acciones</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50">
       {quotes.map((quote) => (
        <tr key={quote.id} className="hover:bg-[#f8fafc]/50 transition-colors">
         <td className="px-6 py-5">
          <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-inner">
            <FileText size={18} />
           </div>
           <div>
            <div className="font-bold text-[#19213d] text-sm leading-tight">
             {quote.name || "Sin nombre"}
            </div>
            <div className="text-[11px] font-medium text-zinc-400 mt-1">
             Tel: {quote.customer?.client_number || "N/A"}
            </div>
           </div>
          </div>
         </td>
         <td className="px-6 py-5">
          <div className="font-bold text-zinc-700 text-sm">
           {quote.warehouse?.name || "Sucursal no asignada"}
          </div>
          <div
           className="text-[10px] font-medium text-zinc-400 mt-1 max-w-[200px] truncate"
           title={quote.warehouse?.address}
          >
           {quote.warehouse?.address}
          </div>
         </td>
         <td className="px-6 py-5">
          <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1.5 text-sm font-bold text-[#19213d]">
            <Calendar size={14} className="text-zinc-400" />
            {new Date(quote.createdAt).toLocaleDateString("es-MX", {
             day: "2-digit",
             month: "short",
             year: "numeric",
            })}
           </div>
           <div className="text-[10px] font-bold text-zinc-400 uppercase">
            {new Date(quote.createdAt).toLocaleTimeString("es-MX", {
             hour: "2-digit",
             minute: "2-digit",
            })}
           </div>
          </div>
         </td>
         <td className="px-6 py-5">
          <div className="text-sm font-black text-[#19213d]">
           $
           {parseFloat(quote.total).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
           })}
          </div>
          <div className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase">
           MXN
          </div>
         </td>
         <td className="px-6 py-5 text-center flex items-center justify-center gap-2">
          {quote.fileId && (
           <button
            className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Ver / Descargar PDF"
            onClick={() => router.push(`/quotes/${quote.id}`)}
           >
            <Eye size={18} />
           </button>
          )}
         </td>
        </tr>
       ))}
       {quotes.length === 0 && !loading && (
        <tr>
         <td
          colSpan={5}
          className="px-6 py-12 text-center text-zinc-500 font-bold"
         >
          No se encontraron cotizaciones con esos filtros.
         </td>
        </tr>
       )}
      </tbody>
     </table>
    </div>

    {/* Pagination */}
    <div className="px-8 py-5 border-t border-zinc-50 bg-[#fcfdfe] flex items-center justify-between">
     <p className="text-[11px] font-bold text-zinc-400">
      Página {currentPage} de {totalPages} | Mostrando {quotes.length} de{" "}
      {total} cotizaciones
     </p>
     <div className="flex items-center gap-2">
      <button
       onClick={() => handlePageChange(offset - limit)}
       disabled={offset === 0 || loading}
       className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 disabled:opacity-30 transition-colors hover:border-zinc-300"
      >
       &lt;
      </button>
      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#19213d] text-white text-[11px] font-bold shadow-md">
       {currentPage}
      </span>
      <button
       onClick={() => handlePageChange(offset + limit)}
       disabled={offset + limit >= total || loading}
       className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 disabled:opacity-30 transition-colors hover:border-zinc-300"
      >
       &gt;
      </button>
     </div>
    </div>
   </div>
  </div>
 );
}
