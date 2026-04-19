import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://shredder-sporting-exponent.ngrok-free.dev";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const res = await fetch(`${BACKEND}/api/search`, {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true" },
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
