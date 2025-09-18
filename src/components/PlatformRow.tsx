import React from "react";

const PlatformCard = ({
  name,
  followers,
  growth,
  views,
  highlight,
}: {
  name: string;
  followers: string;
  growth: string;
  views: string;
  highlight: string;
}) => (
  <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
    <div className="font-semibold mb-2">{name}</div>
    <div className="text-sm grid grid-cols-2 gap-y-1">
      <div className="text-muted-foreground">Followers:</div>
      <div className="font-medium">{followers}</div>
      <div className="text-muted-foreground">Growth:</div>
      <div className="font-medium">{growth}</div>
      <div className="text-muted-foreground">Monthly views:</div>
      <div className="font-medium">{views}</div>
    </div>
    <div className="mt-3 text-xs text-muted-foreground">{highlight}</div>
  </div>
);

export default function PlatformRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PlatformCard
        name="Instagram"
        followers="38.7K"
        growth="+2.3%"
        views="730.0K"
        highlight="3.0% engagement rate (above industry avg)."
      />
      <PlatformCard
        name="YouTube"
        followers="8.8K"
        growth="+4.1%"
        views="86.8K"
        highlight="POV surf content averaging 22k+ views per video."
      />
      <PlatformCard
        name="TikTok"
        followers="1.4K"
        growth="+18.5%"
        views="37.0K"
        highlight="Growing platform with high virality potential."
      />
    </div>
  );
}
