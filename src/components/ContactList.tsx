"use client";

import React from "react";
import ContactItem from "./ContactItem";
import { Search } from "lucide-react";
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

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#19213d]">Mensajes</h1>
        <button className="w-10 h-10 bg-[#19213d] rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors text-white">
          <Search size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && contacts.length === 0 ? (
          <div className="p-6 text-center text-zinc-500">
            Cargando contactos...
          </div>
        ) : (
          contacts.map((contact) => (
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
