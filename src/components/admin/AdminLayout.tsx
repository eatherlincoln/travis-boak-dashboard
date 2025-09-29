// src/components/admin/AdminLayout.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function AdminLayout({
  title = "Admin",
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-content px-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 text-sm text-neutral-600">{subtitle}</p>
              )}
            </div>
            <Link
              to="/"
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-content px-4 py-6">
        <div className="space-y-8">{children}</div>
      </main>
    </div>
  );
}
