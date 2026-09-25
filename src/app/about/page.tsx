import Link from "next/link";
import { ArrowRight, Target, Lightbulb, Heart, CheckCircle } from "lucide-react";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";

type CmsSection = { heading: string; body: string; image?: string };
type CmsData = {
  title: string;
  subtitle?: string;
  heroImage?: string;
  sections: CmsSection[];
};

type TeamMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
};

// Parse team member — section.image upload takes priority, then Image: in body text
function parseTeamMember(section: CmsSection): TeamMember {
  const lines = section.body.split("\n");
  let role = "Team Member";
  let image = "/images/logo.svg";
  let bio = "";
  
  for (const line of lines) {
    if (line.startsWith("Role:")) role = line.replace("Role:", "").trim();
    else if (line.startsWith("Image:")) image = line.replace("Image:", "").trim();
    else if (line.startsWith("Bio:")) bio = line.replace("Bio:", "").trim();
    else if (bio && line.trim()) bio += " " + line.trim();
  }
  
  // Section-level image upload takes priority over body text Image: url
  if (section.image && section.image.length > 5) image = section.image;
  
  return { name: section.heading, role, image, bio };
}

function parseStat(section: CmsSection): { value: string; label: string } {
  return { value: section.heading, label: section.body };
}

async function getCms(slug: string): Promise<CmsData | null> {
  try {
    const [row] = await db.select().from(cmsContent).where(eq(cmsContent.slug, slug)).limit(1);
    if (row?.content) {
      const c = row.content as CmsData;
      if (c.title && c.sections) return c;
    }
  } catch { /* ignore */ }
  return null;
}

const defaultAbout: CmsData = {
  title: "About Founders & Footsteps",
  subtitle: "One platform, endless possibilities. We're redefining how you experience multiple services under one roof.",
  heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
  sections: [
    { heading: "Our Story", body: "Founded with a vision to simplify life's complexities, Founders & Footsteps emerged from the realization that modern consumers need a unified platform for diverse services.\n\nWhat started as a small travel booking service has evolved into a comprehensive platform offering Car Rental, Car Sales, Catering & Events, Construction, Travel & Trips, Salon & Beauty services, Logistics, Tech Repairs, Graphic Design, and a thriving Marketplace.\n\nOur mission is simple: provide exceptional service across all verticals while maintaining the personal touch that makes every customer feel valued." },
    { heading: "Our Vision", body: "To build a world where nobody has to stress over finding reliable services. We want Founders & Footsteps to be the ultimate, all-in-one digital destination — one trusted brand that handles everything from foundation to finish." },
    { heading: "Customer First", body: "Every decision we make starts with our customers' needs and satisfaction. We listen, we adapt, and we deliver." },
    { heading: "Innovation", body: "We continuously evolve our platform to deliver cutting-edge solutions that make your life easier." },
    { heading: "Integrity", body: "Transparency and honesty form the foundation of all our relationships. No hidden fees, no surprises." },
  ],
};

const defaultTeam: CmsData = {
  title: "Leadership Team",
  subtitle: "Meet the visionaries behind Founders & Footsteps",
  sections: [
    { heading: "Mr. Phrimpong Kelvin", body: "Role: Founder & CEO\nImage: https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80\nBio: Visionary entrepreneur leading Founders & Footsteps — Apex Lifestyle Syndicate. Building the most ambitious multi-service platform in West Africa." },
    { heading: "Operations Lead", body: "Role: Head of Operations\nImage: https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80\nBio: Ensuring seamless execution across all service lines with a focus on customer satisfaction and operational excellence." },
    { heading: "Finance Lead", body: "Role: Head of Finance\nImage: https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80\nBio: Managing financial strategy and growth to ensure sustainable expansion across Ghana and beyond." },
  ],
};

const defaultStats: CmsData = {
  title: "Company Statistics",
  subtitle: "Our impact in numbers",
  sections: [
    { heading: "250K+", body: "Happy Customers" },
    { heading: "9", body: "Service Lines" },
    { heading: "50+", body: "Countries Served" },
    { heading: "98%", body: "Satisfaction Rate" },
  ],
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const aboutData = (await getCms("about")) || defaultAbout;
  const teamData = (await getCms("team")) || defaultTeam;
  const statsData = (await getCms("stats")) || defaultStats;

  const team = teamData.sections.map(parseTeamMember);
  const stats = statsData.sections.map(parseStat);

  const storySection = aboutData.sections.find(s => s.heading.toLowerCase().includes("story"));
  const visionSection = aboutData.sections.find(s => s.heading.toLowerCase().includes("vision"));
  const valuesSections = aboutData.sections.filter(s => 
    !s.heading.toLowerCase().includes("story") && 
    !s.heading.toLowerCase().includes("vision")
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[500px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${aboutData.heroImage || defaultAbout.heroImage}')` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">{aboutData.title}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{aboutData.subtitle}</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">{storySection?.heading || "Our Story"}</h2>
              {(storySection?.body || defaultAbout.sections[0].body).split("\n\n").map((para, i) => (
                <p key={i} className="text-lg text-slate-600 mb-6 leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="relative">
              <img src={storySection?.image || aboutData.heroImage || defaultAbout.heroImage} alt="Our Team" className="rounded-3xl shadow-2xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      {visionSection && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">{visionSection.heading}</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">{visionSection.body}</p>
          </div>
        </section>
      )}

      {/* Values */}
      {valuesSections.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">The principles that guide everything we do</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valuesSections.slice(0, 3).map((section, index) => {
                const icons = [Target, Lightbulb, Heart];
                const colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600"];
                const Icon = icons[index % 3];
                return (
                  <div key={index} className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg hover:shadow-xl transition-all">
                    <div className={`w-16 h-16 rounded-2xl ${colors[index % 3]} flex items-center justify-center mx-auto mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.heading}</h3>
                    <p className="text-slate-600">{section.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">{teamData.title}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{teamData.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-center group shadow-lg hover:shadow-xl transition-all">
                <div className="w-full aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  {member.bio && <p className="text-sm text-slate-500 leading-relaxed">{member.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Experience the Difference?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who trust Founders & Footsteps for all their service needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/booking" className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 rounded-full border-2 border-slate-300 text-slate-700 text-lg font-semibold hover:bg-slate-100 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
