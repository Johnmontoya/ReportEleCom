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
    <div className="glass-card p-3 text-sm shadow-2xl border border-gray-600/50">
      <p className="font-semibold text-gray-200 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-bold">
            {p.name === "Revenue"
              ? `$${p.value.toLocaleString("en-US")}`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function SalesChart({ data, loading }: SalesChartProps) {
  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Sales Trend</h2>
          <p className="text-gray-400 text-sm">Last 30 days — completed orders</p>
        </div>
        <span className="status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Live
        </span>
      </div>

      {loading ? (
        <div className="h-72 bg-gray-800/50 rounded-xl animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-4xl mb-2">📊</p>
            <p>No chart data yet. Start enqueuing orders!</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 16, color: "#9ca3af", fontSize: 12 }}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#667eea"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
            />
            <Bar
              yAxisId="count"
              dataKey="count"
              name="Orders"
              fill="#f5576c"
              fillOpacity={0.7}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
