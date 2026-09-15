import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      <div className="mx-auto flex max-w-5xl flex-col px-6 pb-24 pt-10 sm:px-10">
        <header className="flex items-center justify-between">
          <span className="font-display text-xl tracking-tight">Souq</span>
          <nav className="flex items-center gap-6 text-sm text-ink-100">
            <Link href="/login" className="hover:text-ink-50">
              Log in
            </Link>
            <Link
              href="/login?role=merchant"
              className="rounded bg-spark-500 px-4 py-2 text-ink-50 transition-colors hover:bg-spark-400"
            >
              Sell on Souq
            </Link>
          </nav>
        </header>

        <section className="mt-20 grid gap-12 sm:mt-32 sm:grid-cols-5 sm:items-end">
          <div className="sm:col-span-3">
            <h1 className="font-display text-5xl leading-[1.05] text-ink-50 sm:text-6xl">
              Watch a product.
              <br />
              Trust the seller.
              <br />
              <span className="italic text-ink-300">Buy in a tap.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-300">
              Souq brings Nouakchott&rsquo;s boutiques and sellers into one
              video feed — the products people already discover on WhatsApp
              and Instagram, now with real checkout, delivery tracking, and
              reviews you can trust.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/login"
                className="rounded bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-ink-100"
              >
                Start browsing
              </Link>
              <Link
                href="/login?role=merchant"
                className="text-sm text-ink-100 underline decoration-ink-500 underline-offset-4 hover:text-ink-50"
              >
                Open a store, free
              </Link>
            </div>
          </div>

          <div className="sm:col-span-2">
            <dl className="grid grid-cols-2 gap-6 border-t border-ink-600 pt-6 text-ink-300 sm:grid-cols-1">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">
                  Commission
                </dt>
                <dd className="font-display text-2xl text-ink-50">7%</dd>
                <dd className="text-xs text-ink-400">paid only on sales</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">
                  Delivery
                </dt>
                <dd className="font-display text-2xl text-ink-50">
                  Nouakchott
                </dd>
                <dd className="text-xs text-ink-400">
                  first, then nationwide
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
