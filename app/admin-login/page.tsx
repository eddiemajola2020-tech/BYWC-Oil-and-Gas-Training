"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export default function AdminLoginPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Admin login failed:", error.message);
      setErrorMessage("Invalid admin login details.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-blue-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-950 to-orange-500/30" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          {/* LEFT SIDE */}
          <div>
            <img
              src="/bywc-logo.png.png"
              alt="BYWC Logo"
              className="h-24 w-auto object-contain"
            />

            <p className="mt-10 text-sm font-bold uppercase tracking-[0.22em] text-orange-300">
              Admin Access
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight lg:text-6xl">
              Programme Control Centre
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Secure admin access for reviewing applications, managing
              applicants, sending messages, and tracking programme intake.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Back to Website
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="rounded-[34px] bg-white p-8 text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
              Admin Login
            </p>

            <h2 className="mt-3 text-4xl font-bold text-blue-950">
              Sign in
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your administrator credentials to continue.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Admin Email
                </label>

                <input
                  name="email"
                  type="email"
                  placeholder="Enter admin email"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-4 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-orange-500 px-6 py-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Access Admin Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}