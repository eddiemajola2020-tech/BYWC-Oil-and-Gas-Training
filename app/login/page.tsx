"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (error) {
      setErrorMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    const redirectTo =
      new URLSearchParams(window.location.search).get("redirect") || "/home";

    window.location.href = redirectTo;
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="absolute inset-0">
        <img
          src="/banner_4.png"
          alt="Login Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/80 to-blue-950/30" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 py-10 lg:px-10">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_0.8fr]">
          <div className="text-white">
            <span className="inline-flex rounded-full bg-orange-500/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
              Applicant Portal
            </span>

            <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
              Welcome back to your application portal
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              Continue your application, review your status, check updates, and
              manage your documents from one secure place.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-[34px] border border-white/70 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
                  Login
                </p>

                <h2 className="mt-3 text-4xl font-bold tracking-tight text-blue-950">
                  Access your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Enter your login details below to continue.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300"
                    />

                    <span className="text-sm text-slate-600">
                      Remember me
                    </span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-900 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-orange-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? "Logging In..." : "Log In"}
                </button>
              </form>

              <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-center text-sm text-slate-600">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-blue-900 hover:text-blue-950"
                >
                  Create one here
                </Link>
                .
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}