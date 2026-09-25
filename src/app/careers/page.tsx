"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Careers at Founders & Footsteps",
  subtitle: "We're building the most ambitious multi-service platform in West Africa. Come shape the future with us.",
  heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
  sections: [
    { heading: "Senior Construction Engineer", body: "Department: Construction\nLocation: Accra\nType: Full-time\n\nWe're looking for an experienced construction engineer to lead residential and commercial projects across Ghana." },
    { heading: "Travel Operations Lead", body: "Department: Travel & Trips\nLocation: Accra · Hybrid\nType: Full-time\n\nManage trip logistics, vendor relationships, and customer experience for our growing travel desk." },
    { heading: "Frontend Engineer (Next.js)", body: "Department: Engineering\nLocation: Remote · Ghana\nType: Full-time\n\nBuild and maintain our customer-facing platform using Next.js, Tailwind CSS, and PostgreSQL." },
    { heading: "Logistics Coordinator", body: "Department: Logistics\nLocation: Tema\nType: Full-time\n\nCoordinate domestic and international shipments, manage warehouse operations." },
    { heading: "Catering Event Manager", body: "Department: Events\nLocation: Accra\nType: Contract\n\nPlan and execute weddings, corporate events, and private parties." },
    { heading: "Customer Experience Associate", body: "Department: Operations\nLocation: Kumasi\nType: Full-time\n\nProvide world-class support to customers across all service lines." },
    { heading: "Don't see your role?", body: "Send us a general application at phrimpongkelvin@gmail.com — we hire for exceptional people, not just listed positions." },
  ],
};

export default function CareersPage() {
  return <CmsPage slug="careers" fallback={fallback} />;
}
