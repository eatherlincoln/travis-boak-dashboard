// src/pages/Admin.tsx
import React from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLayout from "@/components/admin/AdminLayout";
import InstagramPostList from "@/components/admin/InstagramPostList";
import YouTubePostList from "@/components/admin/YouTubePostList"; // ← ensure this is here
import TikTokPostList from "@/components/admin/TikTokPostList";
import StatsForm from "@/components/admin/StatsForm";

export default function Admin() {
  return (
    <AdminGate>
      <AdminLayout title="Admin Dashboard">
        <div className="space-y-6">
          <section>
            <InstagramPostList />
          </section>
          <section>
            <YouTubePostList />
          </section>{" "}
          {/* ← include it */}
          <section>
            <TikTokPostList />
          </section>
          <section>
            <StatsForm />
          </section>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}
