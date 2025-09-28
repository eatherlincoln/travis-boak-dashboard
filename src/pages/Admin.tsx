import React from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLayout from "@/components/admin/AdminLayout";
import InstagramPostList from "@/components/admin/InstagramPostList";
import YouTubePostList from "@/components/admin/YouTubePostList";
import TikTokPostList from "@/components/admin/TikTokPostList";
// (Keep StatsForm if you use it)

function Admin() {
  return (
    <AdminGate>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-6">
          <section>
            <InstagramPostList />
          </section>
          <section>
            <YouTubePostList />
          </section>
          <section>
            <TikTokPostList />
          </section>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export default Admin;
