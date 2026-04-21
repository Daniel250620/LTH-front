"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { Message, ChatHistoryResponse } from "@/types/chat";

const processMessage = (msg: Message): Message => {
 const s3FileId = (msg as any).fileId;
 if (s3FileId && !msg.fileId) {
  return { ...msg, fileId: String(s3FileId) };
 }

 const whatsappImageId = msg.imageId || (msg as any).mediaId;
 if (whatsappImageId) {
  return { ...msg, imageId: String(whatsappImageId) };
 }

 if (msg.rawPayload) {
  try {
   const payload =
    typeof msg.rawPayload === "string"
     ? JSON.parse(msg.rawPayload)
     : msg.rawPayload;

   const whatsappId =
    payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.id ||
    payload?.image?.id;

   if (whatsappId) {
    return { ...msg, imageId: String(whatsappId) };
   }
  } catch (e) {
   console.error("Error parsing rawPayload for image id", e);
  }
 }

 return msg;
};

export function useChat(customerId?: number) {
 const { socket, isConnected, contacts } = useSocket();

 // FIX 1: Actualización atómica de estado
 const [chatState, setChatState] = useState({
  messages: [] as Message[],
  hasMore: true,
  isLoadingMore: false,
  isLoading: false,
  firstItemIndex: 1000000,
 });

 const [isUploading, setIsUploading] = useState(false);
 const [isTyping, setIsTyping] = useState(false);
 const [prevCustomerId, setPrevCustomerId] = useState(customerId);

 const isLoadingMoreRef = useRef(false);
 const lastLoadTime = useRef(0);
 const pendingMessagesRef = useRef<Message[]>([]);
 const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 // Función para liberar mensajes en espera
 const flushMessages = useCallback(() => {
  if (typingTimeoutRef.current) {
   clearTimeout(typingTimeoutRef.current);
   typingTimeoutRef.current = null;
  }

  if (pendingMessagesRef.current.length > 0) {
   const messagesToAppend = pendingMessagesRef.current.map(processMessage);
   setChatState((prev) => ({
    ...prev,
    messages: [...prev.messages, ...messagesToAppend],
   }));
   pendingMessagesRef.current = [];
  }
  setIsTyping(false);
 }, []);

 // Reiniciar el estado durante el renderizado si el customerId cambia
 if (customerId !== prevCustomerId) {
  // Si cambiamos de chat, cancelamos cualquier simulación pendiente
  if (typingTimeoutRef.current) {
   clearTimeout(typingTimeoutRef.current);
   typingTimeoutRef.current = null;
  }
  pendingMessagesRef.current = [];
  setIsTyping(false);

  setPrevCustomerId(customerId);
  setChatState({
   messages: [],
   hasMore: true,
   isLoadingMore: false,
   isLoading: !!customerId,
   firstItemIndex: 1000000,
  });
 }

 // Obtenemos el estado del bot desde el estado global de contactos
 const currentCustomer = contacts.find((c) => c.id === customerId);
 const isBotActive = currentCustomer?.isBotActive ?? false;

 // Cargar historial cuando cambie el customerId
 useEffect(() => {
  if (socket && customerId) {
   socket.emit(
    "findAllChat",
    { customerId, limit: 50 },
    (response: ChatHistoryResponse | Message[]) => {
     console.log("📜 Historial de chat cargado:", response);
     if (response && !Array.isArray(response) && "messages" in response) {
      const initialMessages = response.messages.map(processMessage);
      setChatState({
       messages: initialMessages,
       hasMore: response.hasMore ?? false,
       isLoadingMore: false,
       isLoading: false,
       firstItemIndex: 1000000 - initialMessages.length,
      });
     } else if (Array.isArray(response)) {
      const initialMessages = response.map(processMessage);
      setChatState({
       messages: initialMessages,
       hasMore: false,
       isLoadingMore: false,
       isLoading: false,
       firstItemIndex: 1000000 - initialMessages.length,
      });
     }
    },
   );
  }
 }, [socket, customerId]);

 // Manejar mensajes entrantes
 useEffect(() => {
  if (!socket) return;

  const onNewMessage = (msg: Message) => {
   console.log("📨 Mensaje recibido en el chat actual:", msg);
   if (msg.customerId === customerId) {
    const isFromClient = msg.direction === "in";

    if (isFromClient) {
     // Si es del cliente, iniciamos o continuamos simulación
     if (!typingTimeoutRef.current) {
      setIsTyping(true);
      pendingMessagesRef.current = [msg];

      // Random delay between 1000ms and 3000ms
      const delay = Math.floor(Math.random() * 2000) + 1000;
      typingTimeoutRef.current = setTimeout(() => {
       flushMessages();
      }, delay);
     } else {
      // Ya estamos simulando, encolamos el mensaje
      pendingMessagesRef.current.push(msg);
     }
    } else {
     // Si es un mensaje de salida (nosotros o el bot), liberamos lo pendiente de inmediato
     flushMessages();
     setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, processMessage(msg)],
     }));
    }
   }
  };

  socket.on("newMessage", onNewMessage);

  return () => {
   socket.off("newMessage", onNewMessage);
   if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
   }
  };
 }, [socket, customerId, flushMessages]);

 const loadMoreMessages = useCallback(async () => {
  const now = Date.now();
  if (
   !socket ||
   !customerId ||
   !chatState.hasMore ||
   isLoadingMoreRef.current ||
   chatState.messages.length === 0 ||
   now - lastLoadTime.current < 500
  ) {
   return;
  }

  isLoadingMoreRef.current = true;
  lastLoadTime.current = now;

  setChatState((prev) => ({ ...prev, isLoadingMore: true }));

  const cursor = chatState.messages[0].createdAt;

  try {
   const response = await new Promise<ChatHistoryResponse | Message[]>(
    (resolve) => {
     socket.emit(
      "findAllChat",
      { customerId, before: cursor, limit: 50 },
      resolve,
     );
    },
   );

   console.log("⏬ Más mensajes cargados del historial:", response);

   if (response && !Array.isArray(response) && "messages" in response) {
    const olderMessages = response.messages.map(processMessage);
    if (olderMessages.length > 0) {
     setChatState((prev) => ({
      ...prev,
      messages: [...olderMessages, ...prev.messages],
      hasMore: response.hasMore ?? false,
      isLoadingMore: false,
      firstItemIndex: prev.firstItemIndex - olderMessages.length,
     }));
    } else {
     setChatState((prev) => ({
      ...prev,
      hasMore: response.hasMore ?? false,
      isLoadingMore: false,
     }));
    }
   } else if (Array.isArray(response)) {
    const olderMessages = response.map(processMessage);
    if (olderMessages.length > 0) {
     setChatState((prev) => ({
      ...prev,
      messages: [...olderMessages, ...prev.messages],
      hasMore: false,
      isLoadingMore: false,
      firstItemIndex: prev.firstItemIndex - olderMessages.length,
     }));
    } else {
     setChatState((prev) => ({
      ...prev,
      hasMore: false,
      isLoadingMore: false,
     }));
    }
   }
  } catch (error) {
   console.error("Error loading more messages:", error);
   setChatState((prev) => ({ ...prev, isLoadingMore: false }));
  } finally {
   isLoadingMoreRef.current = false;
  }
 }, [socket, customerId, chatState.hasMore, chatState.messages]);

 const sendMessage = useCallback(
  (content: string) => {
   if (socket && customerId) {
    socket.emit("createChat", {
     customerId,
     direction: "out",
     content,
    });
   }
  },
  [socket, customerId],
 );

 const sendMedia = useCallback(
  async (file: File) => {
   if (!customerId) return;

   setIsUploading(true);
   const formData = new FormData();
   formData.append("file", file);
   formData.append("customerId", String(customerId));

   try {
    const backendUrl =
     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
    const response = await fetch(`${backendUrl}/whatsapp/media`, {
     method: "POST",
     body: formData,
    });

    if (!response.ok) {
     const errorText = await response.text();
     throw new Error(
      `Error ${response.status}: ${errorText || "Error al subir la imagen al servidor"}`,
     );
    }

    const data = await response.json();
    const isDocument = file.type.includes("pdf");

    if (socket) {
     socket.emit("createChat", {
      customerId,
      direction: "out",
      content: "",
      ...(isDocument
       ? { fileId: data.id || data.mediaId }
       : { mediaId: data.id || data.mediaId }),
     });
    }
   } catch (error) {
    console.error("Upload error:", error);
   } finally {
    setIsUploading(false);
   }
  },
  [customerId, socket],
 );

 const toggleBot = useCallback(
  (active: boolean) => {
   if (socket && customerId) {
    socket.emit("toggleBot", { customerId, isBotActive: active });
   }
  },
  [socket, customerId],
 );

 return {
  messages: chatState.messages,
  isBotActive,
  hasMore: chatState.hasMore,
  isLoading: chatState.isLoading,
  isLoadingMore: chatState.isLoadingMore,
  isUploading,
  isTyping,
  firstItemIndex: chatState.firstItemIndex,
  loadMoreMessages,
  sendMessage,
  sendMedia,
  toggleBot,
  isConnected,
 };
}
