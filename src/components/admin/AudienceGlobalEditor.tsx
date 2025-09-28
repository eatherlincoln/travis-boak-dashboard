import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { Users } from "lucide-react";

/**
 * Single-row global audience editor.
 *
 * DB table (stable, simple):
 *   table: audience
 *   id                text  (PK) — we use 'global'
 *   men_pct           numeric
 *   women_pct         numeric
 *   age_25_34         numeric
 *   age_18_24         numeric
 *   age_35_44         numeric
 *   age_45_54         numeric
 *   country1_name     text
 *   country1_pct      numeric
 *   country2_name     text
 *   country2_pct      numeric
 *   country3_name     text
 *   country3_pct      numeric
 *   country4_name     text
 *   country4_pct      numeric
 *   city1             text
 *   city2             text
 *   city3             text
 *   city4             text
 *   updated_at        timestamptz (default now())
 */

type A = {
  men_pct: number | null;
  women_pct: number | null;
  age_25_34: number | null;
  age_18_24: number | null;
  age_35_44: number | null;
  age_45_54: number | null;
  country1_name: string;
  country1_pct: number | null;
  country2_name: string;
  country2_pct: number | null;
  country3_name: string;
  country3_pct: number | null;
  country4_name: string;
  country4_pct: number | null;
  city1: string;
  city2: string;
  city3: string;
  city4: string;
};

const empty: A = {
  men_pct: null,
  women_pct: null,
  age_25_34: null,
  age_18_24: null,
  age_35_44: null,
  age_45_54: null,
  country1_name: "",
  country1_pct: null,
  country2_name: "",
  country2_pct: null,
  country3_name: "",
  country3_pct: null,
  country4_name: "",
  country4_pct: null,
  city1: "",
  city2: "",
  city3: "",
  city4: "",
};

const pct = (v: string) => {
  if (!v?.trim()) return null;
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function AudienceGlobalEditor() {
  const [form, setForm] = useState<A>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // derived helpers for little “Total xx%” hints
  const genderTotal = useMemo(
    () => (form.men_pct ?? 0) + (form.women_pct ?? 0),
    [form.men_pct, form.women_pct]
  );
  const ageTotal = useMemo(
    () =>
      (form.age_18_24 ?? 0) +
      (form.age_25_34 ?? 0) +
      (form.age_35_44 ?? 0) +
      (form.age_45_54 ?? 0),
    [form.age_18_24, form.age_25_34, form.age_35_44, form.age_45_54]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      const { data, error } = await supabase
        .from("audience")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (!alive) return;

      if (error) {
        // If table is present but empty, we'll still allow first save
        console.error(error);
      }
      if (data) {
        const d = { ...empty, ...data } as A;
        setForm(d);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const set = (key: keyof A, val: string) => {
    setForm((prev) => {
      // number fields we treat as pct by name, others as text
      if (
        key.endsWith("_pct") ||
        key.startsWith("age_") ||
        key.endsWith("men_pct") ||
        key.endsWith("women_pct")
      ) {
        return { ...prev, [key]: pct(val) };
      }
      return { ...prev, [key]: val };
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = { id: "global", ...form };
      const { error } = await supabase
        .from("audience")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
      setMsg("Demographics saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save demographics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <Users size={16} className="text-sky-700" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Audience Demographics (Global)
          </h2>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Demographics"}
        </button>
      </div>

      {/* 3-column editor */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Gender */}
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="mb-3 text-xs font-semibold text-neutral-700">
            GENDER SPLIT (%)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FieldPct
              label="Men"
              value={form.men_pct ?? ""}
              onChange={(v) => set("men_pct", v)}
            />
            <FieldPct
              label="Women"
              value={form.women_pct ?? ""}
              onChange={(v) => set("women_pct", v)}
            />
          </div>
          <BadgeTotal value={genderTotal} />
        </div>

        {/* Age groups */}
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="mb-3 text-xs font-semibold text-neutral-700">
            AGE GROUPS (%)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FieldPct
              label="25–34"
              value={form.age_25_34 ?? ""}
              onChange={(v) => set("age_25_34", v)}
            />
            <FieldPct
              label="18–24"
              value={form.age_18_24 ?? ""}
              onChange={(v) => set("age_18_24", v)}
            />
            <FieldPct
              label="35–44"
              value={form.age_35_44 ?? ""}
              onChange={(v) => set("age_35_44", v)}
            />
            <FieldPct
              label="45–54"
              value={form.age_45_54 ?? ""}
              onChange={(v) => set("age_45_54", v)}
            />
          </div>
          <BadgeTotal value={ageTotal} />
        </div>

        {/* Top countries + cities */}
        <div className="rounded-xl border border-neutral-200 p-4">
          <p className="mb-3 text-xs font-semibold text-neutral-700">
            TOP COUNTRIES & CITIES
          </p>

          {/* Countries rows with % to the right (aligned) */}
          <div className="space-y-2">
            <CountryRow
              label="Country 1"
              name={form.country1_name}
              pct={form.country1_pct ?? ""}
              onName={(v) => set("country1_name", v)}
              onPct={(v) => set("country1_pct", v)}
            />
            <CountryRow
              label="Country 2"
              name={form.country2_name}
              pct={form.country2_pct ?? ""}
              onName={(v) => set("country2_name", v)}
              onPct={(v) => set("country2_pct", v)}
            />
            <CountryRow
              label="Country 3"
              name={form.country3_name}
              pct={form.country3_pct ?? ""}
              onName={(v) => set("country3_name", v)}
              onPct={(v) => set("country3_pct", v)}
            />
            <CountryRow
              label="Country 4"
              name={form.country4_name}
              pct={form.country4_pct ?? ""}
              onName={(v) => set("country4_name", v)}
              onPct={(v) => set("country4_pct", v)}
            />
          </div>

          {/* Cities pills */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <CityPill
              label="City 1"
              value={form.city1}
              onChange={(v) => set("city1", v)}
            />
            <CityPill
              label="City 2"
              value={form.city2}
              onChange={(v) => set("city2", v)}
            />
            <CityPill
              label="City 3"
              value={form.city3}
              onChange={(v) => set("city3", v)}
            />
            <CityPill
              label="City 4"
              value={form.city4}
              onChange={(v) => set("city4", v)}
            />
          </div>
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </section>
  );
}

function FieldPct({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-neutral-600">{label}</span>
      <div className="relative">
        <input
          className="h-9 w-full rounded-md border border-neutral-300 px-3 pr-8 text-sm text-right outline-none focus:border-neutral-500"
          inputMode="numeric"
          placeholder="0"
          value={value as any}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
          %
        </span>
      </div>
    </label>
  );
}

function CountryRow({
  label,
  name,
  pct,
  onName,
  onPct,
}: {
  label: string;
  name: string;
  pct: string | number;
  onName: (v: string) => void;
  onPct: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr,88px] gap-2">
      <input
        className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        placeholder={label}
        value={name}
        onChange={(e) => onName(e.target.value)}
      />
      <div className="relative">
        <input
          className="h-9 w-full rounded-md border border-neutral-300 px-2 pr-7 text-right text-sm outline-none focus:border-neutral-500"
          inputMode="numeric"
          placeholder="%"
          value={pct as any}
          onChange={(e) => onPct(e.target.value)}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
          %
        </span>
      </div>
    </div>
  );
}

function CityPill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="h-9 w-full rounded-full border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function BadgeTotal({ value }: { value: number }) {
  const ok = Math.round(value) === 100;
  return (
    <div
      className={[
        "mt-2 inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      • Total {value || 0}%
    </div>
  );
}
