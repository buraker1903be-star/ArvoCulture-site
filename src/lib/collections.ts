import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";

export type StorefrontCollection = {
  title: string;
  slug: string;
  description: string;
  menu_group: string;
  product_count: number;
};

export const getStorefrontCollections = cache(
  async (): Promise<StorefrontCollection[]> =>
    rpcOrEmpty<StorefrontCollection>(
      "get_arvoculture_storefront_collections",
      {},
      { revalidate: 60, tags: ["storefront-collections"] },
    ),
);
