import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const REDIRECT_URL = "https://bywcprogram.org/create-new-password";

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

    // 1. Verify the email exists in the applications table
    const { data: appRow, error: appErr } = await admin
      .from("applications")
      .select("id, email")
      .ilike("email", normalised)
      .limit(1)
      .single();

    if (appErr || !appRow) {
      // Don't reveal whether email exists — return generic success
      return NextResponse.json({ ok: true });
    }

    // 2. Create auth user if not yet registered (service role bypasses email confirm)
    const { data: userList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = userList?.users?.find(
      (u) => u.email?.toLowerCase() === normalised,
    );

    if (!existing) {
      const { error: createErr } = await admin.auth.admin.createUser({
        email: normalised,
        email_confirm: true,
      });
      if (createErr) {
        console.error("[reset] createUser error:", createErr.message);
        return NextResponse.json({ error: "Could not create account." }, { status: 500 });
      }
    }

    // 3. Generate and send recovery link
    const { error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: normalised,
      options: { redirectTo: REDIRECT_URL },
    });

    if (linkErr) {
      console.error("[reset] generateLink error:", linkErr.message);
      return NextResponse.json({ error: "Could not send reset email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
