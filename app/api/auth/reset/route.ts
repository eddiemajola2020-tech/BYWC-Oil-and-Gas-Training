import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const REDIRECT_URL = "https://bywcprogram.org/create-new-password";

async function sendResetEmail(toEmail: string, actionLink: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "BYWC Programme", email: "noreply@bywcprogram.org" },
      to: [{ email: toEmail }],
      subject: "Reset your BYWC password",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
          <img src="https://bywcprogram.org/logo.png" alt="BYWC" style="height:48px;margin-bottom:24px" />
          <h2 style="color:#1e3a5f;margin-bottom:8px">Reset your password</h2>
          <p style="color:#444;line-height:1.6">
            You requested a password reset for your BYWC applicant account.
            Click the button below to create a new password.
          </p>
          <a href="${actionLink}"
             style="display:inline-block;margin:24px 0;padding:14px 28px;background:#f97316;color:#fff;text-decoration:none;border-radius:999px;font-weight:bold;font-size:15px">
            Create New Password
          </a>
          <p style="color:#888;font-size:13px;line-height:1.6">
            This link expires in 1 hour. If you did not request a password reset, you can ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
          <p style="color:#aaa;font-size:12px">
            BYWC Oil &amp; Gas Training Programme &bull; Botswana
          </p>
        </div>
      `,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Verify email exists in applications table
    const { data: appRow, error: appErr } = await admin
      .from("applications")
      .select("id, email")
      .ilike("email", normalised)
      .limit(1)
      .single();

    if (appErr || !appRow) {
      return NextResponse.json({ ok: true });
    }

    // 2. Create auth user if not yet registered
    const { error: createErr } = await admin.auth.admin.createUser({
      email: normalised,
      email_confirm: true,
    });
    if (createErr && !createErr.message.toLowerCase().includes("already")) {
      console.error("[reset] createUser error:", createErr.message);
      return NextResponse.json({ error: "Could not create account." }, { status: 500 });
    }

    // 3. Generate recovery link (get action_link, send email ourselves via Brevo)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: normalised,
      options: { redirectTo: REDIRECT_URL },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error("[reset] generateLink error:", linkErr?.message);
      return NextResponse.json({ error: "Could not generate reset link." }, { status: 500 });
    }

    // 4. Send via Brevo API (bypasses broken SMTP)
    await sendResetEmail(normalised, linkData.properties.action_link);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
