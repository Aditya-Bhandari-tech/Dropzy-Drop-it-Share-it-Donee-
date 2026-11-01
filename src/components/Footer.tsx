"use client";

import React from "react";
import Link from "next/link";
import { Cloud, ShieldCheck, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/60 bg-white/40 backdrop-blur-md py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Dropzy</span>
          <span>© 2026 Dropzy Inc. Fast, frictionless, & anonymous file sharing.</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-End Encrypted</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span>No Account Required</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
