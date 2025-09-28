import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";

type Age = { range: string; percentage: number | null };
type Ctry = { country: string; percentage: number | null };

const AGE_ORDER: string[] = ["25–34", "18–24", "35–44", "45–54"];

const DEFAULT_AGES: Age[] = AGE_ORDER.map((r) => ({
  range: r,
  percentage: null,
}));
const DEFAULT_CNTS: Ctry[] = [
  { country: "", percentage: null },
  { country: "", percentage: null },
  { country: "", percentage: null },
  { country: "", percentage: null },
];

function toInt(v: string) {
  if (!v.trim()) return null;
  const n = Number(v.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function AudienceGlobalEditor() {
  const { tick } = useRefreshSignal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [men, setMen] = useState<number | null>(null);
  const [women, setWomen] = useState<number | null>(null);
  const [ages, setAges] = useState<Age[]>(DEFAULT_AGES);
  const [countries, setCountries] = useState<Ctry[]>(DEFAULT_CNTS);
  const [cities, setCities] = useState<string[]>(["", "", "", ""]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", "global")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;

      if (!error && data?.[0]) {
        const row = data[0] as any;
        setMen(row.gender?.men ?? null);
        setWomen(row.gender?.women ?? null);

        const byRange = new Map<string, number | null>(
          (row.age_groups ?? []).map((a: any) => [a.range, a.percentage])
        );
        setAges(
          AGE_ORDER.map((r) => ({
            range: r,
            percentage: byRange.get(r) ?? null,
          }))
        );

        const cnts = (row.countries ?? []).slice(0, 4);
        setCountries(
          cnts.concat(
            Array(Math.max(0, 4 - cnts.length)).fill({
              country: "",
              percentage: null,
            })
          )
        );

        const cits = (row.cities ?? []).slice(0, 4);
        setCities(cits.concat(Array(Math.max(0, 4 - cits.length)).fill("")));
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const genderTotal = useMemo(() => (men ?? 0) + (women ?? 0), [men, women]);
  const agesTotal = useMemo(
    () => ages.reduce((s, a) => s + (a.percentage ?? 0), 0),
    [ages]
  );

  const setAge = (i: number, pct: number | null) =>
    setAges((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, percentage: pct } : a))
    );

  const setCountry = (i: number, key: "country" | "percentage", val: string) =>
    setCountries((prev) =>
      prev.map((c, idx) =>
        idx === i
          ? key === "country"
            ? { ...c, country: val }
            : { ...c, percentage: toInt(val) }
          : c
      )
    );

  const setCity = (i: number, val: string) =>
    setCities((prev) => prev.map((c, idx) => (idx === i ? val : c)));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        platform: "global",
        gender: { men: men ?? 0, women: women ?? 0 },
        age_groups: ages.map((a) => ({
          range: a.range,
          percentage: a.percentage ?? 0,
        })),
        countries: countries
          .filter((c) => c.country.trim())
          .map((c) => ({
            country: c.country.trim(),
            percentage: c.percentage ?? 0,
          }))
          .slice(0, 4),
        cities: cities.filter((c) => c.trim()).slice(0, 4),
      };

      const { error } = await supabase
        .from("platform_audience")
        .upsert(payload, { onConflict: "platform" });

      if (error) throw error;

      setMsg("Demographics saved ✅");
      tick();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save demographics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Audience Demographics (Global)
        </h2>
        <button
          onClick={save}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Demographics"}
        </button>
      </div>

      {/* 3 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gender */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Gender split (%)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Num
              label="Men"
              value={men ?? ""}
              onChange={(v) => setMen(toInt(v))}
              suffix="%"
            />
            <Num
              label="Women"
              value={women ?? ""}
              onChange={(v) => setWomen(toInt(v))}
              suffix="%"
            />
          </div>
          <Badge ok={genderTotal === 100} text={`Total ${genderTotal || 0}%`} />
        </section>

        {/* Ages */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Age groups (%)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {ages.map((a, i) => (
              <Num
                key={a.range}
                label={a.range}
                value={a.percentage ?? ""}
                onChange={(v) => setAge(i, toInt(v))}
                suffix="%"
              />
            ))}
          </div>
          <Badge ok={agesTotal === 100} text={`Total ${agesTotal || 0}%`} />
        </section>

        {/* Countries & cities */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Top countries & cities
          </h4>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {countries.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr,80px] gap-2">
                <input
                  className="h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                  placeholder={`Country ${i + 1}`}
                  value={c.country}
                  onChange={(e) => setCountry(i, "country", e.target.value)}
                />
                <input
                  className="h-9 rounded-md border border-neutral-300 px-3 text-right text-sm outline-none focus:border-neutral-500"
                  placeholder="%"
                  inputMode="numeric"
                  value={c.percentage ?? ""}
                  onChange={(e) => setCountry(i, "percentage", e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cities.map((c, i) => (
              <input
                key={i}
                className="h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                placeholder={`City ${i + 1}`}
                value={c}
                onChange={(e) => setCity(i, e.target.value)}
              />
            ))}
          </div>
        </section>
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative">
        <input
          className="h-9 w-full rounded-md border border-neutral-300 px-3 pr-8 text-right text-sm outline-none focus:border-neutral-500"
          inputMode="numeric"
          value={value as any}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function Badge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className={
        "mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] " +
        (ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")
      }
      title="Totals should be 100%"
    >
      <span
        className={
          "inline-block h-1.5 w-1.5 rounded-full " +
          (ok ? "bg-emerald-600" : "bg-amber-600")
        }
      />
      <span className="font-medium">{text}</span>
    </div>
  );
}
