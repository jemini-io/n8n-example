import { NextResponse } from "next/server";

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let n8nPaymentWebhook = "https://dan-jemini.app.n8n.cloud/webhook/schedule-intake";
  const body = await req.json();
  console.log(n8nPaymentWebhook, body);
  const n8nRes = await fetch(n8nPaymentWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: body.name,
      phone: body.phone,
      email: body.email,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    }),
  });
  const data = await n8nRes.json();
  console.log(data);
  return NextResponse.json({ redirectUrl: data.url });
}
