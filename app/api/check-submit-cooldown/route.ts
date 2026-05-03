import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { allowed: false, remainingSeconds: 30 },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("applications")
      .select("submitted_at")
      .eq("email", email)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { allowed: false, remainingSeconds: 30 },
        { status: 500 }
      );
    }

    if (!data?.submitted_at) {
      return NextResponse.json({ allowed: true, remainingSeconds: 0 });
    }

    const lastSubmitTime = new Date(data.submitted_at).getTime();
    const elapsed = Date.now() - lastSubmitTime;
    const cooldownMs = 30_000;

    if (elapsed < cooldownMs) {
      return NextResponse.json(
        {
          allowed: false,
          remainingSeconds: Math.ceil((cooldownMs - elapsed) / 1000),
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ allowed: true, remainingSeconds: 0 });
  } catch {
    return NextResponse.json(
      { allowed: false, remainingSeconds: 30 },
      { status: 500 }
    );
  }
}