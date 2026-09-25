import Link from "next/link";
export const dynamic = "force-dynamic";
export default function DestinationsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Explore Destinations</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Discover breathtaking destinations around the world</p>
        </div>
      </section>
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">Destinations are managed from the admin portal.</p>
          <Link href="/services/travel-trips" className="btn-primary px-6 py-3 inline-block mt-6">View Travel Packages</Link>
        </div>
      </section>
    </div>
  );
}
