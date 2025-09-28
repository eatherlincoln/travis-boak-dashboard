import React from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLayout from "@/components/admin/AdminLayout";

import InstagramPostList from "@/components/admin/InstagramPostList";
import TikTokPostList from "@/components/admin/TikTokPostList";
import YouTubePostList from "@/components/admin/YouTubePostList";
import StatsForm from "@/components/admin/StatsForm";
import AudienceEditor from "@/components/admin/AudienceEditor";

export default function Admin() {
  return (
    <AdminGate>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-8">
          {/* Instagram */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InstagramPostList />
            <AudienceEditor platform="instagram" />
          </section>

          {/* YouTube */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <YouTubePostList />
            <AudienceEditor platform="youtube" />
          </section>

          {/* TikTok */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TikTokPostList />
            <AudienceEditor platform="tiktok" />
          </section>

          {/* Platform-level metrics (followers, monthly views, etc.) */}
          <section>
            <StatsForm />
          </section>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}
