import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@supabaseClient";

type Props = {
  title?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode; // for page-level actions if you need them
};

export default function AdminLayout({
  title = "Admin Dashboard",
  children,
  rightSlot,
}: Props) {
  const onSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // send them back to site
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-content px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <ArrowLeft size={16} />
              <span>Back to site</span>
            </Link>

            <h1 className="ml-2 text-sm font-semibold text-neutral-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {rightSlot}
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="mx-auto max-w-content px-4 py-6">{children}</main>
    </div>
  );
}
