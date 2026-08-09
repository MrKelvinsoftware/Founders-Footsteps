import { ArrowRight, Star, Shield, Headphones, Clock, CheckCircle, Home, Car, Utensils, Plane, Scissors, Truck, Wrench, ShoppingBag, Heart, Building2 } from "lucide-react";
import Link from "next/link";
import RequestQuoteModal from "@/components/RequestQuoteModal";

export default function HomePage() {
  const serviceLines = [
    { name: "Construction & Real Estate", slug: "construction", icon: Home, color: "#6b7280", description: "From foundation to finish - new builds, renovations, and home improvements", features: ["New Home Construction", "Kitchen & Bathroom Renovation", "Full Home Remodeling"] },
    { name: "Car Services", slug: "car-rental", icon: Car, color: "#3b82f6", description: "Premium car rental and quality pre-owned vehicle sales", features: ["Luxury & Economy Rentals", "Certified Pre-Owned Sales", "24/7 Roadside Assistance"] },
    { name: "Catering & Events", slug: "catering-events", icon: Utensils, color: "#f59e0b", description: "Unforgettable celebrations with premium catering and full event planning", features: ["Wedding Planning", "Corporate Events", "Custom Menus"] },
    { name: "Global Logistics", slug: "logistics", icon: Truck, color: "#10b981", description: "Reliable shipping and logistics solutions worldwide", features: ["International Shipping", "Warehousing", "Express Delivery"] },
    { name: "Tech Repairs", slug: "tech-repairs", icon: Wrench, color: "#8b5cf6", description: "Expert repair services for all your devices and electronics", features: ["Phone & Tablet Repair", "Laptop Fix", "Screen Replacement"] },
    { name: "Travel & Trips", slug: "travel-trips", icon: Plane, color: "#06b6d4", description: "Curated travel packages and unforgettable experiences worldwide", features: ["Flight Bookings", "Hotel Reservations", "Tour Packages"] },
    { name: "Salon & Beauty", slug: "salon-beauty", icon: Scissors, color: "#d946ef", description: "Premium salon services to help you look and feel your best", features: ["Hair Styling & Coloring", "Spa Treatments", "Bridal Packages"] },
    { name: "Online Marketplace", slug: "marketplace", icon: ShoppingBag, color: "#ef4444", description: "Shop electronics, appliances, fashion, and more", features: ["Laptops & Phones", "TVs & Appliances", "Fast Delivery"] },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[750px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-white/90 mb-6"><CheckCircle className="w-5 h-5" /><span className="font-medium">One Trusted Brand. Every Service You Need.</span></div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">Build Your Dreams.<br />Manage Your Business.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Enjoy Your Life.</span></h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">Founders & Footsteps is the ultimate all-in-one digital destination. One trusted brand that handles everything from foundation to finish.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="/services/construction" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">Start Your Project <ArrowRight className="w-5 h-5" /></Link>
              <Link href="/marketplace" className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Shop Marketplace</Link>
            </div>
            <div className="flex justify-center">
              <RequestQuoteModal topic="General Inquiry" buttonLabel="Or get a custom quote" className="px-6 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-all backdrop-blur-sm" variant="outline" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Vision</h2>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-12">To build a world where nobody has to stress over finding reliable services. We want Founders & Footsteps to be the ultimate, all-in-one digital destination.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"><Home className="w-10 h-10 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Build Dreams</h3><p className="text-white/80">Construction, renovation, and real estate</p></div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"><Building2 className="w-10 h-10 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Manage Business</h3><p className="text-white/80">Logistics, tech repairs, and event planning</p></div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"><Heart className="w-10 h-10 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Enjoy Life</h3><p className="text-white/80">Travel, beauty, cars, and shopping</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Everything Under One Roof</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">One Company. Eight Service Lines.</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">Why juggle multiple vendors when one trusted brand can handle it all?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {serviceLines.map((service) => (
              <Link key={service.slug} href={service.slug === "marketplace" ? "/marketplace" : `/services/${service.slug}`} className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: service.color }} />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg" style={{ backgroundColor: `${service.color}15` }}>
                  <service.icon className="w-8 h-8" style={{ color: service.color }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
                <p className="text-slate-600 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => <li key={i} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{feature}</li>)}
                </ul>
                <div className="flex items-center gap-2" style={{ color: service.color }}><span className="font-semibold">Learn More</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">The Power of One</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "One Trusted Brand", description: "No more juggling multiple vendors." },
              { icon: CheckCircle, title: "Quality Guaranteed", description: "Every service meets our high standards." },
              { icon: Clock, title: "Save Time & Stress", description: "One account, one bill, one point of contact." },
              { icon: Headphones, title: "24/7 Support", description: "Our dedicated team is always here to help." },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6"><feature.icon className="w-8 h-8 text-blue-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Kwame Mensah", rating: 5, comment: "Founders & Footsteps built our dream home and handled everything!", service: "Construction" },
              { name: "Ama Osei", rating: 5, comment: "I planned my entire wedding through their events team — all in one place!", service: "Events & Travel" },
              { name: "David Boateng", rating: 5, comment: "From shipping my goods to repairing my laptop — one company, zero stress.", service: "Logistics & Tech" },
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-slate-700 mb-6 italic">&quot;{testimonial.comment}&quot;</p>
                <div><p className="font-bold text-slate-900">{testimonial.name}</p><p className="text-sm text-slate-500">{testimonial.service}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to Experience the Future?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">Join thousands of Ghanaians who have simplified their lives with Founders & Footsteps.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg">Create Free Account</Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
