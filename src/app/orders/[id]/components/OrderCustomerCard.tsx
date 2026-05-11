"use client";

import { User, Phone, Truck, CreditCard } from "lucide-react";
import { OrderCustomer } from "@/store/useOrderStore";

interface OrderCustomerCardProps {
  customer: OrderCustomer | null;
  deliveryMethod: string;
  paymentMethod: string | null;
}

export default function OrderCustomerCard({
  customer,
  deliveryMethod,
  paymentMethod,
}: OrderCustomerCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-50 text-[#102B5E] rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          <User size={20} />
        </div>
        <div>
          <h3 className="font-black text-[#102B5E] uppercase tracking-widest text-xs md:text-[13px]">
            Preparado para
          </h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Información del Cliente</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="font-black text-xl text-[#102B5E] leading-tight">
            {customer?.client_name || "Cliente General"}
          </p>
          {customer?.client_number && (
            <a href={`tel:${customer.client_number}`} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#102B5E] text-sm pt-1 font-bold transition-colors">
              <Phone size={14} className="text-slate-400" />
              {customer.client_number}
            </a>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              Método de Entrega
            </p>
            <div className="flex items-center gap-1.5">
              <Truck size={15} className="text-[#102B5E] shrink-0" />
              <p className="text-slate-800 font-black text-sm leading-tight">
                {deliveryMethod === "delivery" ? "Envío a Domicilio" : "Retiro en Sucursal"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              Método de Pago
            </p>
            <div className="flex items-center gap-1.5">
              <CreditCard size={15} className="text-[#102B5E] shrink-0" />
              <p className="text-slate-800 font-black text-sm leading-tight">
                {paymentMethod === "cash" ? "Efectivo" :
                 paymentMethod === "card" ? "Tarjeta Débito/Crédito" :
                 paymentMethod === "transfer" ? "Transferencia Bancaria" : "Por Definir"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
