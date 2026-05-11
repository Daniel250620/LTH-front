"use client";

import React, { useState } from "react";
import ContactItem from "./ContactItem";
import { Search, X } from "lucide-react";
import { Customer } from "@/types/chat";
import { useSocket } from "@/context/SocketContext";

interface Props {
 onSelectContact?: (contact: Customer) => void;
 selectedContactId?: number | string;
 isCollapsed?: boolean;
 onExpand?: () => void;
}

const ContactSkeleton = ({ isCollapsed }: { isCollapsed?: boolean }) => (
 <div
  className={`flex items-center px-4 lg:px-6 py-4.5 lg:py-5 border-b border-slate-100 last:border-0 animate-pulse ${
   isCollapsed ? "justify-center" : ""
  }`}
 >
  <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0 border border-slate-200/40" />
  {!isCollapsed && (
   <div className="ml-3.5 flex-1 min-w-0">
    <div className="flex justify-between items-center mb-2">
     <div className="h-4 bg-slate-100 rounded w-24 lg:w-32" />
     <div className="h-3 bg-slate-50 rounded w-10" />
    </div>
    <div className="h-3.5 bg-slate-50 rounded w-2/3" />
   </div>
  )}
 </div>
);

export default function ContactList({
 onSelectContact,
 selectedContactId,
 isCollapsed,
 onExpand,
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

 const handleExpandAndSearch = () => {
  onExpand?.();
  setIsSearching(true);
 };

 return (
  <div className="flex flex-col h-full bg-white border-r border-slate-200/60 relative">
   {/* Scrollbars delgados profesionales */}
   <style>{`
    .custom-sidebar-scrollbar::-webkit-scrollbar {
     width: 4px;
    }
    .custom-sidebar-scrollbar::-webkit-scrollbar-track {
     background: transparent;
    }
    .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
     background: #e2e8f0;
     border-radius: 9999px;
    }
    .custom-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
     background: #cbd5e1;
    }
   `}</style>

   {/* Header de Mensajes (Alineación 1:1 con el Header del Chat) */}
   <div
    className={`px-4 lg:px-6 flex items-center min-h-[70px] lg:min-h-[80px] border-b border-slate-200 bg-white shrink-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
     isCollapsed ? "justify-center" : "justify-between"
    }`}
   >
    {isCollapsed ? (
     <button
      onClick={handleExpandAndSearch}
      className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-blue-900 transition-all text-slate-500 shadow-sm"
      title="Buscar y expandir"
     >
      <Search size={18} />
     </button>
    ) : isSearching ? (
     <div className="flex items-center w-full gap-2 transition-all duration-200 animate-in fade-in slide-in-from-right-2">
      <div className="relative flex-1">
       <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={16}
       />
       <input
        type="text"
        autoFocus
        placeholder="Buscar cliente..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
       />
      </div>
      <button
       onClick={toggleSearch}
       className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
       <X size={18} />
      </button>
     </div>
    ) : (
     <>
      <div className="flex items-center gap-2">
       <h1 className="text-lg lg:text-xl font-black text-[#101e42] tracking-tight">
        Mensajes
       </h1>
       {contacts.length > 0 && (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md border border-slate-200/40">
         {contacts.length}
        </span>
       )}
      </div>
      
      <button
       onClick={toggleSearch}
       className="w-9 h-9 lg:w-10 lg:h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#101e42] rounded-lg flex items-center justify-center transition-colors"
       title="Buscar mensajes"
      >
       <Search size={16} />
      </button>
     </>
    )}
   </div>

   {/* Lista de Contactos con scroll personalizado delgado */}
   <div className="flex-1 overflow-y-auto custom-sidebar-scrollbar bg-white">
    {loading && contacts.length === 0 ? (
     Array.from({ length: 6 }).map((_, i) => (
      <ContactSkeleton key={i} isCollapsed={isCollapsed} />
     ))
    ) : filteredContacts.length === 0 ? (
     <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
      <Search size={22} className="text-slate-300 stroke-[1.5]" />
      <p className="font-bold uppercase tracking-wider text-[10px]">
       {searchQuery
        ? `Sin coincidencias`
        : !isCollapsed && "Sin conversaciones"}
      </p>
     </div>
    ) : (
     filteredContacts.map((contact) => (
      <div
       key={contact.id}
       onClick={() => onSelectContact?.(contact)}
       className="block"
       title={isCollapsed ? contact.client_name : ""}
      >
       <ContactItem 
        contact={contact} 
        isCollapsed={isCollapsed} 
        isActive={selectedContactId === contact.id} 
       />
      </div>
     ))
    )}
   </div>
  </div>
 );
}
