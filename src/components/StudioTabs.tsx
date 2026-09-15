"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/merchant/dashboard", label: "Overview" },
  { href: "/merchant/products", label: "Content" },
  { href: "/merchant/orders", label: "Orders" },
  { href: "/merchant/analytics", label: "Analytics" },
  { href: "/merchant/affiliates", label: "Affiliates" },
  { href: "/merchant/messages", label: "Messages" },
];

export function StudioTabs() {
  const pathname = usePathname();

  return (
    <div className="no-scrollbar mt-5 flex gap-6 overflow-x-auto">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 border-b-2 pb-3 text-sm ${
              active
                ? "border-ink-50 text-ink-50"
                : "border-transparent text-ink-400"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
