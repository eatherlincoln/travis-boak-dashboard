import React from "react";

export default function Index() {
  // quick helpers
  const formatK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n);

  // demo numbers (we’ll wire Supabase later)
  const totals = {
    followers: 48986,
    views: 443000,
    igER: 0.0201,
    weekly: 0.023,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <header className="relative h-[56vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          // swap to your image path if needed
          style={{
            backgroundImage:
              "url(/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-4xl font-bold sm:text-5xl">Sheldon Simkus</h1>
          <p className="mt-2 text-base sm:text-lg opacity-90">
            Professional Surfer and Content Creator
          </p>

          {/* small badges under hero */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              {formatK(totals.views)} Total Views
            </span>
            <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              {totals.followers.toLocaleString()} Total Followers
            </span>
          </div>

          {/* actions (placeholders) */}
          <div className="mt-5 flex gap-3">
            <button className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
              Refresh Stats
            </button>
            <a
              href="/auth"
              className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* About */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row">
            <img
              src="/lovable-uploads/593bbc81-f03e-419e-a492-8024f176fd1a.png"
              alt="Sheldon Simkus"
              className="h-24 w-24 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">About Sheldon</h2>
              <p className="mt-2 text-sm text-slate-600">
                Sheldon Simkus is a professional surfer with proven global
                reach, a trusted voice in surf culture, and a track record of
                delivering measurable value for partners. He combines
                high-performance surfing with authentic storytelling that drives
                exposure and ROI.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  Professional Surfer
                </span>
                <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
                  Content Creator
                </span>
                <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs text-purple-700">
                  Global Influencer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Reach",
              value: totals.followers.toLocaleString(),
              sub: "Cross-platform followers",
            },
            {
              title: "Monthly Views",
              value: `${formatK(totals.views)}`,
              sub: "Combined platforms",
            },
            {
              title: "Engagement Rate",
              value: `${(totals.igER * 100).toFixed(2)}%`,
              sub: "Instagram (latest)",
            },
            { title: "Weekly Growth", value: "+2.3%", sub: "Last 7 days" },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm text-slate-500">{c.title}</div>
              <div className="mt-2 text-2xl font-semibold">{c.value}</div>
              <div className="mt-1 text-xs text-slate-500">{c.sub}</div>
            </div>
          ))}
        </section>

        {/* Platform grid placeholders */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["Instagram", "YouTube", "TikTok"].map((p) => (
            <div
              key={p}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 text-sm font-medium">{p}</div>
              <div className="h-36 rounded-md bg-slate-100" />
            </div>
          ))}
        </section>

        {/* Audience + Top content placeholders */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium">Audience Demographics</h3>
          <div className="mt-3 h-40 rounded-md bg-slate-100" />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium">Top Performing Posts</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-slate-100"
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium">Top Performing YouTube</h3>
            <div className="mt-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-video rounded-md bg-slate-100" />
              ))}
            </div>
          </div>
        </section>

        {/* Partnerships */}
        <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="mb-2 text-center text-xl font-bold text-sky-900">
            Partnership Opportunities
          </h2>
          <p className="mx-auto max-w-3xl text-center text-sky-900/80">
            Align with Sheldon’s authentic audience and professional content
            across multiple platforms.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              "Content Collaborations",
              "Brand Ambassador",
              "Event & Travel Integration",
              "Custom Campaigns",
            ].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-white/60 bg-white/70 p-4"
              >
                <div className="font-medium text-sky-900">{t}</div>
                <div className="mt-1 text-sm text-sky-900/80">
                  Placeholder description (we’ll refine later).
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
