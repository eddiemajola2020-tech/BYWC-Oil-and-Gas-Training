"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

export default function CreateNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [hasResetSession, setHasResetSession] = useState(false);

  useEffect(() => {
    async function prepareResetSession() {
      setErrorMessage("");

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setErrorMessage(
            "This reset link is invalid or has expired. Please request a new reset link."
          );
          setHasResetSession(false);
          setIsCheckingLink(false);
          return;
        }

        window.history.replaceState(
          {},
          document.title,
          "/create-new-password"
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage(
          "No reset session found. Please request a new reset link from the forgot password page."
        );
        setHasResetSession(false);
      } else {
        setHasResetSession(true);
      }

      setIsCheckingLink(false);
    }

    prepareResetSession();
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!hasResetSession) {
      setErrorMessage("Please request a new reset link first.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully. You can now log in.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-950">
          Create New Password
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter and confirm your new password below.
        </p>

        {isCheckingLink ? (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Checking your reset link...
          </div>
        ) : (
          <>
            <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </span>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!hasResetSession || !!message}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Enter new password"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </span>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!hasResetSession || !!message}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Confirm new password"
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

              <button
                type="submit"
                disabled={isLoading || !hasResetSession || !!message}
                className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>

            {message && (
              <Link
                href="/login"
                className="mt-6 block text-center text-sm font-semibold text-blue-900 hover:underline"
              >
                Go to Login
              </Link>
            )}

            {!hasResetSession && (
              <Link
                href="/forgot-password"
                className="mt-6 block text-center text-sm font-semibold text-blue-900 hover:underline"
              >
                Request New Reset Link
              </Link>
            )}
          </>
        )}
      </div>
    </main>
  );
}