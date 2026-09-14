import Link from "next/link";

export function ConsumerNav({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-indigo-700 bg-indigo-900/95 px-6 py-3 text-sand-100 backdrop-blur sm:px-10">
      <Link href="/feed" className="font-display text-lg">
        Souq
      </Link>
      <div className="flex items-center gap-5 text-sm text-sand-300">
        <Link href="/search" className="hover:text-sand-50">
          Search
        </Link>
        <Link href="/orders" className="hover:text-sand-50">
          Orders
        </Link>
        <Link href="/cart" className="relative hover:text-sand-50">
          Cart
          {cartCount > 0 && (
            <span className="absolute -right-3 -top-2 rounded-full bg-clay-500 px-1.5 py-0.5 text-[10px] text-sand-50">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
