export interface RawPayload {
  object?: "whatsapp_business_account";
  entry?: {
    id: string;
    changes: {
      field: "messages";
      value: {
        messaging_product: "whatsapp";
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: {
          profile: {
            name: string;
          };
          wa_id: string;
        }[];
        messages: {
          from: string;
          id: string;
          timestamp: string;
          type: "image" | string;
          image?: {
            id: string;
            mime_type: string;
            sha256: string;
            url: string;
          };
        }[];
      };
    }[];
  }[];
  type?: string;
  buttons?: any[];
  imageId?: string;
  imageUrl?: string;
  reply_to_text?: string;
  reply_to_direction?: "in" | "out";
  wamid?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}
export interface Message {
  id: string;
  customerId: number;
  direction: "in" | "out";
  content: string;
  createdAt: string;
  rawPayload?: RawPayload;
  /** UUID de S3 — documetos enviados por el bot (PDFs, cotizaciones) */
  fileId?: string;
  /** WhatsApp media ID — imágenes enviadas por admin o recibidas de WhatsApp */
  imageId?: string;
  imageUrl?: string;
}

export interface Customer {
  id: number;
  client_name: string;
  client_number: string;
  isBotActive?: boolean;
  ultimoMensaje?: string;
  avatarColor?: string;
  time?: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ConversationState {
  customerId: number;
  messages: Message[];
  isBotActive: boolean;
}

export interface ChatHistoryResponse {
  messages: Message[];
  isBotActive: boolean;
  hasMore?: boolean;
}
