// src/pages/Auth.tsx
import React, { useState } from "react";
import { supabase } from "@supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending link…");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/admin`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setStatus(error ? `Error: ${error.message}` : "Check your email ✉️");
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-[#f7f9fb]">
      <form
        onSubmit={sendMagicLink}
        className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm"
      >
        <h1 className="mb-3 text-lg font-semibold">Admin login</h1>
        <p className="mb-4 text-sm text-neutral-600">
          Enter your email and we’ll send a magic link.
        </p>

        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white"
        >
          Send magic link
        </button>

        {status && (
          <div className="mt-3 text-xs text-neutral-600">{status}</div>
        )}
      </form>
    </div>
  );
}
