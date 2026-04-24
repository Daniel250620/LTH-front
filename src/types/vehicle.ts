export interface VehicleSummary {
  id: string;
  name: string;
  brandName: string;
  engine: string;
  yearStart: number;
  yearEnd: number;
  _rankingScore?: number;
}

export interface Compatibility {
  id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    price: string | number;
    category?: {
      id: number;
      name: string;
    };
    inventories: {
      id: number;
      stock: number;
      warehouse: {
        id: number;
        name: string;
      };
    }[];
  };
}

export interface Vehicle {
  id: number;
  name: string;
  engine: string;
  yearStart: number;
  yearEnd: number;
  brand: {
    id: number;
    name: string;
  };
  compatibilities?: Compatibility[];
  createdAt?: string;
}

export interface VehicleResponse {
  hits: VehicleSummary[];
  total: number;
  limit: number;
  offset: number;
  query: string;
  processingTimeMs: number;
}
