"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { products, type Product } from "@/lib/products";
import MarketplaceCard from "@/components/MarketplaceCard";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ff_wishlist") || "[]") as string[];
      setFavoriteIds(stored);
    } catch {
      setFavoriteIds([]);
    }
    setLoading(false);
  }, []);

  const removeAll = () => {
    localStorage.removeItem("ff_wishlist");
    setFavoriteIds([]);
  };

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-500 font-semibold mb-2">Saved items</p>
              <h1 className="font-display text-4xl text-slate-900">Your Favorites</h1>
            </div>
            {favoriteIds.length > 0 && (
              <button
                onClick={removeAll}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        {loading ? (
          <p className="text-center text-slate-500 py-20 animate-pulse">Loading your saved items…</p>
        ) : favoriteIds.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-slate-900 mb-2">No favorites saved yet</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Click the heart icon on any product, car rental, or trip to save it here for later.
            </p>
            <Link href="/marketplace" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-6">Showing {favoriteProducts.length} saved marketplace product(s) and {favoriteIds.length - favoriteProducts.length} saved service(s)/car(s)/trip(s).</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteProducts.map((p) => (
                <MarketplaceCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
