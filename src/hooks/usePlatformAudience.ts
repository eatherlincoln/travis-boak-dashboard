// src/hooks/usePlatformAudience.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";

/**
 * Table: platform_audience
 * Columns we use (jsonb for arrays):
 * - platform: text
 * - gender: jsonb   -> { men: number, women: number }
 * - age_groups: jsonb -> [{ range:"25-34", percentage:31 }, ...]
 * - countries: jsonb  -> [{ country:"Australia", percentage:51 }, ...]
 * - cities: jsonb     -> ["Sydney","Gold Coast","Melbourne","Sunshine Coast"]
 * - updated_at: timestamptz
 *
 * This hook is **defensive**: always returns safe defaults.
 */

type Platform = "instagram" | "youtube" | "tiktok";

export type AudienceRecord = {
  platform: Platform;
  gender: { men: number; women: number };
  age_groups: { range: string; percentage: number }[];
  countries: { country: string; percentage: number }[];
  cities: string[];
  updated_at: string | null;
};

const EMPTY: AudienceRecord = {
  platform: "instagram",
  gender: { men: 0, women: 0 },
  age_groups: [
    { range: "25–34", percentage: 0 },
    { range: "18–24", percentage: 0 },
    { range: "35–44", percentage: 0 },
    { range: "45–54", percentage: 0 },
  ],
  countries: [
    { country: "Australia", percentage: 0 },
    { country: "USA", percentage: 0 },
    { country: "Japan", percentage: 0 },
    { country: "Brazil", percentage: 0 },
  ],
  cities: [],
  updated_at: null,
};

function asNum(n: any): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

export function usePlatformAudience(platform: Platform) {
  const [rec, setRec] = useState<AudienceRecord>(() => ({
    ...EMPTY,
    platform,
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      // RLS-safe: expect one most recent row per platform
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;

      if (error || !data || data.length === 0) {
        setRec((prev) => ({ ...EMPTY, platform: platform ?? prev.platform }));
        setLoading(false);
        return;
      }

      const row = data[0] || {};

      const genderSrc = (row.gender || {}) as any;
      const gender = {
        men: asNum(genderSrc.men),
        women: asNum(genderSrc.women),
      };

      const ageSrc = Array.isArray(row.age_groups) ? row.age_groups : [];
      const age_groups = [
        { range: "25–34", percentage: 0 },
        { range: "18–24", percentage: 0 },
        { range: "35–44", percentage: 0 },
        { range: "45–54", percentage: 0 },
      ].map((slot) => {
        const hit = ageSrc.find(
          (a: any) =>
            (a?.range || "").toString().replace(/\s/g, "") ===
            slot.range.replace(/\s/g, "")
        );
        return {
          range: slot.range,
          percentage: asNum(hit?.percentage),
        };
      });

      const countriesSrc = Array.isArray(row.countries) ? row.countries : [];
      const countries = [
        { country: "Australia", percentage: 0 },
        { country: "USA", percentage: 0 },
        { country: "Japan", percentage: 0 },
        { country: "Brazil", percentage: 0 },
      ].map((slot) => {
        const hit = countriesSrc.find(
          (c: any) =>
            (c?.country || "").toString().toLowerCase() ===
            slot.country.toLowerCase()
        );
        return {
          country: slot.country,
          percentage: asNum(hit?.percentage),
        };
      });

      const cities = Array.isArray(row.cities)
        ? row.cities.filter(Boolean).map((c: any) => String(c))
        : [];

      setRec({
        platform,
        gender,
        age_groups,
        countries,
        cities,
        updated_at: row.updated_at || null,
      });
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [platform]);

  return { audience: rec, loading };
}
