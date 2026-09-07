import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";

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

export const getStorefrontDiscounts = cache(
  async (): Promise<StorefrontDiscount[]> =>
    rpcOrEmpty<StorefrontDiscount>(
      "get_arvoculture_storefront_discounts",
      {},
      { revalidate: 30, tags: ["storefront-discounts"] },
    ),
);
