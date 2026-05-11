import { create } from "zustand";

export interface OrderCustomer {
	id: string;
	client_name: string;
	client_number: string;
}

export interface OrderWarehouse {
	id: number;
	name: string;
	address?: string;
	phone?: string;
}

export interface OrderItem {
	id: string;
	sku?: string;
	name?: string;
	quantity: number;
	unitPrice: number;
	subtotal?: number;
}

export interface Address {
	id: string;
	street: string;
	// Other fields as necessary
}

export interface Order {
	id: string;
	status: string;
	totalAmount: number;
	taxAmount: number;
	items: OrderItem[];
	shippingAddress: Address | null;
	customerId: string | OrderCustomer;
	warehouseId: number | OrderWarehouse | null;
	deliveryMethod: string;
	paymentMethod: string | null;
	needsTechnician: boolean;
	deliveryAddressText: string | null;
	latitude: number | null;
	longitude: number | null;
	quoteId: string | null;
	createdAt: string;
	updatedAt: string;
	
	// Relations
	customer?: OrderCustomer;
	warehouse?: OrderWarehouse;
}

export interface FetchOrdersParams {
	limit?: number;
	offset?: number;
	search?: string;
	sort?: string;
	order?: string;
	customerId?: string;
	warehouseId?: string;
	status?: string;
	deliveryMethod?: string;
	paymentMethod?: string;
}

interface OrderStore {
	orders: Order[];
	selectedOrder: Order | null;
	total: number;
	limit: number;
	offset: number;
	loading: boolean;
	error: string | null;
	hasUnreadOrders: boolean;

	// Actions
	fetchOrders: (params?: FetchOrdersParams) => Promise<void>;
	fetchOrderById: (id: string) => Promise<void>;
	updateOrderStatus: (id: string, status: string) => Promise<void>;
	downloadOrderPdf: (quoteId: string) => Promise<Blob>;
	addOrder: (order: Order) => void;
	setHasUnreadOrders: (value: boolean) => void;
	updateOrder: (order: Order) => void;
}

const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const ORDER_API_URL = `${API_BACKEND}/orders`;

export const useOrderStore = create<OrderStore>((set, get) => ({
	orders: [],
	selectedOrder: null,
	total: 0,
	limit: 10,
	offset: 0,
	loading: false,
	error: null,
	hasUnreadOrders: false,

	fetchOrders: async (params = {}) => {
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
			if (params.status) urlParams.append("status", params.status);
			if (params.deliveryMethod) urlParams.append("deliveryMethod", params.deliveryMethod);
			if (params.paymentMethod) urlParams.append("paymentMethod", params.paymentMethod);

			const queryString = urlParams.toString();
			const fetchUrl = queryString ? `${ORDER_API_URL}?${queryString}` : ORDER_API_URL;

			const response = await fetch(fetchUrl);
			if (!response.ok) {
				throw new Error("No se pudo cargar la lista de órdenes");
			}

			const data = await response.json();

			set({
				orders: data.hits || [],
				total: data.total || 0,
				limit: data.limit || 10,
				offset: data.offset || 0,
				loading: false,
			});
		} catch (error) {
			set({
				error: (error as Error).message || "Error al obtener las órdenes",
				loading: false,
			});
		}
	},

	fetchOrderById: async (id) => {
		const { loading, selectedOrder } = get();
		if (loading && selectedOrder?.id === id) return;

		set({ loading: true, error: null });
		try {
			const response = await fetch(`${ORDER_API_URL}/${id}`);
			if (!response.ok) {
				throw new Error("No se pudo cargar la orden");
			}
			const data = await response.json();
			set({ selectedOrder: data, loading: false });
		} catch (error) {
			set({
				error: (error as Error).message || "Error al obtener la orden",
				loading: false,
			});
		}
	},

	updateOrderStatus: async (id, status) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`${ORDER_API_URL}/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status }),
			});

			if (!response.ok) {
				throw new Error("No se pudo actualizar el estado de la orden");
			}

			const updatedOrder = await response.json();
			
			const { selectedOrder, orders } = get();
			// Update selectedOrder if it matches
			if (selectedOrder?.id === id) {
				set({ selectedOrder: { ...selectedOrder, status: updatedOrder.status } });
			}

			// Update order in list
			set({
				orders: orders.map((order) =>
					order.id === id ? { ...order, status: updatedOrder.status } : order
				),
				loading: false,
			});
		} catch (error) {
			set({
				error: (error as Error).message || "Error al actualizar la orden",
				loading: false,
			});
		}
	},

	downloadOrderPdf: async (quoteId) => {
		try {
			const response = await fetch(`${API_BACKEND}/quotes/${quoteId}/pdf`);
			if (!response.ok) {
				throw new Error("No se pudo generar el PDF del pedido");
			}
			return await response.blob();
		} catch (error) {
			throw new Error((error as Error).message || "Error al descargar el PDF");
		}
	},

	addOrder: (order) => {
		const { orders, total } = get();
		if (orders.some((o) => o.id === order.id)) return;
		set({
			orders: [order, ...orders],
			total: total + 1,
		});
	},

	setHasUnreadOrders: (value) => {
		set({ hasUnreadOrders: value });
	},
	updateOrder: (order) => {
		const { orders, selectedOrder } = get();
		if (selectedOrder?.id === order.id) {
			set({ selectedOrder: order });
		}
		set({
			orders: orders.map((o) => (o.id === order.id ? order : o)),
		});
	},
}));
