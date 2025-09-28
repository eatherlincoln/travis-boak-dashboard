import React, { useMemo } from "react";
import { useAudienceGlobal } from "@/hooks/useAudienceGlobal";
import { Users, CalendarDays, MapPin } from "lucide-react";

function barWidth(pct: number) {
  const n = Math.max(0, Math.min(100, pct));
  return { width: `${n}%` };
}

export default function AudienceDemographics() {
  const { data, loading } = useAudienceGlobal();

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="mt-4 h-24 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  const men = data?.gender?.men ?? 0;
  const women = data?.gender?.women ?? 0;

  // ensure canonical order on render
  const ORDER = ["25–34", "18–24", "35–44", "45–54"];
  const ages = ORDER.map((label) => {
    const hit = data?.age_groups?.find((a) => a.range === label);
    return { label, pct: hit?.percentage ?? 0 };
  });

  const countries = (data?.countries ?? []).slice(0, 4);
  const left = countries.slice(0, 2);
  const right = countries.slice(2, 4);
  const cities = (data?.cities ?? []).filter(Boolean);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Title */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
          <Users size={16} className="text-sky-600" />
        </span>
        <h2 className="text-lg font-semibold text-neutral-900">
          Audience Demographics
        </h2>
      </div>

      {/* Gender */}
      <div className="mb-5">
        <div className="mb-2 text-sm font-semibold text-neutral-700">
          Gender Split
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="absolute left-0 top-0 h-full bg-sky-600"
            style={barWidth(men)}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-neutral-700">
          <span>{men}% Men</span>
          <span>{women}% Women</span>
        </div>
      </div>

      {/* Age groups */}
      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={16} className="text-teal-600" />
          <span className="text-sm font-semibold text-neutral-700">
            Age Groups
          </span>
        </div>
        <div className="space-y-3">
          {ages.map((a) => (
            <div key={a.label}>
              <div className="mb-1 flex items-center justify-between text-sm text-neutral-700">
                <span>{a.label}</span>
                <span className="tabular-nums">{a.pct}%</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="absolute left-0 top-0 h-full bg-teal-400"
                  style={barWidth(a.pct)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-rose-600" />
          <span className="text-sm font-semibold text-neutral-700">
            Top Locations
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {left.map((c, i) => (
            <Row key={`L${i}`} label={c.country} value={c.percentage ?? 0} />
          ))}
          {right.map((c, i) => (
            <Row key={`R${i}`} label={c.country} value={c.percentage ?? 0} />
          ))}
        </div>

        {cities.length > 0 && (
          <div className="mt-3 text-sm text-neutral-600">
            <span className="text-neutral-500">Top Cities: </span>
            {cities.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label?: string; value: number }) {
  if (!label) return <div className="h-9 rounded-md bg-neutral-50" />;
  return (
    <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2">
      <span className="text-neutral-800">{label}</span>
      <span className="tabular-nums text-neutral-500">{value}%</span>
    </div>
  );
}
