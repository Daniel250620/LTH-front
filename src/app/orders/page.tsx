"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
 Search,
 Calendar,
 MapPin,
 ChevronDown,
 ChevronUp,
 Loader2,
 Eye,
 FileText,
 Sliders,
 Truck,
 Store,
 Clock,
 CheckCircle2,
 XCircle,
 DollarSign,
 Trash2,
} from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
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
 const [isHovered, setIsHovered] = useState(false);
 const isActive = currentSort === field;
 return (
  <th
   className="px-5 py-4 cursor-pointer group transition-all duration-150 select-none text-xs md:text-[13px] font-black uppercase tracking-wider"
   style={{
    backgroundColor: isHovered ? "#1A4084" : "transparent",
   }}
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
   onClick={() => onSort(field)}
  >
   <div className="flex items-center gap-2.5">
    <span className={isActive || isHovered ? "text-white transition-colors" : "text-slate-200 transition-colors"}>
     {label}
    </span>
    <div
     className={`flex flex-col -space-y-1 transition-opacity duration-200 ${isActive ? "opacity-100" : isHovered ? "opacity-60" : "opacity-20"}`}
    >
     {isActive ? (
      currentOrder === "desc" ? (
       <ChevronDown size={14} className="text-[#E30613] drop-shadow-[0_0_4px_rgba(227,6,19,0.5)]" />
      ) : (
       <ChevronUp size={14} className="text-[#E30613] drop-shadow-[0_0_4px_rgba(227,6,19,0.5)]" />
      )
     ) : (
      <ChevronUp size={14} className="text-slate-400" />
     )}
    </div>
   </div>
  </th>
 );
}

const STATUS_CONFIG: Record<
 string,
 {
  label: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  bulletColor: string;
 }
> = {
 pending: {
  label: "Pendiente",
  icon: Clock,
  bgColor: "bg-amber-500/10",
  textColor: "text-amber-600",
  borderColor: "border-amber-500/20",
  glowColor: "shadow-amber-500/10",
  bulletColor: "bg-amber-500",
 },
 preparing: {
  label: "En preparación",
  icon: Clock,
  bgColor: "bg-blue-500/10",
  textColor: "text-blue-600",
  borderColor: "border-blue-500/20",
  glowColor: "shadow-blue-500/10",
  bulletColor: "bg-blue-500",
 },
 ready_for_pickup: {
  label: "Listo para sucursal",
  icon: Clock, // standard placeholder fallback, we will use Package custom component below
  bgColor: "bg-purple-500/10",
  textColor: "text-purple-600",
  borderColor: "border-purple-500/20",
  glowColor: "shadow-purple-500/10",
  bulletColor: "bg-purple-500",
 },
 in_transit: {
  label: "En camino",
  icon: Truck,
  bgColor: "bg-cyan-500/10",
  textColor: "text-cyan-600",
  borderColor: "border-cyan-500/20",
  glowColor: "shadow-cyan-500/10",
  bulletColor: "bg-cyan-500",
 },
 completed: {
  label: "Completado",
  icon: CheckCircle2,
  bgColor: "bg-emerald-500/10",
  textColor: "text-emerald-600",
  borderColor: "border-emerald-500/20",
  glowColor: "shadow-emerald-500/10",
  bulletColor: "bg-emerald-500",
 },
 cancelled: {
  label: "Cancelado",
  icon: XCircle,
  bgColor: "bg-rose-500/10",
  textColor: "text-rose-600",
  borderColor: "border-rose-500/20",
  glowColor: "shadow-rose-500/10",
  bulletColor: "bg-rose-500",
 },
};

