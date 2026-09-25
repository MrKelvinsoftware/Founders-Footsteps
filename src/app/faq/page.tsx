"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Frequently Asked Questions",
  subtitle: "Quick answers about our services, payments, and policies.",
  sections: [
    { heading: "How do I place an order?", body: "Browse the marketplace, add items to cart, then checkout. We support Mobile Money, Visa, Mastercard, and bank transfer." },
    { heading: "Do you deliver outside Accra?", body: "Yes. We deliver to all 16 regions of Ghana. International shipping is available for select heavy machinery and goods." },
    { heading: "What currency do you charge in?", body: "All prices are in Ghana Cedis (GH₵). Your card may convert automatically if you pay in another currency." },
    { heading: "How do I book a service like construction or events?", body: "Visit the service page (Construction, Catering & Events, Travel, Salon), fill out the form with your requirements, and our team will follow up with a detailed quote." },
    { heading: "Can I cancel an order?", body: "Yes, before fulfilment. Construction & event bookings have a 50% cancellation fee within 7 days of the scheduled date." },
    { heading: "Do you offer trade accounts?", body: "Yes. We have trade accounts for construction companies, event planners, and corporate clients with preferential pricing. Contact phrimpongkelvin@gmail.com." },
    { heading: "How do I become a vendor on the marketplace?", body: "Apply through our vendor portal or email phrimpongkelvin@gmail.com. We vet all vendors for quality and reliability." },
    { heading: "Is the construction service insured?", body: "Yes, all our construction projects carry full contractor insurance and we provide a 10-year structural warranty." },
  ],
};

export default function FaqPage() {
  return <CmsPage slug="faq" fallback={fallback} />;
}
