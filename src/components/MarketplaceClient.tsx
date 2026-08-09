"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, TrendingUp, SlidersHorizontal, X, ShoppingBag, Tag, Star } from "lucide-react";
import type { Product, Category } from "@/lib/products";
import { mergeWithSeed } from "@/lib/contentStore";
import MarketplaceCard from "./MarketplaceCard";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "selling";

export default function MarketplaceClient({
  products: seed,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  // Merge seed catalogue with anything the admin has added / edited / hidden in localStorage.
  const products = useMemo(() => mergeWithSeed(seed, "products"), [seed]);

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const hotDeals = useMemo(() => products.filter((p) => p.comparePrice).slice(0, 4), [products]);
  const [dealIdx, setDealIdx] = useState(0);
  useEffect(() => {
    if (hotDeals.length === 0) return;
    const id = setInterval(() => setDealIdx((i) => (i + 1) % hotDeals.length), 5000);
    return () => clearInterval(id);
  }, [hotDeals.length]);

  // Hero background slideshow — cross-fades through a handful of product images.
  const heroImgs = useMemo(
    () => products.filter((p) => p.images?.[0]).slice(0, 6).map((p) => p.images[0]),
    [products],
  );
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (heroImgs.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % heroImgs.length), 4200);
    return () => clearInterval(id);
  }, [heroImgs.length]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== "all") list = list.filter((p) => p.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)),
      );
    }
    list = list.filter((p) => parseFloat(p.price) <= maxPrice);
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break;
      case "price-desc": list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "selling": list = [...list].sort((a, b) => b.sold - a.sold); break;
    }
    return list;
  }, [products, activeCat, query, sort, maxPrice]);

  const trending = useMemo(() => [...products].sort((a, b) => b.sold - a.sold).slice(0, 4), [products]);
  const featuredDeal = hotDeals[dealIdx];

  const reset = () => { setQuery(""); setActiveCat("all"); setSort("featured"); setMaxPrice(20000); };

  return (
    <div className="min-h-screen bg-[#fafaf7] relative">
      {/* Hero with background slideshow */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-900 text-white">
        {/* Slideshow */}
        <div className="absolute inset-0">
          {heroImgs.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
              style={{ opacity: i === slide ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  transform: i === slide ? "scale(1.08)" : "scale(1)",
                  transition: "transform 6s ease-out",
                }}
              />
            </div>
          ))}
          {/* Legibility wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-orange-300 font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-orange-400" /> Marketplace · {products.length} items in stock
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.92] mb-5">
              Everything you need,
              <br />
              <em className="text-orange-400">delivered today.</em>
            </h1>
            <p className="text-white/80 text-lg max-w-lg leading-relaxed">
              Phones, laptops, TVs, heavy machinery, kitchen appliances — one trusted catalogue with same-day pickup in Accra.
            </p>

            <div className="mt-8 relative max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brands, products, categories…"
                className="w-full pl-14 pr-28 py-4 rounded-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none ring-2 ring-transparent focus:ring-orange-400 transition text-base"
              />
              <button
                type="button"
                onClick={() => document.getElementById("grid")?.scrollIntoView({ behavior: "smooth" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500 transition-colors"
              >
                Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-white/60">Popular:</span>
              {["iPhone 15", "MacBook", "Air Fryer", "Wheel Loader", "Samsung TV"].map((s) => (
                <button key={s} onClick={() => setQuery(s)} className="px-3 py-1 rounded-full bg-white/10 text-white hover:bg-orange-500 transition-colors backdrop-blur-sm border border-white/10">
                  {s}
                </button>
              ))}
            </div>

            {/* slide dots */}
            <div className="mt-8 flex items-center gap-1.5">
              {heroImgs.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`h-1 rounded-full transition-all ${i === slide ? "w-10 bg-orange-400" : "w-3 bg-white/30"}`} />
              ))}
            </div>
          </div>

          {/* Deal of the day */}
          {featuredDeal && (
            <Link href={`/marketplace/${featuredDeal.slug}`} className="group relative block rounded-3xl overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-2xl aspect-[4/5] lg:aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredDeal.images[0]} alt={featuredDeal.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute top-5 left-5">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Deal of the day
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-widest text-orange-300 mb-2">{featuredDeal.brand}</p>
                <h3 className="font-display text-2xl mb-3 leading-tight">{featuredDeal.name}</h3>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-display text-3xl">GH₵{parseFloat(featuredDeal.price).toLocaleString()}</span>
                  {featuredDeal.comparePrice && <span className="text-white/50 line-through">GH₵{parseFloat(featuredDeal.comparePrice).toLocaleString()}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  {hotDeals.map((_, i) => (
                    <button key={i} onClick={(e) => { e.preventDefault(); setDealIdx(i); }} className={`h-1 rounded-full transition-all ${i === dealIdx ? "w-8 bg-orange-400" : "w-3 bg-white/30"}`} aria-label={`Deal ${i + 1}`} />
                  ))}
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Marquee */}
        <div className="relative border-t border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap py-3 text-sm animate-marquee">
            {[...trending, ...trending, ...trending].map((p, i) => (
              <span key={i} className="flex items-center gap-2 text-white/80">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-medium text-white">{p.name}</span>
                <span className="text-white/40">·</span>
                <span className="text-orange-300">GH₵{parseFloat(p.price).toLocaleString()}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-8">
          <div>
            <h3 className="font-display text-lg text-slate-900 mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Categories</h3>
            <div className="space-y-1">
              <button onClick={() => setActiveCat("all")} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${activeCat === "all" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                <span className="font-medium">All products</span>
                <span className={`text-xs ${activeCat === "all" ? "text-white/60" : "text-slate-400"}`}>{products.length}</span>
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.category === c.id).length;
                const active = activeCat === c.id;
                return (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                    <span className="flex items-center gap-2 font-medium"><span>{c.icon}</span>{c.name}</span>
                    <span className={`text-xs ${active ? "text-white/60" : "text-slate-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="font-display text-lg text-slate-900 mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Max price</h3>
            <input type="range" min={100} max={20000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>GH₵100</span>
              <span className="font-semibold text-slate-900">GH₵{maxPrice.toLocaleString()}</span>
            </div>
          </div>
          {(query || activeCat !== "all" || maxPrice < 20000) && (
            <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </aside>

        <main id="grid">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-2xl text-slate-900">{activeCat === "all" ? "All products" : categories.find((c) => c.id === activeCat)?.name}</h2>
              <span className="text-sm text-slate-500">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                {query && <> matching <span className="text-slate-900 font-medium">&ldquo;{query}&rdquo;</span></>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-orange-500">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="selling">Best selling</option>
              </select>
            </div>
          </div>

          {activeCat === "all" && !query && (
            <div className="mb-10">
              <h3 className="font-display text-xl text-slate-900 flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-orange-500" /> Trending now</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {trending.map((p, i) => (
                  <Link key={p.id} href={`/marketplace/${p.slug}`} className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">#{i + 1}</div>
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Star className="w-3 h-3 fill-orange-400 text-orange-400" /> {p.rating} · {p.sold.toLocaleString()} sold</p>
                      <p className="text-orange-600 font-bold mt-1">GH₵{parseFloat(p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-display text-2xl text-slate-900 mb-2">Nothing matches that search</p>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">Try a different keyword or widen the price range.</p>
              <button onClick={reset} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500 transition-colors">Clear filters</button>
            </div>
          ) : (
            <div key={`${activeCat}-${query}-${sort}-${maxPrice}`} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p, i) => (
                <div key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
                  <MarketplaceCard product={p} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
