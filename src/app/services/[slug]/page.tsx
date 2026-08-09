import Link from "next/link";
import AdvancedBookingForm from "@/components/AdvancedBookingForm";
export const dynamic = "force-dynamic";
export default async function ServiceLinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="min-h-screen">
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 capitalize">{slug.replace(/-/g, " ")}</h1>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <AdvancedBookingForm serviceLineSlug={slug} />
        </div>
      </section>
    </div>
  );
}
