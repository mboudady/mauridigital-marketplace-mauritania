import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type CartItem = {
  product_id: string;
  variant_id: string | null;
  quantity: number;
};

type AnySupabase = SupabaseClient<Database>;

export async function getCartItems(
  supabase: AnySupabase,
  userId: string
): Promise<CartItem[]> {
  const { data } = await supabase
    .from("cart")
    .select("items")
    .eq("user_id", userId)
    .maybeSingle();

  return ((data?.items as CartItem[] | null) ?? []).filter(
    (i) => i.quantity > 0
  );
}

export async function getCartCount(
  supabase: AnySupabase,
  userId: string
): Promise<number> {
  const items = await getCartItems(supabase, userId);
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export async function setCartItems(
  supabase: AnySupabase,
  userId: string,
  items: CartItem[]
) {
  const cleaned = items.filter((i) => i.quantity > 0);
  const { error } = await supabase
    .from("cart")
    .upsert({ user_id: userId, items: cleaned }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function addToCart(
  supabase: AnySupabase,
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number
) {
  const items = await getCartItems(supabase, userId);
  const existing = items.find(
    (i) => i.product_id === productId && i.variant_id === variantId
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ product_id: productId, variant_id: variantId, quantity });
  }
  await setCartItems(supabase, userId, items);
}

export async function updateCartQuantity(
  supabase: AnySupabase,
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number
) {
  const items = await getCartItems(supabase, userId);
  const next = items
    .map((i) =>
      i.product_id === productId && i.variant_id === variantId
        ? { ...i, quantity }
        : i
    )
    .filter((i) => i.quantity > 0);
  await setCartItems(supabase, userId, next);
}
