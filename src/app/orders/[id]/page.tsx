"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useOrderStore } from "@/store/useOrderStore";

// Co-located sub-components
import OrderHeader from "./components/OrderHeader";
import OrderTimeline from "./components/OrderTimeline";
import OrderHeaderCard from "./components/OrderHeaderCard";
import OrderCancelledAlert from "./components/OrderCancelledAlert";
import OrderWarehouseCard from "./components/OrderWarehouseCard";
import OrderCustomerCard from "./components/OrderCustomerCard";
import OrderTechnicianCard from "./components/OrderTechnicianCard";
import OrderItemsTable from "./components/OrderItemsTable";
import OrderControlConsole from "./components/OrderControlConsole";
import OrderMapWidget from "./components/OrderMapWidget";
import OrderPickupSlaWidget from "./components/OrderPickupSlaWidget";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { fetchOrderById, selectedOrder, loading, error, downloadOrderPdf, updateOrderStatus } = useOrderStore();
  const [downloading, setDownloading] = useState(false);


  useEffect(() => {
    if (id) {
      fetchOrderById(id as string);
    }
  }, [id, fetchOrderById]);

  const handleDownload = async () => {
    if (!selectedOrder?.quoteId) {
      toast.error("No se puede descargar", {
        description: "Este pedido no cuenta con una cotización vinculada para descargar.",
      });
      return;
    }
    if (downloading) return;

    setDownloading(true);
    try {
      const blob = await downloadOrderPdf(selectedOrder.quoteId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Pedido-${selectedOrder.id?.substring(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Error de descarga", {
        description: (err as Error).message || "Hubo un error al generar o descargar el PDF de este pedido.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdateSuccess = () => {
    toast.success("¡Actualización Exitosa!", {
      description: "El estado de la orden ha sido modificado y sincronizado en tiempo real.",
    });
  };

  if (loading && !selectedOrder) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white shadow-xl shadow-slate-100 max-w-sm w-full border border-slate-100">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-[#102B5E]/10" />
            <div className="w-12 h-12 border-4 border-t-red-500 border-r-[#102B5E] border-b-[#102B5E] border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[#102B5E] font-black text-sm uppercase tracking-widest mt-2 animate-pulse">Cargando Pedido...</p>
          <p className="text-slate-400 text-xs font-semibold">Obteniendo registros en tiempo real</p>
        </div>
      </div>
    );
  }

  if (error || !selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center border border-slate-150">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic mb-2 tracking-tight">Fallo de Carga</h2>
          <p className="text-slate-500 text-sm font-medium mb-6">
            {error || "No se encontró el pedido solicitado en los servidores de LTH."}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-[#102B5E] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-900/10 hover:bg-[#1a3d7a] hover:shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            Volver a Pedidos
          </Link>
        </div>
      </div>
    );
  }

  const order = selectedOrder;
  const customer = (typeof order.customerId === "object" ? order.customerId : order.customer) as any;
  const warehouse = (typeof order.warehouseId === "object" ? order.warehouseId : order.warehouse) as any;

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes radar-sweep {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        @keyframes shine {
          100% { left: 125%; }
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(225, 29, 72, 0.2); }
          50% { border-color: rgba(225, 29, 72, 0.6); }
        }
        .page-bg {
          background-color: #f8fafc;
          background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
          background-size: 24px 24px;
        }
        .anim-nav   { animation: fadeIn    0.35s ease-out forwards; }
        .anim-card  { animation: fadeInUp  0.50s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-row   { opacity: 0; animation: fadeInUp 0.40s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-row:nth-child(1) { animation-delay: 0.15s; }
        .anim-row:nth-child(2) { animation-delay: 0.22s; }
        .anim-row:nth-child(3) { animation-delay: 0.29s; }
        .anim-row:nth-child(4) { animation-delay: 0.36s; }
        .anim-row:nth-child(5) { animation-delay: 0.43s; }
        .anim-total { opacity: 0; animation: fadeInUp 0.45s 0.30s ease-out forwards; }
        .radar-grid {
          background-image: radial-gradient(circle, rgba(20, 184, 166, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="pb-16 space-y-6 lg:space-y-8">
        <OrderHeader
          quoteId={order.quoteId}
          orderId={order.id}
          downloading={downloading}
          onDownload={handleDownload}
        />

        <OrderTimeline
          status={order.status}
          deliveryMethod={order.deliveryMethod}
        />

        <div className="w-full max-w-7xl lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 anim-card">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* Columna Principal - Detalle de Pedido */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-md shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col justify-between">
              
              <OrderHeaderCard
                orderId={order.id}
                createdAt={order.createdAt}
                status={order.status}
              />

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-8 flex-1">
                
                {order.status === "cancelled" && (
                  <OrderCancelledAlert />
                )}

                {/* Grid Informativo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OrderWarehouseCard warehouse={warehouse} />
                  <OrderCustomerCard
                    customer={customer}
                    deliveryMethod={order.deliveryMethod}
                    paymentMethod={order.paymentMethod}
                  />
                  <OrderTechnicianCard needsTechnician={order.needsTechnician} />
                </div>

                {/* Tabla de Productos Estilo Invoice Futurista */}
                <OrderItemsTable
                  items={order.items}
                  totalAmount={order.totalAmount}
                />

                {/* Disclaimer Leyendas */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 font-bold italic">
                      * Precios sujetos a modificación conforme a políticas de distribuidor.
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold italic">
                      * Sincronización telemática en tiempo real de estatus de acumuladores.
                    </p>
                  </div>
                  <p className="text-[#102B5E] font-black text-sm uppercase italic tracking-wide bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg">
                    LTH Oaxaca — Energía en Movimiento
                  </p>
                </div>

              </div>
            </div>

            {/* Columna Lateral - Control y Mapa */}
            <div className="lg:col-span-1 flex flex-col gap-6 lg:gap-8 h-full">
              <OrderControlConsole
                orderId={order.id}
                currentStatus={order.status}
                deliveryMethod={order.deliveryMethod}
                updateOrderStatus={updateOrderStatus}
                onSuccess={handleUpdateSuccess}
              />

              {order.deliveryMethod === "pickup" ? (
                <OrderPickupSlaWidget
                  orderId={order.id}
                  warehouse={warehouse}
                  status={order.status}
                  createdAt={order.createdAt}
                  updatedAt={order.updatedAt}
                  updateOrderStatus={updateOrderStatus}
                  onSuccess={handleUpdateSuccess}
                />
              ) : (
                <OrderMapWidget
                  latitude={order.latitude}
                  longitude={order.longitude}
                  deliveryMethod={order.deliveryMethod}
                  deliveryAddressText={order.deliveryAddressText}
                  warehouse={warehouse}
                />
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-7xl lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col items-center gap-3">
          <div className="w-12 h-1 bg-red-600 rounded-full animate-pulse" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Distribuidor Autorizado LTH Oaxaca — Expertos en Acumuladores
          </p>
        </div>
      </div>

    </>
  );
}
