import React from "react";

/**
 * Borderless, subtle-shadow card. Includes profile image
 * from /public/sheldon-profile.png and three small “badge” chips.
 * Extra top margin so it never collides with the banner.
 */
export default function AboutSection() {
  return (
    <section className="container mx-auto px-4 md:px-6 mt-6 md:mt-8">
      <div className="rounded-xl shadow-sm bg-white">
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            {/* Profile */}
            <img
              src="/sheldon-profile.png"
              alt="Sheldon Simkus"
              className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover ring-2 ring-white/80 shadow-sm"
            />

            {/* Text */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                About Sheldon
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Sheldon Simkus is a professional surfer with a proven global
                reach, a trusted voice in surf culture, and a track record of
                delivering measurable value for partners. His ability to combine
                high-performance surfing with authentic, creative storytelling
                has established him as a unique content creator whose work
                consistently generates strong exposure and ROI.
              </p>

              {/* Chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs md:text-sm">
                  Professional Surfer
                </span>
                <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs md:text-sm">
                  Content Creator
                </span>
                <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs md:text-sm">
                  Global Influencer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
