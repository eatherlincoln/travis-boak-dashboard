// src/components/AudienceDemographics.tsx
import React from "react";
import { usePlatformAudience } from "@/hooks/usePlatformAudience";
import { Users, MapPin } from "lucide-react";

type Platform = "instagram" | "youtube" | "tiktok";

function pct(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`;
}

export default function AudienceDemographics({
  platform,
  title,
}: {
  platform: Platform;
  title?: string;
}) {
  const { audience, loading } = usePlatformAudience(platform);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <Users size={16} className="text-sky-600" />
          </span>
          <h3 className="text-sm font-semibold text-neutral-900">
            {title ??
              `${platform[0].toUpperCase()}${platform.slice(1)} Audience`}
          </h3>
        </div>
        {!loading && audience.updated_at && (
          <span className="text-xs text-neutral-500">
            Updated {new Date(audience.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Gender */}
      <section className="mb-5">
        <p className="mb-2 text-xs font-medium text-neutral-600">
          Gender Split
        </p>
        <div className="relative h-2 w-full overflow-hidden rounded bg-neutral-100">
          <div
            className="h-full bg-sky-600"
            style={{ width: pct(audience.gender.men || 0) }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-neutral-700">
          <span>{(audience.gender.men ?? 0).toFixed(0)}% Men</span>
          <span>{(audience.gender.women ?? 0).toFixed(0)}% Women</span>
        </div>
      </section>

      {/* Age groups */}
      <section className="mb-5">
        <p className="mb-2 text-xs font-medium text-neutral-600">Age Groups</p>
        <div className="space-y-2">
          {(audience.age_groups ?? []).map((g, i) => (
            <div key={`${g.range}-${i}`}>
              <div className="mb-1 flex items-center justify-between text-xs text-neutral-700">
                <span>{g.range}</span>
                <span>{(g.percentage ?? 0).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-100">
                <div
                  className="h-full bg-teal-400"
                  style={{ width: pct(g.percentage || 0) }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top locations */}
      <section>
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-neutral-600">
          <MapPin size={14} /> Top Locations
        </p>

        <div className="grid grid-cols-2 gap-2">
          {(audience.countries ?? []).slice(0, 4).map((c, i) => (
            <div
              key={`${c.country}-${i}`}
              className="flex items-center justify-between rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-700"
            >
              <span>{c.country}</span>
              <span>{(c.percentage ?? 0).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {Array.isArray(audience.cities) && audience.cities.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-neutral-500">
            Top cities: {audience.cities.slice(0, 4).join(", ")}
          </p>
        )}
      </section>
    </div>
  );
}
