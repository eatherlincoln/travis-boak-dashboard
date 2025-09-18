import React from "react";

/**
 * Full-width banner with image, soft overlay, title/subtitle,
 * and two compact stat pills. No external UI deps.
 */
export default function HeroSection() {
  return (
    <section className="relative w-full">
      {/* Background image */}
      <div
        className="h-[360px] md:h-[440px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png')",
        }}
      />
      {/* Dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Text content */}
      <div className="absolute inset-0">
        <div className="container mx-auto h-full px-4 md:px-6 flex flex-col justify-end pb-8 md:pb-10">
          <h1 className="text-white text-3xl md:text-5xl font-bold drop-shadow-sm">
            Sheldon Simkus
          </h1>
          <p className="mt-2 text-white/90 text-base md:text-lg drop-shadow-sm">
            Professional Surfer &amp; Content Creator
          </p>

          {/* Pills */}
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center rounded-full bg-white/15 text-white px-3 py-1 text-xs md:text-sm backdrop-blur-sm">
              854K Monthly Views
            </span>
            <span className="inline-flex items-center rounded-full bg-white/15 text-white px-3 py-1 text-xs md:text-sm backdrop-blur-sm">
              48,910 Total Reach
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
