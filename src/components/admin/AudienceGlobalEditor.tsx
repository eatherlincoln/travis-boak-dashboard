import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { Users, Percent, Globe, MapPin, Save } from "lucide-react";

type Platform = "instagram" | "youtube" | "tiktok";

type AgeBandKey = "25_34" | "18_24" | "35_44" | "45_54";

type CountryRow = { name: string; pct: number | "" };
type Gender = { men: number | ""; women: number | "" };

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

const emptyGender: Gender = { men: "", women: "" };
const emptyAges: Record<AgeBandKey, number | ""> = {
  "25_34": "",
  "18_24": "",
  "35_44": "",
  "45_54": "",
};
const emptyCountries: CountryRow[] = [
  { name: "", pct: "" },
  { name: "", pct: "" },
  { name: "", pct: "" },
  { name: "", pct: "" },
];
const emptyCities = ["", "", "", ""];

/** Small helpers */
const n = (v: number | string | ""): number => {
  if (v === "" || v === null || v === undefined) return 0;
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};
const pct = (v: number | string | ""): number =>
  Math.max(0, Math.min(100, n(v)));

export default function AudienceGlobalEditor() {
  const { tick } = useRefreshSignal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Form state
  const [gender, setGender] = useState<Gender>(emptyGender);
  const [ages, setAges] = useState<Record<AgeBandKey, number | "">>(emptyAges);
  const [countries, setCountries] = useState<CountryRow[]>(emptyCountries);
  const [cities, setCities] = useState<string[]>(emptyCities);

  // Load once (instagram row is our “global” source)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("platform_audience")
          .select("*")
          .eq("platform", "instagram")
          .limit(1)
          .maybeSingle();

        if (!alive) return;

        if (data) {
          // gender
          const g = (data.gender || {}) as any;
          setGender({
            men: g.men ?? "",
            women: g.women ?? "",
          });

          // ages: support either age_bands or legacy age_groups
          const src = (data.age_bands as any) ||
            (data.age_groups as any) || {
              "25_34": "",
              "18_24": "",
              "35_44": "",
              "45_54": "",
            };

          setAges({
            "25_34": src["25_34"] ?? "",
            "18_24": src["18_24"] ?? "",
            "35_44": src["35_44"] ?? "",
            "45_54": src["45_54"] ?? "",
          });

          // countries
          const cList: CountryRow[] = Array.isArray(data.countries)
            ? data.countries.map((c: any) => ({
                name: c.country ?? c.name ?? "",
                pct: c.percentage ?? c.pct ?? "",
              }))
            : emptyCountries;
          setCountries([
            cList[0] ?? { name: "", pct: "" },
            cList[1] ?? { name: "", pct: "" },
            cList[2] ?? { name: "", pct: "" },
            cList[3] ?? { name: "", pct: "" },
          ]);

          // cities
          const cityList: string[] = Array.isArray(data.cities)
            ? data.cities
            : emptyCities;
          setCities([
            cityList[0] ?? "",
            cityList[1] ?? "",
            cityList[2] ?? "",
            cityList[3] ?? "",
          ]);
        }
      } catch (err) {
        // swallow – blank form is fine for first run
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Totals for gentle validation
  const genderTotal = useMemo(
    () => pct(gender.men) + pct(gender.women),
    [gender]
  );

  const ageTotal = useMemo(() => {
    return (
      pct(ages["25_34"]) +
      pct(ages["18_24"]) +
      pct(ages["35_44"]) +
      pct(ages["45_54"])
    );
  }, [ages]);

  const countriesPretty = useMemo(
    () =>
      countries
        .filter((c) => c.name)
        .map((c) => ({ country: c.name, percentage: pct(c.pct) })),
    [countries]
  );

  /** Save to all three platforms. If `age_bands` is missing in DB, retry using `age_groups`. */
  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const base = {
        gender: { men: pct(gender.men), women: pct(gender.women) },
        age_bands: {
          "25_34": pct(ages["25_34"]),
          "18_24": pct(ages["18_24"]),
          "35_44": pct(ages["35_44"]),
          "45_54": pct(ages["45_54"]),
        },
        // include legacy for forward/backward compat
        age_groups: {
          "25_34": pct(ages["25_34"]),
          "18_24": pct(ages["18_24"]),
          "35_44": pct(ages["35_44"]),
          "45_54": pct(ages["45_54"]),
        },
        countries: countriesPretty,
        cities: cities.filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      const rows = PLATFORMS.map((p) => ({ platform: p, ...base }));

      let { error } = await supabase
        .from("platform_audience")
        .upsert(rows, { onConflict: "platform" });

      // If the column `age_bands` doesn't exist yet, retry using only age_groups
      if (error && /age_bands/i.test(error.message)) {
        const fallback = rows.map(({ age_bands, ...rest }) => rest);
        const retry = await supabase
          .from("platform_audience")
          .upsert(fallback, { onConflict: "platform" });
        if (retry.error) throw retry.error;
      } else if (error) {
        throw error;
      }

      setMsg("Demographics saved ✅");
      tick(); // notify frontend hooks to refresh
    } catch (e: any) {
      setMsg(e?.message || "Failed to save demographics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <Users size={16} className="text-neutral-700" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Audience Demographics (Global)
          </h2>
        </div>

        <button
          onClick={save}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save Demographics"}
        </button>
      </div>

      {/* grid: gender / age groups / locations */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Gender */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <Percent size={14} className="text-sky-600" />
            Gender Split (%)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Men"
              value={gender.men}
              suffix="%"
              onChange={(v) => setGender((g) => ({ ...g, men: v }))}
            />
            <Field
              label="Women"
              value={gender.women}
              suffix="%"
              onChange={(v) => setGender((g) => ({ ...g, women: v }))}
            />
          </div>
          <TotalChip value={genderTotal} warn={genderTotal !== 100} />
        </section>

        {/* Ages */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <Percent size={14} className="text-teal-600" />
            Age Groups (%)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="25–34"
              value={ages["25_34"]}
              suffix="%"
              onChange={(v) => setAges((a) => ({ ...a, "25_34": v }))}
            />
            <Field
              label="18–24"
              value={ages["18_24"]}
              suffix="%"
              onChange={(v) => setAges((a) => ({ ...a, "18_24": v }))}
            />
            <Field
              label="35–44"
              value={ages["35_44"]}
              suffix="%"
              onChange={(v) => setAges((a) => ({ ...a, "35_44": v }))}
            />
            <Field
              label="45–54"
              value={ages["45_54"]}
              suffix="%"
              onChange={(v) => setAges((a) => ({ ...a, "45_54": v }))}
            />
          </div>
          <TotalChip value={ageTotal} warn={ageTotal > 100} />
        </section>

        {/* Locations */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <Globe size={14} className="text-indigo-600" />
            Top Countries & Cities
          </h3>

          <div className="grid grid-cols-6 gap-3">
            {/* Countries: 4 rows of [name | %] */}
            {countries.map((c, i) => (
              <React.Fragment key={i}>
                <div className="col-span-4">
                  <Field
                    label={`Country ${i + 1}`}
                    value={c.name}
                    onChange={(v) =>
                      setCountries((list) => {
                        const next = [...list];
                        next[i] = { ...next[i], name: v as string };
                        return next;
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    label="%"
                    value={c.pct}
                    suffix="%"
                    onChange={(v) =>
                      setCountries((list) => {
                        const next = [...list];
                        next[i] = { ...next[i], pct: v };
                        return next;
                      })
                    }
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {cities.map((city, i) => (
              <Field
                key={i}
                label={`City ${i + 1}`}
                value={city}
                icon={<MapPin size={12} className="text-neutral-500" />}
                onChange={(v) =>
                  setCities((arr) => {
                    const next = [...arr];
                    next[i] = v as string;
                    return next;
                  })
                }
              />
            ))}
          </div>
        </section>
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

/* ---------- Reusable UI bits (kept local to avoid cross-file coupling) ---------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  icon,
}: {
  label: string;
  value: string | number | "";
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          className={[
            "h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500",
            icon ? "pl-7" : "",
            suffix ? "pr-7" : "",
          ].join(" ")}
          value={value as any}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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

function TotalChip({ value, warn }: { value: number; warn?: boolean }) {
  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-neutral-50 px-2 py-1 text-xs text-neutral-700">
      Total {Math.round(value)}%
      {warn && <span className="text-amber-600">• check totals</span>}
    </div>
  );
}
