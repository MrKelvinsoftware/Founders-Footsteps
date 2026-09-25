"use client";

import CmsPage from "@/components/CmsPage";

const fallback = {
  title: "Returns & Refunds Policy",
  subtitle: "Your satisfaction is our priority.",
  sections: [
    { heading: "Return Window", body: "You may return most marketplace items within 7 days of delivery for a full refund, provided they are unused and in original packaging." },
    { heading: "Non-Returnable Items", body: "Perishable goods, customised items, and sealed beauty/hygiene products that have been opened are not eligible for return." },
    { heading: "How to Initiate a Return", body: "Contact us at phrimpongkelvin@gmail.com or call 0261404904 with your order number. We'll arrange free pickup in Accra and Kumasi." },
    { heading: "Refund Timeline", body: "Once we receive and inspect your return, refunds are processed within 3-5 business days to your original payment method." },
    { heading: "Service Bookings", body: "Construction and event bookings may be cancelled up to 7 days before the scheduled date. A 50% cancellation fee applies for late cancellations." },
  ],
};

export default function ReturnsPage() {
  return <CmsPage slug="returns" fallback={fallback} />;
}
