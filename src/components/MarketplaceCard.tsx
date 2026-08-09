"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Star, Heart, Check } from "lucide-react";
import type { Product } from "@/lib/products";

export default function MarketplaceCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("ff_cart") || "[]");
    const existing = cart.find((i: { id: string }) => i.id === product.id);
    if (existing) { existing.quantity += 1; } else {
      cart.push({ id: product.id, name: product.name, slug: product.slug, price: parseFloat(product.price), quantity: 1, image: product.images?.[0] ?? "" });
    }
    localStorage.setItem("ff_cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wl = JSON.parse(localStorage.getItem("ff_wishlist") || "[]") as string[];
    if (wl.includes(product.id)) {
      localStorage.setItem("ff_wishlist", JSON.stringify(wl.filter((id) => id !== product.id)));
      setWishlisted(false);
    } else {
      wl.push(product.id);
      localStorage.setItem("ff_wishlist", JSON.stringify(wl));
      setWishlisted(true);
    }
  };

  const discount = product.comparePrice ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 relative">
      <Link href={`/marketplace/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-100">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">-{discount}%</span>}
      </Link>
      <button onClick={toggleWishlist} className={`absolute top-2 right-2 w-8 h-8 rounded-full shadow flex items-center justify-center transition-all z-10 ${wishlisted ? "bg-red-500 text-white" : "bg-white text-slate-600 hover:bg-red-50 hover:text-red-500"}`}>
        <Heart className={`w-4 h-4 ${wishlisted ? "fill-white" : ""}`} />
      </button>
      <div className="p-3">
        <Link href={`/marketplace/${product.slug}`}>
          <h3 className="font-medium text-slate-900 mb-1 line-clamp-2 text-sm h-10 hover:text-orange-600 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-slate-900">{product.rating}</span>
          <span className="text-xs text-slate-500">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-orange-600">GH₵{parseFloat(product.price).toLocaleString()}</span>
          {product.comparePrice && <span className="text-slate-400 line-through text-xs">GH₵{parseFloat(product.comparePrice).toLocaleString()}</span>}
        </div>
        <button onClick={addToCart} className={`w-full py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${added ? "bg-emerald-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
          {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
