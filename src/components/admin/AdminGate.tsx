import React from "react";
import { useAuth } from "@/contexts/AuthContext";

type Props = { children: React.ReactNode };

export default function AdminGate({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-sm text-neutral-600">Checking admin access…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="card p-6">
          <h2 className="text-base font-semibold">Admin only</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Please sign in with your admin email to continue.
          </p>
          <a
            className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-white text-sm"
            href="/auth"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
