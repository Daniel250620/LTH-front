"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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

const WhatsAppLocation = dynamic(() => import("@/components/WhatsAppLocation"), {
  ssr: false,
  loading: () => (
    <div className="w-[240px] lg:w-[280px] h-[160px] bg-zinc-100 animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-300" size={24} />
    </div>
  ),
});

const MessageItem = React.memo(
 ({ msg, clientName, onOpenModal }: { msg: Message; clientName?: string; onOpenModal?: (data: MediaModalData) => void }) => {
  const replyTo = msg.rawPayload?.reply_to_text;
  const replyDirection = msg.rawPayload?.reply_to_direction;
  const isOut = msg.direction === "out";

  return (
   <div className="px-4 lg:px-8 py-2 flex flex-col w-full">
    <div
     className={`flex flex-col ${
      isOut ? "items-end self-end" : "items-start"
     } max-w-[85%] lg:max-w-[70%]`}
    >
     <div
      className={`p-3 lg:p-4 rounded-2xl shadow-sm wrap-break-words ${
       isOut
        ? "bg-blue-950 text-white rounded-tr-none"
        : "bg-white text-[#19213d] rounded-tl-none border border-zinc-100"
      }`}
     >
      {/* Reply status block */}
      {replyTo && (
       <div
        className={`mb-2 p-2 rounded-lg border-l-4 flex flex-col gap-0.5 text-xs select-none max-w-full overflow-hidden ${
         isOut ? "bg-white/10 border-blue-400" : "bg-zinc-50 border-blue-500"
        }`}
       >
        <span
         className={`font-bold ${isOut ? "text-blue-300" : "text-blue-600"}`}
        >
         {replyDirection === "out" ? "Tú" : clientName || "Cliente"}
        </span>
        <div
         className={`line-clamp-2 ${
          isOut ? "text-blue-50/70" : "text-zinc-500"
         }`}
        >
         {replyTo}
        </div>
       </div>
      )}

      {msg.fileId ? (
       <div className="flex flex-col gap-2">
        <WhatsAppDocument fileId={msg.fileId} direction={msg.direction} onOpenModal={onOpenModal} />
        {msg.content &&
         msg.content !== "[Archivo: image]" &&
         msg.content !== "[Archivo: document]" && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap max-w-[220px] lg:max-w-[280px]">
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
          <div className="text-sm leading-relaxed whitespace-pre-wrap pt-1 text-inherit max-w-[220px] lg:max-w-[280px]">
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
         <div className="text-sm leading-relaxed whitespace-pre-wrap pt-1 text-inherit max-w-[220px] lg:max-w-[280px]">
          {renderFormattedText(msg.content)}
         </div>
        )}
       </div>
      ) : (
       renderFormattedText(msg.content)
      )}
     </div>
     <span className="text-[10px] lg:text-[11px] text-zinc-400 mt-1 mx-1">
      {new Date(msg.createdAt).toLocaleTimeString([], {
       hour: "2-digit",
       minute: "2-digit",
      })}
     </span>
    </div>
   </div>
  );
 },
);

