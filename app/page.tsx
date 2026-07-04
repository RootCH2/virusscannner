"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import PrivacyBanner from "@/components/PrivacyBanner";
import DropZone from "@/components/DropZone";
import ThreatScoreWidget from "@/components/ThreatScoreWidget";
import ScanMatrixGrid from "@/components/ScanMatrixGrid";
import ScanBlocker from "@/components/ScanBlocker";
import { Terminal, Shield, RefreshCw, Cpu, Layers } from "lucide-react";

export default function Home() {
  const [apiMode, setApiMode] = useState<"demo" | "virustotal" | "loading">("loading");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [resultMode, setResultMode] = useState<string>("demo");
  const [blockedFileData, setBlockedFileData] = useState<{
    fileName: string;
    fileSize: number;
    hash: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Check connection state on mount
  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const config = await res.json();
          setApiMode(config.mode);
        } else {
          setApiMode("demo");
        }
      } catch {
        setApiMode("demo");
      }
    }
    checkConfig();
  }, []);

  const handleScanStart = () => {
    setIsScanning(true);
    setScanResult(null);
    setBlockedFileData(null);
  };

  const handleScanComplete = (data: any, mode: string) => {
    setIsScanning(false);
    if (data) {
      setScanResult(data);
      setResultMode(mode);
    }
  };

  const handleFileBlocked = (fileName: string, fileSize: number, hash: string) => {
    setIsScanning(false);
    setBlockedFileData({ fileName, fileSize, hash });
  };

  const handleReset = () => {
    setScanResult(null);
    setBlockedFileData(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col relative">
      {/* Cybersecurity Cyber-Grid Layer */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40 z-0" />
      
      {/* Top glowing horizon */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent blur-sm pointer-events-none" />

      {/* Header */}
      <Header apiMode={apiMode} />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10 flex flex-col space-y-8">
        
        {/* Blocker state */}
        {blockedFileData && (
          <div className="flex-grow flex items-center justify-center py-6">
            <ScanBlocker
              fileName={blockedFileData.fileName}
              fileSize={blockedFileData.fileSize}
              hash={blockedFileData.hash}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Scan Results state */}
        {scanResult && !blockedFileData && (
          <div className="space-y-8 animate-fade-in">
            <ThreatScoreWidget
              data={scanResult}
              mode={resultMode}
              onReset={handleReset}
            />
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Terminal className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-200">
                  Antivirus Scan Matrix
                </h3>
              </div>
              <ScanMatrixGrid results={scanResult.results} />
            </div>
          </div>
        )}

        {/* Idle upload state */}
        {!scanResult && !blockedFileData && (
          <div className="max-w-4xl mx-auto w-full space-y-8 flex-grow flex flex-col justify-center">
            
            {/* Title / Hero */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                <Shield className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Zero-Trust File Integrity</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                MHIROX MATRIX SCANNER
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Calculate client-side file checksums, bypass serverless limits with pre-scanned hashes, or upload files for multi-engine threat diagnostics.
              </p>
            </div>

            {/* PrivacyBanner */}
            <PrivacyBanner />

            {/* DropZone */}
            <DropZone
              onScanStart={handleScanStart}
              onScanComplete={handleScanComplete}
              onFileBlocked={handleFileBlocked}
            />

            {/* Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-neon-cyan">
                  <Cpu className="w-4 h-4" />
                  <span className="font-mono text-xs font-bold tracking-wider">LOCAL HASHING</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  All files undergo SHA-256 generation in the browser. Large files check pre-computed threat profiles without upload latencies.
                </p>
              </div>

              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-neon-cyan">
                  <Layers className="w-4 h-4" />
                  <span className="font-mono text-xs font-bold tracking-wider">SMART PROXIES</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Files under 150MB route through backend serverless tunnels. Oversized uploads are analyzed securely using hash indices to prevent quota exhausts.
                </p>
              </div>

              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-neon-cyan">
                  <Shield className="w-4 h-4" />
                  <span className="font-mono text-xs font-bold tracking-wider">20+ AV MATRIX</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Aggregates threat definitions from leading engine engines, providing instant feedback on malware signatures and heuristic detections.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-cyber-border py-5 bg-cyber-darker/60 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            Mhirox Virus Scan &copy; {new Date().getFullYear()} // Secure Threat Matrix Core v1.0.0
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/RootCH2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-200 transition-colors group"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span className="text-[10px] font-mono tracking-wider uppercase hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://t.me/iqq34"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-slate-500 hover:text-sky-400 transition-colors group"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              <span className="text-[10px] font-mono tracking-wider uppercase hidden sm:inline">Telegram</span>
            </a>
            <a
              href="https://discord.gg/GeXPJv4YUw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-slate-500 hover:text-indigo-400 transition-colors group"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span className="text-[10px] font-mono tracking-wider uppercase hidden sm:inline">Discord</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
