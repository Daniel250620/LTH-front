export interface RawPayload {
  object: "whatsapp_business_account";
  entry: {
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
}
export interface Message {
  id: string;
  customerId: number;
  direction: "in" | "out";
  content: string;
  createdAt: string;
  rawPayload?: RawPayload;
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
