import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Order } from "../types";

export async function exportToExcel(orders: Order[], filename = "orders_export"): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "QueueSaaS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Orders", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // ── Column definitions ──────────────────────────────────────────
  sheet.columns = [
    { header: "Order ID", key: "orderId", width: 22 },
    { header: "Customer", key: "customer", width: 24 },
    { header: "Total (USD)", key: "total", width: 14 },
    { header: "Products", key: "products", width: 10 },
    { header: "Date", key: "date", width: 22 },
    { header: "Status", key: "status", width: 14 },
    { header: "Processed At", key: "processedAt", width: 22 },
  ];

  // ── Header styling ───────────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF667EEA" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF5A67D8" } },
    };
  });

  // ── Data rows ────────────────────────────────────────────────────
  const STATUS_COLORS: Record<string, string> = {
    completed: "FF10B981",
    pending: "FFF59E0B",
    processing: "FF3B82F6",
    failed: "FFEF4444",
  };

  orders.forEach((order, i) => {
    const row = sheet.addRow({
      orderId: order.orderId,
      customer: order.customer,
      total: order.total,
      products: order.products.length,
      date: new Date(order.date).toLocaleString("en-US"),
      status: order.status,
      processedAt: order.processedAt
        ? new Date(order.processedAt).toLocaleString("en-US")
        : "—",
    });

    // Alternate row background
    const bgColor = i % 2 === 0 ? "FF1F2937" : "FF111827";
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.font = { color: { argb: "FFD1D5DB" }, size: 10 };
      cell.alignment = { vertical: "middle" };
    });

    // Format total as currency
    const totalCell = row.getCell("total");
    totalCell.numFmt = '"$"#,##0.00';
    totalCell.font = { color: { argb: "FF10B981" }, bold: true, size: 10 };

    // Status badge color
    const statusCell = row.getCell("status");
    statusCell.font = {
      color: { argb: STATUS_COLORS[order.status] ?? "FFD1D5DB" },
      bold: true,
      size: 10,
    };
    statusCell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // ── Summary row ──────────────────────────────────────────────────
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  sheet.addRow([]);
  const summaryRow = sheet.addRow([
    `Total Records: ${orders.length}`,
    "",
    totalRevenue,
    "",
    "",
    `Completed: ${orders.filter((o) => o.status === "completed").length}`,
  ]);
  summaryRow.getCell("total").numFmt = '"$"#,##0.00';
  summaryRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
  });

  // ── Export ───────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
