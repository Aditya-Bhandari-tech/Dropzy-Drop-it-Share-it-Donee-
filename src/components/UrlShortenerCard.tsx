"use client";

import React, { useState, useEffect } from "react";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Globe,
} from "lucide-react";
import QrCodeDisplay from "./QrCodeDisplay";

interface ShortenedItem {
  slug: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: number;
}

export default function UrlShortenerCard() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState<ShortenedItem[]>([]);

  const [result, setResult] = useState<ShortenedItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dropzy_shortened_links");
      if (saved) {
        setRecentLinks(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL to shorten.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          customSlug: customSlug.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newItem: ShortenedItem = {
          slug: data.slug,
          shortUrl: data.shortUrl,
          originalUrl: data.originalUrl,
          createdAt: Date.now(),
        };

        setResult(newItem);
        const updated = [newItem, ...recentLinks.slice(0, 4)];
        setRecentLinks(updated);
        localStorage.setItem("dropzy_shortened_links", JSON.stringify(updated));
        setUrl("");
        setCustomSlug("");
      } else {
        setError(data.error || "Failed to shorten URL.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-blue-500/10 border border-white/80 transition-all duration-300">
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">URL Shortener</h2>
          <p className="text-xs text-slate-500">
            Create instant, fast-redirect short links & QR codes
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Dropzy Link</span>
        </span>
      </div>

      {!result ? (
        <form onSubmit={handleShorten} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Enter Long URL
            </label>
            <div className="relative flex items-center">
              <Globe className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very-long-file-link..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Optional Custom Alias */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Custom Alias <span className="text-slate-400 font-normal">(optional)</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono text-slate-400">/s/</span>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-cool-link"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-blue-500/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Shortening Link...</span>
              </>
            ) : (
              <>
                <span>Generate Short Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Recent Shortened Links */}
          {recentLinks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-2">
                Recent Links
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {recentLinks.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 text-xs transition-colors"
                  >
                    <div className="truncate max-w-[70%]">
                      <span className="font-mono font-semibold text-blue-600 block truncate">
                        {item.shortUrl}
                      </span>
                      <span className="text-slate-400 text-[10px] truncate block">
                        {item.originalUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.shortUrl)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-white shadow-2xs transition-all cursor-pointer"
                      title="Copy Link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Result Screen */
        <div className="animate-fadeIn flex flex-col items-center text-center py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 mb-4">
            Link Generated!
          </span>

          {/* Short URL Box */}
          <div className="w-full bg-blue-50/70 border border-blue-200 rounded-2xl p-4 mb-4 text-left">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Your Short URL
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base sm:text-lg font-mono font-bold text-blue-700 truncate">
                {result.shortUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.shortUrl)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-500 truncate">
              <span className="text-slate-400">Redirects to: </span>
              <span className="font-medium text-slate-700">{result.originalUrl}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center my-2">
            <span className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Scan QR to Open URL</span>
            </span>
            <QrCodeDisplay value={result.shortUrl} size={150} />
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Test Redirect</span>
            </a>

            <button
              type="button"
              onClick={() => setResult(null)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shorten Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
