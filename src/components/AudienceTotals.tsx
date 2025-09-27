import React from "react";
import { useFollowerTotals } from "../hooks";

export default function AudienceTotals() {
  const { totals } = useFollowerTotals();

  return (
    <div className="admin-card rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Audience Totals</h2>
      {totals ? (
        <>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-semibold">
                {totals.instagram_followers}
              </div>
              <div className="text-xs text-neutral-500">Instagram</div>
            </div>
            <div>
              <div className="text-xl font-semibold">
                {totals.youtube_subscribers}
              </div>
              <div className="text-xs text-neutral-500">YouTube</div>
            </div>
            <div>
              <div className="text-xl font-semibold">
                {totals.tiktok_followers}
              </div>
              <div className="text-xs text-neutral-500">TikTok</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Last updated {new Date(totals.updated_at).toLocaleDateString()}
          </p>
        </>
      ) : (
        <p className="text-sm text-neutral-500">No totals found.</p>
      )}
    </div>
  );
}
