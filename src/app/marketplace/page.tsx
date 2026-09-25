import { products as seedProducts, categories } from "@/lib/products";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import MarketplaceClient from "@/components/MarketplaceClient";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  try {
    const [row] = await db.select().from(cmsContent).where(eq(cmsContent.slug, "cms-products")).limit(1);
    
    if (row?.content) {
      const data = row.content as { products: Product[]; hidden: string[] };
      const customProducts = data.products || [];
      const hiddenIds = new Set(data.hidden || []);
      
      // Create maps for merging
      const customById = new Map(customProducts.map((c) => [c.id, c]));
      const seedById = new Map(seedProducts.map((s) => [s.id, s]));
      
      // Visible seeds with custom overrides
      const visibleSeeds = seedProducts
        .filter((s) => !hiddenIds.has(s.id))
        .map((s) => (customById.has(s.id) ? { ...s, ...customById.get(s.id)! } : s));
      
      // New custom products that aren't seed overrides
      const newCustoms = customProducts.filter((c) => !seedById.has(c.id));
      
      return [...newCustoms, ...visibleSeeds];
    }
  } catch (e) {
    console.error("Error loading products:", e);
  }
  
  return seedProducts;
}

export default async function MarketplacePage() {
  const products = await getProducts();
  return <MarketplaceClient products={products} categories={categories} />;
}
