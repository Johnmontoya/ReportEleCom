import mongoose, { Schema, Document } from "mongoose";

export interface IProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderId: string;
  customer: string;
  total: number;
  date: Date;
  products: IProduct[];
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customer: { type: String, required: true },
    total: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    products: { type: [ProductSchema], required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for analytics queries
OrderSchema.index({ date: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
