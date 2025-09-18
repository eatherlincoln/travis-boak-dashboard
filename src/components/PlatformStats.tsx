import React from "react";
import SoftCard from "./SoftCard";

type Stat = {
  label: string;
  value: string;
  sublabel: string;
  trend?: string; // e.g. "+2.3%"
  trendPositive?: boolean;
};

type Props = {
  stats?: Stat[];
};

const DEFAULT_STATS: Stat[] = [
  {
    label: "Total Reach",
    value: "48,910",
    sublabel: "Cross-platform followers",
    trend: "+2.3%",
    trendPositive: true,
  },
  {
    label: "Monthly Views",
    value: "854K",
    sublabel: "Combined platforms",
    trend: "+15.7%",
    trendPositive: true,
  },
  {
    label: "Engagement Rate",
    value: "2.01%",
    sublabel: "Instagram latest",
    trend: "+0.5%",
    trendPositive: true,
  },
  {
    label: "Weekly Growth",
    value: "+2.3%",
    sublabel: "Rolling 7-day",
    trend: "+2.3%",
    trendPositive: true,
  },
];

export default function PlatformStats({ stats = DEFAULT_STATS }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <SoftCard key={i} className="p-4">
          <div className="text-sm text-muted-foreground mb-1">{s.label}</div>
          <div className="text-2xl font-semibold">{s.value}</div>
          <div className="mt-1 flex items-center gap-2">
            {s.trend && (
              <span
                className={
                  "text-xs font-medium " +
                  (s.trendPositive ? "text-emerald-600" : "text-red-600")
                }
              >
                {s.trend}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{s.sublabel}</span>
          </div>
        </SoftCard>
      ))}
    </div>
  );
}
