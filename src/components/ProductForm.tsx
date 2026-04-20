"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import {
 Save,
 X,
 Package,
 DollarSign,
 Tag,
 Info,
 Plus,
 Trash2,
 ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCarBattery } from "@fortawesome/free-solid-svg-icons";

interface ProductFormProps {
 initialData?: Product;
 onSubmit: (data: any) => Promise<void>;
 isLoading: boolean;
 title: string;
}

export default function ProductForm({
 initialData,
 onSubmit,
 isLoading,
 title,
}: ProductFormProps) {
 const router = useRouter();
 const { warehouses, fetchWarehouses } = useWarehouseStore();

 // Colores de la marca LTH basados en tus referencias
 const colors = {
  navy: "#0B1B3D", // Azul oscuro LTH
  red: "#C8102E", // Rojo LTH
 };

 useEffect(() => {
  fetchWarehouses();
 }, [fetchWarehouses]);

 const [formData, setFormData] = useState<any>(() => {
  if (initialData) {
   const { id, category, brand, ...rest } = initialData;
   return {
    ...rest,
    price:
     typeof rest.price === "string" ? parseFloat(rest.price) : rest.price || 0,
    priceWithDiscount:
     typeof rest.priceWithDiscount === "string"
      ? parseFloat(rest.priceWithDiscount)
      : rest.priceWithDiscount || 0,
    categoryId: category?.id || 1,
    brandId: brand && typeof brand === "object" ? brand.id : 1,
    sku: rest.sku ? String(rest.sku) : "",
    batteryModel: rest.batteryModel || {},
    filtersModel: rest.filtersModel || { type: "oil" },
    oilsModel: rest.oilsModel || { type: "synthetic" },
    inventories: (rest as any).inventories ?? [],
   };
  }
  return {
   name: "",
   description: "",
   price: 0,
   priceWithDiscount: 0,
   sku: "",
   brandId: 1,
   categoryId: 1,
   batteryModel: {
    bci: "",
    coldCrankingAmps: 0,
    crankingAmps: 0,
    reserveCapacityMinutes: 0,
    lengthMm: 0,
    widthMm: 0,
    heightMm: 0,
    weightKg: 0,
    voltage: 12,
    amperageAh: 0,
    polarity: "",
    modelCode: "",
    en: "",
    warranty: 0,
   },
   filtersModel: {
    type: "oil",
   },
   oilsModel: {
    viscosity: "",
    type: "synthetic",
    volumeIt: 0,
   },
   inventories: [],
  };
 });

 const generateSKU = (
  name: string,
  categoryId: number,
  brandId: number,
 ): string => {
  if (!name.trim()) return "";

  const prefixes: Record<number, string> = {
   1: "BAT", // Baterías
   2: "FIL", // Filtros
   3: "OIL", // Aceites
  };

  const prefix = prefixes[categoryId] || "GEN";

  // Limpiar nombre: Mayúsculas, sin acentos, solo alfanumérico
  const cleanName = name
   .trim()
   .toUpperCase()
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g, "")
   .replace(/[^A-Z0-9]/g, "");

  // Tomar parte del nombre (max 6 chars)
  const namePart = cleanName.substring(0, 6);

  // ID de Marca con formato (3 dígitos)
  const brandPart = String(brandId).padStart(3, "0");

  // Parte única determinística basada en el nombre completo
  // Esto mantiene el SKU estable mientras se escribe
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i);
   hash |= 0;
  }
  const uniquePart = Math.abs(hash).toString(36).toUpperCase().substring(0, 4);

  return `${prefix}-${brandPart}-${namePart}-${uniquePart}`;
 };

 const handleChange = (
  e: React.ChangeEvent<
   HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
 ) => {
  const { name, value } = e.target;
  setFormData((prev: any) => {
   const newValue =
    name === "price" || name === "priceWithDiscount"
     ? parseFloat(value) || 0
     : name === "categoryId" || name === "brandId"
       ? parseInt(value) || 1
       : value;

   const newState = {
    ...prev,
    [name]: newValue,
   };

   // Generar SKU automáticamente si cambian campos clave y no es edición
   if (
    !initialData &&
    (name === "name" || name === "categoryId" || name === "brandId")
   ) {
    newState.sku = generateSKU(
     newState.name,
     newState.categoryId,
     newState.brandId,
    );
   }

   return newState;
  });
 };

 const handleModelChange = (
  modelName: "batteryModel" | "filtersModel" | "oilsModel",
  field: string,
  value: any,
 ) => {
  setFormData((prev: any) => ({
   ...prev,
   [modelName]: {
    ...(prev[modelName] || {}),
    [field]: value,
   },
  }));
 };

 const handleInventoryChange = (
  index: number,
  field: string,
  value: string | number,
 ) => {
  setFormData((prev: any) => {
   const newInventories = [...(prev.inventories ?? [])];
   newInventories[index] = {
    ...newInventories[index],
    [field]: field === "warehouseId" ? Number(value) : Number(value),
   };
   return { ...prev, inventories: newInventories };
  });
 };

 const addInventory = () => {
  if ((formData.inventories?.length || 0) >= warehouses.length) return;

  const availableWarehouse = warehouses.find(
   (w) =>
    !formData.inventories?.some(
     (inv: any) => (inv.warehouseId || inv.warehouse?.id) === w.id,
    ),
  );

  if (!availableWarehouse) return;

  setFormData((prev: any) => ({
   ...prev,
   inventories: [
    ...(prev.inventories || []),
    {
     warehouseId: availableWarehouse.id,
     stock: 0,
     stock_min: 5,
     stock_max: 100,
    },
   ],
  }));
 };

 const removeInventory = (index: number) => {
  setFormData((prev: any) => ({
   ...prev,
   inventories: prev.inventories.filter((_: any, i: number) => i !== index),
  }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const submissionData: any = {
   name: formData.name,
   description: formData.description,
   price: Number(formData.price),
   priceWithDiscount: Number(formData.priceWithDiscount),
   sku:
    formData.sku ||
    generateSKU(formData.name, formData.categoryId, formData.brandId),
   brandId: formData.brandId || 1,
   categoryId: Number(formData.categoryId),
   status: "active",
  };

  const catId = Number(formData.categoryId);
  if (catId === 1) {
   submissionData.batteryModel = {
    bci: formData.batteryModel.bci,
    coldCrankingAmps: Number(formData.batteryModel.coldCrankingAmps),
    crankingAmps: Number(formData.batteryModel.crankingAmps || 0),
    reserveCapacityMinutes: Number(
     formData.batteryModel.reserveCapacityMinutes || 0,
    ),
    lengthMm: Number(formData.batteryModel.lengthMm || 0),
    widthMm: Number(formData.batteryModel.widthMm || 0),
    heightMm: Number(formData.batteryModel.heightMm || 0),
    weightKg: Number(formData.batteryModel.weightKg || 0),
    voltage: Number(formData.batteryModel.voltage),
    amperageAh: Number(formData.batteryModel.amperageAh),
    polarity: formData.batteryModel.polarity,
    modelCode: formData.batteryModel.modelCode,
    en: formData.batteryModel.en || null,
    warranty: formData.batteryModel.warranty
     ? Number(formData.batteryModel.warranty)
     : null,
    name: formData.name,
   };
  } else if (catId === 2) {
   submissionData.filtersModel = {
    type: formData.filtersModel.type,
   };
  } else if (catId === 3) {
   submissionData.oilsModel = {
    saeGrade: formData.oilsModel.viscosity,
    type: formData.oilsModel.type,
    volumeLiters: Number(formData.oilsModel.volumeIt),
   };
  }

  submissionData.inventories =
   formData.inventories?.map((item: any) => ({
    warehouseId: Number(item.warehouseId || item.warehouse?.id || 1),
    stock: Number(item.stock || 0),
    stock_min: Number(item.stock_min || 5),
    stock_max: Number(item.stock_max || 100),
   })) || [];

  await onSubmit(submissionData);
 };

 // Clases CSS reutilizables para mantener consistencia
 const inputStyles =
  "w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#0B1B3D]/20 focus:border-[#0B1B3D] outline-none transition-all shadow-sm";
 const labelStyles =
  "block mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide";
 const sectionHeaderStyles =
  "flex items-center gap-2 text-[#0B1B3D] text-lg font-bold border-b border-gray-200 pb-3";

 return (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-7xl mx-auto w-full">
   {/* Header del Formulario */}
   <div className="px-4 sm:px-6 md:px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
    <div>
     <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1B3D]">
      {title}
     </h2>
     <p className="text-sm text-gray-500 mt-1">
      Complete los detalles del producto para el catálogo.
     </p>
    </div>
    <button
     type="button"
     onClick={() => router.back()}
     className="p-2 text-gray-400 hover:text-[#C8102E] hover:bg-red-50 rounded-full transition-all"
     title="Cerrar"
    >
     <X size={24} />
    </button>
   </div>

   <form onSubmit={handleSubmit} className="p-4 sm:px-6 md:p-8 space-y-10">
    {/* Información General */}
    <section className="space-y-5">
     <div className={sectionHeaderStyles}>
      <Info size={20} className="text-[#C8102E]" />
      <h3>Información General</h3>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div>
       <label className={labelStyles}>Nombre del Producto</label>
       <input
        required
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej. Batería LTH L-34-600"
        className={inputStyles}
       />
      </div>
      <div>
       <label className={labelStyles}>SKU (Automático)</label>
       <input
        disabled
        type="text"
        name="sku"
        value={formData.sku}
        placeholder={initialData ? formData.sku : "Generado al escribir..."}
        className="w-full bg-gray-100 border border-gray-200 p-3 rounded-lg text-sm text-gray-400 cursor-not-allowed outline-none shadow-inner"
       />
      </div>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div>
       <label className={labelStyles}>Categoría</label>
       <select
        name="categoryId"
        value={formData.categoryId}
        onChange={handleChange}
        className={`${inputStyles} cursor-pointer`}
       >
        <option value={1}>Baterías</option>
        <option value={2}>Filtros</option>
        <option value={3}>Aceites</option>
       </select>
      </div>
      <div>
       <label className={labelStyles}>ID Marca</label>
       <input
        required
        type="number"
        name="brandId"
        value={formData.brandId}
        onChange={handleChange}
        className={inputStyles}
       />
      </div>
      <div>
       <label className={labelStyles}>Precio (MXN)</label>
       <div className="relative">
        <input
         required
         type="number"
         name="price"
         value={formData.price}
         onChange={handleChange}
         min="0"
         step="0.01"
         className={`${inputStyles} pl-10`}
        />
        <DollarSign
         size={18}
         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
       </div>
      </div>
      <div>
       <label className={labelStyles}>Precio con Intercambio</label>
       <div className="relative">
        <input
         type="number"
         name="priceWithDiscount"
         value={formData.priceWithDiscount}
         onChange={handleChange}
         min="0"
         step="0.01"
         className={`${inputStyles} pl-10`}
        />
        <DollarSign
         size={18}
         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
       </div>
      </div>
     </div>

     <div>
      <label className={labelStyles}>Descripción</label>
      <textarea
       name="description"
       value={formData.description}
       onChange={handleChange}
       rows={3}
       placeholder="Detalles adicionales del producto..."
       className={`${inputStyles} resize-y min-h-[80px]`}
      />
     </div>
    </section>

    {/* Especificaciones Técnicas */}
    <section className="space-y-5">
     <div className={sectionHeaderStyles}>
      <Tag size={20} className="text-[#C8102E]" />
      <h3>Especificaciones Técnicas</h3>
     </div>

     {Number(formData.categoryId) === 1 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
       <div>
        <label className={labelStyles}>Código de Modelo</label>
        <input
         type="text"
         value={formData.batteryModel?.modelCode || ""}
         onChange={(e) =>
          handleModelChange("batteryModel", "modelCode", e.target.value)
         }
         placeholder="Ej. L-34-600"
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Terminal EN</label>
        <input
         type="text"
         value={formData.batteryModel?.en || ""}
         onChange={(e) =>
          handleModelChange("batteryModel", "en", e.target.value)
         }
         placeholder="Ej. T1"
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>BCI</label>
        <input
         type="text"
         value={formData.batteryModel?.bci || ""}
         onChange={(e) =>
          handleModelChange("batteryModel", "bci", e.target.value)
         }
         placeholder="Ej. 34"
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>CCA (Arranque Frío)</label>
        <input
         type="number"
         value={formData.batteryModel?.coldCrankingAmps || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "coldCrankingAmps",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>CA (Arranque)</label>
        <input
         type="number"
         value={formData.batteryModel?.crankingAmps || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "crankingAmps",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Capacidad Reserva (Min)</label>
        <input
         type="number"
         value={formData.batteryModel?.reserveCapacityMinutes || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "reserveCapacityMinutes",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Largo (mm)</label>
        <input
         type="number"
         value={formData.batteryModel?.lengthMm || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "lengthMm",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Ancho (mm)</label>
        <input
         type="number"
         value={formData.batteryModel?.widthMm || 0}
         onChange={(e) =>
          handleModelChange("batteryModel", "widthMm", parseInt(e.target.value))
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Alto (mm)</label>
        <input
         type="number"
         value={formData.batteryModel?.heightMm || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "heightMm",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Peso (Kg)</label>
        <input
         type="number"
         step="0.01"
         value={formData.batteryModel?.weightKg || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "weightKg",
           parseFloat(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Voltaje (V)</label>
        <input
         type="number"
         value={formData.batteryModel?.voltage || 12}
         onChange={(e) =>
          handleModelChange("batteryModel", "voltage", parseInt(e.target.value))
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Amperaje (Ah)</label>
        <input
         type="number"
         value={formData.batteryModel?.amperageAh || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "amperageAh",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Polaridad</label>
        <div className="relative">
         <select
          value={formData.batteryModel?.polarity || ""}
          onChange={(e) =>
           handleModelChange("batteryModel", "polarity", e.target.value)
          }
          className={`${inputStyles} cursor-pointer appearance-none pl-10 pr-10`}
         >
          <option value="" disabled>
           Seleccionar Polaridad...
          </option>
          <option value="(-)/(+)">(-) / (+) Estándar</option>
          <option value="(+)/(-)">(+) / (-) Invertida</option>
         </select>
         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <FontAwesomeIcon icon={faCarBattery} />
         </div>
         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
          <ChevronDown size={16} />
         </div>
        </div>
       </div>
       <div>
        <label className={labelStyles}>Garantía (Meses)</label>
        <input
         type="number"
         value={formData.batteryModel?.warranty || 0}
         onChange={(e) =>
          handleModelChange(
           "batteryModel",
           "warranty",
           parseInt(e.target.value),
          )
         }
         className={inputStyles}
        />
       </div>
      </div>
     )}

     {Number(formData.categoryId) === 3 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
       <div>
        <label className={labelStyles}>Viscosidad (SAE)</label>
        <input
         type="text"
         value={formData.oilsModel?.viscosity || ""}
         onChange={(e) =>
          handleModelChange("oilsModel", "viscosity", e.target.value)
         }
         placeholder="Ej. 5W-30"
         className={inputStyles}
        />
       </div>
       <div>
        <label className={labelStyles}>Tipo de Aceite</label>
        <select
         value={formData.oilsModel?.type}
         onChange={(e) =>
          handleModelChange("oilsModel", "type", e.target.value)
         }
         className={`${inputStyles} cursor-pointer`}
        >
         <option value="synthetic">Sintético</option>
         <option value="semiSynthetic">Semisintético</option>
         <option value="mineral">Mineral</option>
        </select>
       </div>
       <div>
        <label className={labelStyles}>Volumen (Litros)</label>
        <input
         type="number"
         step="0.1"
         value={formData.oilsModel?.volumeIt || 0}
         onChange={(e) =>
          handleModelChange("oilsModel", "volumeIt", parseFloat(e.target.value))
         }
         className={inputStyles}
        />
       </div>
      </div>
     )}

     {Number(formData.categoryId) === 2 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
       <div>
        <label className={labelStyles}>Tipo de Filtro</label>
        <select
         value={formData.filtersModel?.type}
         onChange={(e) =>
          handleModelChange("filtersModel", "type", e.target.value)
         }
         className={`${inputStyles} cursor-pointer`}
        >
         <option value="oil">Aceite</option>
         <option value="air">Aire</option>
         <option value="fuel">Combustible</option>
         <option value="cabin">Cabina</option>
        </select>
       </div>
      </div>
     )}
    </section>

    {/* Inventario */}
    <section className="space-y-5">
     <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-3">
      <div className="flex items-center gap-2 text-[#0B1B3D] text-lg font-bold">
       <Package size={20} className="text-[#C8102E]" />
       <h3>Existencias en Bodegas</h3>
      </div>
      <button
       type="button"
       onClick={addInventory}
       disabled={
        warehouses.length === 0 ||
        formData.inventories?.length >= warehouses.length
       }
       className="flex items-center justify-center gap-2 text-sm font-bold text-[#0B1B3D] bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
       <Plus size={16} />
       Agregar Bodega
      </button>
     </div>

     <div className="space-y-4">
      {formData.inventories?.map((inv: any, index: number) => (
       <div
        key={index}
        className="bg-gray-50/80 border border-gray-200 p-4 sm:p-5 rounded-xl relative group transition-all hover:border-[#0B1B3D]/30 shadow-sm"
       >
        <button
         type="button"
         onClick={() => removeInventory(index)}
         className="absolute -top-3 -right-3 bg-white border border-gray-200 p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#C8102E] hover:border-[#C8102E] shadow-md transition-all"
         title="Eliminar bodega"
        >
         <Trash2 size={16} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="sm:col-span-2 lg:col-span-1">
          <label className={labelStyles}>Bodega / Almacén</label>
          <select
           value={inv.warehouseId || inv.warehouse?.id || ""}
           onChange={(e) =>
            handleInventoryChange(index, "warehouseId", e.target.value)
           }
           className={`${inputStyles} cursor-pointer`}
          >
           <option value="" disabled>
            Seleccionar bodega
           </option>
           {warehouses.map((w) => {
            const isSelectedElsewhere = formData.inventories?.some(
             (otherInv: any, otherIndex: number) =>
              otherIndex !== index &&
              (otherInv.warehouseId || otherInv.warehouse?.id) === w.id,
            );

            return (
             <option key={w.id} value={w.id} disabled={isSelectedElsewhere}>
              {w.name} {isSelectedElsewhere ? "(Ya asignada)" : ""}
             </option>
            );
           })}
          </select>
         </div>
         <div>
          <label className={labelStyles}>Stock Actual</label>
          <input
           required
           type="number"
           min="0"
           value={inv.stock ?? 0}
           onChange={(e) =>
            handleInventoryChange(index, "stock", e.target.value)
           }
           className={inputStyles}
          />
         </div>
         <div>
          <label className={labelStyles}>Mínimo</label>
          <input
           type="number"
           value={inv.stock_min ?? 5}
           onChange={(e) =>
            handleInventoryChange(index, "stock_min", e.target.value)
           }
           className={inputStyles}
          />
         </div>
         <div>
          <label className={labelStyles}>Máximo</label>
          <input
           type="number"
           value={inv.stock_max ?? 100}
           onChange={(e) =>
            handleInventoryChange(index, "stock_max", e.target.value)
           }
           className={inputStyles}
          />
         </div>
        </div>
       </div>
      ))}
      {(!formData.inventories || formData.inventories.length === 0) && (
       <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <Package size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">
         Aún no has configurado el inventario en bodegas.
        </p>
        <button
         type="button"
         onClick={addInventory}
         disabled={warehouses.length === 0}
         className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-[#0B1B3D] px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
         <Plus size={18} />
         Configurar Inventario
        </button>
       </div>
      )}
     </div>
    </section>

    {/* Acciones */}
    <div className="pt-8 mt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-gray-100">
     <button
      type="button"
      onClick={() => router.back()}
      className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-center"
     >
      Cancelar
     </button>
     <button
      type="submit"
      disabled={isLoading}
      className="flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A30D25] text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
     >
      {isLoading ? (
       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
       <Save size={18} />
      )}
      {initialData ? "Guardar Cambios" : "Crear Producto"}
     </button>
    </div>
   </form>
  </div>
 );
}
