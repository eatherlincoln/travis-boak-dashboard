// src/components/ui/KpiCard.tsx
import React from "react";
import {
  Instagram as IgIcon,
  Youtube as YtIcon,
  Music2 as TtIcon,
  Users,
  Eye,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

type Platform = "instagram" | "youtube" | "tiktok";

type Props = {
  platform: Platform;
  followers: number;
  monthlyViews: number;
  engagementPct: number;
  followersDelta?: number | null;
  monthlyViewsDelta?: number | null;
  engagementDelta?: number | null;
  updatedAt?: string | null;
  loading?: boolean;
};

export default function KpiCard({
  platform,
  followers,
  monthlyViews,
  engagementPct,
  followersDelta,
  monthlyViewsDelta,
  engagementDelta,
  updatedAt,
  loading,
}: Props) {
  const icons: Record<Platform, React.ReactNode> = {
    instagram: <IgIcon className="h-5 w-5 text-pink-500" />,
    youtube: <YtIcon className="h-5 w-5 text-red-500" />,
    tiktok: <TtIcon className="h-5 w-5 text-black" />,
  };

  const formatNum = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString();

  const renderDelta = (d?: number | null) => {
    if (d === null || d === undefined)
      return <Minus className="h-3 w-3 text-gray-400" />;
    if (d > 0)
      return (
        <span className="flex items-center text-green-600 text-xs font-medium">
          <ArrowUpRight className="h-3 w-3" /> {d.toFixed(1)}%
        </span>
      );
    if (d < 0)
      return (
        <span className="flex items-center text-red-600 text-xs font-medium">
          <ArrowDownRight className="h-3 w-3" /> {Math.abs(d).toFixed(1)}%
        </span>
      );
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icons[platform]}
        <h3 className="text-sm font-semibold capitalize">{platform}</h3>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Refreshing…</p>
      ) : (
        <div className="space-y-3">
          {/* Followers */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="h-4 w-4" />{" "}
              {platform === "youtube" ? "Subscribers" : "Followers"}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {formatNum(followers)}
              </span>
              {renderDelta(followersDelta)}
            </div>
          </div>

          {/* Monthly Views */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="h-4 w-4" /> Monthly views
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {formatNum(monthlyViews)}
              </span>
              {renderDelta(monthlyViewsDelta)}
            </div>
          </div>

          {/* Engagement */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Heart className="h-4 w-4" /> Engagement
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {engagementPct.toFixed(2)}%
              </span>
              {renderDelta(engagementDelta)}
            </div>
          </div>

          {updatedAt && (
            <p className="mt-3 text-[11px] text-gray-400">
              Updated: {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
