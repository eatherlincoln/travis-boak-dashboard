import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { Users } from "lucide-react";

type Gender = { men?: number | null; women?: number | null };
type AgeBand = { range: string; percentage: number | null };
type CountryPct = { country: string; percentage: number | null };

type AudienceRow = {
  gender: Gender;
  age_bands: AgeBand[];
  countries: CountryPct[];
  cities: string[];
  updated_at?: string | null;
};

const EMPTY: AudienceRow = {
  gender: { men: null, women: null },
  age_bands: [],
  countries: [],
  cities: [],
};

export default function AudienceDemographics() {
  const [data, setData] = useState<AudienceRow>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audience")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;
      if (error) {
        setData(EMPTY);
      } else if (data && data.length > 0) {
        const d = data[0] as any;
        setData({
          gender: d.gender ?? { men: null, women: null },
          age_bands: Array.isArray(d.age_bands) ? d.age_bands : [],
          countries: Array.isArray(d.countries) ? d.countries : [],
          cities: Array.isArray(d.cities) ? d.cities : [],
          updated_at: d.updated_at ?? null,
        });
      } else {
        setData(EMPTY);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const malePct = data.gender.men ?? 0;
  const femalePct = data.gender.women ?? 0;

  const topAges = useMemo(
    () =>
      (data.age_bands || [])
        .filter((a) => (a.percentage ?? 0) > 0)
        .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
        .slice(0, 5),
    [data.age_bands]
  );

  const topCountries = useMemo(
    () =>
      (data.countries || [])
        .filter((c) => (c.percentage ?? 0) > 0)
        .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
        .slice(0, 5),
    [data.countries]
  );

  const cities = (data.cities || []).slice(0, 6);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <Users size={16} className="text-neutral-700" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Audience Demographics
          </h2>
        </div>
        {data.updated_at && (
          <span className="text-xs text-neutral-500">
            Updated {new Date(data.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Gender */}
          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="mb-3 text-xs font-semibold text-neutral-700">
              Gender
            </h3>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-neutral-600">Men</span>
              <span className="font-medium">{malePct ?? 0}%</span>
            </div>
            <div className="mb-4 h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${Math.max(0, Math.min(100, malePct || 0))}%`,
                }}
              />
            </div>

            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-neutral-600">Women</span>
              <span className="font-medium">{femalePct ?? 0}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-pink-500"
                style={{
                  width: `${Math.max(0, Math.min(100, femalePct || 0))}%`,
                }}
              />
            </div>
          </section>

          {/* Age bands */}
          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="mb-3 text-xs font-semibold text-neutral-700">Age</h3>
            <div className="space-y-2">
              {topAges.length === 0 ? (
                <p className="text-sm text-neutral-500">No age data yet.</p>
              ) : (
                topAges.map((a, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{a.range}</span>
                      <span className="font-medium">{a.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-100">
                      <div
                        className="h-2 rounded-full bg-neutral-800"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, a.percentage || 0)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Countries + Cities */}
          <section className="rounded-xl border border-neutral-200 p-4">
            <h3 className="mb-3 text-xs font-semibold text-neutral-700">
              Countries & Cities
            </h3>

            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-neutral-600">
                Top countries
              </h4>
              {topCountries.length === 0 ? (
                <p className="text-sm text-neutral-500">No country data yet.</p>
              ) : (
                <ul className="space-y-1">
                  {topCountries.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-neutral-700">{c.country}</span>
                      <span className="font-medium">{c.percentage}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-xs font-medium text-neutral-600">
                Top cities
              </h4>
              {cities.length === 0 ? (
                <p className="text-sm text-neutral-500">No city data yet.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-neutral-700">
                  {cities.map((city, i) => (
                    <li key={i}>• {city}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
