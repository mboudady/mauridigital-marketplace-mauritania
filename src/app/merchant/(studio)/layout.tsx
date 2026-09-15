import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudioTabs } from "@/components/StudioTabs";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=merchant");

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, store_name, total_gmv, total_sales, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) redirect("/onboarding");

  const [{ count: productCount }, { count: followerCount }] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchant.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchant.id),
  ]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <div className="safe-top border-b border-ink-800 px-4 pt-6 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 font-display text-lg">
              {merchant.store_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg leading-tight">{merchant.store_name}</p>
              <p className="text-xs text-ink-400">
                {merchant.verification_status === "verified" ? "Verified" : "Unverified"}
              </p>
            </div>
          </div>

          <dl className="mt-4 flex gap-6 text-sm">
            <div>
              <dd className="font-display text-base">{productCount ?? 0}</dd>
              <dt className="text-xs text-ink-400">Posts</dt>
            </div>
            <div>
              <dd className="font-display text-base">{followerCount ?? 0}</dd>
              <dt className="text-xs text-ink-400">Followers</dt>
            </div>
            <div>
              <dd className="font-display text-base">{merchant.total_sales ?? 0}</dd>
              <dt className="text-xs text-ink-400">Orders</dt>
            </div>
            <div>
              <dd className="font-display text-base">{(merchant.total_gmv ?? 0).toLocaleString()}</dd>
              <dt className="text-xs text-ink-400">GMV (MRU)</dt>
            </div>
          </dl>

          <StudioTabs />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">{children}</div>
    </div>
  );
}
