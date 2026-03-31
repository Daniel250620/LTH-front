"use client";

import React, {
 createContext,
 useContext,
 useEffect,
 useState,
 useCallback,
 useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { Customer, Message } from "@/types/chat";

interface SocketContextType {
 socket: Socket | null;
 isConnected: boolean;
 contacts: Customer[];
 loading: boolean;
 activeContactId: number | null;
 setActiveContactId: (id: number | null) => void;
 refreshContacts: () => Promise<void>;
 setContacts: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const SocketContext = createContext<SocketContextType>({
 socket: null,
 isConnected: false,
 contacts: [],
 loading: false,
 activeContactId: null,
 setActiveContactId: () => {},
 refreshContacts: async () => {},
 setContacts: () => {},
});

export const useSocket = () => useContext(SocketContext);

const COLORS = [
 "bg-blue-600",
 "bg-emerald-600",
 "bg-purple-600",
 "bg-orange-600",
 "bg-pink-600",
 "bg-indigo-600",
 "bg-red-600",
 "bg-cyan-600",
];

const getColorFromName = (name: string) => {
 let hash = 0;
 for (let i = 0; i < name.length; i++) {
  hash = name.charCodeAt(i) + ((hash << 5) - hash);
 }
 const index = Math.abs(hash) % COLORS.length;
 return COLORS[index];
};

const MOCK_CUSTOMERS: Customer[] = [
 {
  id: 1,
  client_name: "Soporte Técnico LTH",
  client_number: "5212200000000",
  isBotActive: true,
  avatarColor: getColorFromName("Soporte Técnico LTH"),
 },
 {
  id: 2,
  client_name: "Juan Pérez",
  client_number: "5212200000001",
  isBotActive: false,
  avatarColor: getColorFromName("Juan Pérez"),
 },
];

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
 const [socket, setSocket] = useState<Socket | null>(null);
 const [isConnected, setIsConnected] = useState(false);
 const [contacts, setContacts] = useState<Customer[]>([]);
 const [loading, setLoading] = useState(false);
 const [activeContactId, setActiveContactIdState] = useState<number | null>(null);
 const activeContactIdRef = useRef<number | null>(null);

 const setActiveContactId = useCallback((id: number | null) => {
  setActiveContactIdState(id);
  activeContactIdRef.current = id;
  if (id !== null) {
   setContacts((prev) =>
    prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
   );
  }
 }, []);

 const fetchContacts = useCallback(async () => {
  setLoading(true);
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers`;

  try {
   const response = await fetch(url);
   const text = await response.text();
   try {
    const data = JSON.parse(text);
    console.log(data);
    if (response.ok && Array.isArray(data)) {
     const dataWithColors = data.map((c: Customer) => ({
      ...c,
      isBotActive: !!c.isBotActive,
      avatarColor: c.avatarColor || getColorFromName(c.client_name || ""),
     }));
     setContacts(dataWithColors);
    } else {
     setContacts(MOCK_CUSTOMERS);
    }
   } catch {
    setContacts(MOCK_CUSTOMERS);
   }
  } catch {
   setContacts(MOCK_CUSTOMERS);
  } finally {
   setLoading(false);
  }
 }, []);

 // Carga inicial
 useEffect(() => {
  fetchContacts();
 }, [fetchContacts]);

 useEffect(() => {
  const socketInstance = io(
   process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081",
   {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
   },
  );

  socketInstance.on("connect", () => {
   console.log("Socket conectado");
   setIsConnected(true);
   setSocket(socketInstance);
  });

  socketInstance.on("disconnect", () => {
   console.log("Socket desconectado");
   setIsConnected(false);
  });

  // Listeners Globales para la lista de contactos
  socketInstance.on(
   "botStatusChanged",
   (data: { customerId: number; isBotActive: boolean }) => {
    setContacts((prev) =>
     prev.map((c) =>
      c.id === data.customerId ? { ...c, isBotActive: data.isBotActive } : c,
     ),
    );
   },
  );

  socketInstance.on("newCustomer", (newCustomer: Customer) => {
   setContacts((prev) => {
    if (prev.some((c) => c.id === newCustomer.id)) return prev;

    const customerWithColor = {
     ...newCustomer,
     isBotActive: !!newCustomer.isBotActive,
     avatarColor:
      newCustomer.avatarColor ||
      getColorFromName(newCustomer.client_name || ""),
    };

    return [customerWithColor, ...prev];
   });
  });

  socketInstance.on("newMessage", (msg: Message) => {
   console.log("📩 Nuevo mensaje recibido (Global):", msg);
   setContacts((prev) => {
    const index = prev.findIndex((c) => c.id === msg.customerId);
    if (index === -1) return prev;

    const updatedContacts = [...prev];
    const contact = { ...updatedContacts[index] };

    // Actualizar datos del mensaje
    contact.lastMessage = msg;

    // Incrementar contador si NO es el chat activo
    if (msg.customerId !== activeContactIdRef.current) {
     contact.unreadCount = (contact.unreadCount || 0) + 1;
    } else {
     contact.unreadCount = 0;
    }

    // Mover el contacto al principio de la lista
    updatedContacts.splice(index, 1);
    updatedContacts.unshift(contact);

    return updatedContacts;
   });
  });

  return () => {
   socketInstance.disconnect();
   setSocket(null);
  };
 }, []);

 return (
  <SocketContext.Provider
   value={{
    socket,
    isConnected,
    contacts,
    loading,
    activeContactId,
    setActiveContactId,
    refreshContacts: fetchContacts,
    setContacts,
   }}
  >
   {children}
  </SocketContext.Provider>
 );
};
