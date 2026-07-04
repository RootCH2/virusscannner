"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, FileIcon, Copy, Check, ArrowLeft } from "lucide-react";

interface ThreatScoreProps {
  data: {
    hash: string;
    fileName: string;
    fileSize: number;
    threatScore: number;
    totalEngines: number;
    scanDate: string;
  };
  mode: string;
  onReset: () => void;
}

export default function ThreatScoreWidget({ data, mode, onReset }: ThreatScoreProps) {
  const [copied, setCopied] = React.useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isClean = data.threatScore === 0;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${isClean ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent" : "bg-gradient-to-r from-transparent via-red-500 to-transparent"}`} />

      <div className="flex flex-col lg:flex-row items-center gap-8">

        {/* Radial Gauge */}
        <div className="flex-shrink-0 relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" className="stroke-slate-900 fill-none" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="40"
              className={`fill-none transition-all duration-1000 ease-out ${isClean ? "stroke-neon-emerald" : "stroke-neon-crimson"}`}
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * Math.max(data.threatScore, isClean ? 0 : 1)) / (data.totalEngines || 1)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isClean ? <ShieldCheck className="w-6 h-6 text-neon-emerald mb-1" /> : <ShieldAlert className="w-6 h-6 text-neon-crimson mb-1 animate-pulse" />}
            <div className="text-2xl font-black font-mono text-white">
              {data.threatScore}<span className="text-slate-600 text-xs font-normal">/{data.totalEngines}</span>
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-full ${isClean ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
              {isClean ? "Clean" : "Threat Detected"}
            </span>
          </div>
        </div>

        {/* File Meta */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/60">
              <FileIcon className="w-5 h-5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">{data.fileName}</h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {formatBytes(data.fileSize)} · <span className="uppercase text-neon-blue">{mode}</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/50">
              <span className="text-[9px] text-slate-600 block mb-0.5">SHA-256</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 truncate text-[10px] select-all">{data.hash}</span>
                <button onClick={copyToClipboard} className="p-1 hover:bg-slate-900 rounded text-slate-600 hover:text-slate-300 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-neon-emerald" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/50">
              <span className="text-[9px] text-slate-600 block mb-0.5">SCAN DATE</span>
              <span className="text-slate-400 text-[10px]">{new Date(data.scanDate).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <button onClick={onReset} className="flex-shrink-0 btn-outline py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Scan Another</span>
        </button>
      </div>
    </div>
  );
}
