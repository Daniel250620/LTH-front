"use client";

import React, { useState, useRef, useEffect } from "react";
import ContactList from "@/components/ContactList";
import {
  Bot,
  Paperclip,
  Send,
  Lock,
  Loader2,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Customer } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import WhatsAppImage from "@/components/WhatsAppImage";
import { Virtuoso } from "react-virtuoso";

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState<Customer | null>(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
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
    sendImage,
    isUploading,
    isConnected,
    isBotActive,
    toggleBot,
    loadMoreMessages,
    firstItemIndex,
  } = useChat(selectedContact?.id as number);

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

    await sendImage(file);

    // Limpiamos el input para poder subir la misma imagen después si se desea
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
                  title={
                    isListCollapsed ? "Mostrar contactos" : "Ocultar contactos"
                  }
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
                    <span className="hidden sm:inline">
                      {isBotActive ? "On" : "Off"}
                    </span>
                  </span>
                  <button
                    onClick={() => toggleBot(!isBotActive)}
                    className={`relative inline-flex h-5 w-9 lg:h-6 lg:w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isBotActive ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
                        isBotActive
                          ? "translate-x-5 lg:translate-x-6"
                          : "translate-x-1"
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
                firstItemIndex={firstItemIndex}
                initialTopMostItemIndex={messages.length - 1}
                startReached={loadMoreMessages}
                followOutput={(isAtBottom) => (isAtBottom ? "smooth" : "auto")}
                alignToBottom
                style={{ height: "100%" }}
                itemContent={(index, msg) => (
                  <div className="px-4 lg:px-8 py-2 flex flex-col w-full">
                    <div
                      className={`flex flex-col ${
                        msg.direction === "out"
                          ? "items-end self-end"
                          : "items-start"
                      } max-w-[85%] lg:max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div
                        className={`p-3 lg:p-4 rounded-2xl shadow-sm wrap-break-words ${
                          msg.direction === "out"
                            ? "bg-[#19213d] text-white rounded-tr-none"
                            : "bg-white text-[#19213d] rounded-tl-none border border-zinc-100"
                        }`}
                      >
                        {msg.imageId ? (
                          <WhatsAppImage mediaId={msg.imageId} />
                        ) : (
                          msg.content
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
                )}
              />
            </div>

            {/* Input de Mensaje */}
            <div className="shrink-0">
              {isBotActive ? (
                <div className="p-4 lg:p-6 bg-[#f8fafc] border-t border-zinc-100 flex items-center justify-center gap-3 text-zinc-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-white p-1.5 lg:p-2 rounded-full shadow-sm border border-zinc-100">
                    <Lock size={16} className="text-zinc-400" />
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-center">
                    El bot está atendiendo este chat. Desactívalo para enviar un
                    mensaje manual.
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
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleFileClick}
                    disabled={isUploading}
                    className={`p-2 transition-colors ${
                      isUploading
                        ? "text-zinc-300"
                        : "text-zinc-400 hover:text-[#19213d]"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2
                        size={20}
                        className="animate-spin lg:w-6 lg:h-6"
                      />
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
                        isUploading
                          ? "Enviando imagen..."
                          : "Escribe un mensaje..."
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
    </div>
  );
}
