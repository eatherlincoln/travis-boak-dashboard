import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  title: string;
  followers: string;
  views: string;
  growthLabel?: string; // e.g. "Followers"
  growthPct?: string; // e.g. "+2.3%" or "-1.2%"
  positive?: boolean; // true if growth is positive
};

export default function PlatformCard({
  title,
  followers,
  views,
  growthLabel = "Growth",
  growthPct = "+0.0%",
  positive = true,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="mb-1 text-sm font-semibold text-gray-900">{title}</div>

      <div className="space-y-1 text-sm text-gray-700">
        <div>
          <span className="text-gray-500">Followers:</span>{" "}
          <span className="font-medium">{followers}</span>
        </div>
        <div>
          <span className="text-gray-500">Views:</span>{" "}
          <span className="font-medium">{views}</span>
        </div>
        <div className="flex items-center gap-1">
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
          )}
          <span className="text-gray-500">{growthLabel}:</span>
          <span className={positive ? "text-emerald-600" : "text-rose-600"}>
            {growthPct}
          </span>
        </div>
      </div>
    </div>
  );
}
