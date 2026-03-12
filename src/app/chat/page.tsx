"use client";

import React, { useState, useRef, useCallback } from "react";
import ContactList from "@/components/ContactList";
import { Bot, Paperclip, Send, Lock, Loader2 } from "lucide-react";
import { Customer } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import WhatsAppImage from "@/components/WhatsAppImage";
import { Virtuoso } from "react-virtuoso";

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState<Customer | null>(null);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    sendMessage,
    sendImage,
    isUploading,
    isConnected,
    isBotActive,
    toggleBot,
    loadMoreMessages,
    isLoadingMore,
    firstItemIndex,
  } = useChat(selectedContact?.id as number);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleStartReached = useCallback(() => {
    loadMoreMessages();
  }, [loadMoreMessages]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await sendImage(file);

    // Limpiamos el input para poder subir la misma imagen después si se desea
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      {/* Barra de Contactos */}
      <div className="w-[450px] h-full shrink-0">
        <ContactList
          onSelectContact={setSelectedContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* Area de Chat */}
      <div className="flex-1 flex flex-col relative border-l border-zinc-200">
        {!selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-white">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Bot size={40} className="text-zinc-300" />
            </div>
            <p className="text-lg font-medium">
              Selecciona un chat para comenzar
            </p>
            {!isConnected && (
              <p className="text-red-400 text-sm mt-2">
                Desconectado del servidor
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Barra superior del chat */}
            <div className="h-[80px] bg-white flex items-center px-8 py-4 justify-between border-b border-zinc-100">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full ${selectedContact.avatarColor} flex items-center justify-center text-white text-lg font-bold mr-4`}
                >
                  {selectedContact.client_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[#19213d] font-bold text-lg">
                    {selectedContact.client_name}
                  </h2>
                </div>
              </div>

              {/* Control del Bot */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
                  <span
                    className={`text-xs font-bold uppercase ${isBotActive ? "text-green-600" : "text-zinc-400"}`}
                  >
                    <Bot size={16} /> {isBotActive ? "On" : "Off"}
                  </span>
                  <button
                    onClick={() => toggleBot(!isBotActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isBotActive ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isBotActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenedor de Mensajes */}
            <div className="flex-1 bg-[#f8fafc] min-h-0">
              <Virtuoso
                data={messages}
                // Usamos el firstItemIndex gestionado por el hook para máxima estabilidad
                firstItemIndex={firstItemIndex}
                // Al usar el índice base, el "final" de la lista siempre es 999,999.
                // Al dejarlo fijo, evitamos que Virtuoso salte al fondo cada vez que messages.length cambie.
                initialTopMostItemIndex={999999}
                overscan={400} // Pre-renderiza más elementos para mayor fluidez
                components={{
                  Header: () => (
                    <div className="h-12 flex items-center justify-center w-full">
                      {isLoadingMore && (
                        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                      )}
                    </div>
                  ),
                }}
                startReached={handleStartReached}
                // Si estamos cargando mensajes antiguos, desactivamos el auto-scroll al fondo
                followOutput={(isAtBottom) => {
                  if (isLoadingMore) return false;
                  return isAtBottom ? "smooth" : false;
                }}
                alignToBottom
                style={{ height: "100%" }}
                itemContent={(index, msg) => {
                  // Solo animamos si es uno de los últimos mensajes (asumiendo que son los nuevos)
                  // Para los mensajes históricos (índices bajos), evitamos la animación de deslizamiento
                  const isRecent = index > 999990;

                  return (
                    <div className="px-8 py-1 flex flex-col w-full">
                      <div
                        className={`flex flex-col ${
                          msg.direction === "out"
                            ? "items-end self-end"
                            : "items-start"
                        } max-w-[70%] ${isRecent ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}`}
                      >
                        <div
                          className={`p-4 rounded-2xl shadow-sm ${
                            msg.direction === "out"
                              ? "bg-[#19213d] text-white rounded-tr-none"
                              : "bg-white text-[#19213d] rounded-tl-none border border-zinc-100"
                          }`}
                        >
                          {msg.imageUrl ? (
                            <img src={msg.imageUrl} alt="Imagen" className="max-w-xs rounded-lg shadow-sm object-cover" />
                          ) : msg.imageId ? (
                            <WhatsAppImage mediaId={msg.imageId} />
                          ) : (
                            msg.content
                          )}
                        </div>                        <span className="text-[11px] text-zinc-400 mt-1 mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Input de Mensaje */}
            {isBotActive ? (
              <div className="p-6 bg-[#f8fafc] border-t border-zinc-100 flex items-center justify-center gap-3 text-zinc-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white p-2 rounded-full shadow-sm border border-zinc-100">
                  <Lock size={18} className="text-zinc-400" />
                </div>
                <p className="text-sm font-medium">
                  El bot está atendiendo este chat. Desactívalo para enviar un
                  mensaje manual.
                </p>
              </div>
            ) : (
              <form
                className="p-6 bg-white border-t border-zinc-100 flex items-center gap-4"
                onSubmit={handleSendMessage}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleFileClick}
                  disabled={isUploading}
                  className={`transition-colors ${isUploading ? "text-zinc-300" : "text-zinc-400 hover:text-[#19213d]"}`}
                >
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Paperclip size={24} />
                  )}
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isUploading
                        ? "Enviando imagen..."
                        : "Escribe un mensaje..."
                    }
                    disabled={isUploading}
                    className="w-full bg-[#f1f5f9] border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#19213d]/10 text-[#19213d] transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !isConnected || isUploading}
                  className="bg-[#19213d] text-white p-3 rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
