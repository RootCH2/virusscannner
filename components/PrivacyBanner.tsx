"use client";

import React from "react";
import { Info, ShieldAlert } from "lucide-react";

export default function PrivacyBanner() {
  return (
    <div className="w-full rounded-xl bg-slate-950/40 border border-slate-800 backdrop-blur-sm p-4 text-slate-400 text-xs sm:text-sm font-sans flex items-start space-x-3 shadow-inner">
      <div className="flex-shrink-0 mt-0.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500">
          <ShieldAlert className="w-4 h-4" />
        </div>
      </div>
      <div className="flex-grow space-y-1">
        <span className="font-semibold text-slate-200 block sm:inline mr-1">
          Privacy Policy & Threat Intelligence Disclosure:
        </span>
        <span className="leading-relaxed">
          Mhirox Virus Scan shares file metadata, cryptographic hashes, and raw uploads with the global threat intelligence community to identify malicious patterns and improve ecosystem security. Do not submit files containing personal, confidential, or proprietary information.
        </span>
      </div>
    </div>
  );
}
