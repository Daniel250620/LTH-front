"use client";

import { X, Package, ShieldCheck, Truck, BarChart } from "lucide-react";
import { Product } from "@/types/product"; // I'll assume this type exists or define it locally if needed

interface ProductDetailModalProps {
 product: any;
 isOpen: boolean;
 onClose: () => void;
}

export default function ProductDetailModal({
 product,
 isOpen,
 onClose,
}: ProductDetailModalProps) {
 if (!isOpen || !product) return null;

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
   <div
    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
    onClick={(e) => e.stopPropagation()}
   >
    {/* Header */}
    <div className="relative h-32 bg-linear-to-br from-blue-800 to-blue-950 p-6 flex items-end">
     <button
      onClick={onClose}
      className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
     >
      <X className="w-5 h-5" />
     </button>
     <div>
      <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
       {product.category?.name || "Refacción"}
      </div>
      <h2 className="text-white text-xl font-bold">{product.name}</h2>
     </div>
    </div>

    {/* Content */}
    <div className="p-8">
     <div className="grid grid-cols-2 gap-8 mb-8">
      <div>
       <div className="flex items-center text-gray-400 mb-2">
        <BarChart className="w-4 h-4 mr-2" />
        <span className="text-xs font-bold uppercase tracking-wider">
         SKU / Identificador
        </span>
       </div>
       <div className="text-gray-900 font-mono font-medium">{product.sku}</div>
      </div>
      <div>
       <div className="flex items-center text-gray-400 mb-2">
        <Truck className="w-4 h-4 mr-2" />
        <span className="text-xs font-bold uppercase tracking-wider">
         Disponibilidad
        </span>
       </div>
       <div
        className={`text-sm font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}
       >
        {product.stock} unidades en stock
       </div>
      </div>
     </div>

     <div className="space-y-4">
      <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
       <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mr-4">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
       </div>
       <div>
        <div className="text-xs font-bold text-gray-900">Garantía LTH</div>
        <div className="text-xs text-gray-500">
         Producto certificado con garantía total del fabricante.
        </div>
       </div>
      </div>

      <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
       <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mr-4">
        <Package className="w-5 h-5 text-blue-600" />
       </div>
       <div>
        <div className="text-xs font-bold text-gray-900">Compatibilidad</div>
        <div className="text-xs text-gray-500">
         Verificado para el motor y modelo seleccionado.
        </div>
       </div>
      </div>
     </div>

     <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
      <div>
       <div className="text-xs text-gray-400 font-bold uppercase mb-1">
        Precio Unitario
       </div>
       <div className="text-2xl font-black text-gray-900">{product.price}</div>
      </div>
      <button
       onClick={onClose}
       className="px-8 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95"
      >
       Cerrar
      </button>
     </div>
    </div>
   </div>
  </div>
 );
}
