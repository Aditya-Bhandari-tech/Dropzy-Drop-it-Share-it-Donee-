"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Download, CheckCircle, ShieldCheck, FileText, ArrowLeft, Loader2, AlertCircle, Archive } from "lucide-react";
import { StoredTransfer } from "@/lib/transferStore";

function ShareContent() {
  const params = useParams();
  const transferId = (params?.id as string) || "";
  const [transfer, setTransfer] = useState<StoredTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  useEffect(() => {
    if (!transferId) return;

    const fetchTransfer = async () => {
      try {
        setLoading(true);
        // Check localStorage first
        const local = JSON.parse(localStorage.getItem("dropzy_recent_transfers") || "{}");
        if (local[transferId]) {
          setTransfer(local[transferId]);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/transfer?code=${transferId}`);
        const data = await res.json();
        if (data.success && data.transfer) {
          setTransfer(data.transfer);
        } else {
          setError(data.error || "Transfer not found or expired.");
        }
      } catch {
        setError("Failed to fetch transfer information.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransfer();
  }, [transferId]);

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

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-12 shadow-2xl border border-white/80 text-center flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <span className="text-sm font-medium text-slate-600">Verifying transfer key #{transferId}...</span>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/80 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Transfer Expired or Invalid</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">{error}</p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          Send or Receive New Files
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/80">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <Download className="w-7 h-7 stroke-[2]" />
      </div>

      <div className="text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 mb-2">
          Key #{transfer.code} Verified
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Your Transfer is Ready</h1>
        <p className="text-xs text-slate-500 mt-1">
          {transfer.files.length} files ({formatBytes(transfer.totalSize)})
        </p>
      </div>

      {/* Files List with Individual Download Buttons */}
      <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/70 divide-y divide-slate-100 p-2 max-h-56 overflow-y-auto">
        {transfer.files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 text-xs">
            <div className="flex items-center gap-2.5 truncate max-w-[65%]">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <span className="font-medium text-slate-800 truncate block">{file.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{formatBytes(file.size)}</span>
              </div>
            </div>

            <button
              onClick={() => handleDownloadSingle(file.name)}
              disabled={downloadingFile === file.name}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-600 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
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
            Note from sender
          </span>
          <p className="italic">“{transfer.message}”</p>
        </div>
      )}

      {/* Download All (ZIP) Button */}
      <button
        onClick={handleDownloadAll}
        disabled={downloadingAll}
        className="w-full mt-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {downloadingAll ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Creating Zip & Downloading...</span>
          </>
        ) : (
          <>
            <Archive className="w-4 h-4" />
            <span>Download All ({formatBytes(transfer.totalSize)})</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Drop it , Share it , Done !</span>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cfdced] via-[#e2ebf8] to-[#edf3fc] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1">
            <Image
              src="/logo.png"
              alt="Dropzy Logo"
              width={36}
              height={36}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <span className="font-bold text-slate-800 text-lg">Dropzy</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Center Download Card */}
      <main className="max-w-lg w-full mx-auto my-auto">
        <Suspense
          fallback={
            <div className="p-12 text-center flex flex-col items-center justify-center bg-white/70 rounded-3xl">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <span className="text-xs text-slate-500">Loading transfer data...</span>
            </div>
          }
        >
          <ShareContent />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-slate-400 py-4">
        © 2026 Dropzy Inc. Drop it , Share it , Done !
      </footer>
    </div>
  );
}
