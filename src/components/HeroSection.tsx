"use client";

import React from "react";
import { Send, Download, Link2, QrCode, Sparkles, Zap } from "lucide-react";
import { FeatureTab } from "@/components/Navbar";

interface HeroSectionProps {
  activeTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
}

const features: { id: FeatureTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "send", label: "Send Files", icon: <Send className="w-3.5 h-3.5" />, desc: "Upload & share instantly" },
  { id: "receive", label: "Receive Files", icon: <Download className="w-3.5 h-3.5" />, desc: "Enter 6-digit key" },
  { id: "shortener", label: "URL Shortener", icon: <Link2 className="w-3.5 h-3.5" />, desc: "Create short links" },
  { id: "qrcode", label: "QR Studio", icon: <QrCode className="w-3.5 h-3.5" />, desc: "Generate & scan QR" },
  { id: "generator", label: "String Generator", icon: <Sparkles className="w-3.5 h-3.5" />, desc: "Keys, UUIDs & more" },
];

export default function HeroSection({ activeTab, onTabChange }: HeroSectionProps) {
  return (
    <div className="flex flex-col justify-center max-w-xl py-6 lg:py-10">
      {/* Slogan Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs w-fit mb-5">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600/30" />
        <span className="tracking-wide">Drop it , Share it , Done !</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
        Share Files Faster <br />
        <span className="text-slate-900">Work Smarter.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-lg">
        Fast, frictionless, and anonymous cloud sharing — 5 powerful tools in one place, zero sign-ups required.
      </p>

      {/* 5 Feature Chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        {features.map((feat) => {
          const isActive = activeTab === feat.id;
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => onTabChange(feat.id)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                  : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs"
              }`}
            >
              <span>{feat.icon}</span>
              <span>{feat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feature Badges */}
      <div className="mt-10 pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>6-Digit P2P Key</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-blue-500" />
          <span>QR Scanner</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-emerald-500" />
          <span>Instant Short Links</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span>String Generator</span>
        </div>
      </div>
    </div>
  );
}