// Simple visual row skeleton
const SkeletonRow = () => (
 <tr className="animate-pulse">
  <td className="px-6 py-5">
   <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
    <div className="space-y-2">
     <div className="h-4 bg-slate-200 rounded w-32" />
     <div className="h-3 bg-slate-100 rounded w-24" />
    </div>
   </div>
  </td>
  <td className="px-6 py-5">
   <div className="space-y-2">
    <div className="h-3 bg-slate-200 rounded w-16" />
    <div className="h-4 bg-slate-200 rounded w-28" />
    <div className="h-3 bg-slate-100 rounded w-36" />
   </div>
  </td>
  <td className="px-6 py-5">
   <div className="space-y-2">
    <div className="h-4 bg-slate-200 rounded w-24" />
    <div className="h-3 bg-slate-100 rounded w-16" />
   </div>
  </td>
  <td className="px-6 py-5">
   <div className="h-6 bg-slate-200 rounded-full w-24" />
  </td>
  <td className="px-6 py-5">
   <div className="space-y-2">
    <div className="h-4 bg-slate-200 rounded w-16" />
    <div className="h-3 bg-slate-100 rounded w-10" />
   </div>
  </td>
  <td className="px-6 py-5 text-right">
   <div className="flex justify-end">
    <div className="h-8 bg-slate-200 rounded-xl w-20" />
   </div>
  </td>
 </tr>
);

