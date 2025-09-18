import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ExternalLink, Play } from "lucide-react";

const ig = [
  {
    img: "/lovable-uploads/18016eb8-2534-4985-b632-e025251442b2.png",
    likes: "12.4K",
    comments: "238",
    link: "#",
  },
  {
    img: "/lovable-uploads/593bbc81-f03e-419e-a492-8024f176fd1a.png",
    likes: "9.8K",
    comments: "121",
    link: "#",
  },
  {
    img: "/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png",
    likes: "8.1K",
    comments: "95",
    link: "#",
  },
];

const yt = {
  title: "POV Snapper Rocks – First Swell",
  videoId: "INJLrBxBHHc",
  views: "116K views",
  thumb: "https://img.youtube.com/vi/INJLrBxBHHc/mqdefault.jpg",
};

export default function TopContent() {
  return (
    <section className="py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* IG grid */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts (Instagram)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ig.map((p, i) => (
              <a
                key={i}
                href={p.link}
                className="group relative block rounded-lg overflow-hidden"
              >
                <img
                  src={p.img}
                  className="aspect-square object-cover w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ExternalLink className="absolute top-2 left-2 h-4 w-4 text-white/90" />
                <div className="absolute bottom-2 left-2 text-white text-xs">
                  ❤️ {p.likes} · 💬 {p.comments}
                </div>
              </a>
            ))}
          </CardContent>
        </Card>

        {/* YT row */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing YouTube Content</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              className="block rounded-lg overflow-hidden group"
              href={`https://www.youtube.com/watch?v=${yt.videoId}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="aspect-video relative">
                <img
                  src={yt.thumb}
                  alt={yt.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white/90" />
              </div>
              <div className="p-3">
                <div className="font-medium text-sm">{yt.title}</div>
                <div className="text-xs text-gray-500">{yt.views}</div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
