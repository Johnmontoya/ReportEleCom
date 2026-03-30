import { useCallback, useEffect, useRef, useState } from "react";
import KPICards from "../components/KPICards";
import SalesChart from "../components/SalesChart";
import OrdersTable from "../components/OrdersTable";
import { fetchKPIs, fetchChartData, fetchOrders, fetchExportData } from "../services/api";
import { exportToExcel } from "../utils/exportExcel";
import type { KPIs, ChartDataPoint, Order, ExportFilters } from "../types";

const POLLING_INTERVAL = 15_000; // 15 s

export default function Dashboard() {
  // ── State ────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    from: "",
    to: "",
    status: "",
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data fetching ────────────────────────────────────────────────
  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [k, c, o] = await Promise.all([
        fetchKPIs(),
        fetchChartData(),
        fetchOrders(1, 20),
      ]);
      setKpis(k);
      setChartData(c);
      setOrders(o.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    pollingRef.current = setInterval(() => loadData(), POLLING_INTERVAL);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadData]);

  // ── Export ───────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await fetchExportData(exportFilters);
      await exportToExcel(data, "queue_system_orders");
    } catch (err) {
      console.error("Export failed:", err);
      alert("La exportación falló. Por favor, inténtalo de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center text-lg">
                <img src="/src/assets/icon.svg" alt="Logo" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Report<span className="text-gradient">EleCom</span>
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              Reporte de Pedidos de EleCommerce — Monitoreo en Tiempo Real
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-gray-500 text-xs hidden sm:block">
                Actualizado {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="btn-secondary text-xs px-3 py-2"
            >
              🔄 Actualizar
            </button>
          </div>
        </header>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <KPICards data={kpis} loading={loading} />

        {/* ── Sales Chart ────────────────────────────────────────── */}
        <SalesChart data={chartData} loading={loading} />

        {/* ── Export Panel ───────────────────────────────────────── */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">Exportar Datos</h2>
              <p className="text-gray-400 text-sm mb-4">
                Filtra y descarga el historial de pedidos como un archivo Excel
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Desde Fecha
                  </label>
                  <input
                    type="date"
                    value={exportFilters.from ?? ""}
                    onChange={(e) =>
                      setExportFilters((f) => ({ ...f, from: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Hasta Fecha
                  </label>
                  <input
                    type="date"
                    value={exportFilters.to ?? ""}
                    onChange={(e) =>
                      setExportFilters((f) => ({ ...f, to: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Estado
                  </label>
                  <select
                    value={exportFilters.status ?? ""}
                    onChange={(e) =>
                      setExportFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  >
                    <option value="">Todos los Estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="processing">En Proceso</option>
                    <option value="completed">Completado</option>
                    <option value="failed">Fallido</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary whitespace-nowrap"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generando…
                </>
              ) : (
                <>📥 Exportar a Excel</>
              )}
            </button>
          </div>
        </div>

        {/* ── Orders Table ───────────────────────────────────────── */}
        <OrdersTable orders={orders} loading={loading} />

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="text-center text-gray-600 text-xs pb-4">
          QueueSaaS · Impulsado por BullMQ + MongoDB · Se actualiza automáticamente cada 15s
        </footer>
      </div>
    </div>
  );
}
