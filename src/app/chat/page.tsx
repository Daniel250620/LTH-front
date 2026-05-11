"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import ContactList from "@/components/ContactList";
import {
 Bot,
 Paperclip,
 Send,
 Lock,
 Loader2,
 ChevronLeft,
 ChevronDown,
 PanelLeftClose,
 PanelLeftOpen,
 Sparkles,
 ShieldCheck,
 Zap,
 CheckCheck,
} from "lucide-react";
import { Customer } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import { useSocket } from "@/context/SocketContext";
import WhatsAppImage from "@/components/WhatsAppImage";
import WhatsAppDocument from "@/components/WhatsAppDocument";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { renderFormattedText } from "@/utils/formatText";
import { Message } from "@/types/chat";
import TypingIndicator from "@/components/TypingIndicator";
import dynamic from "next/dynamic";
import MediaModal, { MediaModalData } from "@/components/MediaModal";
import { useSearchParams } from "next/navigation";

const WhatsAppLocation = dynamic(() => import("@/components/WhatsAppLocation"), {
  ssr: false,
  loading: () => (
    <div className="w-[240px] lg:w-[280px] h-[160px] bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-slate-300" size={24} />
    </div>
  ),
});

const MessageItem = React.memo(
 ({ msg, clientName, onOpenModal }: { msg: Message; clientName?: string; onOpenModal?: (data: MediaModalData) => void }) => {
  const replyTo = msg.rawPayload?.reply_to_text;
  const replyDirection = msg.rawPayload?.reply_to_direction;
  const isOut = msg.direction === "out";

  return (
   <div className="px-4 lg:px-8 py-2.5 flex flex-col w-full animate-in fade-in duration-200">
    <div
     className={`flex flex-col ${
      isOut ? "items-end self-end" : "items-start"
     } max-w-[85%] lg:max-w-[70%]`}
    >
     <div
      className={`p-4 lg:p-4.5 rounded-xl text-base lg:text-[17px] leading-relaxed wrap-break-words border transition-colors duration-200 ${
       isOut
        ? "bg-[#101e42] text-white border-blue-950 rounded-tr-none shadow-sm"
        : "bg-white text-slate-800 rounded-tl-none border-slate-200/70 shadow-sm"
      }`}
     >
      {/* Reply status block */}
      {replyTo && (
       <div
        className={`mb-2.5 p-2 px-3 rounded-md border-l-4 flex flex-col gap-1 text-sm select-none max-w-full overflow-hidden ${
         isOut 
          ? "bg-white/5 border-blue-400" 
          : "bg-slate-50 border-blue-600/70"
        }`}
       >
        <span
         className={`font-semibold uppercase tracking-wider text-[11px] ${isOut ? "text-blue-300" : "text-blue-600"}`}
        >
         {replyDirection === "out" ? "Tú" : clientName || "Cliente"}
        </span>
        <div
         className={`line-clamp-2 italic ${
          isOut ? "text-blue-100/70" : "text-slate-500"
         }`}
        >
         "{replyTo}"
        </div>
       </div>
      )}

      {msg.fileId ? (
       <div className="flex flex-col gap-2">
        <WhatsAppDocument fileId={msg.fileId} direction={msg.direction} onOpenModal={onOpenModal} />
        {msg.content &&
         msg.content !== "[Archivo: image]" &&
         msg.content !== "[Archivo: document]" && (
          <div className="text-base lg:text-[17px] leading-relaxed whitespace-pre-wrap max-w-[220px] lg:max-w-[280px]">
           {renderFormattedText(msg.content)}
          </div>
         )}
       </div>
      ) : msg.imageId ||
        msg.imageUrl ||
        msg.rawPayload?.imageUrl ||
        msg.rawPayload?.imageId ? (
       <div className="flex flex-col gap-2">
        <WhatsAppImage
         mediaId={msg.imageId || msg.rawPayload?.imageId}
         url={msg.imageUrl || msg.rawPayload?.imageUrl}
         onOpenModal={onOpenModal}
        />
        {msg.content &&
         msg.content !== "[Archivo: image]" &&
         msg.content !== "[Archivo: document]" && (
          <div className="text-base lg:text-[17px] leading-relaxed whitespace-pre-wrap pt-1 text-inherit max-w-[220px] lg:max-w-[280px]">
           {renderFormattedText(msg.content)}
          </div>
         )}
       </div>
      ) : msg.rawPayload?.location ? (
       <div className="flex flex-col gap-2">
        <WhatsAppLocation
         latitude={msg.rawPayload.location.latitude}
         longitude={msg.rawPayload.location.longitude}
         name={msg.rawPayload.location.name}
         address={msg.rawPayload.location.address}
         isOut={isOut}
        />
        {msg.content && msg.content !== "[Ubicación Compartida]" && (
         <div className="text-base lg:text-[17px] leading-relaxed whitespace-pre-wrap pt-1 text-inherit max-w-[220px] lg:max-w-[280px]">
          {renderFormattedText(msg.content)}
         </div>
        )}
       </div>
      ) : (
       renderFormattedText(msg.content)
      )}
     </div>
     <div className={`flex items-center gap-1.5 mt-1 px-1 text-xs lg:text-[13px] text-slate-400 font-semibold ${isOut ? "self-end justify-end" : "self-start justify-start"}`}>
      <span>
       {new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
       })}
      </span>
      {isOut && (
       <CheckCheck size={14} className="text-blue-500 stroke-[2.5]" />
      )}
     </div>
    </div>
   </div>
  );
 },
);

