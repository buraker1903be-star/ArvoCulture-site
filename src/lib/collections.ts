import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

export type StorefrontCollection = {
  title: string;
  slug: string;
  description: string;
  menu_group: string;
  product_count: number;
};

export async function getStorefrontCollections(): Promise<StorefrontCollection[]> {
  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_collections",
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
      next: { revalidate: 60, tags: ["storefront-collections"] },
    });
    if (!response.ok) return [];
    return (await response.json()) as StorefrontCollection[];
  } catch {
    return [];
  }
}
