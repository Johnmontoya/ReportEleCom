export interface Product {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderId: string;
  customer: string;
  total: number;
  date: string;
  products: Product[];
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIs {
  totalOrders: number;
  pendingInQueue: number;
  todayRevenue: number;
  todayCount: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  count: number;
}

export interface ExportFilters {
  from?: string;
  to?: string;
  status?: string;
}
