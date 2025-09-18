import React from "react";

const KPICard = ({
  label,
  value,
  sub,
  up = true,
}: {
  label: string;
  value: string;
  sub: string;
  up?: boolean;
}) => (
  <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
    <div
      className={`mt-1 text-xs font-medium ${
        up ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {up ? "▲" : "▼"} {sub}
    </div>
  </div>
);

export default function KpiRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard label="Total Reach" value="48,910" sub="+2.3%" />
      <KPICard label="Monthly Views" value="854K" sub="+15.7%" />
      <KPICard label="Engagement Rate" value="2.01%" sub="+0.5%" />
      <KPICard label="Weekly Growth" value="+2.3%" sub="+2.3%" />
    </div>
  );
}
