"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, ShieldAlert, Cpu, RefreshCw, FileText } from "lucide-react";

interface DropZoneProps {
  onScanComplete: (data: any, mode: string) => void;
  onFileBlocked: (fileName: string, fileSize: number, hash: string) => void;
  onScanStart: () => void;
}

export default function DropZone({ onScanComplete, onFileBlocked, onScanStart }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "hashing" | "checking" | "uploading" | "polling" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const calculateSHA256 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const processFile = async (file: File) => {
    if (!file) return;
    setStatus("hashing");
    setProgress(15);
    setFileDetails({ name: file.name, size: file.size });
    onScanStart();
    setErrorMsg("");

    try {
      const hash = await calculateSHA256(file);
      setProgress(40);
      setStatus("checking");

      const checkRes = await fetch(`/api/check-hash?hash=${hash}&name=${encodeURIComponent(file.name)}&size=${file.size}`);
      if (checkRes.status === 429) throw new Error("Rate limit exceeded. Please retry later.");
      if (!checkRes.ok) throw new Error("Failed to check hash cache.");

      const cacheData = await checkRes.json();
      setProgress(70);

      if (cacheData.exists) {
        setProgress(100);
        setTimeout(() => {
          onScanComplete(cacheData.data, cacheData.mode);
          setStatus("idle");
          setFileDetails(null);
        }, 600);
        return;
      }

      const MAX_PROXY_SIZE = 150 * 1024 * 1024;
      if (file.size > MAX_PROXY_SIZE) {
        setTimeout(() => {
          onFileBlocked(file.name, file.size, hash);
          setStatus("idle");
          setFileDetails(null);
        }, 500);
        return;
      }

      setStatus("uploading");
      setProgress(80);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("hash", hash);

      const uploadRes = await fetch("/api/scan-file", { method: "POST", body: uploadFormData });
      if (uploadRes.status === 429) throw new Error("Upload rate limit reached.");
      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || "Upload failed.");
      }

      const uploadData = await uploadRes.json();
      setStatus("polling");
      setProgress(90);
      pollAnalysis(uploadData.id, file.name);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const pollAnalysis = async (analysisId: string, fileName: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    const checkInterval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(checkInterval);
        setErrorMsg("Scan timed out.");
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(`/api/check-analysis?id=${analysisId}&name=${encodeURIComponent(fileName)}`);
        if (res.status === 429) { clearInterval(checkInterval); throw new Error("Rate limit."); }
        if (!res.ok) { clearInterval(checkInterval); throw new Error("Polling failed."); }
        const scanStatus = await res.json();
        if (scanStatus.status === "completed") {
          clearInterval(checkInterval);
          setProgress(100);
          setTimeout(() => {
            onScanComplete(scanStatus.data, scanStatus.mode);
            setStatus("idle");
            setFileDetails(null);
          }, 600);
        } else if (scanStatus.progress) {
          setProgress(90 + Math.floor(scanStatus.progress * 0.1));
        }
      } catch (err: any) {
        clearInterval(checkInterval);
        setErrorMsg(err.message);
        setStatus("error");
      }
    }, 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const statusLabels: Record<string, string> = {
    hashing: "Computing SHA-256 hash locally...",
    checking: "Querying threat database cache...",
    uploading: "Uploading through secure proxy...",
    polling: "Scanning across 22+ AV engines...",
    error: errorMsg,
  };

  const statusTitles: Record<string, string> = {
    hashing: "Stage 1 — Client Hashing",
    checking: "Stage 2 — Cache Lookup",
    uploading: "Stage 3 — Serverless Upload",
    polling: "Stage 4 — AV Matrix Scan",
    error: "Scan Error",
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={status === "idle" ? () => fileInputRef.current?.click() : undefined}
        className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-10 transition-all duration-300 relative overflow-hidden cursor-pointer min-h-[200px] ${
          isDragActive
            ? "border-neon-blue/60 bg-neon-blue/[0.04] shadow-[0_0_30px_rgba(59,130,246,0.1)] scale-[1.005]"
            : "border-slate-800/60 bg-slate-950/30 hover:border-slate-700/60 hover:bg-slate-950/50"
        } ${status !== "idle" ? "pointer-events-none" : ""}`}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={status !== "idle"} />

        {/* Active scan overlay */}
        {status !== "idle" && (
          <div className="absolute inset-0 bg-cyber-bg/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6">
            <div className="w-full max-w-sm space-y-5">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${status === "error" ? "bg-red-500/10 border-red-500/20" : "bg-neon-blue/10 border-neon-blue/20"}`}>
                  {status === "hashing" && <Cpu className="w-5 h-5 text-neon-blue animate-spin" />}
                  {status === "checking" && <RefreshCw className="w-5 h-5 text-neon-blue animate-spin" />}
                  {status === "uploading" && <UploadCloud className="w-5 h-5 text-neon-blue animate-bounce" />}
                  {status === "polling" && <RefreshCw className="w-5 h-5 text-neon-blue animate-spin" />}
                  {status === "error" && <ShieldAlert className="w-5 h-5 text-neon-crimson" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest block">{statusTitles[status]}</span>
                  <span className="text-sm font-semibold text-white truncate block">{fileDetails?.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{fileDetails?.size ? formatBytes(fileDetails.size) : ""}</span>
                </div>
                <span className="font-mono text-sm font-bold text-neon-blue">{progress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${status === "error" ? "bg-neon-crimson" : "bg-gradient-to-r from-neon-blue to-neon-cyan"}`} style={{ width: `${progress}%` }} />
              </div>
              <p className={`text-center text-xs font-mono ${status === "error" ? "text-neon-crimson" : "text-slate-500"}`}>{statusLabels[status]}</p>
              {status === "error" && (
                <button
                  onClick={(e) => { e.stopPropagation(); setStatus("idle"); onScanComplete(null, "demo"); }}
                  className="w-full py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Idle State */}
        {status === "idle" && (
          <div className="text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neon-blue/5 border border-neon-blue/10 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-slate-300 font-semibold text-sm">Drop a file to scan</p>
              <p className="text-slate-600 text-xs mt-0.5">or <span className="text-neon-blue font-semibold">browse files</span> · max 150MB upload</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
