"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  QrCode,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Archive,
} from "lucide-react";
import { StoredTransfer } from "@/lib/transferStore";

interface ReceiveCardProps {
  initialCode?: string;
  onSwitchToQrStudio?: () => void;
}

export default function ReceiveCard({
  initialCode = "",
  onSwitchToQrStudio,
}: ReceiveCardProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<StoredTransfer | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Sync initialCode if provided
  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      const codeDigits = initialCode.split("");
      setDigits(codeDigits);
      fetchTransferByCode(initialCode);
    }
  }, [initialCode]);

  // Handle individual digit input with auto-advance
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If 6 digits are complete, automatically fetch
    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      fetchTransferByCode(fullCode);
    }
  };

  // Handle keyboard navigation (Backspace, Arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full 6-digit code or link
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digitsOnly = pastedText.replace(/\D/g, "").slice(0, 6);
    if (!digitsOnly) return;

    const newDigits = [...digits];
    for (let i = 0; i < digitsOnly.length; i++) {
      newDigits[i] = digitsOnly[i];
    }
    setDigits(newDigits);

    if (digitsOnly.length === 6) {
      inputRefs.current[5]?.focus();
      fetchTransferByCode(digitsOnly);
    } else {
      inputRefs.current[digitsOnly.length]?.focus();
    }
  };

  // Fetch transfer from API
  const fetchTransferByCode = async (code: string) => {
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check client local transfers first
      const localTransfers = JSON.parse(localStorage.getItem("dropzy_recent_transfers") || "{}");
      if (localTransfers[code]) {
        setTransfer(localTransfers[code]);
        setLoading(false);
        return;
      }

      // Fetch from API
      const res = await fetch(`/api/transfer?code=${code}`);
      const data = await res.json();

      if (data.success && data.transfer) {
        setTransfer(data.transfer);
      } else {
        setError(data.error || "No active transfer found for this code.");
        setTransfer(null);
      }
    } catch {
      setError("Could not reach transfer service. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger real individual file download
  const handleDownloadSingle = (fileName: string) => {
    if (!transfer) return;
    setDownloadingFile(fileName);

    const downloadUrl = `/api/transfer/download?code=${transfer.code}&file=${encodeURIComponent(fileName)}`;
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      setDownloadingFile(null);
    }, 1500);
  };

  // Trigger real "Download All" as .zip
  const handleDownloadAll = () => {
    if (!transfer) return;
    setDownloadingAll(true);

    const downloadUrl = `/api/transfer/download-zip?code=${transfer.code}`;
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `Dropzy-${transfer.code}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      setDownloadingAll(false);
    }, 2000);
  };

  const resetForm = () => {
    setDigits(["", "", "", "", "", ""]);
    setTransfer(null);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-blue-500/10 border border-white/80 transition-all duration-300">
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Receive Files</h2>
          <p className="text-xs text-slate-500">
            Enter the 6-digit key or scan the sender's QR code
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          Drop it, Share it, Done!
        </span>
      </div>

      {!transfer ? (
        <>
          {/* Six Empty Digit Input Boxes */}
          <div className="py-4">
            <label className="block text-xs font-semibold text-slate-600 mb-3 text-center">
              Enter 6-Digit Key
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-extrabold font-mono rounded-xl border transition-all outline-none ${
                    digit
                      ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* QR Scan Button Choice */}
          <div className="mt-2 flex flex-col items-center">
            <div className="relative flex py-2 items-center w-full">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-xs uppercase font-medium text-slate-400">
                Or choose QR
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={onSwitchToQrStudio}
              className="w-full mt-2 py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 active:scale-98 text-blue-700 text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Open QR Studio to Scan</span>
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fetch Action Button */}
          <button
            type="button"
            disabled={digits.join("").length !== 6 || loading}
            onClick={() => fetchTransferByCode(digits.join(""))}
            className="w-full mt-5 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locating transfer...</span>
              </>
            ) : (
              <>
                <span>Retrieve Files</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Instant testing hint */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                const demo = ["1", "2", "3", "4", "5", "6"];
                setDigits(demo);
                fetchTransferByCode("123456");
              }}
              className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors underline cursor-pointer"
            >
              Try test demo code: 123456 (with real downloadable files)
            </button>
          </div>
        </>
      ) : (
        /* Transfer Found: Displays all files with INDIVIDUAL download buttons + DOWNLOAD ALL */
        <div className="py-2 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Transfer Verified
                </span>
                <span className="text-[11px] text-emerald-700 font-mono">
                  Key: #{transfer.code}
                </span>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              title="Enter another code"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Key</span>
            </button>
          </div>

          {/* Files List with Individual Download Buttons */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 max-h-56 overflow-y-auto divide-y divide-slate-100">
            <div className="flex justify-between items-center pb-2 text-[11px] font-semibold text-slate-500">
              <span>{transfer.files.length} Files in Transfer</span>
              <span>Total: {formatBytes(transfer.totalSize)}</span>
            </div>

            {transfer.files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 text-xs group">
                <div className="flex items-center gap-2 truncate max-w-[65%]">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="truncate">
                    <span className="truncate font-medium text-slate-800 block">
                      {file.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                {/* Individual Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(file.name)}
                  disabled={downloadingFile === file.name}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-600 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title={`Download ${file.name}`}
                >
                  {downloadingFile === file.name ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {transfer.message && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Sender Note
              </span>
              <p className="italic">&ldquo;{transfer.message}&rdquo;</p>
            </div>
          )}

          {/* Download All (ZIP Archive) Action Button */}
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="w-full mt-5 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Zip &amp; Downloading...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Download All ({formatBytes(transfer.totalSize)})</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
