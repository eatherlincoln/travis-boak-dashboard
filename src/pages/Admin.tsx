import React from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLayout from "@/components/admin/AdminLayout";

import AudienceGlobalEditor from "@/components/admin/AudienceGlobalEditor";
import StatsForm from "@/components/admin/StatsForm";
import InstagramPostList from "@/components/admin/InstagramPostList";
import YouTubePostList from "@/components/admin/YouTubePostList";
import TikTokPostList from "@/components/admin/TikTokPostList";

export default function Admin() {
  return (
    <AdminGate>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-6">
          {/* 1) Demographics (single record) */}
          <section>
            <AudienceGlobalEditor />
          </section>

          {/* 2) Platform metrics (followers, monthly views, engagement) */}
          <section>
            <StatsForm />
          </section>

          {/* 3) IG top posts */}
          <section>
            <InstagramPostList />
          </section>

          {/* 4) YouTube top posts */}
          <section>
            <YouTubePostList />
          </section>

          {/* 5) TikTok top posts */}
          <section>
            <TikTokPostList />
          </section>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}
