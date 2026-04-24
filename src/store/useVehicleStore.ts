import { create } from "zustand";
import { Vehicle, VehicleSummary, VehicleResponse } from "@/types/vehicle";

interface VehicleStore {
 vehicles: VehicleSummary[];
 totalVehicles: number;
 loading: boolean;
 error: string | null;

 // Search parameters
 search: string;
 brandName: string;
 year: number | null;
 limit: number;
 offset: number;
 sort: string;
 order: "asc" | "desc";

 // Actions
 fetchVehicles: (params?: {
  search?: string;
  brandName?: string;
  year?: number | null;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
 }) => Promise<void>;
 setSearch: (search: string) => void;
 setBrandName: (brandName: string) => void;
 setYear: (year: number | null) => void;
 setPagination: (limit: number, offset: number) => void;
 setSort: (sort: string) => void;
 fetchVehicleById: (id: string | number) => Promise<Vehicle | null>;
 createVehicle: (
  vehicle: Omit<Vehicle, "createdAt">,
 ) => Promise<Vehicle | null>;
 updateVehicle: (
  id: string | number,
  vehicle: Partial<Vehicle>,
 ) => Promise<Vehicle | null>;
 deleteVehicle: (id: string | number) => Promise<boolean>;
 syncVehicles: () => Promise<boolean>;
}

const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_BASE_URL = `${API_BACKEND}/vehicles-models`;
const API_URL = `${API_BASE_URL}/meili`;
let abortController: AbortController | null = null;

export const useVehicleStore = create<VehicleStore>((set, get) => ({
 vehicles: [],
 totalVehicles: 0,
 loading: false,
 error: null,
 search: "",
 brandName: "",
 year: null,
 limit: 7,
 offset: 0,
 sort: "",
 order: "asc",

 fetchVehicles: async (params = {}) => {
  // Cancelar petición previa si existe
  if (get().loading && abortController) {
   abortController.abort();
  }

  abortController = new AbortController();
  const { signal } = abortController;

  set({ loading: true, error: null });

  const state = get();
  const search = params.search !== undefined ? params.search : state.search;
  const brandName =
   params.brandName !== undefined ? params.brandName : state.brandName;
  const year = params.year !== undefined ? params.year : state.year;
  const limit = params.limit !== undefined ? params.limit : state.limit;
  const offset = params.offset !== undefined ? params.offset : state.offset;
  const sort = params.sort !== undefined ? params.sort : state.sort;
  const order = params.order !== undefined ? params.order : state.order;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (brandName) queryParams.append("brandName", brandName);
  if (year) queryParams.append("year", year.toString());
  if (sort) queryParams.append("sort", sort);
  if (sort && order) queryParams.append("order", order);

  queryParams.append("limit", limit.toString());
  queryParams.append("offset", offset.toString());

  try {
   const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
    signal,
   });
   if (!response.ok) {
    throw new Error("No se pudo cargar el catálogo de vehículos");
   }
   const data: VehicleResponse = await response.json();
   set({
    vehicles: data.hits,
    totalVehicles: data.total,
    loading: false,
    search,
    brandName,
    year,
    limit,
    offset,
    sort,
    order,
   });
  } catch (error: any) {
   // No actualizar error si fue cancelado
   if (error.name === "AbortError") return;

   set({
    error: error.message || "Ocurrió un error al cargar los vehículos",
    loading: false,
   });
  }
 },

 fetchVehicleById: async (id) => {
  set({ loading: true, error: null });
  try {
   const response = await fetch(`${API_BASE_URL}/${id}`);
   if (!response.ok) {
    throw new Error("No se pudo cargar el vehículo");
   }
   const vehicle: Vehicle = await response.json();
   set({ loading: false });
   return vehicle;
  } catch (error) {
   set({
    error: (error as Error).message || "Error al obtener el vehículo",
    loading: false,
   });
   return null;
  }
 },

 createVehicle: async (vehicleData) => {
  set({ loading: true, error: null });
  try {
   const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicleData),
   });
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "No se pudo crear el vehículo");
   }
   const newVehicle: Vehicle = await response.json();
   set({ loading: false });
   get().fetchVehicles();
   return newVehicle;
  } catch (error) {
   set({
    error: (error as Error).message || "Error al crear el vehículo",
    loading: false,
   });
   return null;
  }
 },

 updateVehicle: async (id, vehicleData) => {
  set({ loading: true, error: null });
  try {
   const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicleData),
   });
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "No se pudo actualizar el vehículo");
   }
   const updatedVehicle: Vehicle = await response.json();
   set({ loading: false });
   get().fetchVehicles(); // Refresh list
   return updatedVehicle;
  } catch (error) {
   set({
    error: (error as Error).message || "Error al actualizar el vehículo",
    loading: false,
   });
   return null;
  }
 },

 deleteVehicle: async (id) => {
  set({ loading: true, error: null });
  try {
   const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
   });
   if (!response.ok) {
    throw new Error("No se pudo eliminar el vehículo");
   }
   // Eliminación optimista
   set((state) => ({
    vehicles: state.vehicles.filter((v) => v.id !== id.toString()),
    totalVehicles: state.totalVehicles - 1,
    loading: false,
   }));
   // Refresca en background con delay para Meilisearch
   setTimeout(() => get().fetchVehicles(), 1000);
   return true;
  } catch (error) {
   set({
    error: (error as Error).message || "Error al eliminar el vehículo",
    loading: false,
   });
   return false;
  }
 },

 syncVehicles: async () => {
  set({ loading: true, error: null });
  try {
   const response = await fetch(`${API_BASE_URL}/sync`, {
    method: "POST",
   });
   if (!response.ok) {
    throw new Error("No se pudo sincronizar los vehículos");
   }
   set({ loading: false });
   get().fetchVehicles();
   return true;
  } catch (error) {
   set({
    error: (error as Error).message || "Error al sincronizar vehículos",
    loading: false,
   });
   return false;
  }
 },

 setSearch: (search) => {
  set({ search, offset: 0 });
  get().fetchVehicles({ search, offset: 0 });
 },

 setBrandName: (brandName) => {
  set({ brandName, offset: 0 });
  get().fetchVehicles({ brandName, offset: 0 });
 },

 setYear: (year) => {
  set({ year, offset: 0 });
  get().fetchVehicles({ year, offset: 0 });
 },

 setPagination: (limit, offset) => {
  set({ limit, offset });
  get().fetchVehicles({ limit, offset });
 },

 setSort: (newSort) => {
  const { sort, order } = get();
  let newOrder: "asc" | "desc" = "asc";

  if (sort === newSort) {
   newOrder = order === "asc" ? "desc" : "asc";
  }

  set({ sort: newSort, order: newOrder, offset: 0 });
  get().fetchVehicles({ sort: newSort, order: newOrder, offset: 0 });
 },
}));
