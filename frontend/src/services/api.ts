import axios from "axios";
import type { KPIs, ChartDataPoint, Order, ExportFilters } from "../types";

const api = axios.create({ baseURL: "/api" });

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function fetchKPIs(): Promise<KPIs> {
  const { data } = await api.get<{ success: boolean; data: KPIs }>("/orders/kpis");
  return data.data;
}

export async function fetchChartData(): Promise<ChartDataPoint[]> {
  const { data } = await api.get<{ success: boolean; data: ChartDataPoint[] }>("/orders/chart");
  return data.data;
}

export async function fetchOrders(page = 1, limit = 20): Promise<OrdersResponse> {
  const { data } = await api.get<OrdersResponse>(`/orders?page=${page}&limit=${limit}`);
  return data;
}

export async function fetchExportData(filters: ExportFilters): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.status) params.append("status", filters.status);
  const { data } = await api.get<{ success: boolean; data: Order[] }>(
    `/orders/export?${params.toString()}`
  );
  return data.data;
}

export async function enqueueOrder(orderData: {
  orderId: string;
  customer: string;
  total: number;
  date: string;
  products: Array<{ productId: string; name: string; quantity: number; price: number }>;
}) {
  const { data } = await api.post("/orders", orderData);
  return data;
}
