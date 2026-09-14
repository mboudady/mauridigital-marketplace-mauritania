"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const isMerchant = params.get("role") === "merchant";
  const next = isMerchant ? "/onboarding" : "/feed";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-indigo-900 px-6 text-sand-100">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-sand-50">
          {isMerchant ? "Open your store" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-sand-300">
          {isMerchant
            ? "Sign in to set up your storefront on Souq."
            : "Sign in to keep discovering and buying."}
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded border border-indigo-600 bg-indigo-800 p-4 text-sm text-sand-200">
            Check <span className="text-sand-50">{email}</span> for a sign-in
            link. It expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm text-sand-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded border border-indigo-600 bg-indigo-800 px-3 py-2 text-sand-50 placeholder:text-sand-500 focus:border-sand-400 focus:outline-none focus:ring-1 focus:ring-sand-400"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-clay-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded bg-clay-500 px-4 py-2.5 text-sm font-medium text-sand-50 transition-colors hover:bg-clay-400 disabled:opacity-60"
            >
              {status === "sending" ? "Sending link…" : "Send sign-in link"}
            </button>

            <p className="text-xs text-sand-500">
              Phone sign-in with SMS codes is coming soon for Mauritanian
              numbers. Email works today.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
