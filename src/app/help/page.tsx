"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Help Centre",
  subtitle: "How can we help you today?",
  sections: [
    { heading: "Getting Started", body: "Create a free account to access all services. Browse our marketplace, book services, or request quotes — everything is accessible from the homepage." },
    { heading: "Placing an Order", body: "Add items to your cart, proceed to checkout, and pay via Mobile Money, Visa, Mastercard, or bank transfer. Orders are confirmed instantly." },
    { heading: "Booking a Service", body: "Visit any service page (Construction, Events, Travel, Salon, etc.), fill out the request form, and our team will follow up within 24 hours with a detailed quote." },
    { heading: "Tracking Your Order", body: "You'll receive email confirmations with tracking details. For real-time updates, contact us via WhatsApp at 0257664762 or 0261404904." },
    { heading: "Payment Issues", body: "If your payment fails, try again or contact us at phrimpongkelvin@gmail.com. We support MTN MoMo, Vodafone Cash, Visa, and Mastercard." },
    { heading: "Contact Support", body: "Phone: 0261404904\nWhatsApp: 0257664762 / 0261404904\nEmail: phrimpongkelvin@gmail.com\n\nBusiness Hours: Mon-Sat 9am-8pm, Sunday 10am-6pm" },
  ],
};

export default function HelpPage() {
  return <CmsPage slug="help" fallback={fallback} />;
}
