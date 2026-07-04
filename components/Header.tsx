"use client";

import React from "react";
import { Shield, Radio, Activity, RefreshCw } from "lucide-react";

interface HeaderProps {
  apiMode: "demo" | "virustotal" | "loading";
}

export default function Header({ apiMode }: HeaderProps) {
  return (
    <header className="w-full bg-transparent sticky top-0 z-50 backdrop-blur-md border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2 group">
          <div className="relative w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.15)]">
            <Shield className="w-4.5 h-4.5 text-neon-blue" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-extrabold text-[15px] tracking-wide text-white">MHIROX</span>
            <span className="font-bold text-[15px] tracking-wide text-neon-blue text-glow-blue">SCAN</span>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-[13px] text-slate-400 hover:text-white transition-colors font-medium">Features</a>
          <a href="#how-it-works" className="text-[13px] text-slate-400 hover:text-white transition-colors font-medium">How it works</a>
          <a href="https://discord.gg/GeXPJv4YUw" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 text-[13px] text-white bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 rounded-full px-3.5 py-1.5 font-medium transition-all">
            <svg className="w-3.5 h-3.5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            <span>Discord</span>
          </a>
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {/* API Status Pill */}
          {apiMode === "loading" && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-500 text-[11px] font-mono">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline tracking-wider uppercase">Checking</span>
            </div>
          )}
          {apiMode === "virustotal" && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="tracking-wider uppercase font-bold hidden sm:inline">VT Live</span>
            </div>
          )}
          {apiMode === "demo" && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono">
              <Activity className="w-3 h-3" />
              <span className="tracking-wider uppercase font-bold hidden sm:inline">Demo</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
