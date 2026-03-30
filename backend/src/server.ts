import "dotenv/config";
import express from "express";
import cors from "cors";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { connectDB } from "./config/db";
import { orderQueue } from "./config/queue";
import ordersRouter from "./routes/orders.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// ── BullBoard Helper ──────────────────────────────────────────────────────────
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(orderQueue)],
  serverAdapter: serverAdapter,
});

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ["https://report-ele-com.vercel.app", "https://ele-commerce.vercel.app"], credentials: true }));
app.use(express.json({ limit: "1mb" }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/admin/queues", serverAdapter.getRouter());
app.use("/api/orders", ordersRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📋 Control Panel (BullBoard): http://localhost:${PORT}/admin/queues`);
    console.log(`📋 Endpoints:`);
    console.log(`   POST   /api/orders         → Enqueue order(s)`);
    console.log(`   GET    /api/orders/kpis    → Dashboard KPIs`);
    console.log(`   GET    /api/orders/chart   → Daily sales chart`);
  });
}

bootstrap().catch(console.error);
