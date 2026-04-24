"use client";

import { useState, useEffect } from "react";
import {
 Search,
 ChevronDown,
 Wrench,
 Package,
 Calendar,
 Filter,
 ArrowRight,
 Loader2,
 ArrowUpDown,
 ChevronUp,
} from "lucide-react";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useVehicleStore } from "@/store/useVehicleStore";
import { Vehicle } from "@/types/vehicle";

export default function VehiclesPage() {
 // --- Store ---
 const {
  vehicles,
  loading,
  totalVehicles,
  search,
  year,
  limit,
  offset,
  fetchVehicles,
  setSearch,
  setYear,
  setPagination,
  fetchVehicleById,
  sort,
  order,
  setSort,
 } = useVehicleStore();

 // --- Local States ---
 const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
 const [vehicleDetails, setVehicleDetails] = useState<Record<string, Vehicle>>(
  {},
 );
 const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>(
  {},
 );

 const [localSearch, setLocalSearch] = useState(search);
 const [localYear, setLocalYear] = useState<number | null>(year);

 // --- Initial Fetch ---
 useEffect(() => {
  fetchVehicles();
 }, [fetchVehicles]);

 // --- Debounce for search and year ---
 useEffect(() => {
  const timer = setTimeout(() => {
   if (localSearch !== search) {
    setSearch(localSearch);
   }
   if (localYear !== year) {
    setYear(localYear);
   }
  }, 300);
  return () => clearTimeout(timer);
 }, [localSearch, localYear, setSearch, setYear, search, year]);

 const [selectedProduct, setSelectedProduct] = useState<any>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);

 // --- Logic ---
 const toggleRow = async (id: string) => {
  const isExpanding = !expandedRows[id];
  setExpandedRows((prev) => ({
   ...prev,
   [id]: isExpanding,
  }));

  if (isExpanding && !vehicleDetails[id]) {
   setLoadingDetails((prev) => ({ ...prev, [id]: true }));
   try {
    const detail = await fetchVehicleById(id);
    if (detail) {
     setVehicleDetails((prev) => ({ ...prev, [id]: detail }));
    }
   } catch (error) {
    console.error("Error fetching vehicle details:", error);
   } finally {
    setLoadingDetails((prev) => ({ ...prev, [id]: false }));
   }
  }
 };

 const openProductDetails = (product: any) => {
  const totalStock =
   product.inventories?.reduce(
    (acc: number, inv: any) => acc + (inv.stock || 0),
    0,
   ) || 0;
  setSelectedProduct({ ...product, stock: totalStock });
  setIsModalOpen(true);
 };

 const totalPages = Math.ceil(totalVehicles / limit);
 const currentPage = Math.floor(offset / limit) + 1;

 return (
  <div className="space-y-6">
   {/* Toolbar */}
   <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-transparent">
    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
     <div className="relative w-full sm:min-w-[400px]">
      <input
       type="text"
       placeholder="Buscar por marca, modelo o motorización..."
       className="text-black w-full bg-white border border-zinc-200 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
       value={localSearch}
       onChange={(e) => setLocalSearch(e.target.value)}
      />
      <Search
       size={18}
       className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
     </div>

     <div className="relative w-full sm:w-64 text-black">
      <input
       type="number"
       placeholder="Filtrar por año..."
       className="w-full bg-white border border-zinc-200 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
       value={localYear || ""}
       onChange={(e) =>
        setLocalYear(e.target.value ? parseInt(e.target.value) : null)
       }
      />
      <Calendar
       size={18}
       className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
     </div>
    </div>
   </div>

   {/* Main Table Content */}
   <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden min-h-[500px] flex flex-col">
    {/* Header */}
    <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-blue-950 text-[10px] font-black text-blue-100 uppercase tracking-[0.15em]">
     <div
      className="col-span-4 flex items-center cursor-pointer hover:text-white transition-colors group"
      onClick={() => setSort("brandName")}
     >
      Vehículo
      <span className="ml-2">
       {sort === "brandName" ? (
        order === "asc" ? (
         <ChevronUp size={12} />
        ) : (
         <ChevronDown size={12} />
        )
       ) : (
        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />
       )}
      </span>
     </div>
     <div
      className="col-span-4 flex items-center cursor-pointer hover:text-white transition-colors group"
      onClick={() => setSort("engine")}
     >
      Motorización
      <span className="ml-2">
       {sort === "engine" ? (
        order === "asc" ? (
         <ChevronUp size={12} />
        ) : (
         <ChevronDown size={12} />
        )
       ) : (
        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />
       )}
      </span>
     </div>
     <div
      className="col-span-3 flex items-center cursor-pointer hover:text-white transition-colors group"
      onClick={() => setSort("yearStart")}
     >
      Periodo
      <span className="ml-2">
       {sort === "yearStart" ? (
        order === "asc" ? (
         <ChevronUp size={12} />
        ) : (
         <ChevronDown size={12} />
        )
       ) : (
        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />
       )}
      </span>
     </div>
     <div className="col-span-1 text-right"></div>
    </div>

    {/* List */}
    <div className="flex-1 relative">
     {loading && (
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
       <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
     )}

     {vehicles.length > 0
      ? vehicles.map((vehicle) => (
         <div
          key={vehicle.id}
          className="border-b border-gray-50 last:border-0 group/row"
         >
          {/* Fila Principal */}
          <div
           onClick={() => toggleRow(vehicle.id)}
           className="grid grid-cols-12 gap-4 px-10 py-7 items-center cursor-pointer hover:bg-gray-50/50 transition-all relative"
          >
           {/* Indicador lateral */}
           <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-all duration-300 ${expandedRows[vehicle.id] ? "bg-blue-600" : "bg-transparent group-hover/row:bg-blue-300"}`}
           ></div>

           <div className="col-span-4">
            <div className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-0.5">
             {vehicle.brandName}
            </div>
            <div className="text-sm font-medium text-gray-500">
             {vehicle.name}
            </div>
           </div>

           <div className="col-span-4 flex items-center text-sm font-medium text-gray-600">
            <Wrench className="w-3.5 h-3.5 mr-2.5 text-gray-300" />
            {vehicle.engine}
           </div>

           <div className="col-span-3 text-sm font-medium text-gray-500 tracking-tight">
            {vehicle.yearStart}{" "}
            <ArrowRight className="inline-block w-3 h-3 mx-2 text-gray-300" />{" "}
            {vehicle.yearEnd}
           </div>

           <div className="col-span-1 flex justify-end">
            <button
             className={`p-2 rounded-xl transition-all duration-300 bg-gray-50/50 ${expandedRows[vehicle.id] ? "rotate-180 bg-blue-50 text-blue-600" : "text-gray-300 group-hover/row:text-blue-500"}`}
            >
             <ChevronDown className="w-5 h-5" />
            </button>
           </div>
          </div>

          {/* Contenido Desplegable */}
          <div
           className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedRows[vehicle.id] ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
          >
           <div className="px-10 pb-8 pt-2">
            <div className="ml-6 pl-8 border-l-2 border-blue-100/50">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
              Piezas Compatibles
             </h4>

             {loadingDetails[vehicle.id] ? (
              <div className="flex items-center space-x-3 py-4 text-gray-400">
               <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
               <span className="text-xs font-medium">
                Buscando compatibilidades...
               </span>
              </div>
             ) : (
              <div className="grid gap-3">
               {(vehicleDetails[vehicle.id]?.compatibilities?.length ?? 0) >
               0 ? (
                vehicleDetails[vehicle.id]?.compatibilities?.map(
                 (comp: any) => (
                  <div
                   key={comp.id}
                   className="flex items-center justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group/item"
                  >
                   <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 border border-gray-100 group-hover/item:scale-110 transition-transform">
                     <Package className="w-5 h-5" />
                    </div>
                    <div>
                     <div className="text-sm font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                      {comp.product.name}
                     </div>
                     <div className="flex items-center space-x-2 mt-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                       {comp.product.sku}
                      </div>
                      {comp.product.category && (
                       <>
                        <span className="text-[10px] text-gray-300">•</span>
                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-1.5 rounded">
                         {comp.product.category.name}
                        </div>
                       </>
                      )}
                     </div>
                    </div>
                   </div>
                   <div className="flex items-center space-x-12">
                    <div className="text-right">
                     <div className="text-xs font-bold text-gray-900">
                      {comp.product.inventories?.reduce(
                       (acc: number, inv: any) => acc + inv.stock,
                       0,
                      ) || 0}{" "}
                      pz
                     </div>
                     <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                      Disponibles
                     </div>
                    </div>
                    <div className="w-28 text-right">
                     <div className="text-base font-black text-gray-900">
                      ${comp.product.price}
                     </div>
                    </div>
                    <button
                     onClick={() => openProductDetails(comp.product)}
                     className="px-5 py-2.5 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-95"
                    >
                     Ver detalles
                    </button>
                   </div>
                  </div>
                 ),
                )
               ) : (
                <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                 <p className="text-xs text-gray-400 font-medium">
                  No hay refacciones registradas para este modelo todavía.
                 </p>
                </div>
               )}
              </div>
             )}
            </div>
           </div>
          </div>
         </div>
        ))
      : !loading && (
         <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
           <Filter className="w-8 h-8 text-gray-200" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No hay vehículos</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
           No encontramos vehículos que coincidan con tu búsqueda actual.
          </p>
          <button
           onClick={() => {
            setLocalSearch("");
            setLocalYear(null);
            setSearch("");
            setYear(null);
           }}
           className="mt-6 text-sm font-bold text-blue-600 hover:underline"
          >
           Limpiar filtros
          </button>
         </div>
        )}
    </div>

    {/* Pagination Footer */}
    {totalPages > 1 && (
     <div className="px-10 py-6 border-t border-gray-50 flex items-center justify-between">
      <div className="text-xs font-bold text-gray-400">
       Mostrando <span className="text-gray-900">{vehicles.length}</span> de{" "}
       <span className="text-gray-900">{totalVehicles}</span> vehículos
      </div>
      <div className="flex items-center space-x-2">
       <button
        disabled={currentPage === 1}
        onClick={() => setPagination(limit, offset - limit)}
        className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
       >
        <ChevronDown className="w-4 h-4 rotate-90" />
       </button>

       {(() => {
        const pages: (number | string)[] = [];
        const delta = 1;

        for (let i = 1; i <= totalPages; i++) {
         if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
         ) {
          pages.push(i);
         } else if (
          i === currentPage - delta - 1 ||
          i === currentPage + delta + 1
         ) {
          pages.push("...");
         }
        }

        return pages
         .filter((p, index) => !(p === "..." && pages[index - 1] === "..."))
         .map((page, i) =>
          page === "..." ? (
           <span
            key={`dots-${i}`}
            className="px-2 text-gray-400 font-bold text-xs"
           >
            ...
           </span>
          ) : (
           <button
            key={page}
            onClick={() => setPagination(limit, (Number(page) - 1) * limit)}
            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-blue-950 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50"}`}
           >
            {page}
           </button>
          ),
         );
       })()}

       <button
        disabled={currentPage === totalPages}
        onClick={() => setPagination(limit, offset + limit)}
        className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
       >
        <ChevronDown className="w-4 h-4 -rotate-90" />
       </button>
      </div>
     </div>
    )}
   </div>

   {/* Modal */}
   <ProductDetailModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    product={selectedProduct}
   />
  </div>
 );
}
