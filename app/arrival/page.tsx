"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

const ARRIVAL_EVENT_TOKEN = "BYWC-ARRIVAL-2026";

type Application = {
  id: string;
  applicationId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  constituency?: string | null;
  status?: string | null;
  arrivalStatus?: string | null;
  arrivedAt?: string | null;
};

export default function ArrivalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hasValidQrToken, setHasValidQrToken] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    async function loadArrivalPage() {
      setLoading(true);

      const params = new URLSearchParams(window.location.search);
      const eventToken = params.get("event") || "";
      const validToken = eventToken === ARRIVAL_EVENT_TOKEN;

      setHasValidQrToken(validToken);

      if (!validToken) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        window.location.href = `/login?redirect=/arrival?event=${ARRIVAL_EVENT_TOKEN}`;
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to load arrival application:", error);
        setFeedback(
          "We could not load your application record. Please see the registration desk for help.",
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setFeedback(
          "We could not find an application record linked to this account. Please see the registration desk for help.",
        );
        setLoading(false);
        return;
      }

      setApplication({
        id: data.id,
        applicationId: data.application_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        constituency: data.constituency,
        status: data.status,
        arrivalStatus: data.arrival_status || "Not Arrived",
        arrivedAt: data.arrived_at,
      });

      setLoading(false);
    }

    loadArrivalPage();
  }, []);

  const fullName = useMemo(() => {
    if (!application) return "Applicant";

    return `${application.firstName || ""} ${application.lastName || ""}`
      .replace(/\s+/g, " ")
      .trim() || "Applicant";
  }, [application]);

  async function handleConfirmArrival() {
    if (!application) return;

    if (!hasValidQrToken) {
      setFeedback("Please scan the official venue QR code to register arrival.");
      return;
    }

    if (application.status !== "Accepted") {
      setFeedback(
        "Arrival registration is only available for accepted applicants. Please see the registration desk for help.",
      );
      return;
    }

    if (application.arrivalStatus === "Arrived") {
      setFeedback("Your arrival has already been registered.");
      return;
    }

    setSaving(true);
    setFeedback("");

    const arrivedAt = new Date().toISOString();

    const { error } = await supabase
      .from("applications")
      .update({
        arrival_status: "Arrived",
        arrived_at: arrivedAt,
        arrival_confirmed_by: "Venue QR Self Check-in",
      })
      .eq("id", application.id);

    if (error) {
      console.error("Failed to confirm QR arrival:", error);
      setFeedback(
        "We could not confirm your arrival. Please try again or see the registration desk.",
      );
      setSaving(false);
      return;
    }

    setApplication({
      ...application,
      arrivalStatus: "Arrived",
      arrivedAt,
    });

    setFeedback("Arrival confirmed successfully. Welcome to the programme.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f7] px-4 text-slate-900">
        <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <p className="text-sm font-bold text-slate-600">
            Loading arrival registration...
          </p>
        </div>
      </main>
    );
  }

  if (!hasValidQrToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f7] px-4 text-slate-900">
        <section className="w-full max-w-xl rounded-[32px] border border-orange-200 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">
            Arrival Registration
          </p>

          <h1 className="mt-4 text-3xl font-black text-blue-950">
            Scan the official venue QR code
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Arrival registration can only be completed by scanning the official
            BYWC arrival QR code displayed at the registration area.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-blue-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
          >
            Return to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef1f7] px-4 py-6 text-slate-900 lg:px-10 lg:py-10">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-white/70 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:rounded-[40px] lg:p-8">
        <div className="rounded-[28px] bg-blue-950 p-6 text-white lg:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            BYWC Arrival Registration
          </p>

          <h1 className="mt-4 text-4xl font-black lg:text-5xl">
            Welcome, {fullName}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
            Confirm your arrival only after you have physically arrived at the
            venue and scanned the official arrival QR code.
          </p>
        </div>

        {feedback && (
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm font-semibold leading-7 text-slate-700">
            {feedback}
          </div>
        )}

        {application && (
          <div className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 lg:p-6">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Status</span>
              <span className="text-sm font-black text-orange-600">
                {application.status || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Application ID</span>
              <span className="text-sm font-black text-blue-950">
                {application.applicationId || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Constituency</span>
              <span className="text-sm font-black text-blue-950">
                {application.constituency || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Arrival Status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  application.arrivalStatus === "Arrived"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {application.arrivalStatus || "Not Arrived"}
              </span>
            </div>

            {application.arrivedAt && (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Arrived At</span>
                <span className="text-sm font-black text-blue-950">
                  {new Date(application.arrivedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {application?.status === "Accepted" &&
          application?.arrivalStatus !== "Arrived" && (
            <button
              type="button"
              onClick={handleConfirmArrival}
              disabled={saving}
              className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Confirming Arrival..." : "Confirm My Arrival"}
            </button>
          )}

        {application?.arrivalStatus === "Arrived" && (
          <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold leading-7 text-emerald-800">
            Your arrival has been confirmed. Please proceed to the registration
            desk for the next step.
          </div>
        )}

        {application?.status !== "Accepted" && (
          <div className="mt-6 rounded-[24px] border border-orange-200 bg-orange-50 p-5 text-sm font-semibold leading-7 text-orange-800">
            Arrival registration is only available to accepted applicants. If
            you believe this is a mistake, please see the registration desk.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-blue-950 px-6 py-3 text-sm font-bold text-blue-950 transition hover:bg-blue-50"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/inbox"
            className="rounded-full bg-blue-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
          >
            Open Messages
          </Link>
        </div>
      </section>
    </main>
  );
}
