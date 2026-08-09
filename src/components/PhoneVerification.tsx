"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Phone verification removed per requirements — this is now a simple stub
// that auto-verifies. The phone field remains as a standard input.
export default function PhoneVerification({ phone, onVerified }: { phone: string; onVerified: () => void }) {
  const [verified, setVerified] = useState(false);

  const verify = () => {
    setVerified(true);
    onVerified();
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm">
        <CheckCircle2 className="w-4 h-4" /> Phone number noted
      </div>
    );
  }

  return (
    <button type="button" onClick={verify} className="text-sm text-blue-600 hover:underline">
      Confirm phone number
    </button>
  );
}
