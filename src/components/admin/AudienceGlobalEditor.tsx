import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { Globe, Save, Instagram, Youtube, Music2 } from "lucide-react";

type Platform = "instagram" | "youtube" | "tiktok";

type AudienceRow = {
  platform: Platform;
  gender: { men?: number; women?: number } | null;
  age_bands: Array<{ range: string; percentage: number }> | null;
  countries: Array<{ country: string; percentage: number }> | null;
  cities: string[] | null;
};

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

// sensible defaults so the card doesn't look empty
const DEFAULT_ROW = (platform: Platform): AudienceRow => ({
  platform,
  gender: { men: 60, women: 40 },
  age_bands: [
    { range: "13-17", percentage: 5 },
    { range: "18-24", percentage: 25 },
    { range: "25-34", percentage: 35 },
    { range: "35-44", percentage: 20 },
    { range: "45+", percentage: 15 },
  ],
  countries: [
    { country: "Australia", percentage: 50 },
    { country: "USA", percentage: 20 },
    { country: "Indonesia", percentage: 10 },
    { country: "Brazil", percentage: 10 },
    { country: "France", percentage: 10 },
  ],
  cities: ["Gold Coast", "Sydney", "Los Angeles", "Bali", "Rio", "Paris"],
});

function clamp0to100(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export default function AudienceGlobalEditor() {
  const { tick } = useRefreshSignal();

  const [rows, setRows] = useState<Record<Platform, AudienceRow>>({
    instagram: DEFAULT_ROW("instagram"),
    youtube: DEFAULT_ROW("youtube"),
    tiktok: DEFAULT_ROW("tiktok"),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Load current audience for all platforms
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .in("platform", PLATFORMS);

      if (!alive) return;

      if (!error && data) {
        const next = { ...rows };
        for (const p of PLATFORMS) {
          const hit = (data as any[]).find((r) => r.platform === p);
          if (hit) {
            next[p] = {
              platform: p,
              gender: hit.gender ?? DEFAULT_ROW(p).gender,
              age_bands: hit.age_bands ?? DEFAULT_ROW(p).age_bands,
              countries: hit.countries ?? DEFAULT_ROW(p).countries,
              cities: hit.cities ?? DEFAULT_ROW(p).cities,
            };
          }
        }
        setRows(next);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setGender = (platform: Platform, men: number) => {
    setRows((prev) => {
      const menClamped = clamp0to100(men);
      const women = clamp0to100(100 - menClamped);
      return {
        ...prev,
        [platform]: {
          ...prev[platform],
          gender: { men: menClamped, women },
        },
      };
    });
  };

  const setAge = (
    platform: Platform,
    idx: number,
    field: "range" | "percentage",
    value: string
  ) => {
    setRows((prev) => {
      const list = [...(prev[platform].age_bands ?? [])];
      if (!list[idx]) list[idx] = { range: "", percentage: 0 };
      const next =
        field === "range"
          ? { ...list[idx], range: value }
          : { ...list[idx], percentage: clamp0to100(value) };
      list[idx] = next;
      return { ...prev, [platform]: { ...prev[platform], age_bands: list } };
    });
  };

  const setCountry = (
    platform: Platform,
    idx: number,
    field: "country" | "percentage",
    value: string
  ) => {
    setRows((prev) => {
      const list = [...(prev[platform].countries ?? [])];
      if (!list[idx]) list[idx] = { country: "", percentage: 0 };
      const next =
        field === "country"
          ? { ...list[idx], country: value }
          : { ...list[idx], percentage: clamp0to100(value) };
      list[idx] = next;
      return { ...prev, [platform]: { ...prev[platform], countries: list } };
    });
  };

  const setCities = (platform: Platform, value: string) => {
    const arr = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    setRows((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], cities: arr },
    }));
  };

  // Build payload for upsert
  const buildPayload = useMemo(() => {
    return (user_id: string) =>
      PLATFORMS.map((p) => ({
        user_id, // ✅ required by schema
        platform: p,
        gender: rows[p].gender ?? null,
        age_bands: rows[p].age_bands ?? null,
        countries: rows[p].countries ?? null,
        cities: rows[p].cities ?? null,
        updated_at: new Date().toISOString(),
      }));
  }, [rows]);

  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const {
        data: { user },
        error: meErr,
      } = await supabase.auth.getUser();
      if (meErr) throw meErr;
      if (!user?.id) throw new Error("No authenticated user.");

      const payload = buildPayload(user.id);

      const { error } = await supabase
        .from("platform_audience")
        .upsert(payload, { onConflict: "user_id,platform" });

      if (error) throw error;

      setMsg("Audience demographics saved ✅");
      // tell public hooks to refetch
      tick();
    } catch (e: any) {
      setMsg(e?.message || "Failed to save audience demographics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <Globe size={16} className="text-neutral-700" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Audience Demographics (All Platforms)
          </h2>
        </div>

        <button
          onClick={saveAll}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PlatformCard
            icon={<Instagram size={16} className="text-pink-600" />}
            title="Instagram"
          >
            <PlatformEditor
              value={rows.instagram}
              onGender={(men) => setGender("instagram", men)}
              onAge={(i, f, v) => setAge("instagram", i, f, v)}
              onCountry={(i, f, v) => setCountry("instagram", i, f, v)}
              onCities={(v) => setCities("instagram", v)}
            />
          </PlatformCard>

          <PlatformCard
            icon={<Youtube size={16} className="text-red-600" />}
            title="YouTube"
          >
            <PlatformEditor
              value={rows.youtube}
              onGender={(men) => setGender("youtube", men)}
              onAge={(i, f, v) => setAge("youtube", i, f, v)}
              onCountry={(i, f, v) => setCountry("youtube", i, f, v)}
              onCities={(v) => setCities("youtube", v)}
            />
          </PlatformCard>

          <PlatformCard
            icon={<Music2 size={16} className="text-emerald-600" />}
            title="TikTok"
          >
            <PlatformEditor
              value={rows.tiktok}
              onGender={(men) => setGender("tiktok", men)}
              onAge={(i, f, v) => setAge("tiktok", i, f, v)}
              onCountry={(i, f, v) => setCountry("tiktok", i, f, v)}
              onCities={(v) => setCities("tiktok", v)}
            />
          </PlatformCard>
        </div>
      )}

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function PlatformCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function PlatformEditor({
  value,
  onGender,
  onAge,
  onCountry,
  onCities,
}: {
  value: AudienceRow;
  onGender: (men: number) => void;
  onAge: (idx: number, field: "range" | "percentage", value: string) => void;
  onCountry: (
    idx: number,
    field: "country" | "percentage",
    value: string
  ) => void;
  onCities: (value: string) => void;
}) {
  const men = clamp0to100(value.gender?.men ?? 0);
  const women = clamp0to100(value.gender?.women ?? 0);

  return (
    <div className="space-y-4">
      {/* Gender */}
      <div>
        <div className="mb-1 text-xs font-medium text-neutral-600">Gender</div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Men %"
            value={men.toString()}
            inputMode="numeric"
            onChange={(v) => onGender(Number(v))}
          />
          <Field
            label="Women %"
            value={women.toString()}
            inputMode="numeric"
            onChange={() => {}}
            disabled
          />
        </div>
      </div>

      {/* Age bands (5 rows) */}
      <div>
        <div className="mb-1 text-xs font-medium text-neutral-600">Age</div>
        <div className="space-y-2">
          {(value.age_bands ?? []).slice(0, 5).map((a, i) => (
            <div className="grid grid-cols-5 gap-2" key={i}>
              <input
                className="col-span-3 h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                value={a.range}
                onChange={(e) => onAge(i, "range", e.target.value)}
                placeholder="18-24"
              />
              <input
                className="col-span-2 h-9 rounded-md border border-neutral-300 px-3 text-right text-sm outline-none focus:border-neutral-500"
                value={String(a.percentage)}
                onChange={(e) => onAge(i, "percentage", e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Countries (5 rows) */}
      <div>
        <div className="mb-1 text-xs font-medium text-neutral-600">
          Top Countries
        </div>
        <div className="space-y-2">
          {(value.countries ?? []).slice(0, 5).map((c, i) => (
            <div className="grid grid-cols-5 gap-2" key={i}>
              <input
                className="col-span-3 h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                value={c.country}
                onChange={(e) => onCountry(i, "country", e.target.value)}
                placeholder="Australia"
              />
              <input
                className="col-span-2 h-9 rounded-md border border-neutral-300 px-3 text-right text-sm outline-none focus:border-neutral-500"
                value={String(c.percentage)}
                onChange={(e) => onCountry(i, "percentage", e.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div>
        <div className="mb-1 text-xs font-medium text-neutral-600">
          Top Cities
        </div>
        <input
          className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
          value={(value.cities ?? []).join(", ")}
          onChange={(e) => onCities(e.target.value)}
          placeholder="Gold Coast, Sydney, Los Angeles, Bali…"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <input
        className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        disabled={disabled}
      />
    </label>
  );
}
