"use client";

import { FileText } from "lucide-react";
import { OrderItem } from "@/store/useOrderStore";

interface OrderItemsTableProps {
  items: OrderItem[];
  totalAmount: number | string;
}

export default function OrderItemsTable({ items, totalAmount }: OrderItemsTableProps) {
  // Adaptation logic for table display
  const mappedItems = items.map((item) => {
    const product = (item as any).productId;
    const sku = product?.sku || item.sku || "N/A";
    const name = product?.name || item.name || "Producto sin nombre";
    const quantity = item.quantity;
    const unitPrice = parseFloat((item as any).price || item.unitPrice || "0");
    const subtotal = quantity * unitPrice;
    return { sku, name, quantity, unitPrice, subtotal };
  });

  const subtotalSum = mappedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmountNum = typeof totalAmount === "string" ? parseFloat(totalAmount) : totalAmount;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 bg-[#102B5E]/5 text-[#102B5E] rounded-lg flex items-center justify-center shrink-0">
          <FileText size={15} />
        </div>
        <h3 className="font-black text-[#102B5E] uppercase tracking-widest text-xs md:text-[13px]">
          Detalle de Artículos
        </h3>
      </div>

      <div className="rounded-2xl border border-slate-150 overflow-hidden shadow-xs bg-slate-50/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#102B5E] text-white">
                <th className="px-6 py-5 text-[11px] md:text-xs font-black uppercase tracking-widest w-28">
                  SKU
                </th>
                <th className="px-6 py-5 text-[11px] md:text-xs font-black uppercase tracking-widest">
                  Descripción del Acumulador
                </th>
                <th className="px-6 py-5 text-center text-[11px] md:text-xs font-black uppercase tracking-widest w-20">
                  Cant
                </th>
                <th className="px-6 py-5 text-right text-[11px] md:text-xs font-black uppercase tracking-widest w-32">
                  P. Unitario
                </th>
                <th className="px-6 py-5 text-right text-[11px] md:text-xs font-black uppercase tracking-widest w-32">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mappedItems.map((product, idx) => (
                <tr
                  key={idx}
                  className="anim-row hover:bg-slate-50/80 transition-all duration-150 group/row"
                >
                  <td className="px-6 py-5 font-black text-[#102B5E] text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                      <span>{product.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {/* Icono de energía de la celda de batería */}
                      <div className="w-8 h-8 bg-[#102B5E]/5 text-[#102B5E] rounded-lg flex items-center justify-center shrink-0 group-hover/row:bg-red-500 group-hover/row:text-white transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold text-sm leading-tight group-hover/row:text-slate-950 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Garantía LTH Vigente</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-slate-600 text-sm">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-slate-500 text-sm">
                    $
                    {product.unitPrice.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-[#102B5E] text-sm group-hover/row:text-red-600 transition-colors">
                    $
                    {product.subtotal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div className="flex flex-col items-end anim-total pt-4">
        <div className="w-full sm:w-80 space-y-2">
          <div className="flex justify-between px-4 py-1.5 text-sm text-slate-500 font-bold uppercase tracking-wider">
            <span>Subtotal:</span>
            <span className="text-slate-800 font-black">
              ${subtotalSum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between px-4 py-1.5 text-sm text-slate-500 font-bold uppercase tracking-wider">
            <span>IVA Incluido (16%):</span>
            <span className="text-slate-800 font-black">Sí</span>
          </div>
          
          <div className="h-px bg-slate-100 mx-2 my-1" />

          {/* Total Card con barrido diagonal glow */}
          <div className="bg-[#102B5E] rounded-2xl p-5 text-white shadow-lg shadow-blue-900/15 relative overflow-hidden group/total cursor-default border border-white/5">
            {/* Sweep Shine inside block */}
            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/5 -skew-x-12 group-hover/total:translate-x-[400%] transition-transform duration-1000 ease-in-out" />
            
            <div className="relative flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-300">Total General</p>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mt-0.5">Moneda: MXN</p>
              </div>
              <p className="text-3xl font-black italic tracking-tight">
                $
                {totalAmountNum.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
