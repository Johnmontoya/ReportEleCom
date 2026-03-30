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
  iconBg: string;
  loading: boolean;
  delay: string;
}

function Card({ title, value, subtitle, icon, gradient, iconBg, loading, delay }: CardProps) {
  return (
    <div className={`glass-card p-6 flex flex-col gap-4 group hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 animate-fade-in-up ${delay}`}>
      {/* Background tinted glow */}
      <div className={`absolute -inset-4 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient} blur-2xl pointer-events-none rounded-full`}></div>
      
      <div className="flex items-start justify-between relative z-10 w-full">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-gray-300 transition-colors">{title}</p>
          {loading ? (
            <div className="h-9 w-28 bg-dark-800 rounded-lg animate-pulse border border-white/5" />
          ) : (
            <p className="text-3xl font-display font-bold text-white leading-none tracking-tight">{value}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${iconBg} shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-white/10 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0`}
        >
          {icon}
        </div>
      </div>
      
      {subtitle && (
        <div className="relative z-10 mt-auto pt-2">
          <p className="text-gray-500 text-[11px] font-medium tracking-wide flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            {subtitle}
          </p>
        </div>
      )}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card
        title="Total Pedidos"
        value={data ? fmt(data.totalOrders) : "—"}
        subtitle="Todo el tiempo histórico"
        icon="📦"
        gradient="from-brand-500 to-brand-600"
        iconBg="bg-brand-500/20 text-brand-300"
        loading={loading}
        delay="[animation-delay:0ms]"
      />
      <Card
        title="Ingresos Hoy"
        value={data ? fmtCurrency(data.todayRevenue) : "—"}
        subtitle={data ? `Basado en ${data.todayCount} pedidos de hoy` : undefined}
        icon="💎"
        gradient="from-emerald-500 to-emerald-600"
        iconBg="bg-emerald-500/20 text-emerald-300"
        loading={loading}
        delay="[animation-delay:100ms]"
      />
      <Card
        title="En Cola"
        value={data ? fmt(data.pendingInQueue) : "—"}
        subtitle="Esperando proceso backend"
        icon="⏳"
        gradient="from-amber-500 to-amber-600"
        iconBg="bg-amber-500/20 text-amber-300"
        loading={loading}
        delay="[animation-delay:200ms]"
      />
      <Card
        title="Pedidos de Hoy"
        value={data ? fmt(data.todayCount) : "—"}
        subtitle="Tráfico de últimas 24 hrs"
        icon="🛒"
        gradient="from-accent-500 to-accent-600"
        iconBg="bg-accent-500/20 text-accent-300"
        loading={loading}
        delay="[animation-delay:300ms]"
      />
    </div>
  );
}
