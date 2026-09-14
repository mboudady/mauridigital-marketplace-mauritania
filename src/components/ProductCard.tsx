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
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded border border-indigo-700 bg-indigo-800 transition-colors hover:border-indigo-500"
    >
      <div className="relative aspect-square w-full bg-indigo-700">
        {product.heroImageUrl ? (
          <Image
            src={product.heroImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-sand-500">
            No image
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm text-sand-100">{product.name}</p>
        <p className="mt-0.5 truncate text-xs text-sand-400">
          {product.storeName}
        </p>
        <p className="mt-1 font-display text-base text-sand-50">
          {formatMRU(product.price_mru)}
        </p>
      </div>
    </Link>
  );
}
