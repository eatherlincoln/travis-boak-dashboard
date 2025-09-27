// src/pages/Admin.tsx
import React from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLayout from "@/components/admin/AdminLayout";

import InstagramPostList from "@/components/admin/InstagramPostList";
import TikTokPostList from "@/components/admin/TikTokPostList";
import YouTubePostList from "@/components/admin/YouTubePostList"; // NEW
import DemographicsForm from "@/components/admin/DemographicsForm"; // NEW
import StatsForm from "@/components/admin/StatsForm";

function PlatformSection({
  title,
  postsEditor,
  platform,
}: {
  title: string;
  postsEditor: React.ReactNode;
  platform: "instagram" | "youtube" | "tiktok";
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-neutral-900">{title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Posts */}
        <div>{postsEditor}</div>

        {/* Right: Demographics editor for this platform */}
        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-800">
            Demographics
          </h3>
          <DemographicsForm platform={platform} />
        </div>
      </div>
    </section>
  );
}

export default function Admin() {
  return (
    <AdminGate>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-6">
          <PlatformSection
            title="Instagram"
            postsEditor={<InstagramPostList />}
            platform="instagram"
          />

          <PlatformSection
            title="YouTube"
            postsEditor={<YouTubePostList />}
            platform="youtube"
          />

          <PlatformSection
            title="TikTok"
            postsEditor={<TikTokPostList />}
            platform="tiktok"
          />

          {/* Global stats row */}
          <section>
            <StatsForm />
          </section>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}
