// src/components/KpiRow.tsx
import React from "react";
import KpiCard from "@/components/ui/KpiCard";
import { usePlatformStats } from "@/hooks";

export default function KpiRow() {
  const { stats, deltas, updatedAt, loading } = usePlatformStats();

  // super defensive fallback in case a different hook slips in later
  const safe = (p: any) => ({
    followers: Number(p?.followers ?? 0),
    monthly_views: Number(p?.monthly_views ?? 0),
    engagement: Number(p?.engagement ?? 0),
  });
  const ig = safe((stats as any)?.instagram);
  const yt = safe((stats as any)?.youtube);
  const tt = safe((stats as any)?.tiktok);

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <KpiCard
        platform="instagram"
        followers={ig.followers}
        monthlyViews={ig.monthly_views}
        engagementPct={ig.engagement}
        followersDelta={(deltas as any)?.instagram?.followers ?? null}
        monthlyViewsDelta={(deltas as any)?.instagram?.monthly_views ?? null}
        engagementDelta={(deltas as any)?.instagram?.engagement ?? null}
        updatedAt={updatedAt}
        loading={loading}
      />
      <KpiCard
        platform="youtube"
        followers={yt.followers}
        monthlyViews={yt.monthly_views}
        engagementPct={yt.engagement}
        followersDelta={(deltas as any)?.youtube?.followers ?? null}
        monthlyViewsDelta={(deltas as any)?.youtube?.monthly_views ?? null}
        engagementDelta={(deltas as any)?.youtube?.engagement ?? null}
        updatedAt={updatedAt}
        loading={loading}
      />
      <KpiCard
        platform="tiktok"
        followers={tt.followers}
        monthlyViews={tt.monthly_views}
        engagementPct={tt.engagement}
        followersDelta={(deltas as any)?.tiktok?.followers ?? null}
        monthlyViewsDelta={(deltas as any)?.tiktok?.monthly_views ?? null}
        engagementDelta={(deltas as any)?.tiktok?.engagement ?? null}
        updatedAt={updatedAt}
        loading={loading}
      />
    </section>
  );
}
