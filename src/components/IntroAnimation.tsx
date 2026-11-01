"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Check if intro has already been viewed in this session
    const hasSeen = sessionStorage.getItem("dropzy_intro_seen");
    if (hasSeen) {
      onComplete();
      return;
    }

    setVisible(true);

    // Auto complete after 2.4s
    const timer = setTimeout(() => {
      dismissIntro();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const dismissIntro = () => {
    setFadingOut(true);
    setTimeout(() => {
      sessionStorage.setItem("dropzy_intro_seen", "true");
      setVisible(false);
      onComplete();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div
      onClick={dismissIntro}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#cfdced] via-[#e2ebf8] to-[#edf3fc] transition-opacity duration-500 cursor-pointer ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* Floating Paper Airplane & Logo Animation Container */}
      <div className="relative flex flex-col items-center">
        {/* Animated Flight Path with Paper Plane */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          {/* Subtle orbiting ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/50 animate-[spin_8s_linear_infinite]" />

          {/* Real Brand Logo Container */}
          <div className="w-20 h-20 rounded-2xl bg-white shadow-xl shadow-blue-500/20 p-2 flex items-center justify-center border border-slate-100">
            <Image
              src="/logo.png"
              alt="Dropzy Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>

          {/* Flying Paper Airplane */}
          <div className="absolute -top-3 -right-3 p-2.5 rounded-full bg-white text-blue-600 shadow-lg border border-blue-100 animate-bounce">
            <Send className="w-5 h-5 transform -rotate-45" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Dropzy
          </span>
        </div>

        {/* Official Slogan */}
        <div className="text-center px-4">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 animate-pulse">
            Drop it , Share it , Done !
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Fast, frictionless & anonymous cloud sharing
          </p>
        </div>

        {/* Skip button hint */}
        <span className="text-[11px] text-slate-400 mt-8 tracking-wider uppercase font-semibold">
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
}
