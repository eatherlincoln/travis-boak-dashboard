import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "@supabaseClient";
import { Button } from "@/components/ui/button";

/**
 * A clean, consistent admin shell:
 * - Light grey background
 * - Centered 7xl container
 * - Top bar with "Back to site" and Sign out
 * - Section spacing handled here so children can be simple
 */
export default function AdminLayout({
  title = "Admin Dashboard",
  subtitle = "Manage your platform statistics",
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-dvh bg-[#f7f9fb]">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              ← Back to site
            </Link>
            <div className="h-4 w-px bg-neutral-200" />
            <div>
              <div className="text-sm font-semibold text-neutral-900">
                {title}
              </div>
              <div className="text-xs text-neutral-500 -mt-0.5">{subtitle}</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* standard vertical rhythm for all sections */}
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
