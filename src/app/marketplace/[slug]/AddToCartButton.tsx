"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { ShoppingCart, Check } from "lucide-react";

type CartItem = { id: string; name: string; slug: string; price: number; quantity: number; image: string };

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const cart: CartItem[] = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("ff_cart") || "[]" : "[]");
    const existing = cart.find((i) => i.id === product.id);
    if (existing) { existing.quantity += 1; } else {
      cart.push({ id: product.id, name: product.name, slug: product.slug, price: parseFloat(product.price), quantity: 1, image: product.images[0] });
    }
    localStorage.setItem("ff_cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button onClick={handleAdd} className={`flex-1 px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${added ? "bg-emerald-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
      {added ? <><Check className="w-5 h-5" /> Added to cart</> : <><ShoppingCart className="w-5 h-5" /> Add to cart</>}
    </button>
  );
}
