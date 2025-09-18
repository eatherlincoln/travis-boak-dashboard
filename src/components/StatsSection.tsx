import React from "react";

export default function StatsSection() {
  const stats = [
    { label: "Total Reach", value: "48,910", change: "+2.3%" },
    { label: "Monthly Views", value: "854K", change: "+15.7%" },
    { label: "Engagement Rate", value: "2.01%", change: "+0.5%" },
    { label: "Weekly Growth", value: "+2.3%", change: "+2.3%" },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-6 text-center flex flex-col"
        >
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
          <span className="text-green-600 text-sm mt-1">{stat.change}</span>
        </div>
      ))}
    </section>
  );
}
