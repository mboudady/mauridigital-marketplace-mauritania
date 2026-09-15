"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCartCount } from "@/lib/cart";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1v-9"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
      <path d="M20 20l-4.35-4.35" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 10a6 6 0 1112 0c0 3.2 1 4.8 1.7 5.6.3.3.1.9-.3.9H4.6c-.4 0-.6-.6-.3-.9C5 14.8 6 13.2 6 10z"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M9.5 19a2.5 2.5 0 005 0"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
      <path d="M4.5 20c1.2-3.8 4.2-6 7.5-6s6.3 2.2 7.5 6" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
    </svg>
  );
}

const SIDE_TABS = [
  { href: "/feed", label: "Home", Icon: HomeIcon },
  { href: "/search", label: "Discover", Icon: SearchIcon },
];
const RIGHT_TABS = [
  { href: "/notifications", label: "Inbox", Icon: InboxIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function refresh() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setCartCount(0);
          setUnreadCount(0);
          setIsMerchant(false);
        }
        return;
      }
      const [count, { count: notifCount }, { data: merchant }] = await Promise.all([
        getCartCount(supabase, user.id),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
        supabase.from("merchants").select("id").eq("user_id", user.id).maybeSingle(),
      ]);
      if (active) {
        setCartCount(count);
        setUnreadCount(notifCount ?? 0);
        setIsMerchant(!!merchant);
      }
    }

    refresh();
    window.addEventListener("cart:updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("cart:updated", refresh);
    };
  }, [pathname]);

  function handleCreate() {
    router.push(isMerchant ? "/merchant/products/new" : "/onboarding");
  }

  return (
    <nav className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {SIDE_TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-ink-50" : "text-ink-500"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleCreate}
          aria-label={isMerchant ? "Add a product" : "Open a store"}
          className="flex h-9 w-12 items-center justify-center rounded-lg bg-ink-50 text-ink-950"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {RIGHT_TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const badge = href === "/notifications" ? unreadCount : href === "/profile" ? cartCount : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-ink-50" : "text-ink-500"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px]">{label}</span>
              {badge > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-50 px-1 text-[9px] text-ink-950">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="safe-bottom" />
    </nav>
  );
}
