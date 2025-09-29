import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { useAuth } from "@/contexts/AuthContext";
import { Users } from "lucide-react";

type Gender = { men?: number | null; women?: number | null };
type AgeBand = { range: string; percentage: number | null };
type CountryPct = { country: string; percentage: number | null };

type AudienceRow = {
  id?: string;
  user_id?: string | null;
  gender: Gender;
  age_bands: AgeBand[];
  countries: CountryPct[];
  cities: string[];
  updated_at?: string | null;
};

const EMPTY_ROW: AudienceRow = {
  gender: { men: null, women: null },
  age_bands: [
    { range: "13-17", percentage: null },
    { range: "18-24", percentage: null },
    { range: "25-34", percentage: null },
    { range: "35-44", percentage: null },
    { range: "45-54", percentage: null },
    { range: "55-64", percentage: null },
    { range: "65+", percentage: null },
  ],
  countries: [{ country: "Australia", percentage: null }],
  cities: ["Sydney", "Gold Coast", "Melbourne"],
};

const toInt = (v: string) => {
  if (!v?.trim()) return null;
  const n = Number(v.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const toFloat = (v: string) => {
  if (!v?.trim()) return null;
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function AudienceGlobalEditor() {
  const { user, loading: authLoading } = useAuth();
  const { tick } = useRefreshSignal();

  const [row, setRow] = useState<AudienceRow>(EMPTY_ROW);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Load the single (latest) audience row.
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
        setMsg(error.message);
        setRow(EMPTY_ROW);
      } else if (data && data.length > 0) {
        // Normalize to our shape with safe fallbacks
        const d = data[0] as any;
        setRow({
          id: d.id,
          user_id: d.user_id ?? null,
          gender: d.gender ?? { men: null, women: null },
          age_bands: Array.isArray(d.age_bands)
            ? d.age_bands
            : EMPTY_ROW.age_bands,
          countries: Array.isArray(d.countries)
            ? d.countries
            : EMPTY_ROW.countries,
          cities: Array.isArray(d.cities) ? d.cities : EMPTY_ROW.cities,
          updated_at: d.updated_at ?? null,
        });
      } else {
        setRow(EMPTY_ROW);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const genderTotal = useMemo(() => {
    const m = row.gender.men ?? 0;
    const w = row.gender.women ?? 0;
    const total = (Number(m) || 0) + (Number(w) || 0);
    return Number.isFinite(total) ? total : 0;
  }, [row.gender.men, row.gender.women]);

  const setGender = (key: keyof Gender, val: string) =>
    setRow((prev) => ({
      ...prev,
      gender: { ...prev.gender, [key]: toFloat(val) },
    }));

  const setAgeBand = (idx: number, key: keyof AgeBand, val: string) =>
    setRow((prev) => {
      const next = [...prev.age_bands];
      next[idx] = {
        ...next[idx],
        [key]: key === "percentage" ? toFloat(val) : val,
      };
      return { ...prev, age_bands: next };
    });

  const addAgeBand = () =>
    setRow((prev) => ({
      ...prev,
      age_bands: [...prev.age_bands, { range: "New", percentage: null }],
    }));

  const removeAgeBand = (idx: number) =>
    setRow((prev) => ({
      ...prev,
      age_bands: prev.age_bands.filter((_, i) => i !== idx),
    }));

  const setCountry = (idx: number, key: keyof CountryPct, val: string) =>
    setRow((prev) => {
      const next = [...prev.countries];
      next[idx] = {
        ...next[idx],
        [key]: key === "percentage" ? toFloat(val) : val,
      } as CountryPct;
      return { ...prev, countries: next };
    });

  const addCountry = () =>
    setRow((prev) => ({
      ...prev,
      countries: [...prev.countries, { country: "", percentage: null }],
    }));

  const removeCountry = (idx: number) =>
    setRow((prev) => ({
      ...prev,
      countries: prev.countries.filter((_, i) => i !== idx),
    }));

  const setCity = (idx: number, val: string) =>
    setRow((prev) => {
      const next = [...prev.cities];
      next[idx] = val;
      return { ...prev, cities: next };
    });

  const addCity = () =>
    setRow((prev) => ({ ...prev, cities: [...prev.cities, ""] }));

  const removeCity = (idx: number) =>
    setRow((prev) => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== idx),
    }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (!user) {
        setMsg("You must be signed in to save.");
        setSaving(false);
        return;
      }

      const payload: Omit<AudienceRow, "id"> = {
        user_id: user.id,
        gender: {
          men: row.gender.men ?? null,
          women: row.gender.women ?? null,
        },
        age_bands: (row.age_bands || []).map((a) => ({
          range: a.range || "",
          percentage: a.percentage ?? null,
        })),
        countries: (row.countries || []).map((c) => ({
          country: c.country || "",
          percentage: c.percentage ?? null,
        })),
        cities: (row.cities || []).map((c) => c || "").filter(Boolean),
      };

      // If we have an existing row id, update by id; else insert a new one
      if (row.id) {
        const { error } = await supabase
          .from("audience")
          .update(payload as any)
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("audience")
          .insert(payload as any)
          .select("id")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (data?.id) {
          setRow((prev) => ({ ...prev, id: data.id }));
        }
      }

      setMsg("Audience saved ✅");
      tick();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save audience.");
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
            Audience (Global)
          </h2>
        </div>
        <button
          onClick={save}
          disabled={saving || loading || authLoading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Gender */}
      <section className="mb-6 rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-neutral-800">Gender</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Men (%)"
            inputMode="numeric"
            value={row.gender.men ?? ""}
            onChange={(v) => setGender("men", v)}
            alignRight
          />
          <Field
            label="Women (%)"
            inputMode="numeric"
            value={row.gender.women ?? ""}
            onChange={(v) => setGender("women", v)}
            alignRight
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Total:{" "}
          <span
            className={
              genderTotal === 100 ? "text-emerald-600" : "text-amber-600"
            }
          >
            {genderTotal}
          </span>
          %{genderTotal !== 100 ? " (ideally 100%)" : ""}
        </p>
      </section>

      {/* Age bands */}
      <section className="mb-6 rounded-xl border border-neutral-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">Age bands</h3>
          <button
            type="button"
            onClick={addAgeBand}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
          >
            + Add band
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {row.age_bands.map((ab, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <Field
                  label="Range"
                  value={ab.range}
                  onChange={(v) => setAgeBand(i, "range", v)}
                  placeholder="e.g. 25-34"
                />
              </div>
              <div className="col-span-4">
                <Field
                  label="%"
                  inputMode="numeric"
                  value={ab.percentage ?? ""}
                  onChange={(v) => setAgeBand(i, "percentage", v)}
                  alignRight
                />
              </div>
              <div className="col-span-1">
                <IconButton onClick={() => removeAgeBand(i)} title="Remove" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Countries */}
      <section className="mb-6 rounded-xl border border-neutral-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">
            Top countries
          </h3>
          <button
            type="button"
            onClick={addCountry}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
          >
            + Add country
          </button>
        </div>
        <div className="space-y-3">
          {row.countries.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <Field
                  label="Country"
                  value={c.country}
                  onChange={(v) => setCountry(i, "country", v)}
                  placeholder="e.g. Australia"
                />
              </div>
              <div className="col-span-4">
                <Field
                  label="%"
                  inputMode="numeric"
                  value={c.percentage ?? ""}
                  onChange={(v) => setCountry(i, "percentage", v)}
                  alignRight
                />
              </div>
              <div className="col-span-1">
                <IconButton onClick={() => removeCountry(i)} title="Remove" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="rounded-xl border border-neutral-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">Top cities</h3>
          <button
            type="button"
            onClick={addCity}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
          >
            + Add city
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {row.cities.map((city, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-11">
                <Field
                  label="City"
                  value={city}
                  onChange={(v) => setCity(i, v)}
                />
              </div>
              <div className="col-span-1">
                <IconButton onClick={() => removeCity(i)} title="Remove" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {row.updated_at && (
        <p className="mt-4 text-xs text-neutral-500">
          Last updated: {new Date(row.updated_at).toLocaleString()}
        </p>
      )}
      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  alignRight,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  alignRight?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <input
        className={[
          "h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500",
          alignRight ? "text-right" : "",
        ].join(" ")}
        value={value as any}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function IconButton({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-9 w-full rounded-md border border-neutral-300 text-xs hover:bg-neutral-50"
    >
      ✕
    </button>
  );
}
