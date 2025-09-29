import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { Users } from "lucide-react";

type FormState = {
  men_pct: number | null;
  women_pct: number | null;
  age_18_24: number | null;
  age_25_34: number | null;
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

const emptyForm: FormState = {
  men_pct: null,
  women_pct: null,
  age_18_24: null,
  age_25_34: null,
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

export default function AudienceGlobalEditor() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Load once
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audience")
        .select("*")
        .eq("platform", "global")
        .maybeSingle();

      if (!alive) return;
      if (error) console.warn("[audience load error]", error.message);

      if (data) {
        const gender = (data.gender || {}) as { men?: number; women?: number };
        const ageArr = (data.age || []) as Array<{
          range: string;
          percentage: number;
        }>;
        const countries = (data.top_countries || []) as Array<{
          country: string;
          percentage: number;
        }>;
        const cities = (data.top_cities || []) as string[];

        const byRange = Object.fromEntries(
          ageArr.map((a) => [a.range, a.percentage])
        );
        const byCountry = (i: number) =>
          countries[i] || { country: "", percentage: null };

        setForm({
          men_pct: gender.men ?? null,
          women_pct: gender.women ?? null,
          age_18_24: byRange["18-24"] ?? null,
          age_25_34: byRange["25-34"] ?? null,
          age_35_44: byRange["35-44"] ?? null,
          age_45_54: byRange["45-54"] ?? null,
          country1_name: byCountry(0).country,
          country1_pct: byCountry(0).percentage,
          country2_name: byCountry(1).country,
          country2_pct: byCountry(1).percentage,
          country3_name: byCountry(2).country,
          country3_pct: byCountry(2).percentage,
          country4_name: byCountry(3).country,
          country4_pct: byCountry(3).percentage,
          city1: cities?.[0] ?? "",
          city2: cities?.[1] ?? "",
          city3: cities?.[2] ?? "",
          city4: cities?.[3] ?? "",
        });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (key: keyof FormState, val: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: val.trim() === "" ? null : isNaN(Number(val)) ? val : Number(val),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const gender = { men: form.men_pct ?? 0, women: form.women_pct ?? 0 };
      const age = [
        { range: "18-24", percentage: form.age_18_24 ?? 0 },
        { range: "25-34", percentage: form.age_25_34 ?? 0 },
        { range: "35-44", percentage: form.age_35_44 ?? 0 },
        { range: "45-54", percentage: form.age_45_54 ?? 0 },
      ];
      const top_countries = [
        { country: form.country1_name, percentage: form.country1_pct ?? 0 },
        { country: form.country2_name, percentage: form.country2_pct ?? 0 },
        { country: form.country3_name, percentage: form.country3_pct ?? 0 },
        { country: form.country4_name, percentage: form.country4_pct ?? 0 },
      ].filter((c) => c.country);
      const top_cities = [
        form.city1,
        form.city2,
        form.city3,
        form.city4,
      ].filter(Boolean);

      const payload = {
        platform: "global",
        gender,
        age,
        top_countries,
        top_cities,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("audience")
        .upsert(payload, { onConflict: "platform" });

      if (error) throw error;
      setMsg("Demographics saved ✅");
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
            <Users size={16} className="text-sky-600" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Audience Demographics
          </h2>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gender */}
        <section>
          <h3 className="mb-2 text-xs font-semibold text-neutral-600">
            Gender
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Men %"
              value={form.men_pct ?? ""}
              onChange={(v) => setField("men_pct", v)}
            />
            <Field
              label="Women %"
              value={form.women_pct ?? ""}
              onChange={(v) => setField("women_pct", v)}
            />
          </div>
        </section>

        {/* Age */}
        <section>
          <h3 className="mb-2 text-xs font-semibold text-neutral-600">Age</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="18–24"
              value={form.age_18_24 ?? ""}
              onChange={(v) => setField("age_18_24", v)}
            />
            <Field
              label="25–34"
              value={form.age_25_34 ?? ""}
              onChange={(v) => setField("age_25_34", v)}
            />
            <Field
              label="35–44"
              value={form.age_35_44 ?? ""}
              onChange={(v) => setField("age_35_44", v)}
            />
            <Field
              label="45–54"
              value={form.age_45_54 ?? ""}
              onChange={(v) => setField("age_45_54", v)}
            />
          </div>
        </section>

        {/* Countries */}
        <section className="lg:col-span-2">
          <h3 className="mb-2 text-xs font-semibold text-neutral-600">
            Top Countries
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Country 1"
              value={form.country1_name}
              onChange={(v) => setField("country1_name", v)}
            />
            <Field
              label="% 1"
              value={form.country1_pct ?? ""}
              onChange={(v) => setField("country1_pct", v)}
            />
            <Field
              label="Country 2"
              value={form.country2_name}
              onChange={(v) => setField("country2_name", v)}
            />
            <Field
              label="% 2"
              value={form.country2_pct ?? ""}
              onChange={(v) => setField("country2_pct", v)}
            />
            <Field
              label="Country 3"
              value={form.country3_name}
              onChange={(v) => setField("country3_name", v)}
            />
            <Field
              label="% 3"
              value={form.country3_pct ?? ""}
              onChange={(v) => setField("country3_pct", v)}
            />
            <Field
              label="Country 4"
              value={form.country4_name}
              onChange={(v) => setField("country4_name", v)}
            />
            <Field
              label="% 4"
              value={form.country4_pct ?? ""}
              onChange={(v) => setField("country4_pct", v)}
            />
          </div>
        </section>

        {/* Cities */}
        <section className="lg:col-span-2">
          <h3 className="mb-2 text-xs font-semibold text-neutral-600">
            Top Cities
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="City 1"
              value={form.city1}
              onChange={(v) => setField("city1", v)}
            />
            <Field
              label="City 2"
              value={form.city2}
              onChange={(v) => setField("city2", v)}
            />
            <Field
              label="City 3"
              value={form.city3}
              onChange={(v) => setField("city3", v)}
            />
            <Field
              label="City 4"
              value={form.city4}
              onChange={(v) => setField("city4", v)}
            />
          </div>
        </section>
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
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
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <input
        className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        value={value as any}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
