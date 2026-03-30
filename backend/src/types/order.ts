import { IProduct } from "../models/order.model";

export interface OrderJobData {
  orderId: string;
  customer: string;
  total: number;
  date?: string | Date;
  products: IProduct[];
}
