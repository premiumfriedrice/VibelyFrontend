import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://shredder-sporting-exponent.ngrok-free.dev";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = path.join("/");

  const res = await fetch(`${BACKEND}/${backendPath}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Not found" }, { status: res.status });
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
