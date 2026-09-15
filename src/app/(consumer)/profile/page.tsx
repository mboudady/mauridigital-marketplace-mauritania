import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-ink-100">
      {children}
    </span>
  );
}

function Row({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-ink-800 px-1 py-4 last:border-0"
    >
      <RowIcon>{icon}</RowIcon>
      <div className="flex-1">
        <p className="text-sm text-ink-50">{label}</p>
        {sub && <p className="text-xs text-ink-400">{sub}</p>}
      </div>
      <span className="text-ink-500">›</span>
    </Link>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: roles }, { data: merchant }] = await Promise.all([
    supabase.from("user_profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("merchants").select("id, store_name").eq("user_id", user.id).maybeSingle(),
  ]);

  const roleSet = new Set((roles ?? []).map((r) => r.role));
  const isAdmin = roleSet.has("admin") || roleSet.has("moderator");

  return (
    <main className="min-h-screen bg-ink-950 text-ink-50">
      <div className="safe-top mx-auto max-w-lg px-6 pt-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 font-display text-2xl">
            {(profile?.display_name ?? user.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg">
              {profile?.display_name ?? "Your account"}
            </p>
            <p className="text-xs text-ink-400">{user.email}</p>
          </div>
        </div>

        {merchant ? (
          <Link
            href="/merchant/dashboard"
            className="mt-6 block rounded border border-ink-700 bg-ink-850 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-ink-400">Your store</p>
            <p className="mt-1 font-display text-lg">{merchant.store_name}</p>
            <p className="mt-1 text-xs text-ink-50">Open dashboard →</p>
          </Link>
        ) : (
          <Link
            href="/onboarding"
            className="mt-6 block rounded border border-dashed border-ink-600 p-4 text-center text-sm text-ink-300"
          >
            Open a free store and start selling →
          </Link>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/cart"
            className="rounded border border-ink-700 bg-ink-850 p-4 text-center"
          >
            <p className="text-sm text-ink-50">Cart</p>
          </Link>
          <Link
            href="/orders"
            className="rounded border border-ink-700 bg-ink-850 p-4 text-center"
          >
            <p className="text-sm text-ink-50">Orders</p>
          </Link>
        </div>

        <div className="mt-2">
          <Row
            href="/saved"
            label="Saved"
            sub="Products you've bookmarked"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z" />
              </svg>
            }
          />
          <Row
            href="/messages"
            label="Messages"
            sub="Conversations with sellers"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12l2.5-7A1 1 0 017.4 4.5h9.2a1 1 0 01.9.6L20 12v6a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18v-6z" strokeLinejoin="round" />
              </svg>
            }
          />
          <Row
            href="/affiliate"
            label="Affiliate earnings"
            sub="Apply to programs, track commissions"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" />
              </svg>
            }
          />
          <Row
            href="/live"
            label="Live"
            sub="Livestreams from merchants you follow"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="6" width="13" height="12" rx="2" />
                <path d="M21 8.5l-5 3.5 5 3.5v-7z" strokeLinejoin="round" />
              </svg>
            }
          />
          {isAdmin && (
            <>
              <Row
                href="/admin/dashboard"
                label="Admin dashboard"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                }
              />
              <Row
                href="/admin/moderation"
                label="Moderation queue"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7l8-4z" strokeLinejoin="round" />
                  </svg>
                }
              />
            </>
          )}
        </div>

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}

function LogoutButton() {
  return (
    <a
      href="/auth/logout"
      className="block w-full rounded border border-ink-700 py-2.5 text-center text-sm text-ink-400 hover:bg-ink-850"
    >
      Log out
    </a>
  );
}
