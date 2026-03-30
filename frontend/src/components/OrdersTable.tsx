import type { Order } from "../types";

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  processing: "bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-[0_0_10px_rgba(90,117,253,0.2)]",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  failed: "bg-accent-500/10 text-accent-400 border-accent-500/20 shadow-[0_0_10px_rgba(238,73,151,0.2)]",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completada",
  failed: "Fallida",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "🕒",
  processing: "⚙️",
  completed: "🚀",
  failed: "⚠️",
};

function SkeletonRow() {
  return (
    <tr className="border-b border-dark-800">
      {Array(6).fill(0).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-5 bg-dark-800 rounded-md animate-pulse border border-white/5" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function OrdersTable({ orders, loading }: OrdersTableProps) {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("es-ES", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-dark-900/40">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Últimos Pedidos</h2>
          <p className="text-gray-400 text-sm font-medium">Historial en tiempo real de transacciones</p>
        </div>
        {!loading && (
          <div className="px-3 py-1 rounded-lg bg-dark-800 border border-white/10 text-brand-400 text-xs font-bold shadow-inner">
            Mostrando {orders.length}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-[11px] uppercase tracking-widest border-b border-white/10 bg-dark-900/60 font-bold">
              <th className="text-left px-6 py-4">ID Transacción</th>
              <th className="text-left px-6 py-4">Cliente / Usuario</th>
              <th className="text-right px-6 py-4">Monto Total</th>
              <th className="text-left px-6 py-4">Artículos</th>
              <th className="text-left px-6 py-4">Fecha de Vida</th>
              <th className="text-left px-6 py-4">Estado Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : orders.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-800 border border-white/5 shadow-inner mb-4">
                      <span className="text-4xl">📭</span>
                    </div>
                    <p className="text-gray-300 font-medium text-lg">No hay pedidos disponibles</p>
                    <p className="text-gray-500 font-medium text-sm mt-1">Los pedidos aparecerán aquí automáticamente.</p>
                  </td>
                </tr>
              )
              : orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-dark-800/60 transition-colors group cursor-default"
                >
                  <td className="px-6 py-4 font-mono text-[13px] text-brand-400 group-hover:text-brand-300 transition-colors">{order.orderId.substring(0, 16)}...</td>
                  <td className="px-6 py-4 text-gray-200 font-medium group-hover:text-white transition-colors">{order.customer}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 rounded-md bg-dark-900 border border-white/5 text-emerald-400 font-bold shadow-inner">
                      ${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium">
                    <span className="text-gray-300 font-bold">{order.products.length}</span> unids.
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium whitespace-nowrap">
                    {fmtDate(order.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${STATUS_STYLES[order.status] ?? "bg-gray-800/50 text-gray-300 border-gray-600/50"}`}>
                      <span>{STATUS_ICONS[order.status]}</span>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
