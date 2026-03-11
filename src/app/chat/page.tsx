"use client";

import React, { useState, useRef, useEffect } from "react";
import ContactList from "@/components/ContactList";
import { Bot, Paperclip, Send, Lock } from "lucide-react";
import { Customer } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import WhatsAppImage from "@/components/WhatsAppImage";

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState<Customer | null>(null);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isConnected, isBotActive, toggleBot } =
    useChat(selectedContact?.id as number);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
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
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 flex flex-col space-y-4 bg-[#f8fafc]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.direction === "out"
                      ? "items-end self-end"
                      : "items-start"
                  } max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`p-4 rounded-2xl shadow-sm ${
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
                  <span className="text-[11px] text-zinc-400 mt-1 mx-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>

            {/* Input de Mensaje */}
            {isBotActive ? (
              <div className="p-6 bg-[#f8fafc] border-t border-zinc-100 flex items-center justify-center gap-3 text-zinc-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white p-2 rounded-full shadow-sm border border-zinc-100">
                  <Lock size={18} className="text-zinc-400" />
                </div>
                <p className="text-sm font-medium">
                  El bot está atendiendo este chat. Desactívalo para enviar un mensaje manual.
                </p>
              </div>
            ) : (
              <form
                className="p-6 bg-white border-t border-zinc-100 flex items-center gap-4"
                onSubmit={handleSendMessage}
              >
                <button
                  type="button"
                  className="text-zinc-400 hover:text-[#19213d] transition-colors"
                >
                  <Paperclip size={24} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="w-full bg-[#f1f5f9] border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#19213d]/10 text-[#19213d] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !isConnected}
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
