import { products, categories } from "@/lib/products";
import MarketplaceClient from "@/components/MarketplaceClient";

export const dynamic = "force-dynamic";

export default function MarketplacePage() {
  return <MarketplaceClient products={products} categories={categories} />;
}
