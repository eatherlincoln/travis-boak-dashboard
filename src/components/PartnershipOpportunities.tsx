import React from "react";

export default function PartnershipOpportunities() {
  const Tile = ({
    n,
    title,
    body,
  }: {
    n: number;
    title: string;
    body: string;
  }) => (
    <div className="rounded-lg bg-white/10 border border-white/20 p-4 md:p-6">
      <h4 className="font-semibold text-white mb-2">
        {n}. {title}
      </h4>
      <p className="text-white/90 text-sm leading-relaxed">{body}</p>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-br from-sky-500 to-cyan-600 p-5 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
          Partnership Opportunities
        </h2>
        <p className="text-white/90 text-center max-w-4xl mx-auto mb-6 md:mb-8">
          Partner with Travis Boak — a rising force in surf media whose
          authentic lifestyle content and world-class AFL'ing consistently
          engage audiences. With proven performance metrics and a loyal
          following, Travis delivers both reach and real impact.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <Tile
            n={1}
            title="Content Collaborations"
            body="Custom video and photo content with your brand naturally integrated into Travis' lifestyle."
          />
          <Tile
            n={2}
            title="Brand Ambassador"
            body="Ongoing partnerships putting your products front and center across platforms and surf career."
          />
          <Tile
            n={3}
            title="Event & Travel Integration"
            body="Leverage trips and competitions to position your brand in premium, culturally relevant moments."
          />
          <Tile
            n={4}
            title="Custom Campaigns"
            body="Tailored programs that align with specific goals—launches, demographics, or multi-platform buzz."
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Authentic Audience",
            "Growing Revenue",
            "Multi-Platform Reach",
            "Professional Content",
          ].map((t) => (
            <span
              key={t}
              className="bg-white/15 text-white rounded-full text-sm px-3 py-1 border border-white/25"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
