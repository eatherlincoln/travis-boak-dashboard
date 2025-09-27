// src/components/admin/DemographicsForm.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";

type Platform = "instagram" | "youtube" | "tiktok";

type Demo = {
  platform: Platform;
  men_pct: number | null;
  women_pct: number | null;
  age_18_24: number | null;
  age_25_34: number | null;
  age_35_44: number | null;
  age_45_54: number | null;
  country_1?: string | null;
  country_1_pct?: number | null;
  country_2?: string | null;
  country_2_pct?: number | null;
  country_3?: string | null;
  country_3_pct?: number | null;
  city_1?: string | null;
  city_2?: string | null;
  city_3?: string | null;
};

const empty = (platform: Platform): Demo => ({
  platform,
  men_pct: null,
  women_pct: null,
  age_18_24: null,
  age_25_34: null,
  age_35_44: null,
  age_45_54: null,
  country_1: "",
  country_1_pct: null,
  country_2: "",
  country_2_pct: null,
  country_3: "",
  country_3_pct: null,
  city_1: "",
  city_2: "",
  city_3: "",
});

export default function DemographicsForm({ platform }: { platform: Platform }) {
  const [form, setForm] = useState<Demo>(() => empty(platform));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { tick } = useRefreshSignal();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audience_demographics")
        .select(
          "platform, men_pct, women_pct, age_18_24, age_25_34, age_35_44, age_45_54, country_1, country_1_pct, country_2, country_2_pct, country_3, country_3_pct, city_1, city_2, city_3"
        )
        .eq("platform", platform)
        .maybeSingle();

      if (!mounted) return;

      if (!error && data) setForm({ ...empty(platform), ...data });
      else setForm(empty(platform));

      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [platform, tick]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("audience_demographics").upsert(
      {
        ...form,
        platform,
      },
      { onConflict: "platform" }
    );
    setSaving(false);
    if (!error) tick();
  };

  const num = (v: string) => (v === "" ? null : Number(v));

  return (
    <div className="space-y-4">
      {/* Gender split */}
      <div>
        <div className="mb-2 text-xs font-medium text-neutral-600">
          Gender Split (%)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Men"
            value={form.men_pct ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, men_pct: num(v) }))}
          />
          <Field
            label="Women"
            value={form.women_pct ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, women_pct: num(v) }))}
          />
        </div>
      </div>

      {/* Age groups */}
      <div>
        <div className="mb-2 text-xs font-medium text-neutral-600">
          Age Groups (%)
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Field
            label="18–24"
            value={form.age_18_24 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, age_18_24: num(v) }))}
          />
          <Field
            label="25–34"
            value={form.age_25_34 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, age_25_34: num(v) }))}
          />
          <Field
            label="35–44"
            value={form.age_35_44 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, age_35_44: num(v) }))}
          />
          <Field
            label="45–54"
            value={form.age_45_54 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, age_45_54: num(v) }))}
          />
        </div>
      </div>

      {/* Top Countries */}
      <div>
        <div className="mb-2 text-xs font-medium text-neutral-600">
          Top Countries
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CountryRow
            label="Country 1"
            name={form.country_1 ?? ""}
            pct={form.country_1_pct ?? ""}
            onChange={(name, pct) =>
              setForm((f) => ({
                ...f,
                country_1: name,
                country_1_pct: pct === "" ? null : Number(pct),
              }))
            }
          />
          <CountryRow
            label="Country 2"
            name={form.country_2 ?? ""}
            pct={form.country_2_pct ?? ""}
            onChange={(name, pct) =>
              setForm((f) => ({
                ...f,
                country_2: name,
                country_2_pct: pct === "" ? null : Number(pct),
              }))
            }
          />
          <CountryRow
            label="Country 3"
            name={form.country_3 ?? ""}
            pct={form.country_3_pct ?? ""}
            onChange={(name, pct) =>
              setForm((f) => ({
                ...f,
                country_3: name,
                country_3_pct: pct === "" ? null : Number(pct),
              }))
            }
          />
        </div>
      </div>

      {/* Top Cities */}
      <div>
        <div className="mb-2 text-xs font-medium text-neutral-600">
          Top Cities
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field
            label="City 1"
            value={form.city_1 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, city_1: v }))}
          />
          <Field
            label="City 2"
            value={form.city_2 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, city_2: v }))}
          />
          <Field
            label="City 3"
            value={form.city_3 ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, city_3: v }))}
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={save}
          disabled={saving || loading}
          className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Demographics"}
        </button>
      </div>
    </div>
  );
}

function Field({
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
      <span className="text-[11px] text-neutral-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function CountryRow({
  label,
  name,
  pct,
  onChange,
}: {
  label: string;
  name: string | number;
  pct: string | number;
  onChange: (name: string, pct: string) => void;
}) {
  return (
    <div>
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-1 grid grid-cols-3 gap-2">
        <input
          className="col-span-2 rounded-md border px-3 py-2 text-sm"
          placeholder="Country"
          value={name}
          onChange={(e) => onChange(e.target.value, String(pct))}
        />
        <input
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="%"
          inputMode="numeric"
          value={pct}
          onChange={(e) => onChange(String(name), e.target.value)}
        />
      </div>
    </div>
  );
}
