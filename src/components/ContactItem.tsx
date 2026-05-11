import React from "react";
import { Customer } from "@/types/chat";
import { CheckCheck, ShoppingCart } from "lucide-react";
import { renderFormattedText } from "@/utils/formatText";

interface Props {
 contact: Customer;
 isCollapsed?: boolean;
 isActive?: boolean;
}

export default function ContactItem({ contact, isCollapsed, isActive }: Props) {
 const initials = contact.client_name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .slice(0, 1)
  .toUpperCase();

 const avatarColor = contact.avatarColor || "bg-gray-500";

 // Extraemos el contenido y la hora del objeto lastMessage
 const displayMessage =
  contact.lastMessage?.content ||
  contact.ultimoMensaje ||
  contact.client_number ||
  "Sin mensajes";
 const displayTime = contact.lastMessage
  ? new Date(contact.lastMessage.createdAt).toLocaleTimeString([], {
     hour: "2-digit",
     minute: "2-digit",
    })
  : contact.time || "";

 // Verificamos si el último mensaje fue enviado por nosotros
 const isOut = contact.lastMessage?.direction === "out";

 // Configuración de estilos premium basados en el estado del pedido activo de mayor prioridad
 const getStatusStyles = (status?: string | null) => {
  switch (status) {
   case "in_transit":
    return {
     bg: "bg-cyan-50 text-cyan-600 border-cyan-200/50",
     dot: "bg-cyan-500",
     label: "En camino",
     glow: "shadow-[0_0_8px_rgba(6,182,212,0.15)]",
    };
   case "ready_for_pickup":
    return {
     bg: "bg-purple-50 text-purple-600 border-purple-200/50",
     dot: "bg-purple-500",
     label: "Listo para sucursal",
     glow: "shadow-[0_0_8px_rgba(168,85,247,0.15)]",
    };
   case "preparing":
    return {
     bg: "bg-blue-50 text-blue-600 border-blue-200/50",
     dot: "bg-blue-500",
     label: "En preparación",
     glow: "shadow-[0_0_8px_rgba(59,130,246,0.15)]",
    };
   case "pending":
   default:
    return {
     bg: "bg-amber-50 text-amber-600 border-amber-200/50",
     dot: "bg-amber-500",
     label: "Pendiente",
     glow: "shadow-[0_0_8px_rgba(245,158,11,0.15)]",
    };
  }
 };

 return (
  <div
   className={`flex items-center px-4 lg:px-6 py-4.5 lg:py-5 cursor-pointer transition-all duration-200 border-b border-slate-100 last:border-0 group relative ${
    isCollapsed ? "justify-center" : ""
   } ${
    isActive
     ? "bg-gradient-to-r from-blue-50/50 via-slate-50/10 to-transparent border-l-4 border-l-[#101e42] shadow-[inset_1px_0_0_rgba(16,30,66,0.02)]"
     : "bg-white hover:bg-slate-50/50"
   }`}
  >
   {/* Animación del rebote del carrito */}
   <style>{`
    @keyframes bounceSoft {
     0%, 100% { transform: translateY(0); }
     50% { transform: translateY(-3px); }
    }
    .animate-bounce-soft {
     animation: bounceSoft 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    }
   `}</style>

   {/* Avatar Circular con Iniciales */}
   <div className="relative shrink-0 select-none">
    <div
     className={`w-12 h-12 lg:w-13 lg:h-13 rounded-full ${avatarColor} flex items-center justify-center text-white text-lg lg:text-xl font-bold shadow-sm transition-transform duration-200 group-hover:scale-[1.02] ${
      isActive ? "ring-1 ring-[#101e42]/10" : ""
     } border border-black/5`}
    >
     {initials}
    </div>
    
    {/* Indicador de Bot Sólido y Profesional */}
    <div
     className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white transition-all duration-200 ${
      contact.isBotActive 
       ? "bg-emerald-500" 
       : "bg-slate-300"
     }`}
     title={contact.isBotActive ? "Bot Activo" : "Bot Inactivo"}
    ></div>
   </div>

   {/* Info */}
   {!isCollapsed && (
    <div className="ml-3.5 flex-1 min-w-0 animate-in fade-in duration-200">
     <div className="flex justify-between items-baseline mb-1">
      <h3 className={`text-base lg:text-[17px] font-bold tracking-tight truncate pr-2 flex items-center gap-1.5 transition-colors ${
       isActive ? "text-[#101e42] font-black" : "text-slate-800"
      }`}>
       <span className="truncate">{contact.client_name}</span>
       {contact.activeDeliveryOrdersCount && contact.activeDeliveryOrdersCount > 0 ? (
        (() => {
         const styles = getStatusStyles(contact.activeDeliveryStatus);
         return (
          <span
           className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border transition-all duration-300 shrink-0 animate-bounce-soft ${styles.bg} ${styles.glow}`}
           title={`${contact.activeDeliveryOrdersCount} pedido(s) activo(s) en proceso (${styles.label})`}
          >
           <ShoppingCart size={11} className="stroke-[3]" />
           <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${styles.dot}`} />
          </span>
         );
        })()
       ) : null}
      </h3>
      
      <div className="flex flex-col items-end min-w-[65px] shrink-0">
       <span className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">
        {displayTime}
       </span>
       {/* Espacio para el contador de no leídos */}
       <div className="h-5 mt-1 flex items-center justify-end">
        {contact.unreadCount && contact.unreadCount > 0 ? (
         <div className="bg-[#101e42] text-white text-xs font-bold min-w-[19px] h-[19px] p-0.5 rounded-full flex items-center justify-center shadow-sm">
          {contact.unreadCount}
         </div>
        ) : null}
       </div>
      </div>
     </div>

     <div className="flex items-center gap-1 overflow-hidden">
      {isOut && (
       <CheckCheck size={14} className="text-blue-500 stroke-[2.5] shrink-0" />
      )}
      <p className={`text-sm lg:text-[14px] truncate leading-normal flex-1 transition-colors ${
       isActive ? "text-slate-600 font-semibold" : "text-slate-500"
      }`}>
       {renderFormattedText(displayMessage as string, true)}
      </p>
     </div>
    </div>
   )}
  </div>
 );
}
