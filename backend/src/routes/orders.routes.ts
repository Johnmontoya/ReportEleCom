import { Router, Request, Response } from "express";
import { orderQueue } from "../config/queue";
import { Order } from "../models/order.model";
import { OrderJobData } from "../types/order";

const router = Router();

// ─────────────────────────────────────────────
// POST /api/orders — Enqueue a new order
// ─────────────────────────────────────────────
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawData = req.body;
    const isArray = Array.isArray(rawData);
    const ordersToProcess: OrderJobData[] = isArray ? rawData : [rawData];

    const results = [];
    const errors = [];

    for (const orderData of ordersToProcess) {
      const { orderId, customer, total, date, products } = orderData;

      // Basic validation
      if (!orderId || !customer || total === undefined || !products?.length) {
        errors.push({ orderId: orderId || "unknown", message: "Missing required fields" });
        continue;
      }

      // Create a placeholder document immediately (upsert)
      await Order.findOneAndUpdate(
        { orderId },
        {
          orderId,
          customer,
          total,
          date: date ? new Date(date) : new Date(),
          products,
          status: "pending",
        },
        { upsert: true, new: true }
      );

      // Enqueue the job
      const job = await orderQueue.add("process-order", orderData, {
        jobId: orderId,
      });

      results.push({ orderId, jobId: job.id });
    }

    res.status(202).json({
      success: errors.length === 0,
      message: isArray 
        ? `Processed ${results.length} orders successfully. ${errors.length} failed.`
        : "Order enqueued successfully",
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Error enqueuing order(s):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// GET /api/orders — Fetch orders with filters
// ─────────────────────────────────────────────
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, from, to, limit = "50", page = "1" } = req.query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, unknown>)["$gte"] = new Date(from as string);
      if (to) (filter.date as Record<string, unknown>)["$lte"] = new Date(to as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders/kpis — Dashboard KPIs
// ─────────────────────────────────────────────
router.get("/kpis", async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, pendingInQueue, todayOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
    ]);

    const todayRevenue = todayOrders[0]?.revenue ?? 0;
    const todayCount = todayOrders[0]?.count ?? 0;

    res.json({
      success: true,
      data: { totalOrders, pendingInQueue, todayRevenue, todayCount },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders/chart — Daily sales trend (last 30 days)
// ─────────────────────────────────────────────
router.get("/chart", async (_req: Request, res: Response): Promise<void> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      { $match: { date: { $gte: since }, status: "completed" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          revenue: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, count: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders/export — Full export dataset
// ─────────────────────────────────────────────
router.get("/export", async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, unknown>)["$gte"] = new Date(from as string);
      if (to) (filter.date as Record<string, unknown>)["$lte"] = new Date(to as string);
    }

    const orders = await Order.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
