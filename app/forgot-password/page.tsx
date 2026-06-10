"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setEmail("");
        setMessage(
          "If your email is registered, a password reset link has been sent. Please check your inbox and spam folder.",
        );
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-950">Reset Your Password</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter your email and we will send you a reset link.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!message}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              placeholder="Enter your email"
            />
          </label>

          {message && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!message && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          )}
        </form>

        {message && (
          <button
            type="button"
            onClick={() => { setMessage(""); setErrorMessage(""); }}
            className="mt-4 w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Try a different email
          </button>
        )}

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-blue-900 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
