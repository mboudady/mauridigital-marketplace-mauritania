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
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 text-ink-100">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink-50">
          {isMerchant ? "Open your store" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-ink-300">
          {isMerchant
            ? "Sign in to set up your storefront on Souq."
            : "Sign in to keep discovering and buying."}
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded border border-ink-600 bg-ink-850 p-4 text-sm text-ink-100">
            Check <span className="text-ink-50">{email}</span> for a sign-in
            link. It expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm text-ink-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-ink-50 placeholder:text-ink-500 focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded bg-spark-500 px-4 py-2.5 text-sm font-medium text-ink-50 transition-colors hover:bg-spark-400 disabled:opacity-60"
            >
              {status === "sending" ? "Sending link…" : "Send sign-in link"}
            </button>

            <p className="text-xs text-ink-500">
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
