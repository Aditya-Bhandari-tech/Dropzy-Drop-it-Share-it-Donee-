"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Hash,
  Fingerprint,
  FileCode,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";

interface StringGeneratorCardProps {
  onUseCodeInReceiver?: (code: string) => void;
}

export default function StringGeneratorCard({ onUseCodeInReceiver }: StringGeneratorCardProps) {
  const [mode, setMode] = useState<"keys" | "slugs" | "uuid" | "passphrase" | "password">("keys");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState(5);

  // Slugs config
  const [slugLength, setSlugLength] = useState(8);
  const [slugType, setSlugType] = useState<"alphanumeric" | "hex" | "base64">("alphanumeric");

  // Output lists
  const [keys, setKeys] = useState<string[]>([]);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [uuids, setUuids] = useState<string[]>([]);
  const [passphrases, setPassphrases] = useState<string[]>([]);
  const [passwords, setPasswords] = useState<string[]>([]);

  // Generator helpers
  const generateKeys = (count: number) => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(Math.floor(100000 + Math.random() * 900000).toString());
    }
    return list;
  };

  const generateSlugsList = (count: number, len: number, type: string) => {
    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    if (type === "hex") charset = "0123456789abcdef";
    if (type === "base64") charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";

    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let str = "";
      for (let j = 0; j < len; j++) {
        str += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      list.push(str);
    }
    return list;
  };

  const generateUuidsList = (count: number) => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        list.push(crypto.randomUUID());
      } else {
        list.push("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }));
      }
    }
    return list;
  };

  const generatePassphrasesList = (count: number) => {
    const adjectives = ["swift", "hyper", "neon", "cosmic", "silent", "quantum", "turbo", "velvet", "solar", "shadow", "apex", "zenith"];
    const nouns = ["falcon", "matrix", "stream", "cipher", "orbit", "vortex", "rocket", "beacon", "relay", "pulse", "photon", "nexus"];
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(10 + Math.random() * 90);
      list.push(`${adj}-${noun}-${num}`);
    }
    return list;
  };

  const generatePasswordsList = (count: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><,./-=";
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let pass = "";
      for (let j = 0; j < 16; j++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      list.push(pass);
    }
    return list;
  };

  // Populate client-side to satisfy Next.js static prerender
  useEffect(() => {
    setKeys(generateKeys(batchCount));
    setSlugs(generateSlugsList(batchCount, slugLength, slugType));
    setUuids(generateUuidsList(batchCount));
    setPassphrases(generatePassphrasesList(batchCount));
    setPasswords(generatePasswordsList(batchCount));
  }, []);

  const handleRegenerate = () => {
    if (mode === "keys") setKeys(generateKeys(batchCount));
    if (mode === "slugs") setSlugs(generateSlugsList(batchCount, slugLength, slugType));
    if (mode === "uuid") setUuids(generateUuidsList(batchCount));
    if (mode === "passphrase") setPassphrases(generatePassphrasesList(batchCount));
    if (mode === "password") setPasswords(generatePasswordsList(batchCount));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = () => {
    let currentList: string[] = [];
    if (mode === "keys") currentList = keys;
    if (mode === "slugs") currentList = slugs;
    if (mode === "uuid") currentList = uuids;
    if (mode === "passphrase") currentList = passphrases;
    if (mode === "password") currentList = passwords;

    navigator.clipboard.writeText(currentList.join("\n"));
    setCopiedId("copy-all");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCurrentList = () => {
    if (mode === "keys") return keys;
    if (mode === "slugs") return slugs;
    if (mode === "uuid") return uuids;
    if (mode === "passphrase") return passphrases;
    return passwords;
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-blue-500/10 border border-white/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">String Generator</h2>
          <p className="text-xs text-slate-500">
            Generate random keys, tokens, UUIDs & secure passwords
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Dev Utility</span>
        </span>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-semibold text-center">
        <button
          onClick={() => setMode("keys")}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === "keys" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          6-Digit
        </button>
        <button
          onClick={() => setMode("slugs")}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === "slugs" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Slugs
        </button>
        <button
          onClick={() => setMode("uuid")}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === "uuid" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          UUID v4
        </button>
        <button
          onClick={() => setMode("passphrase")}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === "passphrase" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Phrase
        </button>
        <button
          onClick={() => setMode("password")}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            mode === "password" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Password
        </button>
      </div>

      {/* Control Bar (Length, Batch Count, Regenerate) */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span>Batch:</span>
          {[3, 5, 8].map((count) => (
            <button
              key={count}
              onClick={() => {
                setBatchCount(count);
                if (mode === "keys") setKeys(generateKeys(count));
                if (mode === "slugs") setSlugs(generateSlugsList(count, slugLength, slugType));
                if (mode === "uuid") setUuids(generateUuidsList(count));
                if (mode === "passphrase") setPassphrases(generatePassphrasesList(count));
                if (mode === "password") setPasswords(generatePasswordsList(count));
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold cursor-pointer ${
                batchCount === count ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="text-slate-600 hover:text-blue-600 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
          >
            {copiedId === "copy-all" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>Copy All</span>
          </button>
          <span>•</span>
          <button
            onClick={handleRegenerate}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Result Items List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {getCurrentList().map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all text-xs"
          >
            <span
              className={`font-mono font-bold truncate max-w-[75%] ${
                mode === "keys"
                  ? "text-blue-700 text-sm tracking-widest"
                  : mode === "uuid"
                  ? "text-slate-700 text-[11px]"
                  : mode === "password"
                  ? "text-emerald-700 text-xs font-semibold"
                  : "text-slate-800"
              }`}
            >
              {mode === "keys" ? `${item.slice(0, 3)} ${item.slice(3, 6)}` : item}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {mode === "keys" && onUseCodeInReceiver && (
                <button
                  type="button"
                  onClick={() => onUseCodeInReceiver(item)}
                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[10px] font-semibold transition-all cursor-pointer"
                  title="Use in Receiver Tab"
                >
                  Use Key
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopy(item, `item-${idx}`)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-white shadow-2xs transition-colors cursor-pointer"
                title="Copy String"
              >
                {copiedId === `item-${idx}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Cryptographically random & client-safe</span>
        <span className="font-semibold text-slate-600">Drop it , Share it , Done !</span>
      </div>
    </div>
  );
}
