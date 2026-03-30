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
    <div className="min-h-screen bg-dark-950 font-sans text-gray-100 selection:bg-brand-500/30">
      {/* Dynamic Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] mix-blend-screen animate-glow" />
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-accent-600/10 rounded-full blur-[100px] mix-blend-screen animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] bg-brand-400/5 rounded-full blur-[120px] mix-blend-screen animate-glow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Sticky Glass Header ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-950/60 backdrop-blur-xl shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-400 via-accent-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(238,73,151,0.3)] animate-float">
                <img src="/src/assets/icon.svg" alt="Logo" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Report<span className="text-gradient">EleCom</span>
                </h1>
                <p className="text-gray-400 text-xs font-medium tracking-wide uppercase mt-0.5">
                  Real-time Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Última actualización</span>
                  <span className="text-gray-300 text-xs font-medium">
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )}
              <button
                onClick={() => loadData()}
                disabled={loading}
                className="btn-secondary text-sm px-4 py-2"
                title="Actualizar datos"
              >
                <span className={loading ? "animate-spin" : ""}>🔄</span>
                <span className="hidden sm:inline">{loading ? "Actualizando..." : "Actualizar"}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          {/* ── KPI Cards ──────────────────────────────────────────── */}
          <section>
            <KPICards data={kpis} loading={loading} />
          </section>

          {/* ── Sales Chart ────────────────────────────────────────── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <SalesChart data={chartData} loading={loading} />
          </section>

          {/* ── Export Panel ───────────────────────────────────────── */}
          <section className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex-1 max-w-3xl">
                <h2 className="text-xl font-bold text-white mb-2">Exportar Historial</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Descarga un reporte detallado de los pedidos en formato Excel aplicando los filtros correspondientes.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={exportFilters.from ?? ""}
                      onChange={(e) => setExportFilters((f) => ({ ...f, from: e.target.value }))}
                      className="w-full bg-glass-input"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={exportFilters.to ?? ""}
                      onChange={(e) => setExportFilters((f) => ({ ...f, to: e.target.value }))}
                      className="w-full bg-glass-input"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      Estado del Pedido
                    </label>
                    <select
                      value={exportFilters.status ?? ""}
                      onChange={(e) => setExportFilters((f) => ({ ...f, status: e.target.value }))}
                      className="w-full bg-glass-input appearance-none"
                    >
                      <option value="">🚀 Todos los Estados</option>
                      <option value="pending">⏳ Pendiente</option>
                      <option value="processing">⚙️ En Proceso</option>
                      <option value="completed">✅ Completado</option>
                      <option value="failed">❌ Fallido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="btn-primary w-full lg:w-auto h-12 px-8"
                >
                  {exporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ── Orders Table ───────────────────────────────────────── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <OrdersTable orders={orders} loading={loading} />
          </section>
        </main>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="py-6 border-t border-white/5 bg-dark-950/80 backdrop-blur-md mt-auto">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            <p className="text-gray-500 text-xs font-medium">
              ReportEleCom · Impulsado por BullMQ & React · 
              <span className="inline-flex items-center ml-1 text-brand-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse mr-1.5"></span>
                Actualización en tiempo real ({POLLING_INTERVAL / 1000}s)
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
