import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

const STEPS = [
  {
    title: "Find a product",
    body: "Browse the feed for products from merchants running an affiliate program.",
  },
  {
    title: "Apply from the product page",
    body: "Tap \"Become an affiliate for this product.\" Most merchants review applications within a day.",
  },
  {
    title: "Share your link",
    body: "Once approved, copy your personal link from your affiliate dashboard and share it however you like.",
  },
  {
    title: "Earn on every sale",
    body: "When someone buys through your link, you earn the commission rate the merchant set — automatically tracked.",
  },
];

export default function ForAffiliatesPage() {
  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <MarketingHeader />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:px-10">
        <p className="text-xs uppercase tracking-wide text-ink-500">For affiliates</p>
        <h1 className="mt-2 font-display text-4xl text-ink-50 sm:text-5xl">
          Earn commission on products you already recommend
        </h1>
        <p className="mt-4 max-w-lg text-base text-ink-300">
          No upfront cost, no inventory. Apply to a merchant&rsquo;s
          affiliate program, get your link, and earn a commission on every
          order it brings in.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 hover:bg-ink-100"
        >
          Get started
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

        <h2 className="mt-20 font-display text-2xl text-ink-50">Track everything</h2>
        <p className="mt-3 max-w-lg text-sm text-ink-400">
          Your affiliate dashboard shows pending, approved, and paid
          commissions, plus how many people clicked your links — all in
          one place, updated in real time.
        </p>

        <div className="mt-20 rounded-lg border border-ink-700 p-6 text-center">
          <p className="font-display text-xl text-ink-50">Ready to start earning?</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 hover:bg-ink-100"
          >
            Log in and apply
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </main>
  );
}
