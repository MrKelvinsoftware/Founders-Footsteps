"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Terms & Conditions",
  subtitle: "Last updated: January 2026",
  sections: [
    { heading: "1. Acceptance of Terms", body: "By accessing or using the Founders & Footsteps platform, you agree to be bound by these Terms of Service." },
    { heading: "2. Services", body: "We provide an online platform connecting customers with Construction, Car Rental, Catering & Events, Travel & Trips, Salon & Beauty, Logistics, Tech Repairs, and Marketplace services." },
    { heading: "3. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating an account." },
    { heading: "4. Payments", body: "All prices are in Ghana Cedis (GH₵). Payments are processed through Paystack. We do not store credit card information." },
    { heading: "5. Cancellations", body: "Marketplace orders may be cancelled before dispatch. Service bookings are subject to the cancellation policy of each service line." },
    { heading: "6. Limitation of Liability", body: "Founders & Footsteps shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services." },
    { heading: "7. Contact", body: "For questions about these terms, contact phrimpongkelvin@gmail.com or call 0261404904." },
  ],
};

export default function TermsPage() {
  return <CmsPage slug="terms" fallback={fallback} />;
}
