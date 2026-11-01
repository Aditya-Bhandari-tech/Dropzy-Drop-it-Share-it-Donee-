"use client";

import React, { useState } from "react";
import Navbar, { FeatureTab } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import UploadCard from "@/components/UploadCard";
import ReceiveCard from "@/components/ReceiveCard";
import UrlShortenerCard from "@/components/UrlShortenerCard";
import QrToolCard from "@/components/QrToolCard";
import StringGeneratorCard from "@/components/StringGeneratorCard";
import IntroAnimation from "@/components/IntroAnimation";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<FeatureTab>("send");
  const [scannedCode, setScannedCode] = useState("");
  const [introFinished, setIntroFinished] = useState(false);

  const handleQrCodeDetected = (code: string) => {
    setScannedCode(code);
    setActiveTab("receive");
  };

  return (
    <>
      {/* Intro animation (first-time session only) */}
      <IntroAnimation onComplete={() => setIntroFinished(true)} />

      <div className="min-h-screen bg-gradient-to-b from-[#cfdced] via-[#e2ebf8] to-[#edf3fc] text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Main Canvas Card */}
          <div className="w-full max-w-6xl bg-gradient-to-br from-white/95 via-white/85 to-[#e9f1fc]/90 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/90 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.12)] p-4 sm:p-8 lg:p-12 transition-all">
            {/* Top Navigation */}
            <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Core 2-Column Hero & Dynamic Action Split */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-6 lg:mt-10">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <HeroSection activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {/* Right Column: Dynamic Card */}
              <div className="lg:col-span-5 w-full flex justify-center">
                {activeTab === "send" && <UploadCard />}

                {activeTab === "receive" && (
                  <ReceiveCard
                    initialCode={scannedCode}
                    onSwitchToQrStudio={() => setActiveTab("qrcode")}
                  />
                )}

                {activeTab === "shortener" && <UrlShortenerCard />}

                {activeTab === "qrcode" && (
                  <QrToolCard onOpenTransfer={handleQrCodeDetected} />
                )}

                {activeTab === "generator" && (
                  <StringGeneratorCard
                    onUseCodeInReceiver={(code) => {
                      setScannedCode(code);
                      setActiveTab("receive");
                    }}
                  />
                )}
              </div>
            </main>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
