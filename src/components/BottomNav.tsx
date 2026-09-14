"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h2l1.5 10.5a1.5 1.5 0 001.5 1.3h8a1.5 1.5 0 001.5-1.3L20 8H6.5"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.3" fill="currentColor" />
      <circle cx="17" cy="21" r="1.3" fill="currentColor" />
    </svg>
  );
}

function OrdersIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4.5" y="4" width="15" height="17" rx="1.5" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
    </svg>
  );
}

const TABS = [
  { href: "/feed", label: "Home", Icon: HomeIcon },
  { href: "/search", label: "Discover", Icon: SearchIcon },
  { href: "/cart", label: "Cart", Icon: CartIcon },
  { href: "/orders", label: "Orders", Icon: OrdersIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function refresh() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setCartCount(0);
        return;
      }
      const count = await getCartCount(supabase, user.id);
      if (active) setCartCount(count);
    }

    refresh();
    window.addEventListener("cart:updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("cart:updated", refresh);
    };
  }, [pathname]);

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-indigo-800 bg-indigo-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-sand-50" : "text-sand-500"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px]">{label}</span>
              {href === "/cart" && cartCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[9px] text-sand-50">
                  {cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
