"use client";

import React, { useState } from "react";
import { ShieldAlert, Copy, Check, ArrowLeft, Terminal } from "lucide-react";

interface ScanBlockerProps {
  fileName: string;
  fileSize: number;
  hash: string;
  onReset: () => void;
}

export default function ScanBlocker({ fileName, fileSize, hash, onReset }: ScanBlockerProps) {
  const [copied, setCopied] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-6 md:p-8 border-neon-crimson/30 shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden">
      
      {/* Glow Header bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-neon-crimson to-red-600 shadow-[0_1px_15px_#ef4444]" />

      <div className="flex flex-col items-center text-center space-y-6">
        
        {/* Blocker Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/40 border border-neon-crimson/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
          <ShieldAlert className="w-8 h-8 text-neon-crimson" />
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black tracking-wider text-slate-100 uppercase">
            Payload Threshold Exceeded
          </h2>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
            Stage 3 Smart Upload Halted
          </p>
        </div>

        {/* Explanatory Technical Banner */}
        <div className="w-full bg-slate-950/80 border border-slate-900 rounded-xl p-4 text-left space-y-3 font-sans">
          <div className="flex items-center space-x-2 text-neon-crimson">
            <Terminal className="w-4 h-4" />
            <span className="font-mono text-xs font-bold tracking-wider">GATEWAY PROTOCOL LIMITATION:</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            This application is deployed on Vercel Serverless Architecture, which imposes a hard <strong>4.5MB payload limit</strong> on API Route gateway requests. Because this file hash was unrecognized in our cache database, raw file transmission is required to scan it. 
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            To prevent security credential exposure, we do not perform direct client-to-API uploads of private keys or raw tokens.
          </p>
        </div>

        {/* File Details Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-left font-mono text-xs">
          <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg">
            <span className="text-[10px] text-slate-500 block mb-1">FILE NAME</span>
            <span className="text-slate-300 font-semibold truncate block" title={fileName}>
              {fileName}
            </span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg">
            <span className="text-[10px] text-slate-500 block mb-1">FILE SIZE</span>
            <span className="text-slate-300 font-semibold">
              {formatBytes(fileSize)} <span className="text-[10px] text-slate-500 font-normal">(Limit: 4.0MB)</span>
            </span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 block mb-0.5">SHA-256 IDENTIFIER</span>
            <div className="flex items-center justify-between gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
              <span className="text-slate-300 text-[10px] truncate select-all">
                {hash.substring(0, 8)}...{hash.substring(hash.length - 8)}
              </span>
              <button
                onClick={copyHash}
                className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-slate-300 transition-colors"
                title="Copy SHA-256"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            onClick={onReset}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 font-mono text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Scan Smaller File</span>
          </button>
          <button
            onClick={copyHash}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/20 hover:border-red-500/40 font-mono text-xs font-bold text-neon-crimson transition-all flex items-center justify-center space-x-2"
          >
            <span>Copy Full Hash ({copied ? "Copied!" : "SHA-256"})</span>
          </button>
        </div>

      </div>

    </div>
  );
}
