import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

const STEPS = [
  {
    title: "Open your store",
    body: "Sign in with your email, name your store, and pick a category. Takes under a minute.",
  },
  {
    title: "Post your products",
    body: "Add photos or a short video, set your price and stock, and publish. It shows up in the feed right away.",
  },
  {
    title: "Get paid",
    body: "Customers order and pay cash on delivery for now. You keep your margin — Souq only takes 7% when you actually sell.",
  },
];

const FEATURES = [
  { title: "Video-first listings", body: "Products with video get more views than photos alone." },
  { title: "Order management", body: "Confirm, ship, and track every order from one dashboard." },
  { title: "Direct messages", body: "Answer customer questions without leaving the app." },
  { title: "Affiliate program", body: "Let creators promote your products for a commission you set." },
  { title: "Analytics", body: "See views, conversion, and top products at a glance." },
  { title: "No upfront cost", body: "Free to join, free to list. You only pay when you sell." },
];

export default function ForMerchantsPage() {
  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <MarketingHeader />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:px-10">
        <p className="text-xs uppercase tracking-wide text-ink-500">For merchants</p>
        <h1 className="mt-2 font-display text-4xl text-ink-50 sm:text-5xl">
          Sell where people already discover you
        </h1>
        <p className="mt-4 max-w-lg text-base text-ink-300">
          Free to join. Post products with photos or video. Pay a 7%
          commission only on what you actually sell — no listing fees, no
          monthly cost.
        </p>
        <Link
          href="/login?role=merchant"
          className="mt-8 inline-block rounded bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 hover:bg-ink-100"
        >
          Open your store, free
        </Link>

        <h2 className="mt-20 font-display text-2xl text-ink-50">How it works</h2>
        <ol className="mt-6 space-y-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-600 font-display text-sm">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-ink-50">{s.title}</p>
                <p className="mt-1 text-sm text-ink-400">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-20 font-display text-2xl text-ink-50">What you get</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <p className="font-medium text-ink-50">{f.title}</p>
              <p className="mt-1 text-sm text-ink-400">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-lg border border-ink-700 p-6 text-center">
          <p className="font-display text-xl text-ink-50">Ready to post your first product?</p>
          <Link
            href="/login?role=merchant"
            className="mt-4 inline-block rounded bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 hover:bg-ink-100"
          >
            Open your store
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </main>
  );
}
