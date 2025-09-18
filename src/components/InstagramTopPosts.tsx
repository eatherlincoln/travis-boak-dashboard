import React from "react";

type Props = {
  hideTitle?: boolean;
  /** Tailwind class to control the card height per row on desktop */
  rowHeightClass?: string; // e.g. "lg:h-[360px]"
};

const posts = [
  {
    id: 1,
    img: "/lovable-uploads/ig1.jpg",
    title: "Post 1",
    likes: "12.6K",
    comments: 320,
    reach: "88K",
    saves: 410,
  },
  {
    id: 2,
    img: "/lovable-uploads/ig2.jpg",
    title: "Post 2",
    likes: "9.7K",
    comments: 210,
    reach: "75K",
    saves: 302,
  },
  {
    id: 3,
    img: "/lovable-uploads/ig3.jpg",
    title: "Post 3",
    likes: "10.2K",
    comments: 245,
    reach: "81K",
    saves: 330,
  },
  {
    id: 4,
    img: "/lovable-uploads/ig4.jpg",
    title: "Post 4",
    likes: "8.9K",
    comments: 190,
    reach: "70K",
    saves: 280,
  },
];

export default function InstagramTopPosts({
  hideTitle,
  rowHeightClass = "lg:h-[360px]",
}: Props) {
  return (
    <div>
      {!hideTitle && (
        <h4 className="text-base md:text-lg font-semibold mb-3">
          Top Performing Instagram Posts
        </h4>
      )}

      {/* 2×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map((p) => (
          <div
            key={p.id}
            className={`${rowHeightClass} rounded-xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col`}
          >
            {/* Media fills remaining height */}
            <div className="relative flex-1">
              <img
                src={p.img}
                alt={p.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            {/* Meta */}
            <div className="p-4">
              <div className="font-medium mb-2">{p.title}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                <span>❤️ {p.likes}</span>
                <span>💬 {p.comments}</span>
                <span>📈 Reach: {p.reach}</span>
              </div>
              <div className="text-sm text-gray-700 mt-2">
                📌 Saves: {p.saves}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
