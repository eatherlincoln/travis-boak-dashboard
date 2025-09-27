import React from "react";

/** HERO */
import HeroSection from "@/components/HeroSection";

/** ABOUT */
import AboutSection from "@/components/AboutSection";

/** KPI row */
import KpiRow from "@/components/KpiRow";

/** PLATFORM HIGHLIGHTS */
import PlatformHighlights from "@/components/PlatformHighlights";

/** AUDIENCE (per-platform) */
import AudienceDemographics from "@/components/AudienceDemographics";

/** TOP CONTENT */
import InstagramTopPosts from "@/components/InstagramTopPosts";
import TopYouTubeContent from "@/components/TopYouTubeContent";

/** PARTNERSHIPS */
import PartnershipOpportunities from "@/components/PartnershipOpportunities";

export default function Index() {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* 1) Hero stays full-bleed */}
      <section className="relative">
        <HeroSection />
      </section>

      {/* 2) All page content shares the SAME centered width */}
      <main className="mx-auto max-w-content px-4">
        {/* About */}
        <section className="mt-section">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
            <AboutSection />
          </div>
        </section>

        {/* KPI Row */}
        <section className="mt-6">
          <KpiRow />
        </section>

        {/* Platform Highlights */}
        <section className="mt-6">
          <PlatformHighlights />
        </section>

        {/* Audience Demographics — one block per platform */}
        <section className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AudienceDemographics platform="instagram" />
            <AudienceDemographics platform="youtube" />
            <AudienceDemographics platform="tiktok" />
          </div>
        </section>

        {/* Top Content (IG + YT) */}
        <section className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-pink-500/80" />
                <h3 className="text-sm font-semibold text-neutral-800">
                  Top Performing Posts
                </h3>
              </div>
              <InstagramTopPosts />
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500/80" />
                <h3 className="text-sm font-semibold text-neutral-800">
                  Top Performing YouTube Content
                </h3>
              </div>
              <TopYouTubeContent />
            </div>
          </div>
        </section>

        {/* Partnerships */}
        <section className="mt-8 mb-12">
          <div className="rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-neutral-200 p-0 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Partnership Opportunities
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Partner with Sheldon Simkus — authentic lifestyle content,
                world-class surfing, and proven audience growth.
              </p>
            </div>
            <div className="p-6">
              <PartnershipOpportunities />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
