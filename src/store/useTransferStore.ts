import { create } from "zustand";
import { Warehouse, Product } from "@/types/product";

export interface TransferItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Transfer {
  id: number;
  fromWarehouse: Warehouse;
  toWarehouse: Warehouse;
  status: string;
  createdAt: string;
  completedAt: string | null;
  items: TransferItem[];
}

export interface FetchTransfersParams {
  status: "pending" | "in_transit" | "completed" | "cancelled";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse {
  data: Transfer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TransferStore {
  // Guardamos las transferencias agrupadas por status para que el Kanban funcione fluido
  columns: Record<string, PaginatedResponse>;
  // Estado de carga independiente por columna
  loading: Record<string, boolean>;
  error: string | null;

  // Actions
  // El parámetro `append` es clave para el Infinite Scroll (true = sumar abajo, false = reemplazar todo)
  fetchTransfers: (params: FetchTransfersParams, append?: boolean) => Promise<void>;
  updateTransferStatus: (id: number, currentStatus: string, newStatus: string) => Promise<void>;
}

const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const TRANSFER_API_URL = `${API_BACKEND}/transfers`;

const defaultPaginatedResponse: PaginatedResponse = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export const useTransferStore = create<TransferStore>((set, get) => ({
  columns: {
    pending: { ...defaultPaginatedResponse },
    in_transit: { ...defaultPaginatedResponse },
    completed: { ...defaultPaginatedResponse },
    cancelled: { ...defaultPaginatedResponse },
  },
  loading: {
    pending: false,
    in_transit: false,
    completed: false,
    cancelled: false,
  },
  error: null,

  fetchTransfers: async (params, append = false) => {
    const { status, page = 1, limit = 20 } = params;
    
    set((state) => ({
      loading: { ...state.loading, [status]: true },
      error: null,
    }));

    try {
      const urlParams = new URLSearchParams();
      urlParams.append("status", status);
      urlParams.append("page", page.toString());
      urlParams.append("limit", limit.toString());

      const fetchUrl = `${TRANSFER_API_URL}?${urlParams.toString()}`;
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`Error al obtener transferencias: ${response.statusText}`);
      }

      const data: PaginatedResponse = await response.json();

      set((state) => {
        const existingData = state.columns[status]?.data || [];
        
        return {
          columns: {
            ...state.columns,
            [status]: {
              ...data,
              // Magia del infinite scroll: Si me piden append, junto lo viejo con lo nuevo
              data: append ? [...existingData, ...data.data] : data.data,
            },
          },
          loading: { ...state.loading, [status]: false },
        };
      });
    } catch (error) {
      set((state) => ({
        error: (error as Error).message || "Error al cargar el Kanban",
        loading: { ...state.loading, [status]: false },
      }));
    }
  },

  updateTransferStatus: async (id, currentStatus, newStatus) => {
    set((state) => ({ error: null }));
    
    try {
      const response = await fetch(`${TRANSFER_API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado de la transferencia');
      }

      // Refrescamos ambas columnas para que el movimiento se vea reflejado
      const { fetchTransfers, columns } = get();
      
      // Recargamos la primera página de ambas para ver el cambio inmediato
      await Promise.all([
        fetchTransfers({ status: currentStatus as any, page: 1, limit: columns[currentStatus].limit }),
        fetchTransfers({ status: newStatus as any, page: 1, limit: columns[newStatus].limit }),
      ]);

    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
