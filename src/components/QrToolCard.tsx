"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  QrCode,
  Camera,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import QrCodeDisplay from "./QrCodeDisplay";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";

interface QrToolCardProps {
  onOpenTransfer?: (code: string) => void;
}

export default function QrToolCard({ onOpenTransfer }: QrToolCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"generate" | "scan">("generate");

  // Generator states
  const [inputText, setInputText] = useState("https://dropzy.app");
  const [qrSize, setQrSize] = useState(160);
  const [copiedText, setCopiedText] = useState(false);

  // Scanner states
  const [scannerMode, setScannerMode] = useState<"camera" | "upload">("camera");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract transfer code
  const extractTransferCode = (text: string): string | null => {
    const match = text.match(/(?:code=|\/share\/|\/s\/)?(\d{6})/);
    if (match && match[1]) return match[1];
    const digits = text.replace(/\D/g, "");
    if (digits.length === 6) return digits;
    return null;
  };

  // Camera scanner lifecycle
  useEffect(() => {
    if (activeSubTab !== "scan" || scannerMode !== "camera") {
      stopCamera();
      return;
    }

    let isMounted = true;
    const scannerId = "qr-tool-camera-video";

    const startCamera = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            stopCamera();
            setScanResult(decodedText);
          },
          () => {
            // ignore frame parse errors
          }
        );
      } catch {
        if (!isMounted) return;
        setCameraError("Camera unavailable or permission denied. You can upload a QR image below.");
        setScannerMode("upload");
      } finally {
        if (isMounted) setIsScanning(false);
      }
    };

    const timer = setTimeout(startCamera, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [activeSubTab, scannerMode]);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  };

  // Image file QR scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      setCameraError(null);

      const html5QrCode = new Html5Qrcode("qr-tool-file-detector");
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      setScanResult(decodedText);
    } catch {
      setCameraError("Could not recognize a QR code in this image. Try another image.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Download QR Code as PNG
  const handleDownloadQrPng = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(inputText || "https://dropzy.app", {
        width: 400,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "dropzy-qr.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const detectedCode = scanResult ? extractTransferCode(scanResult) : null;
  const isUrl = scanResult && (scanResult.startsWith("http://") || scanResult.startsWith("https://"));

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-blue-500/10 border border-white/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">QR Code Studio</h2>
          <p className="text-xs text-slate-500">
            Generate high-res QR codes & scan via camera or images
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
          <QrCode className="w-3 h-3" />
          <span>Universal QR</span>
        </span>
      </div>

      {/* Primary Switcher: Generate QR vs Scan QR */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveSubTab("generate");
          }}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "generate"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Generate QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("scan")}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "scan"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Scan QR</span>
        </button>
      </div>

      {/* Mode 1: Generate QR Code */}
      {activeSubTab === "generate" && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Enter Content, URL, or Text
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text or URL to generate QR..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => setInputText("https://dropzy.app")}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              Dropzy App
            </button>
            <button
              type="button"
              onClick={() => setInputText("https://dropzy.app/share/123456")}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              Demo Key 123456
            </button>
          </div>

          {/* Rendered QR Code */}
          <div className="flex flex-col items-center justify-center py-2">
            <QrCodeDisplay value={inputText || "https://dropzy.app"} size={qrSize} />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadQrPng}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy(inputText)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Scan QR Code */}
      {activeSubTab === "scan" && (
        <div className="space-y-4 animate-fadeIn">
          {!scanResult ? (
            <>
              {/* Camera vs Upload Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setScannerMode("camera")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    scannerMode === "camera"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScannerMode("upload");
                  }}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    scannerMode === "upload"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image File</span>
                </button>
              </div>

              {/* Camera Stream */}
              {scannerMode === "camera" && (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full h-56 bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border-2 border-dashed border-blue-400">
                    <div id="qr-tool-camera-video" className="w-full h-full object-cover" />
                    {isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white text-xs gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                        <span>Initializing camera stream...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 text-center">
                    Point your camera at any QR code to scan instantly
                  </p>
                </div>
              )}

              {/* Upload Image View */}
              {scannerMode === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div id="qr-tool-file-detector" className="hidden" />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      Click or drop QR screenshot here
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP</span>
                  </div>

                  {isProcessingFile && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing QR code image...</span>
                    </div>
                  )}
                </div>
              )}

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </>
          ) : (
            /* Scanned Result View */
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  QR Decoded Successfully
                </span>
                <button
                  onClick={() => setScanResult(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Scan another</span>
                </button>
              </div>

              {/* Decoded Content */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800 break-all select-all">
                {scanResult}
              </div>

              {/* Actions based on decoded content */}
              <div className="flex flex-col gap-2 pt-1">
                {detectedCode && onOpenTransfer && (
                  <button
                    type="button"
                    onClick={() => onOpenTransfer(detectedCode)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Open Dropzy Transfer #{detectedCode}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isUrl && (
                  <a
                    href={scanResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open URL in New Tab</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(scanResult)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
