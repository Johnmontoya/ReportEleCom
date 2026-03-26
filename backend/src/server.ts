import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import ordersRouter from "./routes/orders.routes";
// Import queue to ensure it's initialized on startup
import "./config/queue";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/orders", ordersRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📋 Endpoints:`);
    console.log(`   POST   /api/orders         → Enqueue order`);
    console.log(`   GET    /api/orders         → List orders`);
    console.log(`   GET    /api/orders/kpis    → Dashboard KPIs`);
    console.log(`   GET    /api/orders/chart   → Daily sales chart`);
    console.log(`   GET    /api/orders/export  → Export dataset`);
  });
}

bootstrap().catch(console.error);
