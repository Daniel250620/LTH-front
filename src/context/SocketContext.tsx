"use client";

import React, {
 createContext,
 useContext,
 useEffect,
 useState,
 useCallback,
 useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { Customer, Message } from "@/types/chat";
import { useOrderStore } from "@/store/useOrderStore";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

interface SocketContextType {
 socket: Socket | null;
 isConnected: boolean;
 contacts: Customer[];
 loading: boolean;
 activeContactId: number | null;
 setActiveContactId: (id: number | null) => void;
 refreshContacts: () => Promise<void>;
 setContacts: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const SocketContext = createContext<SocketContextType>({
 socket: null,
 isConnected: false,
 contacts: [],
 loading: false,
 activeContactId: null,
 setActiveContactId: () => {},
 refreshContacts: async () => {},
 setContacts: () => {},
});

export const useSocket = () => useContext(SocketContext);

const COLORS = [
 "bg-blue-600",
 "bg-emerald-600",
 "bg-purple-600",
 "bg-orange-600",
 "bg-pink-600",
 "bg-indigo-600",
 "bg-red-600",
 "bg-cyan-600",
];

const getColorFromName = (name: string) => {
 let hash = 0;
 for (let i = 0; i < name.length; i++) {
  hash = name.charCodeAt(i) + ((hash << 5) - hash);
 }
 const index = Math.abs(hash) % COLORS.length;
 return COLORS[index];
};

const MOCK_CUSTOMERS: Customer[] = [
 {
  id: 1,
  client_name: "Soporte Técnico LTH",
  client_number: "5212200000000",
  isBotActive: true,
  avatarColor: getColorFromName("Soporte Técnico LTH"),
 },
 {
  id: 2,
  client_name: "Juan Pérez",
  client_number: "5212200000001",
  isBotActive: false,
  avatarColor: getColorFromName("Juan Pérez"),
 },
];

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
 const router = useRouter();
 const [socket, setSocket] = useState<Socket | null>(null);
 const [isConnected, setIsConnected] = useState(false);
 const [contacts, setContacts] = useState<Customer[]>([]);
 const [loading, setLoading] = useState(false);
 const [activeContactId, setActiveContactIdState] = useState<number | null>(null);
 const activeContactIdRef = useRef<number | null>(null);
 const [realtimeOrder, setRealtimeOrder] = useState<any | null>(null);

 const setActiveContactId = useCallback((id: number | null) => {
  setActiveContactIdState(id);
  activeContactIdRef.current = id;
  if (id !== null) {
   setContacts((prev) =>
    prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
   );
  }
 }, []);

 const fetchContacts = useCallback(async (silent = false) => {
  if (!silent) setLoading(true);
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers`;

  try {
   const response = await fetch(url);
   const text = await response.text();
   try {
    const data = JSON.parse(text);
    console.log(data);
    if (response.ok && Array.isArray(data)) {
     const dataWithColors = data.map((c: any) => ({
      ...c,
      isBotActive: !!c.isBotActive,
      avatarColor: c.avatarColor || getColorFromName(c.client_name || ""),
      activeDeliveryOrdersCount: c.activeDeliveryCount || 0,
      activeDeliveryStatus: c.activeDeliveryStatus || null,
     }));
     setContacts(dataWithColors);
    } else {
     setContacts(MOCK_CUSTOMERS);
    }
   } catch {
    setContacts(MOCK_CUSTOMERS);
   }
  } catch {
   setContacts(MOCK_CUSTOMERS);
  } finally {
   if (!silent) setLoading(false);
  }
 }, []);

 // Sincronizar referencia mutable para evitar stale closures en WebSockets
 const fetchContactsRef = useRef(fetchContacts);
 useEffect(() => {
  fetchContactsRef.current = fetchContacts;
 }, [fetchContacts]);

 // Carga inicial
 useEffect(() => {
  fetchContacts();
 }, [fetchContacts]);

 useEffect(() => {
  const socketInstance = io(
   process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081",
   {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
   },
  );

  socketInstance.on("connect", () => {
   console.log("Socket conectado");
   setIsConnected(true);
   setSocket(socketInstance);
  });

  socketInstance.on("disconnect", () => {
   console.log("Socket desconectado");
   setIsConnected(false);
  });

  // Listeners Globales para la lista de contactos
  socketInstance.on(
   "botStatusChanged",
   (data: { customerId: number; isBotActive: boolean }) => {
    setContacts((prev) =>
     prev.map((c) =>
      c.id === data.customerId ? { ...c, isBotActive: data.isBotActive } : c,
     ),
    );
   },
  );

  socketInstance.on("newCustomer", (newCustomer: Customer) => {
   setContacts((prev) => {
    if (prev.some((c) => c.id === newCustomer.id)) return prev;

    const customerWithColor = {
     ...newCustomer,
     isBotActive: !!newCustomer.isBotActive,
     avatarColor:
      newCustomer.avatarColor ||
      getColorFromName(newCustomer.client_name || ""),
    };

    return [customerWithColor, ...prev];
   });
  });

  socketInstance.on("newMessage", (msg: Message) => {
   console.log("📩 Nuevo mensaje recibido (Global):", msg);
   setContacts((prev) => {
    const index = prev.findIndex((c) => c.id === msg.customerId);
    if (index === -1) return prev;

    const updatedContacts = [...prev];
    const contact = { ...updatedContacts[index] };

    // Actualizar datos del mensaje
    contact.lastMessage = msg;

    // Incrementar contador si NO es el chat activo
    if (msg.customerId !== activeContactIdRef.current) {
     contact.unreadCount = (contact.unreadCount || 0) + 1;
    } else {
     contact.unreadCount = 0;
    }

    // Mover el contacto al principio de la lista
    updatedContacts.splice(index, 1);
    updatedContacts.unshift(contact);

    return updatedContacts;
   });
  });

  socketInstance.on("orderCreated", (order: any) => {
   console.log("🛒 [Socket] Nueva orden detectada:", order);
   useOrderStore.getState().addOrder(order);
   setRealtimeOrder(order);

   // Incrementar conteo si es una orden de envío
   if (order.deliveryMethod === "delivery") {
    const customerId = typeof order.customerId === "object"
     ? (order.customerId as any)?.id
     : order.customer?.id || order.customerId;
    const parsedId = Number(customerId);

    if (!isNaN(parsedId)) {
     setContacts((prev) =>
      prev.map((c) => {
       if (c.id === parsedId) {
        const newCount = (c.activeDeliveryOrdersCount || 0) + 1;
        const statusPriority: Record<string, number> = {
         in_transit: 4,
         ready_for_pickup: 3,
         preparing: 2,
         pending: 1,
        };
        const currentPri = c.activeDeliveryStatus ? (statusPriority[c.activeDeliveryStatus] || 0) : 0;
        const orderPri = statusPriority[order.status] || 1;
        const newStatus = orderPri > currentPri ? order.status : c.activeDeliveryStatus || order.status;
        return {
         ...c,
         activeDeliveryOrdersCount: newCount,
         activeDeliveryStatus: newStatus,
        };
       }
       return c;
      }),
     );
     fetchContactsRef.current(true);
    }
   }

   // Encender el punto naranja si el usuario está en otra vista
   if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/orders" &&
    !window.location.pathname.startsWith("/orders/")
   ) {
    useOrderStore.getState().setHasUnreadOrders(true);
   }
  });

  socketInstance.on("orderUpdated", (order: any) => {
   console.log("🔄 [Socket] Orden actualizada detectada:", order);
   useOrderStore.getState().updateOrder(order);

   // Decrementar si pasa a completado o cancelado y es de envío
   if (order.deliveryMethod === "delivery") {
    const customerId = typeof order.customerId === "object"
     ? (order.customerId as any)?.id
     : order.customer?.id || order.customerId;
    const parsedId = Number(customerId);

    if (!isNaN(parsedId)) {
     const isTerminal = order.status === "completed" || order.status === "cancelled";
     setContacts((prev) =>
      prev.map((c) => {
       if (c.id === parsedId) {
        let newCount = c.activeDeliveryOrdersCount || 0;
        if (isTerminal) {
         newCount = Math.max(0, newCount - 1);
        }
        return {
         ...c,
         activeDeliveryOrdersCount: newCount,
         activeDeliveryStatus: isTerminal && newCount === 0 ? null : c.activeDeliveryStatus,
        };
       }
       return c;
      }),
     );
     fetchContactsRef.current(true);
    }
   }
  });

  return () => {
   socketInstance.disconnect();
   setSocket(null);
  };
 }, []);

 return (
  <SocketContext.Provider
   value={{
    socket,
    isConnected,
    contacts,
    loading,
    activeContactId,
    setActiveContactId,
    refreshContacts: fetchContacts,
    setContacts,
   }}
  >
   {children}

   {/* Premium Animated Real-time Order Notification Toast */}
   {realtimeOrder && (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-in-order max-w-md w-[380px] bg-slate-900 text-white rounded-2xl border border-emerald-500/30 shadow-[0_20px_50px_rgba(16,43,94,0.3)] p-4 flex flex-col gap-3 overflow-hidden text-left">
     {/* Local keyframes style block */}
     <style>{`
      @keyframes slideInOrder {
       0% { transform: translateX(120%) scale(0.9); opacity: 0; }
       70% { transform: translateX(-10px) scale(1.02); }
       100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      .animate-slide-in-order {
       animation: slideInOrder 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
     `}</style>

     {/* Decorative pulse glow */}
     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

     {/* Header */}
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
       <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
       </span>
       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
        Nueva Orden En Tiempo Real
       </span>
      </div>
      <button
       onClick={() => setRealtimeOrder(null)}
       className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all cursor-pointer"
      >
       <X size={14} />
      </button>
     </div>

     {/* Content */}
     <div className="flex gap-3">
      <div className="w-10 h-10 bg-[#102B5E] text-white rounded-xl flex items-center justify-center font-bold border border-white/10 shadow-inner shrink-0 text-xs">
       LTH
      </div>
      <div className="flex-1 min-w-0">
       <h4 className="font-bold text-sm text-white truncate leading-tight">
        {typeof realtimeOrder.customerId === "object"
         ? (realtimeOrder.customerId as any)?.client_name
         : (realtimeOrder.customer as any)?.client_name || "Cliente Registrado"}
       </h4>
       <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
        <span>Folio:</span>
        <span className="text-slate-200 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
         {realtimeOrder.id.slice(0, 8)}
        </span>
       </p>
      </div>
     </div>

     {/* Divider */}
     <div className="h-[1px] bg-white/10 w-full" />

     {/* Footer & Action */}
     <div className="flex items-center justify-between mt-0.5">
      <div className="flex flex-col">
       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total a Cobrar</span>
       <span className="text-sm font-black text-emerald-400">
        ${parseFloat(realtimeOrder.totalAmount || 0).toLocaleString("es-MX", {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
        })} MXN
       </span>
      </div>
      <button
       onClick={() => {
        router.push(`/orders/${realtimeOrder.id}`);
        setRealtimeOrder(null);
       }}
       className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10"
      >
       <span>Ver Detalle</span>
       <ArrowRight size={12} className="shrink-0 font-bold" />
      </button>
     </div>
    </div>
   )}
  </SocketContext.Provider>
 );
};
