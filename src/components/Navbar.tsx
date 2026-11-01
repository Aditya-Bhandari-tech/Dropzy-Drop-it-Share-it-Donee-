"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, Download, Link2, QrCode, Sparkles } from "lucide-react";

export type FeatureTab = "send" | "receive" | "shortener" | "qrcode" | "generator";

interface NavbarProps {
  activeTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const features: { id: FeatureTab; label: string; icon: React.ReactNode }[] = [
    { id: "send", label: "Send File", icon: <Send className="w-3.5 h-3.5" /> },
    { id: "receive", label: "Receive File", icon: <Download className="w-3.5 h-3.5" /> },
    { id: "shortener", label: "URL Shortener", icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: "qrcode", label: "QR Studio", icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: "generator", label: "String Generator", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="w-full pt-4 pb-2 px-2 sm:px-6 max-w-7xl mx-auto">
      <nav className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
        {/* Brand Logo & Slogan */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md shadow-blue-500/10 border border-slate-100 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="Dropzy Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Dropzy
            </span>
            <span className="text-[10px] font-semibold text-blue-600 -mt-1 hidden sm:block">
              Drop it , Share it , Done !
            </span>
          </div>
        </Link>

        {/* Center: All 5 Features Listed in the Navbar */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/80 shadow-xs max-w-full overflow-x-auto no-scrollbar">
          {features.map((feat) => {
            const isActive = activeTab === feat.id;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => onTabChange(feat.id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>{feat.icon}</span>
                <span>{feat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Slogan Pill Indicator (desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Drop it , Share it , Done !</span>
        </div>
      </nav>
    </header>
  );
}
