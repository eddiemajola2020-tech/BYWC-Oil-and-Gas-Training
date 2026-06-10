import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAILS = [
  "eddiemajola2020@gmail.com",
  "bandaseilaneng@gmail.com",
  "oil-gas.training@sethresources.com",
  "tsmogotsi@yahoo.com",
];
const REDIRECT_URL = "https://bywcprogram.org/create-new-password";

export async function POST(request: Request) {
  try {
    const { email, callerEmail } = await request.json();

    // Only admin emails can call this endpoint
    if (!ADMIN_EMAILS.includes(callerEmail)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required." }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if auth user exists
    const { data: userList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = userList?.users?.find(
      (u) => u.email?.toLowerCase() === normalised,
    );

    let created = false;
    if (!existing) {
      const { error: createErr } = await admin.auth.admin.createUser({
        email: normalised,
        email_confirm: true,
      });
      if (createErr) {
        return NextResponse.json(
          { error: "Failed to create auth account: " + createErr.message },
          { status: 500 },
        );
      }
      created = true;
    }

    // Always send a fresh reset link
    const { error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: normalised,
      options: { redirectTo: REDIRECT_URL },
    });

    if (linkErr) {
      return NextResponse.json(
        { error: "Failed to send reset email: " + linkErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      created,
      message: created
        ? `Auth account created and reset email sent to ${normalised}.`
        : `Reset email sent to ${normalised}.`,
    });
  } catch (err) {
    console.error("[sync-auth] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
