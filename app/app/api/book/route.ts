import { NextResponse } from "next/server";

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const n8nRes = await fetch("http://localhost:5678/webhook-test/schedule-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  console.log(n8nRes);
  // const data = await n8nRes.json();
  // console.log(data);
  return NextResponse.json({ redirectUrl: n8nRes.url });
}
