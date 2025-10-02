// src/components/admin/AdminLayout.tsx
import React from "react";

export default function AdminLayout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-content px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-neutral-900">
              {title ?? "Admin"}
            </h1>
            <a
              href="/"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Back to site
            </a>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
