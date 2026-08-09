import Link from "next/link";
export default function DealsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95]">Deals worth leaving the house for.</h1>
        </div>
      </section>
      <div className="container mx-auto px-4 py-12">
        <p className="text-slate-500 text-center py-20">Check back soon for amazing deals.</p>
      </div>
    </div>
  );
}
