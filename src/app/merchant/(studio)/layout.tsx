import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StudioTabs } from "@/components/StudioTabs";
import { MerchantSidebar } from "@/components/MerchantSidebar";

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
    .select("id, store_name, total_gmv, total_sales, verification_status, logo_url")
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
    <div className="min-h-screen bg-ink-950 text-ink-50 lg:flex">
      <MerchantSidebar />

      <div className="flex-1">
        <div className="safe-top border-b border-ink-800 px-4 pt-6 sm:px-8">
          <div className="mx-auto max-w-3xl lg:mx-0 lg:max-w-none">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-800 font-display text-lg">
                {merchant.logo_url ? (
                  <Image src={merchant.logo_url} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  merchant.store_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg leading-tight">{merchant.store_name}</p>
                <p className="text-xs text-ink-400">
                  {merchant.verification_status === "verified" ? "Verified" : "Unverified"}
                </p>
              </div>
              <Link
                href="/merchant/profile/edit"
                className="hidden rounded border border-ink-600 px-3 py-1.5 text-xs text-ink-100 lg:block"
              >
                Edit profile
              </Link>
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

            <div className="lg:hidden">
              <StudioTabs />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 lg:mx-0 lg:max-w-none lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
