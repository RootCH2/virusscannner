import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.VIRUSTOTAL_API_KEY;
  return NextResponse.json({
    mode: hasKey ? "virustotal" : "demo"
  });
}
