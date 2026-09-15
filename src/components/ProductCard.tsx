import Link from "next/link";
import Image from "next/image";
import { formatMRU } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  price_mru: number;
  category: string;
  heroImageUrl: string | null;
  storeName: string;
  hasVideo?: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded border border-ink-700 bg-ink-850 transition-colors hover:border-spark-500"
    >
      <div className="relative aspect-square w-full bg-ink-800">
        {product.heroImageUrl ? (
          <Image
            src={product.heroImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-500">
            No image
          </div>
        )}
        {product.hasVideo && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/80 text-ink-50">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1 0.5L9 5L1 9.5V0.5Z" />
            </svg>
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm text-ink-100">{product.name}</p>
        <p className="mt-0.5 truncate text-xs text-ink-400">
          {product.storeName}
        </p>
        <p className="mt-1 font-display text-base text-ink-50">
          {formatMRU(product.price_mru)}
        </p>
      </div>
    </Link>
  );
}
