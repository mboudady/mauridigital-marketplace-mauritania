import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-900 px-6 text-center text-sand-100">
      <p className="text-xs uppercase tracking-widest text-sand-500">
        Feed — Phase 2
      </p>
      <h1 className="mt-4 font-display text-3xl text-sand-50">
        The video feed isn&rsquo;t built yet.
      </h1>
      <p className="mt-3 max-w-sm text-sm text-sand-300">
        {productCount === 0
          ? "No products have been listed yet. Once merchants publish their first videos, they'll show up here."
          : `${productCount} product${productCount === 1 ? "" : "s"} in the catalog so far — the swipeable feed comes next.`}
      </p>
    </main>
  );
}
