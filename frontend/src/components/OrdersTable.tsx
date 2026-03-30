import type { Order } from "../types";

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏳",
  processing: "🔄",
  completed: "✅",
  failed: "❌",
};

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800">
      {Array(6).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
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
      <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Pedidos Recientes</h2>
          <p className="text-gray-400 text-sm">Últimos 20 pedidos de todos los estados</p>
        </div>
        {!loading && (
          <span className="text-gray-400 text-sm">{orders.length} registros</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
              <th className="text-left px-4 py-3 font-semibold">ID de Pedido</th>
              <th className="text-left px-4 py-3 font-semibold">Cliente</th>
              <th className="text-right px-4 py-3 font-semibold">Total</th>
              <th className="text-left px-4 py-3 font-semibold">Productos</th>
              <th className="text-left px-4 py-3 font-semibold">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : orders.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <p className="text-3xl mb-2">📭</p>
                    <p>Aún no hay pedidos. ¡Envía uno a través de la API!</p>
                  </td>
                </tr>
              )
              : orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-brand-500 text-xs">{order.orderId}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{order.customer}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                    ${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {order.products.length} {order.products.length !== 1 ? "artículos" : "artículo"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {fmtDate(order.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${STATUS_STYLES[order.status] ?? ""}`}>
                      {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status] ?? order.status}
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
