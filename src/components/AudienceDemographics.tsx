import React from "react";
import { usePlatformAudience } from "@/hooks/usePlatformAudience";

export default function AudienceDemographics({
  platform,
}: {
  platform: "instagram" | "youtube" | "tiktok";
}) {
  const { data, loading, error } = usePlatformAudience(platform);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-neutral-800">
        {platform === "instagram" && "Instagram Audience"}
        {platform === "youtube" && "YouTube Audience"}
        {platform === "tiktok" && "TikTok Audience"}
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}

      {!loading && (error || !data) && (
        <div className="text-sm text-neutral-500">No data.</div>
      )}

      {!loading && data && (
        <div className="space-y-3 text-sm">
          {/* Gender */}
          {data.gender && (
            <div>
              <div className="font-medium text-neutral-700">Gender</div>
              <div className="mt-1 text-neutral-600">
                Men {data.gender.men ?? 0}% • Women {data.gender.women ?? 0}%
              </div>
            </div>
          )}

          {/* Age groups */}
          {data.age_groups && data.age_groups.length > 0 && (
            <div>
              <div className="font-medium text-neutral-700">Age Groups</div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-600">
                {data.age_groups.map((a, i) => (
                  <div key={i}>
                    {a.range} — {a.percentage}%
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {data.countries && data.countries.length > 0 && (
            <div>
              <div className="font-medium text-neutral-700">Top Countries</div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-600">
                {data.countries.slice(0, 3).map((c, i) => (
                  <div key={i}>
                    {c.country} — {c.percentage}%
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cities */}
          {data.cities && data.cities.length > 0 && (
            <div>
              <div className="font-medium text-neutral-700">Top Cities</div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-600">
                {data.cities.slice(0, 4).map((city, i) => (
                  <div key={i}>{city}</div>
                ))}
              </div>
            </div>
          )}

          {data.updated_at && (
            <div className="pt-2 text-xs text-neutral-400">
              Updated {new Date(data.updated_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
