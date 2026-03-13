"use client";

import React, { useState } from "react";
import ContactItem from "./ContactItem";
import { Search, X } from "lucide-react";
import { Customer } from "@/types/chat";
import { useSocket } from "@/context/SocketContext";

interface Props {
  onSelectContact?: (contact: Customer) => void;
  selectedContactId?: number | string;
}

export default function ContactList({
  onSelectContact,
  selectedContactId,
}: Props) {
  const { contacts, loading } = useSocket();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.client_name.toLowerCase().includes(query) ||
      contact.client_number.includes(query)
    );
  });

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchQuery("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      <div className="p-4 lg:p-6 flex justify-between items-center min-h-[80px] lg:min-h-[100px]">
        {isSearching ? (
          <div className="flex items-center w-full gap-2 transition-all duration-300">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                autoFocus
                placeholder="Buscar contacto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 rounded-full text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#19213d] transition-all"
              />
            </div>
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-400" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl lg:text-2xl font-bold text-[#19213d]">Mensajes</h1>
            <button
              onClick={toggleSearch}
              className="w-9 h-9 lg:w-10 lg:h-10 bg-[#19213d] rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors text-white"
            >
              <Search size={18} className="lg:w-5 lg:h-5" />
            </button>
          </>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && contacts.length === 0 ? (
          <div className="p-6 text-center text-zinc-500">
            Cargando contactos...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-6 text-center text-zinc-500">
            {searchQuery
              ? `No se encontraron contactos para "${searchQuery}"`
              : "No hay contactos"}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact?.(contact)}
              className={selectedContactId === contact.id ? "bg-zinc-100" : ""}
            >
              <ContactItem contact={contact} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
