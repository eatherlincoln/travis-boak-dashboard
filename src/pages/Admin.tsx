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
      <AdminLayout
        title="Admin Dashboard"
        subtitle="Demographics → Metrics → Top content"
      >
        <section>
          <AudienceGlobalEditor />
        </section>

        <section>
          <StatsForm />
        </section>

        <section>
          <InstagramPostList />
        </section>

        <section>
          <YouTubePostList />
        </section>

        <section>
          <TikTokPostList />
        </section>
      </AdminLayout>
    </AdminGate>
  );
}
