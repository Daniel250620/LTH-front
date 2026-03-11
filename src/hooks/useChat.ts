"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { Message, ChatHistoryResponse } from "@/types/chat";

const processMessage = (msg: Message): Message => {
  if (msg.content === "[Archivo: image]" && msg.rawPayload) {
    try {
      const payload = typeof msg.rawPayload === 'string' ? JSON.parse(msg.rawPayload) : msg.rawPayload;
      const imageId = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image?.id;
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

  // Obtenemos el estado del bot desde el estado global de contactos
  const currentCustomer = contacts.find((c) => c.id === customerId);
  const isBotActive = currentCustomer?.isBotActive ?? false;

  // Cargar historial cuando cambie el customerId
  useEffect(() => {
    if (socket && customerId) {
      socket.emit("findAllChat", { customerId }, (response: ChatHistoryResponse | Message[]) => {
        // Manejar nuevo formato { messages: Message[], isBotActive: boolean }
        if (response && !Array.isArray(response) && 'messages' in response) {
          setMessages(response.messages.map(processMessage));
          
          // Sincronizar el estado del bot en la lista global de contactos
          setContacts((prev) =>
            prev.map((c) =>
              c.id === customerId
                ? { ...c, isBotActive: response.isBotActive }
                : c,
            ),
          );
        } else if (Array.isArray(response)) {
          // Fallback para el formato anterior (solo array de mensajes)
          setMessages(response.map(processMessage));
        }
      });
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

  const toggleBot = useCallback(
    (active: boolean) => {
      if (socket && customerId) {
        socket.emit("toggleBot", { customerId, isBotActive: active });
      }
    },
    [socket, customerId],
  );

  return { messages, isBotActive, sendMessage, toggleBot, isConnected };
}
