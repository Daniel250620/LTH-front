import React from "react";
import { Customer } from "@/types/chat";
import { CheckCheck } from "lucide-react";

interface Props {
  contact: Customer;
}

export default function ContactItem({ contact }: Props) {
  const initials = contact.client_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();

  const avatarColor = contact.avatarColor || "bg-gray-500";

  // Extraemos el contenido y la hora del objeto lastMessage (o de los campos antiguos por si acaso)
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

  return (
    <div className="flex items-center px-4 lg:px-6 py-4 lg:py-5 hover:bg-zinc-50 cursor-pointer transition-colors border-b border-zinc-100 last:border-0 group relative">
      {/* Avatar Circular con Iniciales */}
      <div className="relative shrink-0">
        <div
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full ${avatarColor} flex items-center justify-center text-white text-lg lg:text-xl font-bold shadow-sm`}
        >
          {initials}
        </div>
        {/* Indicador de Bot */}
        <div
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border-2 border-white ${contact.isBotActive ? "bg-green-500" : "bg-gray-300"}`}
          title={contact.isBotActive ? "Bot Activo" : "Bot Inactivo"}
        ></div>
      </div>

      {/* Info */}
      <div className="ml-3 lg:ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5 lg:mb-1">
          <h3 className="text-base lg:text-[17px] font-bold text-[#19213d] truncate pr-2">
            {contact.client_name}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-[10px] lg:text-[12px] text-zinc-400 font-medium">
              {displayTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-hidden">
          {isOut && <CheckCheck size={14} className="text-zinc-500 shrink-0 lg:w-4 lg:h-4" />}
          <p className="text-sm lg:text-[15px] text-zinc-500 truncate leading-tight flex-1">
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
