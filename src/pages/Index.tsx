import React from "react";

import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import KpiRow from "../components/KpiRow";
import PlatformRow from "../components/PlatformRow";
import AudienceChart from "../components/AudienceChart";
import InstagramTopPosts from "../components/InstagramTopPosts";
import TopYouTubeContent from "../components/TopYouTubeContent";
import PartnershipOpportunities from "../components/PartnershipOpportunities";

export default function Index() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <HeroSection />
      <AboutSection />

      <section className="container mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <KpiRow />
      </section>

      <section className="container mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <PlatformRow />
      </section>

      <section className="container mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <AudienceChart />
      </section>

      {/* Top Content */}
      <section className="container mx-auto px-4 md:px-6 mt-8 md:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              Top Performing Instagram Posts
            </h3>
            {/* rowHeightClass makes the two rows on the left equal the two video cards on the right */}
            <InstagramTopPosts hideTitle rowHeightClass="lg:h-[360px]" />
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-4">
              Top Performing YouTube Content
            </h3>
            <TopYouTubeContent hideTitle rowHeightClass="lg:h-[360px]" />
          </div>
        </div>
      </section>

      {/* Partnerships footer now padded via container */}
      <section className="container mx-auto px-4 md:px-6 mt-10 md:mt-12">
        <PartnershipOpportunities />
      </section>
    </main>
  );
}
