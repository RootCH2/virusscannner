"use client";

import React, { useState, useMemo } from "react";
import { Search, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { EngineScanResult } from "@/lib/mockData";

interface ScanMatrixGridProps {
  results: Record<string, EngineScanResult>;
}

type FilterType = "all" | "malicious" | "clean";

export default function ScanMatrixGrid({ results }: ScanMatrixGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const engines = useMemo(() => Object.values(results), [results]);

  const stats = useMemo(() => {
    let malicious = 0, clean = 0, skipped = 0;
    engines.forEach((e) => {
      if (e.category === "malicious") malicious++;
      else if (e.category === "clean") clean++;
      else skipped++;
    });
    return { malicious, clean, skipped };
  }, [engines]);

  const filteredEngines = useMemo(() => {
    return engines.filter((engine) => {
      const matchesSearch = engine.engine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (engine.result && engine.result.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTab =
        activeFilter === "all" ||
        (activeFilter === "malicious" && engine.category === "malicious") ||
        (activeFilter === "clean" && engine.category === "clean");
      return matchesSearch && matchesTab;
    });
  }, [engines, searchTerm, activeFilter]);

  return (
    <div className="w-full space-y-5">

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/50 self-start">
          {(["all", "malicious", "clean"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeFilter === f
                  ? f === "malicious"
                    ? "bg-red-500/10 text-red-400 border border-red-500/15"
                    : f === "clean"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                    : "bg-slate-800/80 text-white border border-transparent"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {f === "malicious" && <ShieldAlert className="w-3 h-3" />}
              {f === "clean" && <ShieldCheck className="w-3 h-3" />}
              <span className="capitalize">{f} ({f === "all" ? engines.length : f === "malicious" ? stats.malicious : stats.clean})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
          <input
            type="text"
            placeholder="Filter engines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-950/60 border border-slate-800/50 rounded-lg text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-neon-blue/30 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredEngines.length === 0 ? (
        <div className="w-full text-center py-16 border border-dashed border-slate-800/50 rounded-2xl">
          <ShieldX className="w-7 h-7 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-600">No engines match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredEngines.map((engine) => {
            const isMalicious = engine.category === "malicious";
            const isClean = engine.category === "clean";
            const isSkipped = engine.category === "skipped";

            return (
              <div
                key={engine.engine_name}
                className={`rounded-xl p-3.5 border transition-all duration-200 ${
                  isMalicious
                    ? "bg-red-500/[0.03] border-red-500/15 hover:border-red-500/30"
                    : isClean
                    ? "bg-slate-950/40 border-slate-800/40 hover:border-slate-700/60"
                    : "bg-slate-950/20 border-slate-900/40 opacity-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="font-semibold text-[13px] text-slate-200 truncate">{engine.engine_name}</span>
                  {isClean && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10">Clean</span>
                  )}
                  {isMalicious && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/10">Detected</span>
                  )}
                  {isSkipped && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-600 bg-slate-900/40">Skipped</span>
                  )}
                </div>
                {isMalicious ? (
                  <div className="bg-red-500/[0.05] border border-red-500/10 rounded p-2">
                    <span className="text-[8px] text-red-500/70 uppercase font-bold tracking-wider block mb-0.5">Signature</span>
                    <span className="font-mono text-[11px] text-red-400 break-all leading-tight font-semibold">{engine.result || "Malicious.Generic"}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-700 font-mono">{engine.method}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
