import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import SaveButton from "@/components/admin/SaveButton";

type Platform = "instagram" | "youtube" | "tiktok";

type Gender = { men?: number | ""; women?: number | "" };
type AgeGroup = { range: string; percentage?: number | "" };
type Country = { country: string; percentage?: number | "" };

type AudienceDraft = {
  gender: Gender;
  age_groups: AgeGroup[];
  countries: Country[];
  cities: string[];
};

function n(v: number | string | undefined | null): number | null {
  if (v === "" || v == null) return null;
  const x =
    typeof v === "number" ? v : parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(x) ? x : null;
}

export default function AudienceEditor({ platform }: { platform: Platform }) {
  const [draft, setDraft] = useState<AudienceDraft>({
    gender: { men: "", women: "" },
    age_groups: [
      { range: "18-24", percentage: "" },
      { range: "25-34", percentage: "" },
      { range: "35-44", percentage: "" },
      { range: "45-54", percentage: "" },
    ],
    countries: [
      { country: "", percentage: "" },
      { country: "", percentage: "" },
      { country: "", percentage: "" },
    ],
    cities: ["", "", ""],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Load existing audience row for this user + platform (if any)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setMsg(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        if (mounted) {
          setLoading(false);
          setMsg("Sign in required to edit audience.");
        }
        return;
      }

      const { data, error } = await supabase
        .from("platform_audience")
        .select("gender, age_groups, countries, cities")
        .eq("user_id", userId)
        .eq("platform", platform)
        .maybeSingle();

      if (!mounted) return;

      if (!error && data) {
        setDraft({
          gender: {
            men: (data.gender?.men ?? "") as number | "",
            women: (data.gender?.women ?? "") as number | "",
          },
          age_groups: (data.age_groups as AgeGroup[])?.length
            ? data.age_groups
            : draft.age_groups,
          countries: (data.countries as Country[])?.length
            ? data.countries
            : draft.countries,
          cities:
            Array.isArray(data.cities) && data.cities.length
              ? (data.cities as string[])
              : draft.cities,
        });
      }

      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) throw new Error("Not signed in.");

      const payload = {
        user_id: userId,
        platform,
        gender: {
          men: n(draft.gender.men) ?? 0,
          women: n(draft.gender.women) ?? 0,
        },
        age_groups: draft.age_groups.map((g) => ({
          range: g.range,
          percentage: n(g.percentage) ?? 0,
        })),
        countries: draft.countries.map((c) => ({
          country: c.country?.trim() ?? "",
          percentage: n(c.percentage) ?? 0,
        })),
        cities: draft.cities.map((c) => (c ?? "").trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("platform_audience")
        .upsert(payload, { onConflict: "user_id,platform" });

      if (error) throw error;
      setMsg("Demographics saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save demographics.");
    } finally {
      setSaving(false);
    }
  };

  const setGender = (k: keyof Gender, v: string) =>
    setDraft((d) => ({ ...d, gender: { ...d.gender, [k]: v } }));

  const setAge = (idx: number, v: string) =>
    setDraft((d) => {
      const next = [...d.age_groups];
      next[idx] = { ...next[idx], percentage: v };
      return { ...d, age_groups: next };
    });

  const setCountry = (idx: number, key: "country" | "percentage", v: string) =>
    setDraft((d) => {
      const next = [...d.countries];
      next[idx] = { ...next[idx], [key]: v };
      return { ...d, countries: next };
    });

  const setCity = (idx: number, v: string) =>
    setDraft((d) => {
      const next = [...d.cities];
      next[idx] = v;
      return { ...d, cities: next };
    });

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-800">
          Demographics — {platform[0].toUpperCase() + platform.slice(1)}
        </div>
        <SaveButton onClick={save} saving={saving} label="Save Demographics" />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gender */}
          <div>
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Gender Split (%)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Men"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={draft.gender.men ?? ""}
                onChange={(e) => setGender("men", e.target.value)}
              />
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Women"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={draft.gender.women ?? ""}
                onChange={(e) => setGender("women", e.target.value)}
              />
            </div>
          </div>

          {/* Age groups */}
          <div>
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Age Groups (%)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {draft.age_groups.map((g, i) => (
                <div key={g.range} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-12">
                    {g.range}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={g.percentage ?? ""}
                    onChange={(e) => setAge(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Top Countries
            </div>
            <div className="space-y-2">
              {draft.countries.map((c, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input
                    placeholder={`Country ${i + 1}`}
                    className="col-span-2 rounded-md border px-3 py-2 text-sm"
                    value={c.country}
                    onChange={(e) => setCountry(i, "country", e.target.value)}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="%"
                    className="rounded-md border px-3 py-2 text-sm"
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
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Top Cities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {draft.cities.map((c, i) => (
                <input
                  key={i}
                  placeholder={`City ${i + 1}`}
                  className="rounded-md border px-3 py-2 text-sm"
                  value={c}
                  onChange={(e) => setCity(i, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
