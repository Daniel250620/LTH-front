"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { Message, ChatHistoryResponse } from "@/types/chat";

const processMessage = (msg: Message): Message => {
  if (msg.content === "[Archivo: image]" && msg.rawPayload) {
    try {
      const payload =
        typeof msg.rawPayload === "string"
          ? JSON.parse(msg.rawPayload)
          : msg.rawPayload;
      const imageId =
        payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.id;
      if (imageId) {
        return { ...msg, imageId };
      }
    } catch (e) {
      console.error("Error parsing rawPayload for image id", e);
    }
  }
  return msg;
};

export function useChat(customerId?: number) {
  const { socket, isConnected, contacts, setContacts } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [prevCustomerId, setPrevCustomerId] = useState(customerId);
  const [firstItemIndex, setFirstItemIndex] = useState(1000000);

  const isLoadingMoreRef = useRef(false);
  const lastLoadTime = useRef(0);

  // Reiniciar el estado durante el renderizado si el customerId cambia
  // Esto evita "cascading renders" comparado con hacerlo en un useEffect
  if (customerId !== prevCustomerId) {
    setPrevCustomerId(customerId);
    setMessages([]);
    setHasMore(true);
    setFirstItemIndex(1000000);
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
          // Manejar nuevo formato { messages: Message[], isBotActive: boolean, hasMore?: boolean }
          if (response && !Array.isArray(response) && "messages" in response) {
            const initialMessages = response.messages.map(processMessage);
            setMessages(initialMessages);
            setHasMore(response.hasMore ?? false);
            setFirstItemIndex(1000000 - initialMessages.length);
          } else if (Array.isArray(response)) {
            // Fallback para el formato anterior (solo array de mensajes)
            const initialMessages = response.map(processMessage);
            setMessages(initialMessages);
            setHasMore(false);
            setFirstItemIndex(1000000 - initialMessages.length);
          }
        },
      );
    }
  }, [socket, customerId, setContacts]);

  // Manejar mensajes entrantes (solo para el chat activo)
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg: Message) => {
      if (msg.customerId === customerId) {
        setMessages((prev) => [...prev, processMessage(msg)]);
      }
    };

    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [socket, customerId]);

  const loadMoreMessages = useCallback(async () => {
    const now = Date.now();
    if (
      !socket ||
      !customerId ||
      !hasMore ||
      isLoadingMoreRef.current ||
      messages.length === 0 ||
      now - lastLoadTime.current < 500
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    lastLoadTime.current = now;
    setIsLoadingMore(true);

    const cursor = messages[0].createdAt;

    try {
      // Promisificamos el socket.emit para usar la estructura async/await
      const response = await new Promise<ChatHistoryResponse | Message[]>(
        (resolve) => {
          socket.emit(
            "findAllChat",
            { customerId, before: cursor, limit: 50 },
            resolve,
          );
        },
      );

      if (response && !Array.isArray(response) && "messages" in response) {
        const olderMessages = response.messages.map(processMessage);
        if (olderMessages.length > 0) {
          setMessages((prev) => [...olderMessages, ...prev]);
          setFirstItemIndex((prev) => prev - olderMessages.length);
        }
        setHasMore(response.hasMore ?? false);
      } else if (Array.isArray(response)) {
        const olderMessages = response.map(processMessage);
        if (olderMessages.length > 0) {
          setMessages((prev) => [...olderMessages, ...prev]);
          setFirstItemIndex((prev) => prev - olderMessages.length);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [socket, customerId, hasMore, messages]);

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

  const sendImage = useCallback(
    async (file: File) => {
      if (!customerId) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", String(customerId));

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
        console.log("Subiendo imagen a:", `${backendUrl}/files/upload`);

        const response = await fetch(`${backendUrl}/files/upload`, {
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
        console.log("Respuesta del servidor tras subir imagen:", data);

        // Paso 3: Mandar evento de socket con el ID recibido para que el back confirme y devuelva la URL
        if (socket) {
          socket.emit("createChat", {
            customerId,
            direction: "out",
            content: "",
            mediaId: data.id || data.mediaId, // Usamos data.id o data.mediaId según lo que devuelva tu back
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [customerId],
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
    messages,
    isBotActive,
    hasMore,
    isLoadingMore,
    isUploading,
    firstItemIndex,
    loadMoreMessages,
    sendMessage,
    sendImage,
    toggleBot,
    isConnected,
  };
}
