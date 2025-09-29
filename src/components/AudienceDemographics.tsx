import React from "react";
import { usePlatformAudience } from "@/hooks";

export default function AudienceDemographics({
  platform,
}: {
  platform: "instagram" | "youtube" | "tiktok";
}) {
  const { data, loading, error } = usePlatformAudience(platform);

  const title =
    platform.charAt(0).toUpperCase() + platform.slice(1) + " Demographics";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        {!loading && data?.updated_at && (
          <span className="text-xs text-neutral-500">
            Updated {new Date(data.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-neutral-500">Couldn’t load audience.</p>
      ) : !data ? (
        <p className="text-sm text-neutral-500">No data.</p>
      ) : (
        <div className="space-y-4">
          {/* Gender */}
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-600">
              Gender
            </div>
            <div className="text-sm text-neutral-800">
              Men: {data.gender?.men ?? 0}% • Women: {data.gender?.women ?? 0}%
            </div>
          </div>

          {/* Age bands */}
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-600">Age</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {(data.age_bands ?? []).map((a, i) => (
                <div key={i} className="flex justify-between">
                  <span>{a.range}</span>
                  <span className="text-neutral-700">{a.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-600">
              Top Countries
            </div>
            <div className="space-y-1 text-sm">
              {(data.countries ?? []).slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between">
                  <span>{c.country}</span>
                  <span className="text-neutral-700">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-600">
              Top Cities
            </div>
            <div className="text-sm text-neutral-800">
              {(data.cities ?? []).slice(0, 6).join(" • ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
