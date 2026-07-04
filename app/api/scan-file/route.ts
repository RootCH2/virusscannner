import { NextResponse } from "next/server";

export const maxDuration = 120; // Allow up to 2 minutes for large uploads

export async function POST(request: Request) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const clientHash = formData.get("hash") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const MAX_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 150MB upload limit." },
        { status: 413 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;

    if (!apiKey) {
      // Mock Demo Mode
      const fileMeta = {
        hash: clientHash || "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        fileName,
        fileSize,
        t: Date.now()
      };
      
      const metaString = JSON.stringify(fileMeta);
      const base64Meta = Buffer.from(metaString).toString("base64url");
      const mockAnalysisId = `demo-analysis-${base64Meta}`;

      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        id: mockAnalysisId,
        mode: "demo",
        message: "File uploaded successfully (Demo Mode)."
      });
    }

    // Real VirusTotal API upload
    const fileBytes = await file.arrayBuffer();
    const fileBlob = new Blob([fileBytes], { type: file.type || "application/octet-stream" });

    // Files > 32MB need a special upload URL from VirusTotal
    const VT_LARGE_FILE_THRESHOLD = 32 * 1024 * 1024;
    let uploadUrl = "https://www.virustotal.com/api/v3/files";

    if (file.size > VT_LARGE_FILE_THRESHOLD) {
      const urlRes = await fetch("https://www.virustotal.com/api/v3/files/upload_url", {
        headers: { "x-apikey": apiKey },
      });

      if (urlRes.status === 429) {
        return NextResponse.json(
          { error: "VirusTotal API rate limit exceeded. Please try again later.", isRateLimit: true },
          { status: 429 }
        );
      }

      if (!urlRes.ok) {
        const errText = await urlRes.text();
        return NextResponse.json(
          { error: `Failed to get VT upload URL: ${urlRes.statusText} - ${errText}` },
          { status: urlRes.status }
        );
      }

      const urlData = await urlRes.json();
      uploadUrl = urlData.data;
    }

    const vtFormData = new FormData();
    vtFormData.append("file", fileBlob, file.name);

    const vtResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "x-apikey": apiKey
      },
      body: vtFormData
    });

    if (vtResponse.status === 429) {
      return NextResponse.json(
        { error: "VirusTotal API rate limit exceeded (429). Please try again later.", isRateLimit: true },
        { status: 429 }
      );
    }

    if (!vtResponse.ok) {
      const errText = await vtResponse.text();
      return NextResponse.json(
        { error: `VirusTotal upload failed: ${vtResponse.statusText} (${errText})` },
        { status: vtResponse.status }
      );
    }

    const vtData = await vtResponse.json();
    const analysisId = vtData?.data?.id;

    if (!analysisId) {
      return NextResponse.json({ error: "Failed to obtain analysis ID from VirusTotal" }, { status: 502 });
    }

    return NextResponse.json({
      id: analysisId,
      mode: "virustotal",
      message: "File uploaded successfully to VirusTotal."
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Upload proxy error: ${error.message}` },
      { status: 500 }
    );
  }
}
