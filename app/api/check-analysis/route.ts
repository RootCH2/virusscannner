import { NextResponse } from "next/server";
import { generateMockScan } from "@/lib/mockData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const fileName = searchParams.get("name") || "scanned_file";

    if (!id) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });
    }

    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    // Handle Mock Demo Mode
    if (id.startsWith("demo-analysis-")) {
      const base64Meta = id.substring("demo-analysis-".length);
      try {
        const metaString = Buffer.from(base64Meta, "base64url").toString("utf8");
        const fileMeta = JSON.parse(metaString);
        const { hash, fileName: metaName, fileSize, t } = fileMeta;

        // Simulate 3-second scanning/processing time
        const elapsed = t ? Date.now() - t : 5000; // default complete if t is missing
        if (elapsed < 3000) {
          return NextResponse.json({
            status: "processing",
            mode: "demo",
            progress: Math.min(Math.floor((elapsed / 3000) * 100), 99)
          });
        }

        const data = generateMockScan(metaName || fileName, hash, fileSize);
        return NextResponse.json({
          status: "completed",
          mode: "demo",
          data
        });
      } catch (e) {
        return NextResponse.json({ error: "Invalid demo analysis ID format" }, { status: 400 });
      }
    }

    // Handle Real VirusTotal API
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured for VirusTotal checks" }, { status: 400 });
    }

    const url = `https://www.virustotal.com/api/v3/analyses/${id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apikey": apiKey
      }
    });

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

    const status = attributes.status; // "queued", "processing", "completed"

    if (status !== "completed") {
      return NextResponse.json({
        status: "processing",
        mode: "virustotal"
      });
    }

    // Process completed results
    const results: Record<string, any> = {};
    const vtResults = attributes.results || {};
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
    const fileInfo = vtData?.meta?.file_info || {};

    const formattedResponse = {
      hash: fileInfo.sha256 || "unknown",
      fileName: fileName,
      fileSize: fileInfo.size || 0,
      threatScore,
      totalEngines: activeEngines,
      scanDate: new Date().toISOString(),
      status: "completed",
      results
    };

    return NextResponse.json({
      status: "completed",
      mode: "virustotal",
      data: formattedResponse
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to query scan analysis: ${error.message}` },
      { status: 500 }
    );
  }
}
