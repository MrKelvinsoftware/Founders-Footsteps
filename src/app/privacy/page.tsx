"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Privacy Policy",
  subtitle: "Last updated: January 2026",
  sections: [
    { heading: "1. Information We Collect", body: "We collect information you give us directly: name, email, phone number, delivery address, payment information (processed by certified gateways — we never store your card), and any information you provide when requesting a service quote." },
    { heading: "2. How We Use It", body: "To deliver services, process payments, send you order updates, improve our platform, and — only with your consent — share relevant offers." },
    { heading: "3. Sharing", body: "We share data only with the partners needed to fulfil your order (couriers, technicians, payment processors). We never sell your personal data." },
    { heading: "4. Your Rights", body: "You can request access, correction, or deletion of your data at any time by emailing phrimpongkelvin@gmail.com. We respond within 30 days." },
    { heading: "5. Contact", body: "For any privacy concerns, email phrimpongkelvin@gmail.com." },
  ],
};

export default function PrivacyPage() {
  return <CmsPage slug="privacy" fallback={fallback} />;
}
