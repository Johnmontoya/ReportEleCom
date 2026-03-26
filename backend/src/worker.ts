import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redisConnection } from "./config/redis";
import { connectDB } from "./config/db";
import { Order, IOrder } from "./models/order.model";
import { ORDER_QUEUE_NAME } from "./config/queue";

export interface OrderJobData {
  orderId: string;
  customer: string;
  total: number;
  date: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

async function processOrderJob(job: Job<OrderJobData>): Promise<void> {
  const { orderId, customer, total, date, products } = job.data;

  console.log(`🔄 [Job ${job.id}] Processing order: ${orderId}`);

  // Mark as processing
  await Order.findOneAndUpdate({ orderId }, { status: "processing" });

  // Simulate real-world async processing delay (e.g., inventory check, ERP sync)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Persist final state
  await Order.findOneAndUpdate(
    { orderId },
    {
      status: "completed",
      processedAt: new Date(),
      customer,
      total,
      date: new Date(date),
      products,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ [Job ${job.id}] Order ${orderId} saved to DB`);
}

async function startWorker(): Promise<void> {
  await connectDB();

  const worker = new Worker<OrderJobData>(ORDER_QUEUE_NAME, processOrderJob, {
    connection: redisConnection,
    concurrency: 5, // process 5 jobs simultaneously
  });

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    if (job) {
      Order.findOneAndUpdate(
        { orderId: job.data.orderId },
        { status: "failed" }
      ).exec();
    }
  });

  worker.on("error", (err) => {
    console.error("🚨 Worker error:", err);
  });

  console.log(`🚀 Worker listening on queue: "${ORDER_QUEUE_NAME}"`);
}

startWorker().catch(console.error);
