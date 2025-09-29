// src/components/AudienceDemographics.tsx
import React from "react";
import { Users, CalendarDays, MapPin } from "lucide-react";
import { usePlatformAudience } from "@/hooks/usePlatformAudience";

function Bar({ pct }: { pct: number }) {
  const width = Math.max(0, Math.min(100, pct || 0));
  return (
    <div className="h-2 w-full rounded bg-neutral-200">
      <div className="h-2 rounded bg-sky-500" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function AudienceDemographics({
  platform,
}: {
  platform: "instagram" | "youtube" | "tiktok" | "global";
}) {
  const { audience, loading } = usePlatformAudience(platform);

  const men = audience.men ?? 0;
  const women = audience.women ?? 0;
  const ages = audience.ages ?? [];
  const countries = audience.countries ?? [];
  const cities = audience.cities ?? [];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Users size={16} className="text-sky-600" />
        <h3 className="text-sm font-semibold text-neutral-900">
          {platform === "global"
            ? "Audience Demographics"
            : `${platform[0].toUpperCase()}${platform.slice(1)} Audience`}
        </h3>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : (
        <div className="space-y-6">
          {/* Gender */}
          <section>
            <p className="mb-2 text-xs font-medium text-neutral-600">
              Gender Split
            </p>
            <div className="flex items-center gap-3">
              <div className="min-w-16 text-xs text-neutral-700">
                {Math.round(men)}% Men
              </div>
              <Bar pct={men} />
              <div className="min-w-16 text-right text-xs text-neutral-700">
                {Math.round(women)}% Women
              </div>
            </div>
          </section>

          {/* Ages */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays size={14} className="text-neutral-500" />
              <p className="text-xs font-medium text-neutral-600">Age Groups</p>
            </div>
            <div className="space-y-3">
              {ages.map((a) => (
                <div
                  key={a.label}
                  className="grid grid-cols-5 items-center gap-2"
                >
                  <div className="col-span-1 text-xs text-neutral-700">
                    {a.label}
                  </div>
                  <div className="col-span-3">
                    <Bar pct={a.pct || 0} />
                  </div>
                  <div className="col-span-1 text-right text-xs text-neutral-700">
                    {Math.round(a.pct || 0)}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Locations */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-neutral-500" />
              <p className="text-xs font-medium text-neutral-600">
                Top Locations
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(countries.length ? countries : []).slice(0, 4).map((c, i) => (
                <div
                  key={c.name + i}
                  className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2"
                >
                  <span className="text-sm">{c.name || "-"}</span>
                  <span className="text-xs text-neutral-600">
                    {Math.round(c.pct || 0)}%
                  </span>
                </div>
              ))}
            </div>
            {cities.length > 0 && (
              <p className="mt-2 text-xs text-neutral-600">
                Top Cities: {cities.filter(Boolean).join(", ")}
              </p>
            )}
          </section>

          {audience.updatedAt && (
            <p className="text-xs text-neutral-500">
              Updated {new Date(audience.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
