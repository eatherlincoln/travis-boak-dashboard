import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@supabaseClient";

export default function AdminLayout({
  title = "Admin Dashboard",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              ← Back to site
            </Link>
            <h1 className="text-sm font-semibold text-neutral-900">{title}</h1>
          </div>
          <button
            onClick={signOut}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
