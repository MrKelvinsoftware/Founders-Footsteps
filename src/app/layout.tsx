import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "Founders & Footsteps - Your Multi-Service Platform",
  description: "One platform for all your needs - Car Rental, Car Sales, Catering & Events, Construction, Travel & Trips, Salon & Beauty, and Marketplace.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
