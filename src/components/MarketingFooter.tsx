import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-5xl border-t border-ink-700 px-6 py-8 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-400">
        <span>© {new Date().getFullYear()} Souq</span>
        <nav className="flex flex-wrap gap-5">
          <Link href="/" className="hover:text-ink-50">Home</Link>
          <Link href="/for-merchants" className="hover:text-ink-50">For merchants</Link>
          <Link href="/for-affiliates" className="hover:text-ink-50">For affiliates</Link>
          <Link href="/login" className="hover:text-ink-50">Log in</Link>
          <Link href="/login?role=merchant" className="hover:text-ink-50">Open a store</Link>
        </nav>
      </div>
    </footer>
  );
}
