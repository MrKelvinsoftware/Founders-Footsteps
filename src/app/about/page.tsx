import Link from "next/link";
import { ArrowRight, Target, Lightbulb, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">About Founders & Footsteps</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            One platform, endless possibilities. We&apos;re redefining how you experience multiple services under one roof.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
              <p className="text-lg text-slate-600 mb-6">
                Founded with a vision to simplify life&apos;s complexities, Founders & Footsteps emerged from the realization that modern consumers need a unified platform for diverse services.
              </p>
              <p className="text-lg text-slate-600 mb-6">
                What started as a small travel booking service has evolved into a comprehensive platform offering Car Rental, Car Sales, Catering & Events, Construction, Travel & Trips, Salon & Beauty services, and a thriving Marketplace.
              </p>
              <p className="text-lg text-slate-600">
                Our mission is simple: provide exceptional service across all verticals while maintaining the personal touch that makes every customer feel valued.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Our Team"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Customer First</h3>
              <p className="text-slate-600">
                Every decision we make starts with our customers&apos; needs and satisfaction.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Innovation</h3>
              <p className="text-slate-600">
                We continuously evolve our platform to deliver cutting-edge solutions.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Integrity</h3>
              <p className="text-slate-600">
                Transparency and honesty form the foundation of all our relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">250K+</div>
              <p className="text-white/80">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">6</div>
              <p className="text-white/80">Service Lines</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-white/80">Countries Served</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <p className="text-white/80">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Leadership Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Meet the visionaries behind Founders & Footsteps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Founder & CEO", role: "Founder & CEO, Founders & Footsteps — Apex Lifestyle Syndicate", image: "/images/logo.svg", initials: "MR.Phrimpong Kelvin" },
              { name: "Operations Lead", role: "Head of Operations", image: "/images/logo.svg", initials: "OL" },
              { name: "Finance Lead", role: "Head of Finance", image: "/images/logo.svg", initials: "FL" },
            ].map((member, index) => (
              <div key={index} className="card overflow-hidden text-center">
                <div className="w-full aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-slate-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Founders & Footsteps for all their service needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/booking" className="btn-primary px-8 py-4 text-lg">
              Get Started
            </Link>
            <Link href="/contact" className="btn-secondary px-8 py-4 text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
