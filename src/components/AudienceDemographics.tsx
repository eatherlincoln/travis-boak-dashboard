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

function pct(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return "0%";
  return `${n}%`;
}

function StatBlock({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="text-sm text-neutral-900">{value}</div>
    </div>
  );
}

function AudienceCard({
  label,
  platform,
}: {
  label: string;
  platform: "instagram" | "youtube" | "tiktok";
}) {
  const { row, loading, error } = usePlatformAudience(platform);

  const gender: Gender = row?.gender ?? null;
  const men = gender?.men ?? 0;
  const women = gender?.women ?? 0;

  const ages = toArray<AG>(row?.age_groups).slice(0, 4);
  const countries = toArray<KP>(row?.countries).slice(0, 3);
  const cities = toArray<string>(row?.cities).slice(0, 4);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`h-4 w-4 rounded-full ${
            platform === "instagram"
              ? "bg-pink-500/80"
              : platform === "youtube"
              ? "bg-red-500/80"
              : "bg-violet-500/80"
          }`}
        />
        <h3 className="text-sm font-semibold text-neutral-800">
          {label} Audience
        </h3>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : !row ? (
        <div className="text-sm text-neutral-500">No data.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Gender */}
          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Gender
            </div>
            <div className="flex gap-6">
              <StatBlock title="Men" value={pct(men)} />
              <StatBlock title="Women" value={pct(women)} />
            </div>
          </div>

          {/* Age Groups */}
          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Age Groups
            </div>
            {ages.length ? (
              <ul className="text-sm text-neutral-900 space-y-1">
                {ages.map((a, i) => (
                  <li key={`${a.range}-${i}`} className="flex justify-between">
                    <span className="text-neutral-700">{a.range}</span>
                    <span>{pct(a.percentage)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-neutral-500">No data.</div>
            )}
          </div>

          {/* Top Countries & Cities */}
          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Top Countries
            </div>
            {countries.length ? (
              <ul className="text-sm text-neutral-900 space-y-1 mb-3">
                {countries.map((c, i) => (
                  <li
                    key={`${c.country}-${i}`}
                    className="flex justify-between"
                  >
                    <span className="text-neutral-700">{c.country}</span>
                    <span>{pct(c.percentage)}</span>
                  </li>
                ))}
              </ul>
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
      <AudienceCard label="Instagram" platform="instagram" />
      <AudienceCard label="YouTube" platform="youtube" />
      <AudienceCard label="TikTok" platform="tiktok" />
    </div>
  );
}
