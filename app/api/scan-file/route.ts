import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const clientHash = formData.get("hash") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Limit check for Vercel Payload (4.5MB max payload size originally, increased to 150MB)
    // 150MB = 157,286,400 bytes
    const MAX_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 150MB proxy upload limit for serverless functions." },
        { status: 413 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;

    if (!apiKey) {
      // Mock Demo Mode
      // Create a stateless mock analysis ID by base64-encoding the file metadata
      const fileMeta = {
        hash: clientHash || "da39a3ee5e6b4b0d3255bfef95601890afd80709", // fallback
        fileName,
        fileSize,
        t: Date.now()
      };
      
      const metaString = JSON.stringify(fileMeta);
      const base64Meta = Buffer.from(metaString).toString("base64url");
      const mockAnalysisId = `demo-analysis-${base64Meta}`;

      // Simulate a small delay for upload network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        id: mockAnalysisId,
        mode: "demo",
        message: "File uploaded successfully (Demo Mode)."
      });
    }

    // Real VirusTotal API upload
    const vtFormData = new FormData();
    // Convert File to Blob for standard fetch transmission
    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
    vtFormData.append("file", fileBlob, file.name);

    const vtResponse = await fetch("https://www.virustotal.com/api/v3/files", {
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