const MessageSkeleton = () => (
 <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-50/30" style={{
  backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.08) 1.5px, transparent 1.5px)`,
  backgroundSize: '24px 24px'
 }}>
  {[
   { side: "left", width: "w-[50%]" },
   { side: "right", width: "w-[40%]" },
   { side: "left", width: "w-[65%]" },
   { side: "right", width: "w-[30%]" },
  ].map((item, i) => (
   <div
    key={i}
    className={`flex flex-col ${item.side === "right" ? "items-end" : "items-start"} animate-pulse`}
   >
    <div
     className={`h-12 ${item.width} rounded-xl ${
      item.side === "right"
       ? "bg-[#101e42]/5 border border-[#101e42]/10"
       : "bg-white border border-slate-200/50"
     }`}
    />
    <div className="h-3.5 w-12 bg-slate-200 rounded mt-2 mx-1 opacity-50" />
   </div>
  ))}
 </div>
);

MessageItem.displayName = "MessageItem";

function ChatContent() {
 const [selectedContact, setSelectedContact] = useState<Customer | null>(null);
 const [isListCollapsed, setIsListCollapsed] = useState(false);
 const [inputValue, setInputValue] = useState("");
 const [modalData, setModalData] = useState<MediaModalData | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const searchParams = useSearchParams();
 const customerIdParam = searchParams.get("customerId");
 const { setActiveContactId, contacts } = useSocket();

 // Escuchar el parámetro customerId de la URL y seleccionar automáticamente al contacto
 useEffect(() => {
  if (customerIdParam && contacts.length > 0) {
   const matchedContact = contacts.find(
    (c) => String(c.id) === String(customerIdParam)
   );
   if (matchedContact && (!selectedContact || String(selectedContact.id) !== String(matchedContact.id))) {
    setSelectedContact(matchedContact);
   }
  }
 }, [customerIdParam, contacts, selectedContact]);

 // Asegurar que en móvil la lista no esté colapsada
 useEffect(() => {
  const handleResize = () => {
   if (window.innerWidth < 1024 && isListCollapsed) {
    setIsListCollapsed(false);
   }
  };
  window.addEventListener("resize", handleResize);
  handleResize();
  return () => window.removeEventListener("resize", handleResize);
 }, [isListCollapsed]);

 const {
  messages,
  sendMessage,
  sendMedia,
  isUploading,
  isConnected,
  isBotActive,
  isTyping,
  isLoading,
  toggleBot,
  loadMoreMessages,
  firstItemIndex,
 } = useChat(selectedContact?.id as number);

 useEffect(() => {
  setActiveContactId(selectedContact ? Number(selectedContact.id) : null);
 }, [selectedContact, setActiveContactId]);

 const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputValue.trim()) return;
  sendMessage(inputValue);
  setInputValue("");
 };

 const handleFileClick = () => {
  fileInputRef.current?.click();
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  await sendMedia(file);

  // Limpiamos el input para poder subir el mismo archivo después si se desea
  if (fileInputRef.current) {
   fileInputRef.current.value = "";
  }
 };

 const virtuosoRef = useRef<VirtuosoHandle>(null);
 const [unreadCount, setUnreadCount] = useState(0);
 const [showScrollButton, setShowScrollButton] = useState(false);

 const computeItemKey = useCallback(
  (index: number, msg: Message) => msg.id,
  [],
 );

 const lastMessageIdRef = useRef<string | null>(null);
 const prevMessagesLengthRef = useRef(0);

 const handleFollowOutput = useCallback(
  (isAtBottom: boolean) => {
   const currentLength = messages.length;
   const itemsAdded = currentLength - prevMessagesLengthRef.current;
   prevMessagesLengthRef.current = currentLength;

   // Si se añadieron 0 mensajes o un BLOQUE grande (ej. 50 de historial), ignorar por completo.
   if (itemsAdded !== 1) return false;

   const lastMessage = messages[currentLength - 1];
   if (!lastMessage) return false;

   // ¿Es realmente un mensaje nuevo al FINAL de la lista?
   const isNewMessageAtBottom = lastMessage.id !== lastMessageIdRef.current;
   lastMessageIdRef.current = lastMessage.id;

   // Si por alguna razón el mensaje final no cambió ID (aunque el length sí), ignorar
   if (!isNewMessageAtBottom) return false;

   const isOut = lastMessage?.direction === "out";

   if (isOut || isAtBottom) {
    setShowScrollButton(false);
    setUnreadCount(0);
    return "smooth";
   }

   if (lastMessage?.direction === "in" && !isAtBottom) {
    setShowScrollButton(true);
    setUnreadCount((prev) => prev + 1);
   }

   return false;
  },
  [messages],
 );

 useEffect(() => {
  lastMessageIdRef.current = null;
  prevMessagesLengthRef.current = 0;
  setShowScrollButton(false);
  setUnreadCount(0);
 }, [selectedContact?.id]);

 const scrollToBottom = useCallback(() => {
  if (virtuosoRef.current && messages.length > 0) {
   virtuosoRef.current.scrollToIndex({
    index: messages.length - 1,
    behavior: "smooth",
   });
  }
 }, [messages.length]);

 // Efecto para bajar el scroll cuando se activa el typing
 useEffect(() => {
  if (isTyping) {
   const timer = setTimeout(() => {
    scrollToBottom();
   }, 100);
   return () => clearTimeout(timer);
  }
 }, [isTyping, scrollToBottom]);

 const itemContent = useCallback(
  (_index: number, msg: Message) => (
   <MessageItem msg={msg} clientName={selectedContact?.client_name} onOpenModal={setModalData} />
  ),
  [selectedContact?.client_name],
 );

 const handleStartReached = useCallback(() => {
  loadMoreMessages();
 }, [loadMoreMessages]);

 return (
  <div className="flex h-full bg-[#f8fafc] overflow-hidden relative">
   {/* Barra de Contactos */}
   <div
    className={`h-full shrink-0 transition-all duration-300 overflow-hidden bg-white border-r border-slate-200/60 ${
     selectedContact ? "hidden lg:block" : "block w-full"
    } ${isListCollapsed ? "lg:w-[80px]" : "lg:w-[350px]"}`}
   >
    <div
     className={`h-full transition-all duration-300 ${
      isListCollapsed ? "lg:w-[80px] w-full" : "lg:w-[350px] w-full"
     }`}
    >
     <ContactList
      onSelectContact={setSelectedContact}
      selectedContactId={selectedContact?.id}
      isCollapsed={isListCollapsed}
      onExpand={() => setIsListCollapsed(false)}
     />
    </div>
   </div>

   {/* Area de Chat */}
   <div
    className={`flex-1 flex flex-col relative bg-slate-50/50 h-full ${
     !selectedContact ? "hidden lg:flex" : "flex"
    }`}
   >
    {!selectedContact ? (
     <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-zinc-500 relative bg-white overflow-hidden">
      {/* Retículas técnicas sutiles sin luces de respiración */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
       backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
       backgroundSize: '20px 20px'
      }} />

      {isListCollapsed && (
       <button
        onClick={() => setIsListCollapsed(false)}
        className="absolute top-6 left-6 p-2 bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors hidden lg:block z-10 text-sm font-semibold"
        title="Mostrar contactos"
       >
        <PanelLeftOpen size={20} />
       </button>
      )}

      {/* Hero Central Profesional */}
      <div className="flex flex-col items-center max-w-lg text-center gap-4 mb-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
       <div className="mb-2">
        <div className="w-18 h-18 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm border border-slate-200/80 text-[#101e42]">
         <Bot size={36} />
        </div>
       </div>
       <div>
        <h2 className="text-2xl lg:text-3xl font-black text-[#101e42] tracking-tight">
         Centro de Mensajería LTH
        </h2>
        <p className="text-sm lg:text-base text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
         Monitoreo de conversaciones con clientes, soporte técnico y control del copiloto autónomo.
        </p>
       </div>
       {!isConnected ? (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">
         <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
         <span>Desconectado</span>
        </div>
       ) : (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-bold border border-slate-200 shadow-sm">
         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
         <span>Canal Activo</span>
        </div>
       )}
      </div>

      {/* Grid de KPIs / Widgets Técnicos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
       {/* Card 1: SLA */}
       <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col items-start gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-600">
         <Zap size={18} />
        </div>
        <div>
         <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Eficiencia</span>
         <h4 className="text-base font-bold text-[#101e42] mt-1">SLA de Respuesta</h4>
         <p className="text-xs lg:text-[13px] text-slate-400 mt-1.5 leading-relaxed">Promedio de respuesta técnica en tiempo real menor a 2 minutos.</p>
        </div>
       </div>

       {/* Card 2: Copilot */}
       <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col items-start gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-600">
         <Bot size={18} />
        </div>
        <div>
         <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Asistencia</span>
         <h4 className="text-base font-bold text-[#101e42] mt-1">Copiloto Inteligente</h4>
         <p className="text-xs lg:text-[13px] text-slate-400 mt-1.5 leading-relaxed">El bot asiste de forma autónoma con fichas de acumuladores y cotizaciones.</p>
        </div>
       </div>

       {/* Card 3: Security */}
       <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col items-start gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-600">
         <ShieldCheck size={18} />
        </div>
        <div>
         <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Seguridad</span>
         <h4 className="text-base font-bold text-[#101e42] mt-1">Canal Encriptado</h4>
         <p className="text-xs lg:text-[13px] text-slate-400 mt-1.5 leading-relaxed">Línea oficial integrada mediante WhatsApp Business API con encriptación.</p>
        </div>
       </div>
      </div>

      <p className="text-xs text-slate-300 mt-12 font-bold tracking-wider uppercase">
       Selecciona un chat para comenzar
      </p>
     </div>
    ) : (
     <>
      {/* Barra superior del chat (Header Profesional) */}
      <div className="h-[70px] lg:h-[80px] bg-white flex items-center px-4 lg:px-8 py-4 justify-between border-b border-slate-200 shrink-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
       <div className="flex items-center min-w-0">
        <button
         onClick={() => setSelectedContact(null)}
         className="lg:hidden p-2 -ml-2 mr-1 text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-50"
        >
         <ChevronLeft size={24} />
        </button>

        <button
         onClick={() => setIsListCollapsed(!isListCollapsed)}
         className="hidden lg:block p-2 -ml-4 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
         title={isListCollapsed ? "Mostrar contactos" : "Ocultar contactos"}
        >
         {isListCollapsed ? (
          <PanelLeftOpen size={20} />
         ) : (
          <PanelLeftClose size={20} />
         )}
        </button>

        {/* Avatar Profesional */}
        <div className="relative mr-3 lg:mr-4 shrink-0">
         <div
          className={`w-11 h-11 lg:w-12 lg:h-12 rounded-full ${selectedContact.avatarColor} flex items-center justify-center text-white text-base lg:text-lg font-bold shadow-sm relative z-10 border border-black/5`}
         >
          {selectedContact.client_name.charAt(0).toUpperCase()}
         </div>
        </div>

        <div className="truncate">
         <h2 className="text-[#101e42] font-black text-lg lg:text-xl truncate tracking-tight leading-none mb-1">
          {selectedContact.client_name}
         </h2>
         <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-bold text-xs text-slate-500">WhatsApp oficial en línea</span>
         </div>
        </div>
       </div>

       {/* Módulo de Control del Bot Profesional (Sin pulso ni glows) */}
       <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
         isBotActive 
          ? "bg-slate-50 border-slate-300 text-slate-700 shadow-sm" 
          : "bg-slate-50 border-slate-200 text-slate-400"
        }`}>
         <span
          className="text-xs lg:text-sm font-bold uppercase flex items-center gap-1.5 tracking-wider"
         >
          <Bot size={16} className={`lg:w-[18px] lg:h-[18px] ${isBotActive ? "text-emerald-500" : "text-slate-400"}`} />
          <span className="hidden sm:inline">Bot: {isBotActive ? "ACTIVO" : "Inactivo"}</span>
          <span className="sm:hidden">{isBotActive ? "On" : "Off"}</span>
         </span>
         <button
          onClick={() => toggleBot(!isBotActive)}
          className={`relative inline-flex h-5.5 w-10 lg:h-6 lg:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
           isBotActive ? "bg-emerald-500" : "bg-slate-300"
          }`}
         >
          <span
           className={`inline-block h-4 w-4 lg:h-4.5 lg:w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isBotActive ? "translate-x-5 lg:translate-x-5.5" : "translate-x-0.5"
           }`}
          />
         </button>
        </div>
       </div>
      </div>

      {/* Contenedor de Mensajes (Diseño de Limpieza Absoluta) */}
      <div className="flex-1 min-h-0 relative bg-white" style={{
       backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.08) 1.5px, transparent 1.5px)`,
       backgroundSize: '24px 24px'
      }}>
       {isLoading ? (
        <MessageSkeleton />
       ) : (
        <Virtuoso
         key={selectedContact?.id}
         ref={virtuosoRef}
         data={messages}
         computeItemKey={computeItemKey}
         firstItemIndex={firstItemIndex}
         initialTopMostItemIndex={999999}
         startReached={handleStartReached}
         followOutput={handleFollowOutput}
         atBottomStateChange={(atBottom) => {
          if (atBottom) {
           setShowScrollButton(false);
           setUnreadCount(0);
          }
         }}
         alignToBottom
         overscan={200}
         increaseViewportBy={{ top: 200, bottom: 200 }}
         style={{ height: "100%" }}
         itemContent={itemContent}
         components={{
          Footer: () => (isTyping ? <TypingIndicator /> : null),
         }}
        />
       )}

       {/* Botón de scroll abajo sin bounce */}
       {showScrollButton && (
        <button
         onClick={scrollToBottom}
         className="absolute bottom-24 right-6 lg:bottom-28 lg:right-10 p-3 bg-red-600 text-white rounded-full shadow-[0_4px_12px_rgba(220,38,38,0.2)] hover:bg-red-500 hover:scale-105 active:scale-95 transition-all z-20 group"
         title="Ver nuevos mensajes"
        >
         {unreadCount > 0 && (
          <div className="absolute -top-1 -left-1 bg-[#101e42] text-white text-xs font-bold min-w-[20px] h-[20px] p-0.5 rounded-full flex items-center justify-center border border-white shadow-sm">
           {unreadCount}
          </div>
         )}
         <ChevronDown
          size={18}
          className="group-hover:translate-y-0.5 transition-transform"
         />
        </button>
       )}
      </div>

      {/* Input de Mensaje (Cápsula Flotante Profesional) */}
      <div className="shrink-0 z-10 bg-white border-t border-slate-100">
       {isBotActive ? (
        <div className="p-3.5 mx-4 my-3 lg:mx-6 lg:my-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-3.5 text-slate-500 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden">
         <div className="bg-slate-200/60 p-1.5 rounded-lg border border-slate-300/40 shrink-0">
          <Lock size={15} className="text-slate-500" />
         </div>
         <p className="text-sm lg:text-[15px] font-bold tracking-wide text-center">
          El bot automático está atendiendo este chat. Desactívalo arriba para enviar un mensaje manual.
         </p>
        </div>
       ) : (
        <form
         className="p-3.5 mx-4 my-3 lg:mx-6 lg:my-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 lg:gap-4 shadow-sm"
         onSubmit={handleSendMessage}
        >
         <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*, application/pdf"
          className="hidden"
         />
         <button
          type="button"
          onClick={handleFileClick}
          disabled={isUploading}
          className={`p-2.5 lg:p-3 rounded-xl transition-all duration-200 ${
           isUploading 
            ? "bg-slate-50 text-slate-300 animate-pulse" 
            : "bg-slate-50 text-slate-500 hover:text-blue-900 hover:bg-slate-100"
          }`}
         >
          {isUploading ? (
           <Loader2 size={18} className="animate-spin" />
          ) : (
           <Paperclip size={18} />
          )}
         </button>
         
         <div className="flex-1 relative">
          <input
           type="text"
           value={inputValue}
           onChange={(e) => setInputValue(e.target.value)}
           placeholder={
            isUploading ? "Cargando archivo..." : "Escribe un mensaje técnico aquí..."
           }
           disabled={isUploading}
           className="w-full bg-slate-50/80 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-slate-300/60 text-slate-800 placeholder-slate-400 text-base lg:text-[16px] transition-all disabled:opacity-50"
          />
         </div>
         
         <button
          type="submit"
          disabled={!inputValue.trim() || !isConnected || isUploading}
          className="bg-[#101e42] text-white p-3 lg:p-3.5 rounded-xl hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
         >
          <Send size={18} />
         </button>
        </form>
       )}
      </div>
     </>
    )}
   </div>

   {/* Modal para Imágenes y Documentos */}
   <MediaModal data={modalData} onClose={() => setModalData(null)} />
  </div>
 );
}

export default function Chat() {
 return (
  <Suspense fallback={<MessageSkeleton />}>
   <ChatContent />
  </Suspense>
 );
}