// Package svg icon
const PackageIcon = ({ size, className }: { size: number; className?: string }) => (
 <svg
  className={className}
  style={{ width: size, height: size }}
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={2}
 >
  <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  />
 </svg>
);
const getStatusBadge = (status: string) => {
 const config = STATUS_CONFIG[status] || {
  label: status,
  icon: Clock,
  bgColor: "bg-slate-500/10",
  textColor: "text-slate-600",
  borderColor: "border-slate-500/20",
  glowColor: "shadow-slate-500/5",
  bulletColor: "bg-slate-500",
 };
  
 return (
  <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs md:text-[13px] font-black border uppercase tracking-wider shadow-sm transition-all duration-300 ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.glowColor}`}>
   <span className="relative flex h-2.5 w-2.5">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.bulletColor}`}></span>
    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.bulletColor}`}></span>
   </span>
   {status === "ready_for_pickup" ? (
    <PackageIcon size={14} className="shrink-0" />
   ) : (
    <config.icon size={14} className="shrink-0" />
   )}
   <span>{config.label}</span>
  </span>
 );
};

const getInitials = (name?: string) => {
 if (!name) return "??";
 const parts = name.trim().split(/\s+/);
 if (parts.length >= 2) {
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
 }
 return parts[0].substring(0, 2).toUpperCase();
};

const getAvatarGradient = (name?: string) => {
 if (!name) return "from-slate-500 to-slate-700";
 const colors = [
  "from-[#102B5E] to-[#1e40af]",
  "from-slate-700 to-slate-900",
  "from-[#102B5E] to-[#123E85]",
  "from-[#102B5E] to-red-600",
  "from-slate-800 to-[#102B5E]",
 ];
 let hash = 0;
 for (let i = 0; i < name.length; i++) {
  hash = name.charCodeAt(i) + ((hash << 5) - hash);
 }
 const index = Math.abs(hash) % colors.length;
 return colors[index];
};

const STATUS_ACCENT_COLORS: Record<string, string> = {
 pending: "hover:border-l-amber-500",
 preparing: "hover:border-l-blue-500",
 ready_for_pickup: "hover:border-l-purple-500",
 in_transit: "hover:border-l-cyan-500",
 completed: "hover:border-l-emerald-500",
 cancelled: "hover:border-l-rose-500",
};

export default function OrdersPage() {
 const router = useRouter();
 const { orders, total, limit, offset, loading, fetchOrders } = useOrderStore();
 const { warehouses, fetchWarehouses } = useWarehouseStore();

 const [search, setSearch] = useState("");
 const [warehouseFilter, setWarehouseFilter] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
 const [sortField, setSortField] = useState("createdAt");
 const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

 // Cargar almacenes al inicio
 useEffect(() => {
  fetchWarehouses();
 }, [fetchWarehouses]);

 // Debounce para la búsqueda, filtrado por almacén, estado y ordenamiento
 useEffect(() => {
  const timer = setTimeout(() => {
   fetchOrders({
    search,
    warehouseId: warehouseFilter || undefined,
    status: statusFilter || undefined,
    sort: sortField,
    order: sortOrder,
    offset: 0, // Reset a página 1 cuando cambia el filtro
   });
  }, 400);

  return () => clearTimeout(timer);
 }, [search, warehouseFilter, statusFilter, sortField, sortOrder, fetchOrders]);

 const handlePageChange = useCallback(
  (newOffset: number) => {
   fetchOrders({
    search,
    warehouseId: warehouseFilter || undefined,
    status: statusFilter || undefined,
    sort: sortField,
    order: sortOrder,
    offset: newOffset,
   });
  },
  [search, warehouseFilter, statusFilter, sortField, sortOrder, fetchOrders],
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

 // Compute statistics dynamically for the matching orders on this page
 const stats = useMemo(() => {
  const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount as any || 0), 0);
  const activeOrders = orders.filter(o => ["pending", "preparing", "in_transit"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const deliveryOrders = orders.filter(o => o.deliveryMethod === "delivery").length;
  const pickupOrders = orders.filter(o => o.deliveryMethod !== "delivery").length;

  return { totalAmount, activeOrders, completedOrders, deliveryOrders, pickupOrders };
 }, [orders]);

 return (
   <div className="space-y-8">
    {/* Page Title & Subtitle */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100">
     <div>
      <h1 className="text-3xl md:text-4xl font-black text-[#102B5E] uppercase tracking-wider">
       Órdenes de Servicio
      </h1>
      <p className="text-sm font-semibold text-slate-500 mt-1.5 uppercase tracking-wide">
       Monitoreo de pedidos de acumuladores, despacho a domicilio y recolección en sucursal LTH
      </p>
     </div>
     <div className="flex items-center gap-2.5 text-slate-600 font-bold bg-white px-4.5 py-2.5 rounded-xl border border-slate-100 shadow-xs shrink-0 self-start md:self-auto">
      <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
      <span className="text-xs font-black text-[#102B5E] uppercase tracking-wider">Monitoreo Activo</span>
     </div>
    </div>

    {/* Statistics Dashboard widgets */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
     {/* Card 1: Facturación */}
     <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-[#102B5E]/5 -skew-x-12 group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      <div className="flex items-center justify-between">
       <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
         Facturación en Página
        </p>
        <h4 className="text-2xl md:text-[26px] font-black text-[#102B5E] italic tracking-tight mt-1.5">
         ${stats.totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h4>
        <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wide">
         MXN Neto
        </p>
       </div>
       <div className="w-12 h-12 bg-[#102B5E]/5 text-[#102B5E] rounded-xl flex items-center justify-center shadow-inner group-hover:bg-[#102B5E] group-hover:text-white transition-all duration-300">
        <DollarSign size={22} />
       </div>
      </div>
     </div>

     {/* Card 2: Logística Activa */}
     <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-[#E30613]/5 -skew-x-12 group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      <div className="flex items-center justify-between">
       <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
         Logística Activa
        </p>
        <h4 className="text-2xl md:text-[26px] font-black text-[#102B5E] tracking-tight mt-1.5">
         {stats.activeOrders} <span className="text-xs md:text-sm font-bold text-slate-400">pedidos</span>
        </h4>
        <p className="text-xs font-bold text-amber-600 mt-1.5 uppercase tracking-wide flex items-center gap-1.5">
         <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
         </span>
         En Proceso de Despacho
        </p>
       </div>
       <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
        <Truck size={22} />
       </div>
      </div>
     </div>

     {/* Card 3: Entregas Exitosas */}
     <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-emerald-500/5 -skew-x-12 group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      <div className="flex items-center justify-between">
       <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
         Entregas Exitosas
        </p>
        <h4 className="text-2xl md:text-[26px] font-black text-[#102B5E] tracking-tight mt-1.5">
         {stats.completedOrders} <span className="text-xs md:text-sm font-bold text-slate-400">órdenes</span>
        </h4>
        <p className="text-xs font-bold text-emerald-600 mt-1.5 uppercase tracking-wide flex items-center gap-1.5">
         <CheckCircle2 size={12} className="text-emerald-500" />
         Sincronización Correcta
        </p>
       </div>
       <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
        <CheckCircle2 size={22} />
       </div>
      </div>
     </div>

     {/* Card 4: Distribución de Despacho */}
     <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-purple-500/5 -skew-x-12 group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      <div className="flex items-center justify-between">
       <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
         Tipo de Despacho
        </p>
        <h4 className="text-sm md:text-base font-black text-[#102B5E] tracking-tight mt-2 flex items-center gap-2.5">
         <span className="flex items-center gap-1.5">
          <Truck size={14} className="text-blue-500 shrink-0" /> {stats.deliveryOrders} Dom.
         </span>
         <span className="text-slate-200">|</span>
         <span className="flex items-center gap-1.5">
          <Store size={14} className="text-purple-500 shrink-0" /> {stats.pickupOrders} Suc.
         </span>
        </h4>
        <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wide">
         Preferencia del Cliente
        </p>
       </div>
       <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
        <Store size={22} />
       </div>
      </div>
     </div>
    </div>

    {/* Toolbar */}
    <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
     <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
      {/* Search Bar */}
      <div className="relative w-full sm:w-[320px] lg:w-[360px]">
       <input
        type="text"
        placeholder="Buscar por cliente, sucursal o folio..."
        className="w-full bg-slate-50/50 border text-slate-700 border-slate-200 placeholder:text-slate-400 p-3.5 pl-12 rounded-xl text-sm md:text-base focus:bg-white focus:border-[#102B5E] focus:ring-4 focus:ring-[#102B5E]/5 outline-none transition-all shadow-xs hover:border-slate-300 font-medium"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
       />
       <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
       />
      </div>

      {/* Warehouse Selector */}
      <div className="relative w-full sm:w-[240px] lg:w-[280px]">
       <MapPin
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
       />
       <select
        className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 p-3.5 pl-12 pr-10 rounded-xl text-sm md:text-base appearance-none focus:bg-white focus:border-[#102B5E] focus:ring-4 focus:ring-[#102B5E]/5 outline-none transition-all shadow-xs hover:border-slate-300 cursor-pointer font-medium"
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
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
       />
      </div>

      {/* Status Selector */}
      <div className="relative w-full sm:w-[200px] lg:w-[240px]">
       <Sliders
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
       />
       <select
        className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 p-3.5 pl-12 pr-10 rounded-xl text-sm md:text-base appearance-none focus:bg-white focus:border-[#102B5E] focus:ring-4 focus:ring-[#102B5E]/5 outline-none transition-all shadow-xs hover:border-slate-300 cursor-pointer font-medium"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
       >
        <option value="">Todos los estados</option>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
         <option key={key} value={key}>
          {config.label}
         </option>
        ))}
       </select>
       <ChevronDown
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
       />
      </div>
     </div>

     {/* Clear filters action button */}
     {(search || warehouseFilter || statusFilter) && (
      <div className="flex items-center justify-end xl:pl-4">
       <button
        onClick={() => {
         setSearch("");
         setWarehouseFilter("");
         setStatusFilter("");
        }}
        className="w-full xl:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-[#E30613] hover:bg-red-700 text-white rounded-xl text-xs md:text-sm font-black uppercase tracking-wider shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
       >
        <Trash2 size={16} />
        <span>Limpiar Filtros</span>
       </button>
      </div>
     )}
    </div>

    {/* Main Content Table Container */}
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden min-h-[400px] relative transition-all duration-300">
     <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
      <div className="flex items-center gap-3">
       <div className="w-3 h-3 rounded-full bg-[#102B5E] animate-pulse" />
       <p className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-wider">
        Monitoreo de Pedidos: <span className="text-[#102B5E] font-black text-sm md:text-base">{total}</span> órdenes encontradas
       </p>
      </div>
      {loading && (
       <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#102B5E]/5 border border-[#102B5E]/10 rounded-full">
        <Loader2 className="w-3.5 h-3.5 text-[#102B5E] animate-spin" />
        <span className="text-xs font-black text-[#102B5E] uppercase tracking-wider">Sincronizando</span>
       </div>
      )}
     </div>

     <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
       <thead>
        <tr className="bg-[#102B5E] text-slate-200 uppercase text-xs md:text-[13px] font-black tracking-wider">
         <SortHeader
          label="Cliente"
          field="cliente"
          currentSort={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
         />
         <SortHeader
          label="Entrega / Sucursal"
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
          label="Estado"
          field="status"
          currentSort={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
         />
         <SortHeader
          label="Total"
          field="totalAmount"
          currentSort={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
         />
         <th className="px-6 py-5 text-right text-xs md:text-[13px] font-black uppercase tracking-wider text-slate-300">Acciones</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
        {loading && orders.length === 0 ? (
         Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
        ) : (
         orders.map((order) => {
          const customer = (typeof order.customerId === "object" ? order.customerId : order.customer) as any;
          const warehouse = (typeof order.warehouseId === "object" ? order.warehouseId : order.warehouse) as any;
          const clientName = customer?.client_name || "Sin nombre";
          const borderLeftAccent = STATUS_ACCENT_COLORS[order.status] || "hover:border-l-[#102B5E]";

          return (
           <tr
            key={order.id}
            className={`border-l-4 border-l-transparent ${borderLeftAccent} hover:bg-slate-50 hover:translate-x-0.5 transition-all duration-200`}
           >
            {/* Cliente */}
            <td className="px-6 py-5">
             <div className="flex items-center gap-4">
              {/* Beautiful Avatar Block */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getAvatarGradient(clientName)} flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0 tracking-wide`}>
               {getInitials(clientName)}
              </div>
              <div>
               <div className="font-extrabold text-[#102B5E] text-base leading-tight">
                {clientName}
               </div>
               <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>Tel: {customer?.client_number || "N/A"}</span>
               </div>
              </div>
             </div>
            </td>

            {/* Entrega o Sucursal */}
            <td className="px-6 py-5">
             {order.deliveryMethod === "delivery" ? (
              <div className="space-y-1.5">
               <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Truck size={12} className="shrink-0" />
                <span>Domicilio</span>
               </div>
               <div className="font-extrabold text-slate-800 text-sm leading-tight">
                Envío Programado
               </div>
               <div
                className="text-xs font-semibold text-slate-500 max-w-[220px] truncate flex items-center gap-1"
                title={order.deliveryAddressText || ""}
               >
                <MapPin size={11} className="shrink-0 text-slate-400" />
                <span>{order.deliveryAddressText || "Sin dirección"}</span>
               </div>
              </div>
             ) : (
              <div className="space-y-1.5">
               <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Store size={12} className="shrink-0" />
                <span>Sucursal</span>
               </div>
               <div className="font-extrabold text-slate-800 text-sm leading-tight">
                {warehouse?.name || "Sucursal no asignada"}
               </div>
               <div
                className="text-xs font-semibold text-slate-500 max-w-[220px] truncate flex items-center gap-1"
                title={warehouse?.address || ""}
               >
                <MapPin size={11} className="shrink-0 text-slate-400" />
                <span>{warehouse?.address || "Retiro en tienda"}</span>
               </div>
              </div>
             )}
            </td>

            {/* Fecha */}
            <td className="px-6 py-5">
             <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
               <Calendar size={14} className="text-[#102B5E]/60 shrink-0" />
               <span>
                {new Date(order.createdAt).toLocaleDateString("es-MX", {
                 day: "2-digit",
                 month: "short",
                 year: "numeric",
                })}
               </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
               <Clock size={12} className="text-slate-400 shrink-0" />
               <span>
                {new Date(order.createdAt).toLocaleTimeString("es-MX", {
                 hour: "2-digit",
                 minute: "2-digit",
                 hour12: true,
                })}
               </span>
              </div>
             </div>
            </td>

            {/* Estado */}
            <td className="px-6 py-5">
             {getStatusBadge(order.status)}
            </td>

            {/* Total */}
            <td className="px-6 py-5">
             <div>
              <div className="text-base font-black text-[#102B5E] tracking-tight flex items-baseline gap-0.5">
               <span className="text-sm font-bold text-[#102B5E]/70">$</span>
               <span className="text-lg md:text-[20px] italic font-black">
                {parseFloat(order.totalAmount as unknown as string).toLocaleString("es-MX", {
                 minimumFractionDigits: 2,
                })}
               </span>
              </div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-[#102B5E]/30" />
               <span>MXN Neto</span>
              </div>
             </div>
            </td>

            {/* Acciones */}
            <td className="px-6 py-5 text-right">
             <div className="flex items-center justify-end">
              <button
               className="group/btn flex items-center gap-1.5 px-4 py-2 bg-[#102B5E] text-white rounded-xl text-xs md:text-sm font-black uppercase tracking-wider shadow-xs hover:bg-[#E30613] hover:shadow-md hover:shadow-red-500/20 active:scale-95 transition-all duration-200"
               title="Ver Detalles de la Orden"
               onClick={() => router.push(`/orders/${order.id}`)}
              >
               <span>Detalle</span>
               <Eye size={14} className="group-hover/btn:scale-110 transition-transform shrink-0" />
              </button>
             </div>
            </td>
           </tr>
          );
         })
        )}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
         <tr>
          <td colSpan={6} className="px-6 py-16 text-center">
           <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-4">
            {/* Animated outer circle representing empty state */}
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-transform duration-300">
             <div className="absolute inset-0 bg-red-500/5 rounded-2xl animate-ping opacity-25 pointer-events-none"></div>
             <FileText size={28} className="text-slate-400" />
            </div>
            <div className="space-y-1">
             <h3 className="text-sm font-black text-[#102B5E] uppercase tracking-wider">
              Sin Órdenes Registradas
             </h3>
             <p className="text-xs text-slate-400 font-medium">
              No encontramos pedidos que coincidan con los criterios de búsqueda o filtros seleccionados.
             </p>
            </div>
            {(search || warehouseFilter || statusFilter) && (
             <button
              onClick={() => {
               setSearch("");
               setWarehouseFilter("");
               setStatusFilter("");
              }}
              className="px-4 py-2 bg-slate-800 text-white hover:bg-[#E30613] rounded-xl text-xs font-black uppercase tracking-widest shadow-xs hover:shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer"
             >
              Restablecer Filtros
             </button>
            )}
           </div>
          </td>
         </tr>
        )}
       </tbody>
      </table>
     </div>

     {/* Pagination */}
     <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between">
      <p className="text-xs md:text-sm font-semibold text-slate-500">
       Página {currentPage} de {totalPages} | Mostrando {orders.length} de{" "}
       {total} órdenes
      </p>
      <div className="flex items-center gap-2">
       <button
        onClick={() => handlePageChange(offset - limit)}
        disabled={offset === 0 || loading}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-30 transition-all hover:border-[#102B5E] hover:text-[#102B5E] disabled:hover:border-slate-200 disabled:hover:text-slate-400 active:scale-95 cursor-pointer font-bold text-sm md:text-base"
       >
        &lt;
       </button>
       <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#102B5E] text-white text-xs md:text-sm font-black shadow-md relative overflow-hidden">
        {currentPage}
       </span>
       <button
        onClick={() => handlePageChange(offset + limit)}
        disabled={offset + limit >= total || loading}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-30 transition-all hover:border-[#102B5E] hover:text-[#102B5E] disabled:hover:border-slate-200 disabled:hover:text-slate-400 active:scale-95 cursor-pointer font-bold text-sm md:text-base"
       >
        &gt;
       </button>
      </div>
     </div>
    </div>
   </div>
 );
}
