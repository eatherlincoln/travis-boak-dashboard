import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Instagram, Youtube, Music2, Users, Eye, Heart } from "lucide-react";

type Row = { label: string; value: string; icon?: React.ReactNode };

function PlatformCard({
  icon,
  title,
  rows,
}: {
  icon: React.ReactNode;
  title: string;
  rows: Row[];
}) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            {r.icon}
            <span className="w-40 text-gray-500">{r.label}</span>
            <span className="font-medium text-gray-800">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function PlatformHighlights() {
  return (
    <section className="py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlatformCard
          icon={<Instagram className="h-4 w-4 text-pink-500" />}
          title="Instagram"
          rows={[
            {
              label: "Followers",
              value: "38.7K",
              icon: <Users className="h-3.5 w-3.5" />,
            },
            {
              label: "Monthly views",
              value: "730.0K",
              icon: <Eye className="h-3.5 w-3.5" />,
            },
            {
              label: "Engagement",
              value: "2.01%",
              icon: <Heart className="h-3.5 w-3.5" />,
            },
          ]}
        />
        <PlatformCard
          icon={<Youtube className="h-4 w-4 text-red-500" />}
          title="YouTube"
          rows={[
            {
              label: "Subscribers",
              value: "8.8K",
              icon: <Users className="h-3.5 w-3.5" />,
            },
            {
              label: "Monthly views",
              value: "86.8K",
              icon: <Eye className="h-3.5 w-3.5" />,
            },
          ]}
        />
        <PlatformCard
          icon={<Music2 className="h-4 w-4 text-black" />}
          title="TikTok"
          rows={[
            {
              label: "Followers",
              value: "1.4K",
              icon: <Users className="h-3.5 w-3.5" />,
            },
            {
              label: "Monthly views",
              value: "37.0K",
              icon: <Eye className="h-3.5 w-3.5" />,
            },
          ]}
        />
      </div>
    </section>
  );
}
