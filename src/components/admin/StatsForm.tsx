import React, { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { BarChart2, Instagram, Youtube, Music2 } from "lucide-react";

/**
 * Table: platform_stats
 * Columns (expected):
 * - platform: text (PK/unique)
 * - followers: bigint / numeric / int
 * - monthly_views: bigint / numeric / int
 * - engagement: numeric (e.g., 2.01 for 2.01%)
 *
 * We read the latest row per platform (or 1 row if unique),
 * show pretty inputs, and upsert all at once with onConflict: "platform".
 */

type StatRow = {
  platform: "instagram" | "youtube" | "tiktok";
  followers: number | null;
  monthly_views: number | null;
  engagement: number | null; // store as percent (2.01 means 2.01%)
};

const PLATFORMS: StatRow["platform"][] = ["instagram", "youtube", "tiktok"];

const emptyRow = (platform: StatRow["platform"]): StatRow => ({
  platform,
  followers: null,
  monthly_views: null,
  engagement: null,
});

// numeric helpers
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

export default function StatsForm() {
  const { tick } = useRefreshSignal();

  // state per platform
  const [rows, setRows] = useState<Record<StatRow["platform"], StatRow>>({
    instagram: emptyRow("instagram"),
    youtube: emptyRow("youtube"),
    tiktok: emptyRow("tiktok"),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // load once
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      // pull all three in one request
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .in("platform", PLATFORMS);

      if (!alive) return;

      if (!error && data) {
        const next = { ...rows };
        for (const p of PLATFORMS) {
          const hit = data.find((d: any) => d.platform === p);
          if (hit) {
            next[p] = {
              platform: p,
              followers: hit.followers ?? null,
              monthly_views: hit.monthly_views ?? null,
              engagement: hit.engagement ?? null,
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

  const setField = (
    platform: StatRow["platform"],
    key: keyof Omit<StatRow, "platform">,
    val: string
  ) => {
    setRows((prev) => {
      const current = prev[platform];
      const next: StatRow = {
        ...current,
        [key]: key === "engagement" ? toFloat(val) : toInt(val),
      };
      return { ...prev, [platform]: next };
    });
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = PLATFORMS.map((p) => rows[p]);
      const { error } = await supabase
        .from("platform_stats")
        .upsert(payload, { onConflict: "platform" });

      if (error) throw error;

      setMsg("Metrics saved ✅");
      tick(); // so public KPI hooks refresh
    } catch (e: any) {
      setMsg(e?.message || "Failed to save metrics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
            <BarChart2 size={16} className="text-neutral-700" />
          </span>
          <h2 className="text-sm font-semibold text-neutral-900">
            Platform Metrics
          </h2>
        </div>
        <button
          onClick={saveAll}
          disabled={saving || loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* 3 columns, one per platform */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PlatformCard
          icon={<Instagram size={16} className="text-pink-600" />}
          title="Instagram"
          row={rows.instagram}
          onChange={setField}
          disabled={loading}
        />
        <PlatformCard
          icon={<Youtube size={16} className="text-red-600" />}
          title="YouTube"
          row={rows.youtube}
          onChange={setField}
          disabled={loading}
        />
        <PlatformCard
          icon={<Music2 size={16} className="text-emerald-600" />}
          title="TikTok"
          row={rows.tiktok}
          onChange={setField}
          disabled={loading}
        />
      </div>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function PlatformCard({
  icon,
  title,
  row,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  row: StatRow;
  onChange: (
    platform: StatRow["platform"],
    key: keyof Omit<StatRow, "platform">,
    val: string
  ) => void;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>

      <div className="space-y-3">
        <Field
          label="Followers"
          placeholder="e.g. 38700"
          value={row.followers ?? ""}
          onChange={(v) => onChange(row.platform, "followers", v)}
          disabled={disabled}
          alignRight
        />
        <Field
          label="Monthly views"
          placeholder="e.g. 730000"
          value={row.monthly_views ?? ""}
          onChange={(v) => onChange(row.platform, "monthly_views", v)}
          disabled={disabled}
          alignRight
        />
        <Field
          label="Engagement"
          placeholder="e.g. 2.01"
          suffix="%"
          value={row.engagement ?? ""}
          onChange={(v) => onChange(row.platform, "engagement", v)}
          disabled={disabled}
          alignRight
        />
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  disabled,
  alignRight,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  alignRight?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative">
        <input
          className={[
            "h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500",
            alignRight ? "pr-8 text-right" : "",
          ].join(" ")}
          placeholder={placeholder}
          inputMode="numeric"
          value={value as any}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
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
