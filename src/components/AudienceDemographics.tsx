import React from "react";
import { usePlatformAudience } from "@/hooks";

type KP = { country: string; percentage: number };
type AG = { range: string; percentage: number };
type Gender = { men?: number; women?: number } | null;

function toArray<T>(v: T[] | T | null | undefined): T[] {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
}
function pct(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return "0%";
  return `${n}%`;
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className="text-neutral-900">{value}</span>
    </div>
  );
}

function Card({
  title,
  platform,
}: {
  title: string;
  platform: "instagram" | "youtube" | "tiktok";
}) {
  const { row, loading, error } = usePlatformAudience(platform);

  const gender: Gender = row?.gender ?? null;
  const men = gender?.men ?? 0;
  const women = gender?.women ?? 0;
  const ages = toArray<AG>(row?.age_groups).slice(0, 4);
  const countries = toArray<KP>(row?.countries).slice(0, 3);
  const cities = toArray<string>(row?.cities).slice(0, 4);

  const dot =
    platform === "instagram"
      ? "bg-pink-500/80"
      : platform === "youtube"
      ? "bg-red-500/80"
      : "bg-violet-500/80";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-4 w-4 rounded-full ${dot}`} />
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : !row ? (
        <div className="text-sm text-neutral-500">No data.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Gender
            </div>
            <div className="space-y-1">
              <Stat label="Men" value={pct(men)} />
              <Stat label="Women" value={pct(women)} />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Age Groups
            </div>
            {ages.length ? (
              <div className="space-y-1">
                {ages.map((a, i) => (
                  <Stat
                    key={`${a.range}-${i}`}
                    label={a.range}
                    value={pct(a.percentage)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">No data.</div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Top Countries
            </div>
            {countries.length ? (
              <div className="space-y-1 mb-3">
                {countries.map((c, i) => (
                  <Stat
                    key={`${c.country}-${i}`}
                    label={c.country}
                    value={pct(c.percentage)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500 mb-3">No data.</div>
            )}

            <div className="text-xs font-medium text-neutral-700 mb-2">
              Top Cities
            </div>
            {cities.length ? (
              <div className="flex flex-wrap gap-2">
                {cities.map((city, i) => (
                  <span
                    key={`${city}-${i}`}
                    className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-xs"
                  >
                    {String(city)}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">No data.</div>
            )}
          </div>
        </div>
      )}

      {row?.updated_at && (
        <div className="mt-3 text-xs text-neutral-500">
          Updated {new Date(row.updated_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default function AudienceDemographics() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card title="Instagram Audience" platform="instagram" />
      <Card title="YouTube Audience" platform="youtube" />
      <Card title="TikTok Audience" platform="tiktok" />
    </div>
  );
}