const MessageSkeleton = () => (
 <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 animate-pulse bg-[#f8fafc]">
  {[
   { side: "left", width: "w-[60%]" },
   { side: "right", width: "w-[40%]" },
   { side: "left", width: "w-[70%]" },
   { side: "left", width: "w-[30%]" },
   { side: "right", width: "w-[55%]" },
   { side: "left", width: "w-[45%]" },
  ].map((item, i) => (
   <div
    key={i}
    className={`flex flex-col ${item.side === "right" ? "items-end" : "items-start"}`}
   >
    <div
     className={`h-12 lg:h-16 ${item.width} rounded-2xl ${
      item.side === "right"
       ? "bg-blue-900/10 rounded-tr-none"
       : "bg-zinc-200/50 rounded-tl-none"
     }`}
    />
    <div className="h-3 w-12 bg-zinc-100 rounded mt-2 mx-1" />
   </div>
  ))}
 </div>
);

MessageItem.displayName = "MessageItem";

export default function Chat() {
 const [selectedContact, setSelectedContact] = useState<Customer | null>(null);
 const [isListCollapsed, setIsListCollapsed] = useState(false);
 const [inputValue, setInputValue] = useState("");
 const [modalData, setModalData] = useState<MediaModalData | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

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

 const { setActiveContactId } = useSocket();

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
   // Relajamos a < 10 para permitir las ráfagas que vienen del flush del TypingIndicator
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
   // Un pequeño delay asegura que el componente Footer ya se esté renderizando
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

 // startReached ya debería venir de useCallback desde donde lo defines,
 // pero si no, también envuélvelo:
 const handleStartReached = useCallback(() => {
  loadMoreMessages();
 }, [loadMoreMessages]);

 return (
  <div className="flex h-full bg-[#f1f5f9] overflow-hidden relative">
   {/* Barra de Contactos */}
   <div
    className={`h-full shrink-0 transition-all duration-300 overflow-hidden bg-white border-r border-zinc-200 ${
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
    className={`flex-1 flex flex-col relative bg-white h-full ${
     !selectedContact ? "hidden lg:flex" : "flex"
    }`}
   >
    {!selectedContact ? (
     <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 relative">
      {isListCollapsed && (
       <button
        onClick={() => setIsListCollapsed(false)}
        className="absolute top-6 left-6 p-2 bg-white shadow-sm border border-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-lg transition-colors hidden lg:block z-10"
        title="Mostrar contactos"
       >
        <PanelLeftOpen size={24} />
       </button>
      )}
      <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
       <Bot size={40} className="text-zinc-300" />
      </div>
      <p className="text-lg font-medium">Selecciona un chat para comenzar</p>
      {!isConnected && (
       <p className="text-red-400 text-sm mt-2">Desconectado del servidor</p>
      )}
     </div>
    ) : (
     <>
      {/* Barra superior del chat */}
      <div className="h-[70px] lg:h-[80px] bg-white flex items-center px-4 lg:px-8 py-4 justify-between border-b border-zinc-100 shrink-0">
       <div className="flex items-center min-w-0">
        <button
         onClick={() => setSelectedContact(null)}
         className="lg:hidden p-2 -ml-2 mr-1 text-zinc-500 hover:text-zinc-800 transition-colors"
        >
         <ChevronLeft size={24} />
        </button>

        <button
         onClick={() => setIsListCollapsed(!isListCollapsed)}
         className="hidden lg:block p-2 -ml-4 mr-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
         title={isListCollapsed ? "Mostrar contactos" : "Ocultar contactos"}
        >
         {isListCollapsed ? (
          <PanelLeftOpen size={24} />
         ) : (
          <PanelLeftClose size={24} />
         )}
        </button>

        <div
         className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full ${selectedContact.avatarColor} flex items-center justify-center text-white text-base lg:text-lg font-bold mr-3 lg:mr-4 shrink-0`}
        >
         {selectedContact.client_name.charAt(0).toUpperCase()}
        </div>
        <div className="truncate">
         <h2 className="text-[#19213d] font-bold text-base lg:text-lg truncate">
          {selectedContact.client_name}
         </h2>
        </div>
       </div>

       {/* Control del Bot */}
       <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <div className="flex items-center gap-1.5 lg:gap-2 bg-zinc-50 px-2 lg:px-4 py-1.5 lg:py-2 rounded-full border border-zinc-100">
         <span
          className={`text-[10px] lg:text-xs font-bold uppercase flex items-center gap-1 ${
           isBotActive ? "text-green-600" : "text-zinc-400"
          }`}
         >
          <Bot size={14} className="lg:w-4 lg:h-4" />
          <span className="hidden sm:inline">{isBotActive ? "On" : "Off"}</span>
         </span>
         <button
          onClick={() => toggleBot(!isBotActive)}
          className={`relative inline-flex h-5 w-9 lg:h-6 lg:w-11 items-center rounded-full transition-colors focus:outline-none ${
           isBotActive ? "bg-green-600" : "bg-gray-300"
          }`}
         >
          <span
           className={`inline-block h-3.5 w-3.5 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
            isBotActive ? "translate-x-5 lg:translate-x-6" : "translate-x-1"
           }`}
          />
         </button>
        </div>
       </div>
      </div>

      {/* Contenedor de Mensajes */}
      <div className="flex-1 bg-[#f8fafc] min-h-0 relative">
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
         increaseViewportBy={{ top: 200, bottom: 200 }} // ayuda con el parpadeo al hacer scroll
         style={{ height: "100%" }}
         itemContent={itemContent}
         components={{
          Footer: () => (isTyping ? <TypingIndicator /> : null),
         }}
        />
       )}

       {/* Botón de mensaje nuevo / scroll abajo */}
       {showScrollButton && (
        <button
         onClick={scrollToBottom}
         className="absolute bottom-6 right-6 p-2.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all active:scale-90 z-20 group  "
         title="Ver nuevos mensajes"
        >
         {unreadCount > 0 && (
          <div className="absolute -top-1 -left-1  bg-blue-950 text-white text-[10px] font-bold min-w-[18px] h-[18px] p-0.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
           {unreadCount}
          </div>
         )}
         <ChevronDown
          size={22}
          className="group-hover:translate-y-0.5 transition-transform"
         />
        </button>
       )}
      </div>

      {/* Input de Mensaje */}
      <div className="shrink-0">
       {isBotActive ? (
        <div className="p-4 lg:p-6 bg-[#f8fafc] border-t border-zinc-100 flex items-center justify-center gap-3 text-zinc-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
         <div className="bg-white p-1.5 lg:p-2 rounded-full shadow-sm border border-zinc-100">
          <Lock size={16} className="text-zinc-400" />
         </div>
         <p className="text-xs lg:text-sm font-medium text-center">
          El bot está atendiendo este chat. Desactívalo para enviar un mensaje
          manual.
         </p>
        </div>
       ) : (
        <form
         className="p-4 lg:p-6 bg-white border-t border-zinc-100 flex items-center gap-2 lg:gap-4"
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
          className={`p-2 transition-colors ${
           isUploading ? "text-zinc-300" : "text-zinc-400 hover:text-[#19213d]"
          }`}
         >
          {isUploading ? (
           <Loader2 size={20} className="animate-spin lg:w-6 lg:h-6" />
          ) : (
           <Paperclip size={20} className="lg:w-6 lg:h-6" />
          )}
         </button>
         <div className="flex-1 relative">
          <input
           type="text"
           value={inputValue}
           onChange={(e) => setInputValue(e.target.value)}
           placeholder={
            isUploading ? "Enviando archivo..." : "Escribe un mensaje..."
           }
           disabled={isUploading}
           className="w-full bg-[#f1f5f9] border-none rounded-full px-4 lg:px-6 py-2.5 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#19213d]/10 text-[#19213d] text-sm lg:text-base transition-all disabled:opacity-50"
          />
         </div>
         <button
          type="submit"
          disabled={!inputValue.trim() || !isConnected || isUploading}
          className="bg-[#19213d] text-white p-2.5 lg:p-3 rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
         >
          <Send size={18} className="lg:w-5 lg:h-5" />
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
