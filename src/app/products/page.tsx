"use client";

import { useState, useEffect } from "react";
import { ProductSummary } from "@/types/product";
import { useProductStore } from "@/store/useProductStore";
import {
 Search,
 Eye,
 Pencil,
 AlertCircle,
 ChevronUp,
 ChevronDown,
 CarFront,
} from "lucide-react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import CompatibleVehiclesModal, { VehicleCompatibility } from "@/components/CompatibleVehiclesModal";
import {
 faCarBattery,
 faFilter,
 faOilCan,
 faTrash,
} from "@fortawesome/free-solid-svg-icons";

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

export default function ProductsPage() {
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [productToDelete, setProductToDelete] = useState<{
  id: string;
  name: string;
 } | null>(null);

 const [compatibilityModalOpen, setCompatibilityModalOpen] = useState(false);
 const [vehicles, setVehicles] = useState<VehicleCompatibility[]>([]);
 const [loadingVehicles, setLoadingVehicles] = useState(false);

 const {
  products,
  loading,
  error,
  search,
  category,
  offset,
  limit,
  sort,
  order,
  fetchProducts,
  setSearch,
  setCategory,
  setPagination,
  setSort,
  deleteProduct,
  fetchVehiclesByProduct,
 } = useProductStore();

 const [localSearch, setLocalSearch] = useState(search);

 // Carga inicial
 useEffect(() => {
  fetchProducts();
 }, [fetchProducts]);

 // Debounce para la búsqueda
 useEffect(() => {
  const timer = setTimeout(() => {
   if (localSearch !== search) {
    setSearch(localSearch);
   }
  }, 300);
  return () => clearTimeout(timer);
 }, [localSearch, setSearch, search]);

 const categories = [
  { label: "Todos", value: "" },
  { label: "Baterías", value: "Batteries" },
  { label: "Filtros", value: "Filters" },
  { label: "Aceites", value: "Oils" },
 ];

 return (
  <div className="space-y-6">
   {/* Toolbar */}
   <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-transparent pt-4">
    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
     <div className="relative w-full sm:min-w-[320px]">
      <input
       type="text"
       placeholder="Buscar por nombre, SKU o categoría..."
       className="w-full bg-white border text-zinc-600 border-zinc-400 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-[#19213d]/10 outline-none transition-all"
       value={localSearch}
       onChange={(e) => setLocalSearch(e.target.value)}
      />
      <Search
       size={18}
       className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
      />
      {loading && (
       <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-[#19213d] border-t-transparent rounded-full" />
      )}
     </div>

     <div className="flex bg-white p-1 rounded-xl border border-zinc-200 shadow-sm">
      {categories.map((cat) => (
       <button
        key={cat.label}
        onClick={() => setCategory(cat.value)}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
         category === cat.value
          ? "bg-[#19213d] text-white shadow-sm"
          : "text-zinc-500 hover:text-[#19213d]"
        }`}
       >
        {cat.label}
       </button>
      ))}
     </div>
    </div>
   </div>

   {/* Main Content Table */}
   <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden min-h-[400px] relative">
    {loading && !products.length && (
     <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
       <div className="animate-spin h-8 w-8 border-4 border-[#19213d] border-t-transparent rounded-full" />
       <p className="text-xs font-bold text-zinc-500">Cargando productos...</p>
      </div>
     </div>
    )}

    {error && (
     <div className="p-12 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-bold text-[#19213d]">Error al cargar</h3>
      <p className="text-zinc-500 text-sm mt-1">{error}</p>
      <button
       onClick={() => fetchProducts()}
       className="mt-4 bg-[#19213d] text-white px-6 py-2 rounded-xl text-sm font-bold"
      >
       Reintentar
      </button>
     </div>
    )}

    <div className="px-6 py-4 border-b border-zinc-50 flex items-center justify-between">
     <p className="text-xs font-bold text-zinc-400">
      <span className="text-[#19213d]">{products.length}</span> productos en
      esta página
     </p>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse">
      <thead>
       <tr className="bg-[#fcfdfe] text-zinc-400 uppercase text-[10px] font-black tracking-widest">
        <SortHeader
         label="Producto"
         field="name"
         currentSort={sort}
         currentOrder={order}
         onSort={setSort}
        />
        <SortHeader
         label="Categoría"
         field="category"
         currentSort={sort}
         currentOrder={order}
         onSort={setSort}
        />
        <SortHeader
         label="Stock"
         field="stock"
         currentSort={sort}
         currentOrder={order}
         onSort={setSort}
        />
        <SortHeader
         label="Precio"
         field="price"
         currentSort={sort}
         currentOrder={order}
         onSort={setSort}
        />
        <th className="px-6 py-4">Detalles Técnicos</th>
        <th className="px-6 py-4 text-center">Acciones</th>
       </tr>
      </thead>
      <tbody
       className={`divide-y divide-zinc-50 ${loading ? "opacity-50" : ""}`}
      >
       {products.map((product: ProductSummary) => (
        <tr
         key={product.id}
         className="hover:bg-[#f8fafc]/50 transition-colors"
        >
         <td className="px-6 py-5">
          <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 shadow-inner">
            {product.category === "Batteries" ? (
             <FontAwesomeIcon icon={faCarBattery} />
            ) : product.category === "Oils" ? (
             <FontAwesomeIcon icon={faOilCan} />
            ) : (
             <FontAwesomeIcon icon={faFilter} />
            )}
           </div>
           <div>
            <div className="font-bold text-[#19213d] text-sm leading-tight">
             {product.name}
            </div>
            <div className="text-[11px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
             {product.sku}
            </div>
           </div>
          </div>
         </td>
         <td className="px-6 py-5">
          <span
           className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            product.category === "Batteries"
             ? "bg-blue-50 text-blue-700"
             : product.category === "Filters"
               ? "bg-orange-50 text-orange-700"
               : "bg-emerald-50 text-emerald-700"
           }`}
          >
           {product.category}
          </span>
         </td>
         <td className="px-6 py-5">
          <div className="flex flex-col gap-1.5">
           <div className="flex justify-between items-end w-32">
            <span className="text-sm font-bold text-[#19213d]">
             {product.stock}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
             unidades
            </span>
           </div>
           <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
             className={`h-full rounded-full ${product.stock > 10 ? "bg-emerald-500" : "bg-red-500"}`}
             style={{
              width: `${Math.min((product.stock / 200) * 100, 100)}%`,
             }}
            ></div>
           </div>
          </div>
         </td>
         <td className="px-6 py-5">
          <div className="text-sm font-black text-[#19213d]">
           ${product.price.toLocaleString("es-MX")}
          </div>
          <div className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase">
           MXN
          </div>
         </td>
         <td className="px-6 py-5">
          <div className="flex flex-wrap gap-1.5 max-w-[320px]">
           {product.details
            ?.split(" | ")
            .filter(Boolean)
            .map((detail, i) => {
             const parts = detail.split(": ");
             const key = parts[0];
             const value = parts[1] || "";

             return (
              <div
               key={i}
               className="flex items-center bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1 gap-1.5 shadow-sm hover:border-zinc-200 transition-colors group/detail"
              >
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter border-r border-zinc-200 pr-1.5 group-hover/detail:text-[#19213d] transition-colors">
                {key}
               </span>
               <span className="text-[10px] font-bold text-zinc-600 whitespace-nowrap">
                {value}
               </span>
              </div>
             );
            }) || (
            <span className="text-[10px] font-bold text-zinc-300 italic">
             Sin detalles técnicos
            </span>
           )}
          </div>
         </td>
         <td className="px-6 py-5 text-center flex items-center justify-center gap-1">
          <button
           className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
           onClick={async () => {
            setCompatibilityModalOpen(true);
            setLoadingVehicles(true);
            const fetchedVehicles = await fetchVehiclesByProduct(parseInt(product.id));
            setVehicles(fetchedVehicles);
            setLoadingVehicles(false);
           }}
           title="Ver vehículos compatibles"
          >
           <CarFront size={16} />
          </button>
          <button
           className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
           onClick={() => {
            setProductToDelete({ id: product.id, name: product.name });
            setDeleteModalOpen(true);
           }}
          >
           <FontAwesomeIcon icon={faTrash} />
          </button>
          <Link
           href={`/products/${product.id}/edit`}
           className="p-2 text-zinc-400 hover:text-[#19213d] hover:bg-zinc-50 rounded-lg transition-all"
          >
           <Pencil size={16} />
          </Link>
         </td>
        </tr>
       ))}
       {!loading && products.length === 0 && (
        <tr>
         <td
          colSpan={6}
          className="px-6 py-12 text-center text-zinc-500 font-bold"
         >
          No se encontraron productos con esos filtros.
         </td>
        </tr>
       )}
      </tbody>
     </table>
    </div>

    {/* Pagination */}
    <div className="px-8 py-5 border-t border-zinc-50 bg-[#fcfdfe] flex items-center justify-between">
     <p className="text-[11px] font-bold text-zinc-400">
      Página {Math.floor(offset / limit) + 1} | Mostrando {products.length}{" "}
      productos
     </p>
     <div className="flex items-center gap-2">
      <button
       disabled={offset === 0 || loading}
       onClick={() => setPagination(limit, Math.max(0, offset - limit))}
       className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
      >
       &lt;
      </button>
      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#19213d] text-white text-[11px] font-bold shadow-md">
       {Math.floor(offset / limit) + 1}
      </span>
      <button
       disabled={products.length < limit || loading}
       onClick={() => setPagination(limit, offset + limit)}
       className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
      >
       &gt;
      </button>
     </div>
    </div>
   </div>

   <ConfirmDeleteModal
    isOpen={deleteModalOpen}
    onClose={() => {
     setDeleteModalOpen(false);
     setProductToDelete(null);
    }}
    onConfirm={async () => {
     if (productToDelete) {
      await deleteProduct(productToDelete.id);
     }
    }}
    productName={productToDelete?.name || ""}
   />
   <CompatibleVehiclesModal 
    isOpen={compatibilityModalOpen}
    onClose={() => setCompatibilityModalOpen(false)}
    vehicles={vehicles}
    isLoading={loadingVehicles}
   />
  </div>
 );
}
