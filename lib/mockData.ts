export interface EngineScanResult {
  engine_name: string;
  category: "clean" | "malicious" | "skipped";
  result: string | null;
  method: string;
}

export interface ScanResponse {
  hash: string;
  fileName: string;
  fileSize: number;
  threatScore: number;
  totalEngines: number;
  scanDate: string;
  status: "completed" | "processing";
  results: Record<string, EngineScanResult>;
}

const AV_ENGINES = [
  "Bitdefender",
  "Kaspersky",
  "Sophos",
  "CrowdStrike",
  "ClamAV",
  "Microsoft",
  "Symantec",
  "Avast",
  "AVG",
  "Malwarebytes",
  "ESET NOD32",
  "McAfee",
  "Trend Micro",
  "Fortinet",
  "Palo Alto Networks",
  "SentinelOne",
  "F-Secure",
  "G Data",
  "Avira",
  "VIPRE",
  "Webroot",
  "Cynet"
];

// Helper to determine if a file name or hash represents a simulated threat
export function detectMockThreat(fileName: string, hash: string): { isThreat: boolean; type: "eicar" | "malware" | "clean" } {
  const lowerName = fileName.toLowerCase();
  const lowerHash = hash.toLowerCase();

  if (lowerName.includes("eicar") || lowerHash.includes("eicar")) {
    return { isThreat: true, type: "eicar" };
  }
  if (
    lowerName.includes("virus") ||
    lowerName.includes("malware") ||
    lowerName.includes("trojan") ||
    lowerHash.startsWith("bad") ||
    lowerHash.endsWith("666")
  ) {
    return { isThreat: true, type: "malware" };
  }
  return { isThreat: false, type: "clean" };
}

// Generate deterministic mock scan results
export function generateMockScan(fileName: string, fileHash: string, fileSize: number): ScanResponse {
  const { isThreat, type } = detectMockThreat(fileName, fileHash);
  const results: Record<string, EngineScanResult> = {};
  let threatScore = 0;

  AV_ENGINES.forEach((engine, index) => {
    // We want some deterministic variety. Let's use the engine name character sum and hash characters
    const engineSeed = engine.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isSkipped = (engineSeed % 9 === 0); // ~11% chance to be skipped for realism

    if (isSkipped) {
      results[engine] = {
        engine_name: engine,
        category: "skipped",
        result: null,
        method: "skipped"
      };
      return;
    }

    if (isThreat) {
      // Not all engines detect even a threat (simulating real-world detection rate)
      // E.g., detection rate of 75% for malware, 90% for EICAR
      const detectionThreshold = type === "eicar" ? 0.9 : 0.7;
      const isDetected = ((engineSeed + fileHash.charCodeAt(0)) % 100) / 100 < detectionThreshold;

      if (isDetected) {
        threatScore++;
        results[engine] = {
          engine_name: engine,
          category: "malicious",
          result: type === "eicar" 
            ? "EICAR-Test-Signature (static)" 
            : getDeterministicSignature(engine, engineSeed),
          method: "signature-match"
        };
      } else {
        results[engine] = {
          engine_name: engine,
          category: "clean",
          result: null,
          method: "heuristic"
        };
      }
    } else {
      // Clean file
      results[engine] = {
        engine_name: engine,
        category: "clean",
        result: null,
        method: "heuristic"
      };
    }
  });

  const activeEngines = AV_ENGINES.filter(e => results[e].category !== "skipped").length;

  return {
    hash: fileHash,
    fileName,
    fileSize,
    threatScore,
    totalEngines: activeEngines,
    scanDate: new Date().toISOString(),
    status: "completed",
    results
  };
}

function getDeterministicSignature(engine: string, seed: number): string {
  const signatures = [
    "Win32.Trojan.Generic",
    "Trojan.Downloader.Agent.gen",
    "Adware.Generic.VSCAN",
    "Worm.Generic.Explorer",
    "Ransom.Crypter.Locky",
    "Exploit.HTML.Shellcode",
    "HEUR/Malware.Passive",
    "PUA.Bundler.Generic"
  ];
  return signatures[seed % signatures.length];
}
