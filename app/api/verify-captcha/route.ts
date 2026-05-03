import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}