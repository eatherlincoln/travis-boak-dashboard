import React from "react";
import { usePlatformAudience } from "@/hooks";

type Props = {
  platform: "instagram" | "youtube" | "tiktok";
  title?: string;
};

export default function AudienceDemographics({ platform, title }: Props) {
  const { data, loading, error } = usePlatformAudience(platform);

  const label =
    title ??
    {
      instagram: "Instagram Demographics",
      youtube: "YouTube Demographics",
      tiktok: "TikTok Demographics",
    }[platform];

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-500">Loading {label}…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-neutral-500">
          No demographics found for {label}.
        </div>
      </div>
    );
  }

  // Helpers to render key/value lists
  const renderKV = (obj?: Record<string, number> | null) => {
    if (!obj) return <div className="text-sm text-neutral-500">No data.</div>;
    const entries = Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-lg border px-3 py-2"
          >
            <span className="text-sm text-neutral-700">{k}</span>
            <span className="text-sm font-medium">{v}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-sky-500/80" />
        <h3 className="text-sm font-semibold text-neutral-800">{label}</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gender split */}
        <div>
          <div className="mb-2 text-sm font-medium text-neutral-700">
            Gender
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Male", data.gender_male ?? 0],
              ["Female", data.gender_female ?? 0],
              ["Other", data.gender_other ?? 0],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border p-3 text-center">
                <div className="text-xs text-neutral-500">{k}</div>
                <div className="text-base font-semibold">{v}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Age groups */}
        <div>
          <div className="mb-2 text-sm font-medium text-neutral-700">
            Age Groups
          </div>
          {renderKV(data.ages)}
        </div>

        {/* Top countries / cities */}
        <div className="grid gap-6">
          <div>
            <div className="mb-2 text-sm font-medium text-neutral-700">
              Top Countries
            </div>
            {renderKV(data.countries)}
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-neutral-700">
              Top Cities
            </div>
            {renderKV(data.cities)}
          </div>
        </div>
      </div>
    </div>
  );
}
