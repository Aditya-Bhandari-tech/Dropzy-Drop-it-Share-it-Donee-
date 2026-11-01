"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  File,
  X,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Clock,
  QrCode,
  ArrowRight,
  RefreshCw,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";
import QrCodeDisplay from "./QrCodeDisplay";

export default function UploadCard() {
  const [mode, setMode] = useState<"file" | "folder">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state after generating code & QR
  const [createdTransfer, setCreatedTransfer] = useState<{
    code: string;
    expiresAt: number;
    files: { name: string; size: number; type: string }[];
    totalSize: number;
  } | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer effect
  useEffect(() => {
    if (!createdTransfer) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.floor((createdTransfer.expiresAt - Date.now()) / 1000)
      );
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdTransfer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const handleSend = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one file or folder to send.");
      return;
    }

    setErrorMessage(null);
    setUploadProgress(15);

    // Simulate smooth upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 15;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    try {
      // Build real multipart FormData payload with real file binaries
      const formData = new FormData();
      formData.append("message", message);
      formData.append("expiryMinutes", expiryMinutes.toString());
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/transfer", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success && data.code) {
        // Also save to client localStorage for cross-tab availability
        const currentTransfers = JSON.parse(
          localStorage.getItem("dropzy_recent_transfers") || "{}"
        );
        currentTransfers[data.code] = {
          code: data.code,
          files: data.files,
          totalSize: totalBytes,
          message,
          createdAt: Date.now(),
          expiresAt: data.expiresAt,
        };
        localStorage.setItem(
          "dropzy_recent_transfers",
          JSON.stringify(currentTransfers)
        );

        setRemainingSeconds(data.expiresInSeconds);
        setCreatedTransfer({
          code: data.code,
          expiresAt: data.expiresAt,
          files: data.files,
          totalSize: totalBytes,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#3b82f6", "#60a5fa", "#38bdf8"],
        });
      } else {
        setErrorMessage(data.error || "Failed to create transfer.");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setErrorMessage("Network error occurred while preparing transfer.");
    } finally {
      setTimeout(() => setUploadProgress(null), 300);
    }
  };

  const copyCodeToClipboard = () => {
    if (!createdTransfer) return;
    navigator.clipboard.writeText(createdTransfer.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLinkToClipboard = () => {
    if (!createdTransfer) return;
    const url = `${window.location.origin}/share/${createdTransfer.code}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const resetAll = () => {
    setCreatedTransfer(null);
    setSelectedFiles([]);
    setMessage("");
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-blue-500/10 border border-white/80 transition-all duration-300">
      {/* Hidden file & folder inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFilesAdded(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder uploads in HTML5
        webkitdirectory="true"
        multiple
        className="hidden"
        onChange={(e) => handleFilesAdded(e.target.files)}
      />

      {!createdTransfer ? (
        <>
          {/* Top Segmented Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("file");
                fileInputRef.current?.click();
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                mode === "file"
                  ? "bg-slate-50/80 text-blue-600 border border-blue-100 shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <span className="text-base">📄</span>
              <span>Add File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("folder");
                folderInputRef.current?.click();
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                mode === "folder"
                  ? "bg-slate-50/80 text-blue-600 border border-blue-100 shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <span className="text-base">📁</span>
              <span>Add Folder</span>
            </button>
          </div>

          {/* Dropzone Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (mode === "folder") {
                folderInputRef.current?.click();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 bg-slate-50/30"
            }`}
          >
            {/* Upload Cloud Icon */}
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6 stroke-[1.8]" />
            </div>

            <p className="text-sm font-medium text-slate-600">
              Choose a file or drag & drop it here.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "folder") {
                  folderInputRef.current?.click();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="mt-3 px-4 py-1.5 rounded-lg border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {mode === "folder" ? "Browse Folder" : "Browse File"}
            </button>
          </div>

          {/* Selected Files preview list */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 max-h-36 overflow-y-auto divide-y divide-slate-100 text-left">
              <div className="flex items-center justify-between pb-2 text-xs font-medium text-slate-500">
                <span>Selected ({selectedFiles.length})</span>
                <span>Total: {formatBytes(totalBytes)}</span>
              </div>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-xs group">
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <File className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate font-medium text-slate-800">{file.name}</span>
                    <span className="text-slate-400 shrink-0 text-[11px]">
                      ({formatBytes(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Optional Message / Expiry selector */}
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message for recipient"
              className="w-full px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Code Validity:</span>
              </span>
              <div className="flex gap-1.5">
                {[10, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setExpiryMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      expiryMinutes === mins
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress Bar (while uploading) */}
          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Encrypting & uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="button"
            disabled={uploadProgress !== null || selectedFiles.length === 0}
            onClick={handleSend}
            className="w-full mt-5 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploadProgress !== null ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading & Generating Key...</span>
              </>
            ) : (
              <span>Send File</span>
            )}
          </button>
        </>
      ) : (
        /* Generated 6-Digit Code & QR Code View */
        <div className="flex flex-col items-center text-center animate-fadeIn py-2">
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Ready to Share
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              <Clock className="w-3.5 h-3.5" />
              <span>Expires in {formatTimer(remainingSeconds)}</span>
            </div>
          </div>

          {/* Prominent 6-Digit Code Display */}
          <div className="w-full bg-blue-50/60 border border-blue-200 rounded-2xl p-4 mb-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              6-Digit Transfer Key
            </span>
            <div className="flex items-center justify-center gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-blue-700">
                {createdTransfer.code.slice(0, 3)} {createdTransfer.code.slice(3, 6)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Recipient enters this 6-digit key to download files instantly
            </p>

            <button
              type="button"
              onClick={copyCodeToClipboard}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {codeCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center my-1">
            <span className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Or Scan with Mobile Camera</span>
            </span>
            <QrCodeDisplay
              value={typeof window !== "undefined" ? `${window.location.origin}/share/${createdTransfer.code}` : createdTransfer.code}
              size={160}
            />
          </div>

          {/* Metadata pill */}
          <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span>
              {createdTransfer.files.length} Files ({formatBytes(createdTransfer.totalSize)})
            </span>
            <button
              onClick={copyLinkToClipboard}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>{linkCopied ? "Link Copied" : "Copy Link"}</span>
            </button>
          </div>

          {/* Send Another Transfer Button */}
          <button
            type="button"
            onClick={resetAll}
            className="w-full mt-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send Another Transfer</span>
          </button>
        </div>
      )}
    </div>
  );
}
