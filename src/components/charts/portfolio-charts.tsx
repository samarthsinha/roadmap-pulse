"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  GREEN: "#10b981",
  AMBER: "#f59e0b",
  RED: "#ef4444",
  BLUE: "#3b82f6",
  GREY: "#a1a1aa",
};

export function StatusPieChart({
  data,
}: {
  data: { name: string; value: number; status: string }[];
}) {
  if (data.every((d) => d.value === 0)) {
    return <p className="py-8 text-center text-sm text-zinc-500">No data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProgressBarChart({
  data,
}: {
  data: { name: string; progress: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${v}%`, "Progress"]} />
        <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConfidenceBarChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
