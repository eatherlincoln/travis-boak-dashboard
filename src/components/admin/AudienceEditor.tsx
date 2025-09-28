import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { cn } from "@/lib/utils"; // if you don't have this helper, just inline className joins

type Platform = "instagram" | "youtube" | "tiktok";

type AudienceRow = {
  platform: Platform;
  gender: { men: number | null; women: number | null };
  age_groups: { range: string; percentage: number | null }[]; // e.g., 25–34, 18–24, 35–44, 45–54
  countries: { country: string; percentage: number | null }[]; // up to 4
  cities: string[]; // up to 4
  updated_at?: string | null;
};

type Props = {
  platform: Platform;
  title?: string;
};

const DEFAULT_AGES = [
  { range: "25–34", percentage: null },
  { range: "18–24", percentage: null },
  { range: "35–44", percentage: null },
  { range: "45–54", percentage: null },
];

const DEFAULT_COUNTRIES = [
  { country: "", percentage: null },
  { country: "", percentage: null },
  { country: "", percentage: null },
  { country: "", percentage: null },
];

function toInt(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function AudienceEditor({ platform, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { tick } = useRefreshSignal();

  const [gender, setGender] = useState<{
    men: number | null;
    women: number | null;
  }>({
    men: null,
    women: null,
  });
  const [ageGroups, setAgeGroups] =
    useState<{ range: string; percentage: number | null }[]>(DEFAULT_AGES);
  const [countries, setCountries] =
    useState<{ country: string; percentage: number | null }[]>(
      DEFAULT_COUNTRIES
    );
  const [cities, setCities] = useState<string[]>(["", "", "", ""]);

  // Fetch current audience for this platform
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const { data, error } = await supabase
        .from<AudienceRow>("platform_audience")
        .select("*")
        .eq("platform", platform)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!alive) return;

      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }

      const row = data?.[0];
      if (row) {
        setGender(row.gender ?? { men: null, women: null });
        setAgeGroups(
          row.age_groups?.length
            ? normalizeAgeRanges(row.age_groups)
            : DEFAULT_AGES
        );
        setCountries(
          (row.countries?.length ? row.countries : DEFAULT_COUNTRIES)
            .slice(0, 4)
            .concat(
              Array(Math.max(0, 4 - (row.countries?.length || 0))).fill({
                country: "",
                percentage: null,
              })
            )
        );
        setCities(
          (row.cities?.length ? row.cities : ["", "", "", ""])
            .slice(0, 4)
            .concat(Array(Math.max(0, 4 - (row.cities?.length || 0))).fill(""))
        );
      } else {
        // defaults
        setGender({ men: null, women: null });
        setAgeGroups(DEFAULT_AGES);
        setCountries(DEFAULT_COUNTRIES);
        setCities(["", "", "", ""]);
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [platform]);

  // —— derived helpers ——
  const genderTotal = useMemo(
    () => (gender.men ?? 0) + (gender.women ?? 0),
    [gender.men, gender.women]
  );

  const agesTotal = useMemo(
    () => ageGroups.reduce((sum, a) => sum + (a.percentage ?? 0), 0),
    [ageGroups]
  );

  const canSave = useMemo(() => {
    // Allow saving even if not perfect, but highlight guidance below.
    return !saving && !loading;
  }, [saving, loading]);

  // —— event handlers ——
  const setAge = (idx: number, value: number | null) => {
    setAgeGroups((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], percentage: value };
      return next;
    });
  };

  const setCountry = (
    idx: number,
    key: "country" | "percentage",
    value: string
  ) => {
    setCountries((prev) => {
      const next = [...prev];
      next[idx] =
        key === "country"
          ? { ...next[idx], country: value }
          : { ...next[idx], percentage: toInt(value) };
      return next;
    });
  };

  const setCity = (idx: number, value: string) => {
    setCities((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload: Partial<AudienceRow> = {
        platform,
        gender: {
          men: gender.men ?? 0,
          women: gender.women ?? 0,
        },
        age_groups: normalizeAgeRanges(
          ageGroups.map((a) => ({
            range: a.range,
            percentage: a.percentage ?? 0,
          }))
        ),
        countries: countries
          .filter((c) => c.country.trim() !== "")
          .map((c) => ({
            country: c.country.trim(),
            percentage: c.percentage ?? 0,
          }))
          .slice(0, 4),
        cities: cities.filter((c) => c.trim() !== "").slice(0, 4),
      };

      const { error } = await supabase
        .from("platform_audience")
        .upsert(payload, { onConflict: "platform" });

      if (error) throw error;
      setMsg("Demographics saved ✅");
      tick(); // nudge the frontend hooks to refetch
    } catch (e: any) {
      setMsg(e?.message || "Failed to save demographics.");
    } finally {
      setSaving(false);
    }
  };

  // —— UI ——
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">
          Demographics — {title ?? platformLabel(platform)}
        </h3>
        <div className="flex items-center gap-3">
          <GuidanceBadge
            ok={genderTotal === 100}
            label={`Gender ${genderTotal || 0}%`}
            hint="Men + Women should total 100%"
          />
          <GuidanceBadge
            ok={agesTotal === 100}
            label={`Ages ${agesTotal || 0}%`}
            hint="Age groups should total 100%"
          />
          <button
            onClick={save}
            disabled={!canSave}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              canSave
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            )}
          >
            {saving ? "Saving…" : "Save Demographics"}
          </button>
        </div>
      </div>

      {/* 2-column (lg: 3-column) spacious layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Gender split (%)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <LabeledNumber
              label="Men"
              value={gender.men ?? ""}
              onChange={(v) => setGender((g) => ({ ...g, men: toInt(v) }))}
              suffix="%"
            />
            <LabeledNumber
              label="Women"
              value={gender.women ?? ""}
              onChange={(v) => setGender((g) => ({ ...g, women: toInt(v) }))}
              suffix="%"
            />
          </div>
          <ProgressRow total={genderTotal} />
        </section>

        {/* Age groups */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Age groups (%)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {ageGroups.map((a, i) => (
              <LabeledNumber
                key={a.range}
                label={a.range}
                value={a.percentage ?? ""}
                onChange={(v) => setAge(i, toInt(v))}
                suffix="%"
              />
            ))}
          </div>
          <ProgressRow total={agesTotal} />
        </section>

        {/* Top countries & cities */}
        <section className="rounded-xl border border-neutral-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Top countries (%) & Top cities
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {/* Countries */}
            <div>
              <div className="mb-2 text-[11px] font-medium text-neutral-500">
                Countries (up to 4)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {countries.map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr,80px] gap-2">
                    <input
                      className="h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                      placeholder={`Country ${i + 1}`}
                      value={c.country}
                      onChange={(e) => setCountry(i, "country", e.target.value)}
                    />
                    <input
                      className="h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none text-right focus:border-neutral-500"
                      placeholder="%"
                      inputMode="numeric"
                      value={c.percentage ?? ""}
                      onChange={(e) =>
                        setCountry(i, "percentage", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cities */}
            <div>
              <div className="mb-2 text-[11px] font-medium text-neutral-500">
                Cities (up to 4)
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
            </div>
          </div>
        </section>
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

/* ---------- little UI helpers ---------- */

function LabeledNumber({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number | string;
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
          className="h-9 w-full rounded-md border border-neutral-300 px-3 pr-8 text-sm outline-none text-right focus:border-neutral-500"
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

function ProgressRow({ total }: { total: number }) {
  const ok = total === 100;
  const pct = Math.max(0, Math.min(100, total || 0));
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-neutral-500">Total</span>
        <span
          className={cn(
            "text-[11px] font-medium",
            ok ? "text-emerald-600" : "text-amber-600"
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-200">
        <div
          className={cn(
            "h-1.5 rounded-full",
            ok ? "bg-emerald-500" : "bg-amber-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!ok && (
        <div className="mt-1 text-[11px] text-neutral-500">
          Aim for a total of <span className="font-medium">100%</span>.
        </div>
      )}
    </div>
  );
}

function GuidanceBadge({
  ok,
  label,
  hint,
}: {
  ok: boolean;
  label: string;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-2 rounded-md px-2 py-1 text-[11px]",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}
      title={hint}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          ok ? "bg-emerald-600" : "bg-amber-600"
        )}
      />
      <span className="font-medium">{label}</span>
    </div>
  );
}

/* ensure age ranges are in our canonical order */
function normalizeAgeRanges(
  arr: { range: string; percentage: number | null }[]
) {
  const order = ["25–34", "18–24", "35–44", "45–54"];
  const byRange = new Map(arr.map((a) => [a.range, a]));
  return order.map((r) => byRange.get(r) ?? { range: r, percentage: null });
}

function platformLabel(p: Platform) {
  switch (p) {
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    default:
      return p;
  }
}
