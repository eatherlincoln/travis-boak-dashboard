// src/components/AudienceDemographics.tsx
import React from "react";
import { usePlatformAudience } from "@/hooks";

type Platform = "instagram" | "youtube" | "tiktok";

type Props = {
  platform: Platform;
};

function titleForPlatform(p: Platform) {
  switch (p) {
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    default:
      return "Audience";
  }
}

export default function AudienceDemographics({ platform }: Props) {
  const { data, loading, error } = usePlatformAudience(platform);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100">
            {/* small dot for now; you can swap for an icon */}
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          </span>
          <h3 className="text-sm font-semibold text-neutral-800">
            {titleForPlatform(platform)} Audience
          </h3>
        </div>
        {data?.updated_at && (
          <span className="text-[11px] text-neutral-500">
            Updated {new Date(data.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* States */}
      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">Failed to load.</div>
      ) : !data ? (
        <div className="text-sm text-neutral-500">No data.</div>
      ) : (
        <>
          {/* Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 p-3">
              <div className="text-[11px] font-medium text-neutral-500">
                Men
              </div>
              <div className="text-sm font-semibold text-neutral-900">
                {data.gender?.men ?? 0}%
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 p-3">
              <div className="text-[11px] font-medium text-neutral-500">
                Women
              </div>
              <div className="text-sm font-semibold text-neutral-900">
                {data.gender?.women ?? 0}%
              </div>
            </div>
          </div>

          {/* Age groups */}
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-medium text-neutral-500">
              Age Groups
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(data.age_groups ?? []).slice(0, 6).map((a: any, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border border-neutral-200 p-2 text-[12px]"
                >
                  <span className="font-medium">{a.range}</span>
                  <span className="ml-1 text-neutral-600">{a.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-medium text-neutral-500">
              Top Countries
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.countries ?? []).slice(0, 3).map((c: any, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-neutral-200 px-2 py-1 text-[12px]"
                >
                  {c.country} • {c.percentage}%
                </span>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-medium text-neutral-500">
              Top Cities
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.cities ?? [])
                .slice(0, 4)
                .map((city: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-[12px] text-neutral-700"
                  >
                    {city}
                  </span>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
