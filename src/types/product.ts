// Estructura para la tabla (Meilisearch)
export interface ProductSummary {
 id: string;
 name: string;
 description: string;
 price: number;
 stock: number;
 category: string;
 details: string;
 images: any[];
 sku: string;
 brand: string;
 stockByWarehouse?: {
  id: number;
  name: string;
  stock: number;
  stock_min: number;
  stock_max: number;
  address?: string;
  latitude?: number;
  longitude?: number;
 }[];
}

export interface Warehouse {
 id: number;
 name: string;
 address?: string;
 phone?: string;
 latitude?: number;
 longitude?: number;
}

export interface Inventory {
 id?: number;
 stock: number;
 productId: number;
 warehouseId: number;
 stock_min: number;
 stock_max: number;
 location: string;
 warehouse?: Warehouse;
}

export interface Category {
 id: number;
 value: string;
}

export interface BatteryModel {
 id?: number;
 modelCode?: string;
 en?: string | null;
 crankingAmps?: number;
 coldCrankingAmps?: number;
 reserveCapacityMinutes?: number;
 lengthMm?: number;
 widthMm?: number;
 heightMm?: number;
 weightKg?: string | number;
 polarity?: string;
 voltage?: number;
 amperageAh?: number;
 warranty?: string | null;
 bci?: string;
}

export interface FiltersModel {
 id?: number;
 type?: string;
 heightMm?: number;
 outerDiameterMm?: number;
 threadSize?: string;
}

export interface OilsModel {
 id?: number;
 saeGrade?: string;
 type?: string;
 volumeLiters?: number;
}

export interface Product {
 id: number;
 name: string;
 description: string;
 price: string | number;
 priceWithDiscount?: string | number;
 sku: string;
 category: Category;
 brand?: { id: number; name: string } | string;
 batteryModel?: BatteryModel | null;
 filtersModel?: FiltersModel | null;
 oilsModel?: OilsModel | null;
 inventories: Inventory[];
 totalStock?: number;
}
