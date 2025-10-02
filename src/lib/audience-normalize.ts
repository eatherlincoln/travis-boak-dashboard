// src/lib/audience-normalize.ts
const clampPct = (n: any) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
};

export const parsePct = (x: any) => {
  if (x == null) return 0;
  if (typeof x === "number") return clampPct(x);
  if (typeof x === "string") {
    const m = x.match(/-?\d+(\.\d+)?/);
    return clampPct(m ? Number(m[0]) : 0);
  }
  return 0;
};

const toArraySafe = (x: any): Array<any> => {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object")
    return Object.entries(x).map(([k, v]) => ({ label: k, pct: v as any }));
  if (typeof x === "string")
    return x.trim() ? [{ label: x.trim(), pct: 0 }] : [];
  return [];
};

export function normalizeAudiencePayload(input: any) {
  const gender = input.gender ?? input;
  const men = parsePct(gender?.men ?? gender?.gender_men);
  const women =
    parsePct(gender?.women ?? gender?.gender_women) || Math.max(0, 100 - men);

  const ages = input.age_bands ?? input.ages ?? {};
  const age_bands = {
    "18-24": parsePct(ages["18-24"] ?? ages["18_24"]),
    "25-34": parsePct(ages["25-34"] ?? ages["25_34"]),
    "35-44": parsePct(ages["35-44"] ?? ages["35_44"]),
    "45-54": parsePct(ages["45-54"] ?? ages["45_54"]),
  };

  const countries = toArraySafe(input.countries ?? input.top_countries).map(
    (it) => ({
      label:
        it?.country ??
        it?.label ??
        it?.name ??
        (typeof it === "string" ? it : ""),
      pct: parsePct(it?.percentage ?? it?.pct ?? it?.value ?? 0),
    })
  );

  const cities = toArraySafe(input.cities ?? input.top_cities).map((it) => ({
    label:
      it?.city ?? it?.label ?? it?.name ?? (typeof it === "string" ? it : ""),
    pct: parsePct(it?.percentage ?? it?.pct ?? it?.value ?? 0),
  }));

  return {
    gender_men: men,
    gender_women: women,
    age_bands,
    countries,
    cities,
  };
}
