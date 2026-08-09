"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Press & News",
  subtitle: "The latest from Founders & Footsteps.",
  sections: [
    { heading: "Founders & Footsteps Launches 8-Service Platform", body: "Accra, Ghana — Founders & Footsteps, a new multi-service digital platform, officially launches today offering Construction, Car Rental, Catering & Events, Travel & Trips, Salon & Beauty, Logistics, Tech Repairs, and an online Marketplace — all under one roof.\n\nFor press inquiries, email phrimpongkelvin@gmail.com." },
    { heading: "Media Kit", body: "Download our brand assets, logos, and press materials by contacting phrimpongkelvin@gmail.com." },
  ],
};

export default function PressPage() {
  return <CmsPage slug="press" fallback={fallback} />;
}
