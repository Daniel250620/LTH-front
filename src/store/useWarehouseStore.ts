import { create } from "zustand";
import { Warehouse } from "@/types/product";

interface WarehouseStore {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchWarehouses: () => Promise<void>;
}

const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const WAREHOUSE_API_URL = `${API_BACKEND}/warehouses`;

export const useWarehouseStore = create<WarehouseStore>((set, get) => ({
  warehouses: [],
  loading: false,
  error: null,

  fetchWarehouses: async () => {
    const { warehouses } = get();
    // Evitar llamada si ya tenemos los almacenes guardados en el store localmente
    if (warehouses.length > 0) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(WAREHOUSE_API_URL);
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de bodegas");
      }
      const data: Warehouse[] = await response.json();
      set({ warehouses: data, loading: false });
    } catch (error) {
      set({
        error: (error as Error).message || "Error al obtener las bodegas",
        loading: false,
      });
    }
  },
}));
