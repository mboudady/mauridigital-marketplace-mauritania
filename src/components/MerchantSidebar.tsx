"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const SECTIONS = [
  {
    items: [
      { href: "/merchant/dashboard", label: "Overview", d: "M4 11.5L12 4l8 7.5M6 10v9a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1v-9" },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: "/merchant/products", label: "Content", d: "M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v13A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5v-13zM8 8h8M8 12h8M8 16h5" },
      { href: "/merchant/orders", label: "Orders", d: "M4.5 4h15v17l-3-2-2.5 2-2.5-2-2.5 2-2.5-2-2 2V4z" },
      { href: "/merchant/messages", label: "Messages", d: "M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v7A2.5 2.5 0 0117.5 15H10l-4 3.5V15H6.5A2.5 2.5 0 014 12.5v-7z" },
    ],
  },
  {
    title: "Grow",
    items: [
      { href: "/merchant/analytics", label: "Analytics", d: "M4 20V10M10 20V4M16 20v-7M4 20h16" },
      { href: "/merchant/affiliates", label: "Affiliate", d: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
    ],
  },
];

export function MerchantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-ink-800 bg-ink-950 px-3 py-6 lg:flex">
      <Link href="/feed" className="px-2 font-display text-lg text-ink-50">
        Souq <span className="text-xs font-sans text-ink-500">Studio</span>
      </Link>

      <nav className="mt-6 flex flex-col gap-5">
        {SECTIONS.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-ink-500">
                {section.title}
              </p>
            )}
            <div className="mt-1 flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                      active ? "bg-ink-800 font-medium text-ink-50" : "text-ink-300 hover:bg-ink-900"
                    }`}
                  >
                    <Icon d={item.d} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-ink-800 pt-4">
        <Link href="/merchant/profile/edit" className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-ink-900">
          Store settings
        </Link>
        <Link href="/feed" className="rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-900">
          ← Back to app
        </Link>
      </div>
    </aside>
  );
}
