import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyMerchant(formData: FormData) {
  "use server";
  const merchantId = formData.get("merchantId") as string;
  const supabase = await createClient();
  await supabase
    .from("merchants")
    .update({ verification_status: "verified", verified_at: new Date().toISOString() })
    .eq("id", merchantId);
  revalidatePath("/admin/dashboard");
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isAdmin = roles?.some((r) => r.role === "admin");

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand-50 text-indigo-900">
        <p className="text-sm text-sand-500">
          This account doesn&rsquo;t have admin access.
        </p>
      </main>
    );
  }

  const { data: merchants } = await supabase
    .from("merchants")
    .select("id, store_name, category, verification_status, total_gmv, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-indigo-900 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl">Merchants</h1>
        <p className="mt-1 text-sm text-sand-500">
          {merchants?.length ?? 0} total
        </p>

        <table className="mt-8 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sand-300 text-sand-500">
              <th className="py-2 font-medium">Store</th>
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">GMV</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {merchants?.map((m) => (
              <tr key={m.id} className="border-b border-sand-200">
                <td className="py-3">{m.store_name}</td>
                <td className="py-3 text-sand-600">{m.category}</td>
                <td className="py-3">
                  <span
                    className={
                      m.verification_status === "verified"
                        ? "text-indigo-500"
                        : "text-sand-500"
                    }
                  >
                    {m.verification_status}
                  </span>
                </td>
                <td className="py-3">{m.total_gmv} MRU</td>
                <td className="py-3 text-right">
                  {m.verification_status !== "verified" && (
                    <form action={verifyMerchant}>
                      <input type="hidden" name="merchantId" value={m.id} />
                      <button
                        type="submit"
                        className="rounded border border-indigo-300 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                      >
                        Verify
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!merchants?.length && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sand-400">
                  No merchants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
