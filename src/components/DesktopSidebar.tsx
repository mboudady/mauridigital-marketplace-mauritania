"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCartCount } from "@/lib/cart";

const NAV = [
  { href: "/feed", label: "Home" },
  { href: "/search", label: "Discover" },
  { href: "/live", label: "Live" },
  { href: "/notifications", label: "Inbox" },
  { href: "/profile", label: "Profile" },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [isMerchant, setIsMerchant] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [count, { data: merchant }, { data: profile }] = await Promise.all([
        getCartCount(supabase, user.id),
        supabase.from("merchants").select("id").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setCartCount(count);
      setIsMerchant(!!merchant);
      setDisplayName(profile?.display_name ?? null);
    })();
  }, [pathname]);

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-ink-800 bg-ink-950 px-4 py-6 lg:flex">
      <Link href="/feed" className="px-2 font-display text-xl text-ink-50">
        Souq
      </Link>

      <div className="mt-2 px-2">
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-full border border-ink-600 px-3 py-2 text-sm text-ink-400"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Search
        </Link>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                active ? "bg-ink-800 font-medium text-ink-50" : "text-ink-300 hover:bg-ink-900"
              }`}
            >
              {item.label}
              {item.href === "/notifications" && cartCount > 0 && (
                <span className="text-xs text-ink-500">{cartCount}</span>
              )}
            </Link>
          );
        })}
        <Link
          href="/cart"
          className={`rounded-lg px-3 py-2.5 text-sm ${
            pathname === "/cart" ? "bg-ink-800 font-medium text-ink-50" : "text-ink-300 hover:bg-ink-900"
          }`}
        >
          Cart{cartCount > 0 ? ` (${cartCount})` : ""}
        </Link>
        <Link
          href="/orders"
          className={`rounded-lg px-3 py-2.5 text-sm ${
            pathname === "/orders" ? "bg-ink-800 font-medium text-ink-50" : "text-ink-300 hover:bg-ink-900"
          }`}
        >
          Orders
        </Link>
      </nav>

      <button
        onClick={() => router.push(isMerchant ? "/merchant/products/new" : "/onboarding")}
        className="mt-6 rounded-lg bg-ink-50 px-4 py-2.5 text-sm font-medium text-ink-950"
      >
        {isMerchant ? "+ New post" : "Open a store"}
      </button>

      <div className="mt-auto px-2 text-xs text-ink-500">
        {displayName ? (
          <Link href="/profile" className="hover:text-ink-300">
            {displayName}
          </Link>
        ) : (
          <Link href="/login" className="hover:text-ink-300">
            Log in
          </Link>
        )}
      </div>
    </aside>
  );
}
