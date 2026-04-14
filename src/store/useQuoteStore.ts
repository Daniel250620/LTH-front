import { create } from "zustand";

export interface QuoteCustomer {
  id: number;
  client_name: string;
  client_number: string;
}

export interface QuoteWarehouse {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  fileId: string;
  name: string;
  customerId: number;
  warehouseId: number;
  total: string;
  createdAt: string;
  customer: QuoteCustomer;
  warehouse: QuoteWarehouse;
}

interface FetchQuotesParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort?: string;
  order?: string;
  customerId?: string;
  warehouseId?: string;
}

interface QuoteStore {
  quotes: Quote[];
  total: number;
  limit: number;
  offset: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchQuotes: (params?: FetchQuotesParams) => Promise<void>;
}

const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const QUOTE_API_URL = `${API_BACKEND}/quotes`;

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: [],
  total: 0,
  limit: 10,
  offset: 0,
  loading: false,
  error: null,

  fetchQuotes: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const urlParams = new URLSearchParams();
      
      if (params.limit !== undefined) urlParams.append("limit", params.limit.toString());
      if (params.offset !== undefined) urlParams.append("offset", params.offset.toString());
      if (params.search) urlParams.append("search", params.search);
      if (params.sort) urlParams.append("sort", params.sort);
      if (params.order) urlParams.append("order", params.order);
      if (params.customerId) urlParams.append("customerId", params.customerId);
      if (params.warehouseId) urlParams.append("warehouseId", params.warehouseId);

      const queryString = urlParams.toString();
      const fetchUrl = queryString ? `${QUOTE_API_URL}?${queryString}` : QUOTE_API_URL;

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de cotizaciones");
      }
      
      const data = await response.json();
      
      set({ 
        quotes: data.hits || [], 
        total: data.total || 0,
        limit: data.limit || 10,
        offset: data.offset || 0,
        loading: false 
      });
    } catch (error) {
      set({
        error: (error as Error).message || "Error al obtener las cotizaciones",
        loading: false,
      });
    }
  },
}));
