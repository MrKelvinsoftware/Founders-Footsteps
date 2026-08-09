import { notFound } from "next/navigation";
import { getProduct, getRelated, categories } from "@/lib/products";
import Link from "next/link";
import { Star, Shield, Truck, RotateCcw, ChevronRight, CheckCircle2 } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const cat = categories.find((c) => c.id === product.category);
  const related = getRelated(product, 4);
  const discount = product.comparePrice ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link><ChevronRight className="w-3 h-3" />
          <Link href="/marketplace" className="hover:text-slate-900">Marketplace</Link><ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 truncate">{product.name}</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl p-6 lg:p-10 border border-slate-200/70">
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100"><img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /></div>
            {discount > 0 && <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-{discount}%</span>}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-2"><span>{cat?.icon}</span><span>{cat?.name}</span>{product.brand && <><span className="text-slate-300">·</span><span className="text-slate-700 font-semibold">{product.brand}</span></>}</div>
            <h1 className="font-display text-3xl md:text-4xl text-slate-900 leading-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map((i) => <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}<span className="ml-1 text-sm font-semibold text-slate-900">{product.rating}</span></div>
              <span className="text-sm text-slate-500">({product.reviews} reviews)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl text-orange-600">GH₵{parseFloat(product.price).toLocaleString()}</span>
              {product.comparePrice && <span className="text-lg text-slate-400 line-through">GH₵{parseFloat(product.comparePrice).toLocaleString()}</span>}
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>
            {product.specs && product.specs.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-3">
                {product.specs.map((s) => <div key={s.label} className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"><p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p><p className="text-sm font-semibold text-slate-900">{s.value}</p></div>)}
              </div>
            )}
            <div className="flex items-center gap-2 mb-6 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> In stock ({product.inStock ?? "many"})</div>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <AddToCartButton product={product} />
              <Link href="/cart" className="px-6 py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 text-center">Buy now</Link>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
              <div className="text-center"><Truck className="w-5 h-5 mx-auto text-slate-600 mb-1" /><p className="text-xs text-slate-600">Free delivery over GH₵500</p></div>
              <div className="text-center"><Shield className="w-5 h-5 mx-auto text-slate-600 mb-1" /><p className="text-xs text-slate-600">Genuine warranty</p></div>
              <div className="text-center"><RotateCcw className="w-5 h-5 mx-auto text-slate-600 mb-1" /><p className="text-xs text-slate-600">7-day returns</p></div>
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-slate-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/marketplace/${p.slug}`} className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="aspect-square overflow-hidden bg-slate-100"><img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <div className="p-3"><p className="text-sm font-semibold text-slate-900 line-clamp-1">{p.name}</p><p className="text-orange-600 font-bold mt-1">GH₵{parseFloat(p.price).toLocaleString()}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
