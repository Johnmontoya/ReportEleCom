import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "../types";

interface SalesChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-900/90 backdrop-blur-xl p-4 rounded-xl text-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      <p className="font-bold text-white mb-3 tracking-wide">{label}</p>
      <div className="space-y-2 relative z-10">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}></span>
              <span className="text-gray-300 font-medium">
                {p.name === "Revenue" ? "Monto de Ingresos" : p.name === "Orders" ? "Volumen de Pedidos" : p.name}
              </span>
            </div>
            <span className="font-bold text-white">
              {p.name === "Revenue"
                ? `$${p.value.toLocaleString("es-ES")}`
                : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SalesChart({ data, loading }: SalesChartProps) {
  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  };

  return (
    <div className="glass-card p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Análisis de Desempeño</h2>
          <p className="text-gray-400 text-sm font-medium">Rendimiento de los últimos 30 días (pedidos completados)</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            En Vivo
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-80 bg-dark-800/50 rounded-xl animate-pulse border border-white/5" />
      ) : data.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center bg-dark-900/50 p-8 rounded-2xl border border-white/5 shadow-inner">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-800 border border-white/5 shadow-inner mb-4">
              <span className="text-3xl">🧮</span>
            </div>
            <p className="text-gray-200 font-bold mb-1">Aún no hay datos</p>
            <p className="text-gray-500 text-sm">Empieza a procesar pedidos para ver gráficos.</p>
          </div>
        </div>
      ) : (
        <div className="h-80 w-full relative">
          {/* Subtle grid background accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-xl"></div>
          
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5a75fd" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#5a75fd" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#5a75fd" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ee4997" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ee4997" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tickMargin={16}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={16}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#5a75fd"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, fill: "#5a75fd", stroke: "#0e1132", strokeWidth: 3 }}
              />
              <Bar
                yAxisId="count"
                dataKey="count"
                name="Orders"
                fill="url(#ordersGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
