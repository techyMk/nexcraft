import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SOURCES = new Set(["footer", "home_section", "other"]);

export async function POST(req: Request) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const source = body.source && VALID_SOURCES.has(body.source) ? body.source : "other";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("newsletter_subscribers")
    .upsert(
      { email, source, confirmed_at: new Date().toISOString() },
      { onConflict: "email" },
    );

  if (error) {
    console.error("[newsletter] insert failed:", error);
    return NextResponse.json(
      { error: "Couldn't save your email — please try again." },
      { status: 500 },
    );
  }

  // Best-effort welcome email. If Resend isn't configured we just skip it;
  // the subscription itself has already succeeded.
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "NexCart <techymk.dev@gmail.com>";
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: "Welcome to NexCart Insiders",
          html: welcomeHtml(),
        }),
      });
    } catch (e) {
      console.warn("[newsletter] welcome email failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

function welcomeHtml() {
  return `<!doctype html>
<html><body style="margin:0;background:#050816;color:#e6e9f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a91b4">Insiders only</div>
  <h1 style="margin:12px 0 16px;font-size:28px;line-height:1.15;background:linear-gradient(90deg,#7c5cff,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent">Welcome to NexCart.</h1>
  <p style="font-size:15px;line-height:1.6;color:#cbd0e6">You're in. From now on, you'll be first to see private drops, AI-picked deals, and ten percent off your first order.</p>
  <p style="font-size:15px;line-height:1.6;color:#cbd0e6">Use code <strong style="color:#fff;background:rgba(124,92,255,.18);padding:2px 8px;border-radius:6px">INSIDER10</strong> at checkout — valid for 7 days.</p>
  <div style="margin:28px 0">
    <a href="https://nexcart-ecom.vercel.app/shop" style="display:inline-block;padding:12px 22px;border-radius:9999px;background:linear-gradient(90deg,#7c5cff,#a855f7);color:#fff;text-decoration:none;font-weight:600;font-size:14px">Start shopping →</a>
  </div>
  <p style="font-size:12px;color:#8a91b4">No spam. You can unsubscribe any time by replying STOP.</p>
</div>
</body></html>`;
}
