import React from "react";
import { MapPin, Globe } from "lucide-react";

/**
 * Derive a flag emoji from a 2-letter ISO country code (e.g. "AU" -> 🇦🇺).
 * No literal emoji in source — avoids parser issues.
 */
function countryCodeToFlag(code: string): string {
  if (!code) return "";
  const cc = code.trim().toUpperCase();
  // Regional indicator symbols start at 0x1F1E6 for 'A'
  return cc.length === 2
    ? String.fromCodePoint(
        0x1f1e6 + (cc.charCodeAt(0) - 65),
        0x1f1e6 + (cc.charCodeAt(1) - 65)
      )
    : "";
}

/** Minimal name -> ISO-2 mapping (add more as needed). */
const NAME_TO_CODE: Record<string, string> = {
  australia: "AU",
  "new zealand": "NZ",
  brazil: "BR",
  usa: "US",
  "united states": "US",
  uk: "GB",
  "united kingdom": "GB",
  japan: "JP",
  canada: "CA",
  france: "FR",
  germany: "DE",
  spain: "ES",
  italy: "IT",
  portugal: "PT",
  indonesia: "ID",
  philippines: "PH",
  thailand: "TH",
  "south africa": "ZA",
  "united arab emirates": "AE",
};

function nameToFlag(name: string): string {
  const code = NAME_TO_CODE[name?.trim().toLowerCase()] || "";
  return countryCodeToFlag(code);
}

export default function CountriesCitiesCard({
  countries = [],
  cities = [],
}: {
  countries?: Array<{
    name?: string;
    country?: string;
    percent?: number;
    percentage?: number;
  }>;
  cities?: string[];
}) {
  // Normalise input:
  const topCountries = (Array.isArray(countries) ? countries : [])
    .map((c) => ({
      name: (c.name ?? c.country ?? "").toString(),
      percent:
        typeof c.percent === "number"
          ? c.percent
          : typeof c.percentage === "number"
          ? c.percentage
          : Number(c.percent ?? c.percentage ?? 0),
    }))
    .filter((c) => c.name)
    .slice(0, 6);

  const topCities = (Array.isArray(cities) ? cities : []).slice(0, 8);

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
          <Globe size={16} className="text-neutral-700" />
        </span>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
          Countries & Cities
        </h4>
      </div>

      {/* Countries */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-neutral-600">
          Top countries
        </p>
        <div className="space-y-2">
          {topCountries.length === 0 && (
            <div className="rounded border border-dashed border-neutral-200 p-3 text-xs text-neutral-500">
              No countries yet.
            </div>
          )}
          {topCountries.map((c, idx) => {
            const pct = Math.max(0, Math.min(100, Number(c.percent) || 0));
            const flag = nameToFlag(c.name);
            return (
              <div key={`${c.name}-${idx}`}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{flag || "🌍"}</span>
                    <span className="text-neutral-800">{c.name}</span>
                  </div>
                  <span className="text-neutral-700">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cities */}
      <div>
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-neutral-600">
          <MapPin size={14} />
          Top cities
        </p>
        {topCities.length === 0 ? (
          <div className="rounded border border-dashed border-neutral-200 p-3 text-xs text-neutral-500">
            No cities yet.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-neutral-800">
            {topCities.map((city, i) => (
              <li key={`${city}-${i}`} className="flex items-center gap-2">
                <span className="text-neutral-400">•</span>
                <span>{city}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
