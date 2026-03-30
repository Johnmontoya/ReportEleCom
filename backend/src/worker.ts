import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redisConnection } from "./config/redis";
import { connectDB } from "./config/db";
import { Order, IProduct } from "./models/order.model";
import { ORDER_QUEUE_NAME } from "./config/queue";
import { OrderJobData } from "./types/order";

async function processOrderJob(job: Job<OrderJobData>): Promise<void> {
  const { orderId, customer, total, date, products } = job.data;

  console.log(`🔄 [TRABAJO RECIBIDO] Procesando orden: ${orderId}`);

  // Mark as processing
  await Order.findOneAndUpdate({ orderId }, { status: "processing" });

  // Simulación de procesamiento (ej: sincronización con inventario)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Actualizar a completado
  await Order.findOneAndUpdate(
    { orderId },
    {
      status: "completed",
      processedAt: new Date(),
      customer,
      total,
      date: date ? new Date(date) : new Date(),
      products,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ [TRABAJO COMPLETADO] Orden ${orderId} lista.`);
}

async function startWorker(): Promise<void> {
  await connectDB();

  const worker = new Worker(ORDER_QUEUE_NAME, processOrderJob, {
    connection: redisConnection,
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} finalizó con éxito.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} falló estrepitosamente:`, err.message);
    if (job) {
      Order.findOneAndUpdate(
        { orderId: job.data.orderId },
        { status: "failed" }
      ).exec();
    }
  });

  console.log(`🚀 Worker escuchando en la cola: "${ORDER_QUEUE_NAME}"`);
}

startWorker().catch((err) => {
  console.error("🚨 Error fatal del Worker:", err);
});
