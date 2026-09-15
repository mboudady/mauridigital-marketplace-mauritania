import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-10 sm:px-10">
      <Link href="/" className="font-display text-xl tracking-tight text-ink-50">
        Souq
      </Link>
      <nav className="flex items-center gap-6 text-sm text-ink-100">
        <Link href="/for-merchants" className="hover:text-ink-50">
          For merchants
        </Link>
        <Link href="/for-affiliates" className="hover:text-ink-50">
          For affiliates
        </Link>
        <Link href="/login" className="hover:text-ink-50">
          Log in
        </Link>
        <Link
          href="/login?role=merchant"
          className="rounded bg-ink-50 px-4 py-2 text-ink-950 transition-colors hover:bg-ink-200"
        >
          Sell on Souq
        </Link>
      </nav>
    </header>
  );
}
