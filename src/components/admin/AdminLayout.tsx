import React from "react";
import { Link } from "react-router-dom";

export default function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-content px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-semibold">{title}</h1>
          <Link
            to="/"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-content px-4 py-6">
        <div className="grid grid-cols-1 gap-6">{children}</div>
      </main>
    </div>
  );
}
