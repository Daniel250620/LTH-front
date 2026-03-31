import { create } from "zustand";
import { Product, ProductSummary, Warehouse } from "@/types/product";

interface ProductResponse {
  hits: ProductSummary[];
  totalHits?: number;
  offset?: number;
  limit?: number;
}

interface ProductStore {
  products: ProductSummary[];
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;

  // Search parameters
  search: string;
  category: string;
  limit: number;
  offset: number;
  sort: string;
  order: "asc" | "desc";

  // Actions
  fetchProducts: (params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: "asc" | "desc";
  }) => Promise<void>;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setPagination: (limit: number, offset: number) => void;
  setSort: (sort: string) => void;
  fetchProductById: (id: string) => Promise<Product | null>;
  createProduct: (product: Omit<Product, "id">) => Promise<Product | null>;
  updateProduct: (
    id: string,
    product: Partial<Product>,
  ) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  fetchWarehouses: () => Promise<void>;
}
const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_BASE_URL = `${API_BACKEND}/products`;
const WAREHOUSE_API_URL = `${API_BACKEND}/warehouses`;
const API_URL = `${API_BASE_URL}/meili`;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  warehouses: [],
  loading: false,
  error: null,
  search: "",
  category: "",
  limit: 5,
  offset: 0,
  sort: "",
  order: "asc",

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });

    const state = get();
    const search = params.search !== undefined ? params.search : state.search;
    const category =
      params.category !== undefined ? params.category : state.category;
    const limit = params.limit !== undefined ? params.limit : state.limit;
    const offset = params.offset !== undefined ? params.offset : state.offset;
    const sort = params.sort !== undefined ? params.sort : state.sort;
    const order = params.order !== undefined ? params.order : state.order;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (category) queryParams.append("category", category);
    if (sort) queryParams.append("sort", sort);
    if (sort) queryParams.append("order", order);

    queryParams.append("limit", limit.toString());
    queryParams.append("offset", offset.toString());

    try {
      const response = await fetch(`${API_URL}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el catálogo de productos");
      }
      const data: ProductResponse = await response.json();
      set({
        products: data.hits,
        loading: false,
        search,
        category,
        limit,
        offset,
        sort,
        order,
      });
    } catch (error) {
      set({
        error:
          (error as Error).message ||
          "Ocurrió un error al cargar los productos",
        loading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el producto");
      }
      const product: Product = await response.json();
      set({ loading: false });
      return product;
    } catch (error) {
      set({
        error: (error as Error).message || "Error al obtener el producto",
        loading: false,
      });
      return null;
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error("No se pudo crear el producto");
      }
      const newProduct: Product = await response.json();
      set({ loading: false });
      get().fetchProducts();
      return newProduct;
    } catch (error) {
      set({
        error: (error as Error).message || "Error al crear el producto",
        loading: false,
      });
      return null;
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error("No se pudo actualizar el producto");
      }
      const updatedProduct: Product = await response.json();
      set({ loading: false });
      get().fetchProducts(); // Refresh list
      return updatedProduct;
    } catch (error) {
      set({
        error: (error as Error).message || "Error al actualizar el producto",
        loading: false,
      });
      return null;
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto");
      }
      // Eliminación optimista: quita el producto del estado local de inmediato
      // para evitar el delay de re-indexación de MeiliSearch
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
      // Refresca en background con un pequeño delay para dar tiempo a MeiliSearch
      setTimeout(() => get().fetchProducts(), 1500);
      return true;
    } catch (error) {
      set({
        error: (error as Error).message || "Error al eliminar el producto",
        loading: false,
      });
      return false;
    }
  },

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
      const warehouses: Warehouse[] = await response.json();
      set({ warehouses, loading: false });
    } catch (error) {
      set({
        error: (error as Error).message || "Error al obtener las bodegas",
        loading: false,
      });
    }
  },

  setSearch: (search: string) => {
    set({ search, offset: 0 });
    get().fetchProducts({ search, offset: 0 });
  },

  setCategory: (category: string) => {
    set({ category, offset: 0 });
    get().fetchProducts({ category, offset: 0 });
  },

  setPagination: (limit: number, offset: number) => {
    set({ limit, offset });
    get().fetchProducts({ limit, offset });
  },

  setSort: (newSort: string) => {
    const { sort, order } = get();
    let newOrder: "asc" | "desc" = "asc";

    if (sort === newSort) {
      newOrder = order === "asc" ? "desc" : "asc";
    }

    set({ sort: newSort, order: newOrder, offset: 0 });
    get().fetchProducts({ sort: newSort, order: newOrder, offset: 0 });
  },
}));
