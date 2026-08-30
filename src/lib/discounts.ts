import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

export type StorefrontDiscount = {
  id: string;
  name: string;
  code: string | null;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minimum_subtotal: number;
  combinable: boolean;
  badge: string;
};

export async function getStorefrontDiscounts(): Promise<StorefrontDiscount[]> {
  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_discounts",
      SUPABASE_URL,
    );
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 30, tags: ["storefront-discounts"] },
    });
    if (!response.ok) return [];
    return (await response.json()) as StorefrontDiscount[];
  } catch {
    return [];
  }
}
