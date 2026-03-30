import type { KPIs } from "../types";

interface KPICardsProps {
  data: KPIs | null;
  loading: boolean;
}

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  gradient: string;
  loading: boolean;
}

function Card({ title, value, subtitle, icon, gradient, loading }: CardProps) {
  return (
    <div className="glass-card p-6 flex items-start gap-4 group hover:border-gray-600/70 transition-all duration-300">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${gradient} shadow-lg`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-700 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-white leading-tight">{value}</p>
        )}
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function KPICards({ data, loading }: KPICardsProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { minimumFractionDigits: 0 }).format(n);
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card
        title="Total de Pedidos"
        value={data ? fmt(data.totalOrders) : "—"}
        subtitle="Todo el tiempo"
        icon="📦"
        gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20"
        loading={loading}
      />
      <Card
        title="Ingresos Hoy"
        value={data ? fmtCurrency(data.todayRevenue) : "—"}
        subtitle={data ? `${data.todayCount} pedidos hoy` : undefined}
        icon="💰"
        gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20"
        loading={loading}
      />
      <Card
        title="Pendientes en Cola"
        value={data ? fmt(data.pendingInQueue) : "—"}
        subtitle="Esperando procesamiento"
        icon="⏳"
        gradient="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20"
        loading={loading}
      />
      <Card
        title="Pedidos de Hoy"
        value={data ? fmt(data.todayCount) : "—"}
        subtitle="Recibidos hoy"
        icon="🛒"
        gradient="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20"
        loading={loading}
      />
    </div>
  );
}
