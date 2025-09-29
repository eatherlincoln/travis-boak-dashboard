// src/hooks/usePlatformAudience.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";

export type AudienceRow = {
  platform?: "instagram" | "youtube" | "tiktok" | "global";
  men?: number | null;
  women?: number | null;
  // latest table/view – flat columns
  age_18_24?: number | null;
  age_25_34?: number | null;
  age_35_44?: number | null;
  age_45_54?: number | null;
  // legacy shapes
  gender?: any;
  age_groups?: any;
  countries?: any;
  cities?: any;
  // locations – latest
  country1?: string | null;
  country1_pct?: number | null;
  country2?: string | null;
  country2_pct?: number | null;
  country3?: string | null;
  country3_pct?: number | null;
  country4?: string | null;
  country4_pct?: number | null;
  city1?: string | null;
  city2?: string | null;
  city3?: string | null;
  city4?: string | null;
  updated_at?: string | null;
};

export type NormalizedAudience = {
  men: number;
  women: number;
  ages: { label: string; pct: number }[];
  countries: { name: string; pct: number }[];
  cities: string[];
  updatedAt: string | null;
};

const SAFE: NormalizedAudience = {
  men: 0,
  women: 0,
  ages: [
    { label: "18–24", pct: 0 },
    { label: "25–34", pct: 0 },
    { label: "35–44", pct: 0 },
    { label: "45–54", pct: 0 },
  ],
  countries: [],
  cities: [],
  updatedAt: null,
};

function coerceNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalize(row?: AudienceRow | null): NormalizedAudience {
  if (!row) return SAFE;

  // gender: prefer flat columns; fallback to JSON
  const men =
    row.men != null
      ? coerceNum(row.men)
      : row.gender && typeof row.gender.men !== "undefined"
      ? coerceNum(row.gender.men)
      : 0;
  const women =
    row.women != null
      ? coerceNum(row.women)
      : row.gender && typeof row.gender.women !== "undefined"
      ? coerceNum(row.gender.women)
      : 0;

  // ages: prefer flat; fallback to array of {range, percentage}
  const ages = [
    { label: "18–24", pct: row.age_18_24 ?? null },
    { label: "25–34", pct: row.age_25_34 ?? null },
    { label: "35–44", pct: row.age_35_44 ?? null },
    { label: "45–54", pct: row.age_45_54 ?? null },
  ].map((a) => ({ label: a.label, pct: coerceNum(a.pct) }));

  if (ages.every((a) => a.pct === 0) && Array.isArray(row.age_groups)) {
    const m = new Map<string, number>();
    for (const g of row.age_groups) {
      if (!g) continue;
      const lbl = String(g.range ?? "").trim();
      const pct = coerceNum(g.percentage ?? 0);
      if (!lbl) continue;
      m.set(lbl, pct);
    }
    const order = ["18–24", "25–34", "35–44", "45–54"];
    const alt = order.map((lbl) => ({
      label: lbl,
      pct: coerceNum(m.get(lbl)),
    }));
    if (alt.some((a) => a.pct > 0)) {
      (ages as any).splice(0, ages.length, ...alt);
    }
  }

  // countries: prefer flat; fallback to JSON array
  const countries: { name: string; pct: number }[] = [];
  const flat = [
    [row.country1, row.country1_pct],
    [row.country2, row.country2_pct],
    [row.country3, row.country3_pct],
    [row.country4, row.country4_pct],
  ]
    .filter(([n]) => n && String(n).trim().length)
    .map(([n, p]) => ({ name: String(n), pct: coerceNum(p) }));

  if (flat.length) countries.push(...flat);
  else if (Array.isArray(row.countries)) {
    for (const c of row.countries) {
      if (!c) continue;
      countries.push({
        name: String(c.country ?? c.name ?? "").trim(),
        pct: coerceNum(c.percentage ?? c.pct ?? 0),
      });
    }
  }

  // cities
  const cities: string[] = [];
  for (const c of [row.city1, row.city2, row.city3, row.city4]) {
    if (c && String(c).trim().length) cities.push(String(c));
  }
  if (!cities.length && Array.isArray(row.cities)) {
    for (const c of row.cities) {
      if (!c) continue;
      const name =
        typeof c === "string" ? c : String(c.city ?? c.name ?? "").trim();
      if (name) cities.push(name);
    }
  }

  return {
    men,
    women,
    ages,
    countries,
    cities,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

/**
 * Fetch latest audience for a platform ("instagram" | "youtube" | "tiktok") or "global".
 * We read from the new `audience` view/table first; if empty, we fall back to `platform_audience`.
 */
export function usePlatformAudience(platform: AudienceRow["platform"]) {
  const [data, setData] = useState<NormalizedAudience>(SAFE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);

      // 1) Try audience (new)
      let row: AudienceRow | null = null;
      {
        const { data: aRow, error } = await supabase
          .from("audience")
          .select("*")
          .eq("platform", platform ?? "global")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && aRow) row = aRow as any;
      }

      // 2) Fallback to platform_audience (old)
      if (!row) {
        const { data: pRow } = await supabase
          .from("platform_audience")
          .select("*")
          .eq("platform", platform ?? "global")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (pRow) row = pRow as any;
      }

      if (!ok) return;
      setData(normalize(row));
      setLoading(false);
    })();
    return () => {
      ok = false;
    };
  }, [platform]);

  return useMemo(() => ({ audience: data, loading }), [data, loading]);
}
