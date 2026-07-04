import { NextResponse } from "next/server";
import { generateMockScan } from "@/lib/mockData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");
    const fileName = searchParams.get("name") || "unknown_file";
    const fileSizeStr = searchParams.get("size");
    const fileSize = fileSizeStr ? parseInt(fileSizeStr, 10) : 0;

    if (!hash) {
      return NextResponse.json({ error: "SHA-256 hash is required" }, { status: 400 });
    }

    return await handleCheckHash(hash, fileName, fileSize);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hash, fileName, fileSize } = body;

    if (!hash) {
      return NextResponse.json({ error: "SHA-256 hash is required" }, { status: 400 });
    }

    return await handleCheckHash(hash, fileName || "unknown_file", fileSize || 0);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

async function handleCheckHash(hash: string, fileName: string, fileSize: number) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    // Mock Demo Mode
    // Deterministic cache hit/miss based on first character of hash
    // Even character = hit (exists), Odd character = miss (needs upload)
    const firstChar = hash.charAt(0).toLowerCase();
    const isCacheHit = "02468ace".includes(firstChar);

    if (isCacheHit) {
      const mockResult = generateMockScan(fileName, hash, fileSize);
      return NextResponse.json({
        exists: true,
        mode: "demo",
        data: mockResult
      });
    } else {
      return NextResponse.json({
        exists: false,
        mode: "demo",
        message: "Hash not found in cache. Client should upload the file."
      });
    }
  }

  // Real VirusTotal API call
  try {
    const url = `https://www.virustotal.com/api/v3/files/${hash}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apikey": apiKey
      }
    });

    if (response.status === 404) {
      return NextResponse.json({
        exists: false,
        mode: "virustotal",
        message: "Hash not found in VirusTotal."
      });
    }

    if (response.status === 429) {
      return NextResponse.json(
        { error: "VirusTotal API rate limit exceeded (429). Please try again later.", isRateLimit: true },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `VirusTotal API error: ${response.statusText} (${errText})` }, { status: response.status });
    }

    const vtData = await response.json();
    const attributes = vtData?.data?.attributes;

    if (!attributes) {
      return NextResponse.json({ error: "Invalid response structure from VirusTotal" }, { status: 502 });
    }

    // Format VT response to our unified format
    const results: Record<string, any> = {};
    const vtResults = attributes.last_analysis_results || {};
    let threatScore = 0;

    Object.keys(vtResults).forEach((engine) => {
      const engineData = vtResults[engine];
      const vtCategory = engineData.category;
      let category: "clean" | "malicious" | "skipped" = "clean";

      if (vtCategory === "malicious" || vtCategory === "suspicious") {
        category = "malicious";
        threatScore++;
      } else if (["timeout", "failure", "type-unsupported"].includes(vtCategory)) {
        category = "skipped";
      }

      results[engine] = {
        engine_name: engine,
        category,
        result: engineData.result || null,
        method: engineData.method || "unknown"
      };
    });

    const activeEngines = Object.keys(results).filter(k => results[k].category !== "skipped").length;

    const formattedResponse = {
      hash: attributes.sha256 || hash,
      fileName: fileName || attributes.names?.[0] || "scanned_file",
      fileSize: attributes.size || fileSize,
      threatScore,
      totalEngines: activeEngines,
      scanDate: new Date(attributes.last_analysis_date * 1000 || Date.now()).toISOString(),
      status: "completed",
      results
    };

    return NextResponse.json({
      exists: true,
      mode: "virustotal",
      data: formattedResponse
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to query VirusTotal: ${error.message}` },
      { status: 500 }
    );
  }
}
