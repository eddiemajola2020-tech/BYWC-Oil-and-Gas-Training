"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

const ARRIVAL_EVENT_TOKEN = "BYWC-ARRIVAL-2026";
const ARRIVAL_DISCLAIMER_VERSION = "BYWC-ARRIVAL-DISCLAIMER-2026-V1";

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
  arrivalDisclaimerAccepted?: boolean | null;
  arrivalDisclaimerAcceptedAt?: string | null;
  arrivalDisclaimerVersion?: string | null;
};

export default function ArrivalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hasValidQrToken, setHasValidQrToken] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

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
        arrivalDisclaimerAccepted: data.arrival_disclaimer_accepted || false,
        arrivalDisclaimerAcceptedAt: data.arrival_disclaimer_accepted_at,
        arrivalDisclaimerVersion: data.arrival_disclaimer_version,
      });

      setHasAcceptedDisclaimer(Boolean(data.arrival_disclaimer_accepted));

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

    if (!hasAcceptedDisclaimer) {
      setFeedback("Please read and accept the arrival disclaimer before confirming your arrival.");
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
        arrival_disclaimer_accepted: true,
        arrival_disclaimer_accepted_at: arrivedAt,
        arrival_disclaimer_version: ARRIVAL_DISCLAIMER_VERSION,
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
      arrivalDisclaimerAccepted: true,
      arrivalDisclaimerAcceptedAt: arrivedAt,
      arrivalDisclaimerVersion: ARRIVAL_DISCLAIMER_VERSION,
    });

    setFeedback("Arrival confirmed successfully. Redirecting you to your dashboard...");
    setSaving(false);

    setTimeout(() => {
      window.location.href = "/dashboard?arrival=confirmed";
    }, 1600);
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
            <section className="mt-6 rounded-[28px] border border-orange-200 bg-orange-50 p-5 lg:p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                Arrival Disclaimer
              </p>

              <h2 className="mt-2 text-2xl font-black text-blue-950">
                Please read before confirming
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-700">
                By confirming arrival, you acknowledge that you are physically present at the official registration venue for the Botswana Youth, Women & Citizen Oil & Gas Training Programme 2026. Your arrival time will be recorded for registration, accommodation allocation, attendance tracking, and programme administration purposes.
              </p>

              <button
                type="button"
                onClick={() => setShowFullDisclaimer((current) => !current)}
                className="mt-4 rounded-full border border-blue-950 px-5 py-3 text-sm font-bold text-blue-950 transition hover:bg-blue-50"
              >
                {showFullDisclaimer ? "Hide Full Disclaimer" : "Read Full Disclaimer"}
              </button>

              {showFullDisclaimer && (
                <div className="mt-5 space-y-3 rounded-[24px] bg-white p-5 text-sm leading-7 text-slate-700">
                  <p>
                    Arrival confirmation is only for applicants who have been accepted into the programme and who have physically arrived at the official venue. Do not confirm arrival on behalf of another person.
                  </p>
                  <p>
                    The programme administration team may use your arrival record to support registration verification, attendance monitoring, accommodation allocation, meal planning, safety coordination, and official programme reporting.
                  </p>
                  <p>
                    Confirming arrival does not replace any additional verification that may be required at the registration desk. You may still be asked to present your Omang/ID and any required programme documents.
                  </p>
                  <p>
                    If the information shown on this page is incorrect, do not continue. Please report to the registration desk for assistance.
                  </p>
                </div>
              )}

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[24px] bg-white p-4 text-sm font-semibold leading-6 text-slate-700">
                <input
                  type="checkbox"
                  checked={hasAcceptedDisclaimer}
                  onChange={(event) => setHasAcceptedDisclaimer(event.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600"
                />
                <span>
                  I have read and understood the arrival disclaimer, and I confirm that I am physically present at the official registration venue.
                </span>
              </label>
            </section>
          )}

        {application?.status === "Accepted" &&
          application?.arrivalStatus !== "Arrived" && (
            <button
              type="button"
              onClick={handleConfirmArrival}
              disabled={saving || !hasAcceptedDisclaimer}
              className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving
                ? "Confirming Arrival..."
                : hasAcceptedDisclaimer
                ? "Confirm My Arrival"
                : "Accept Disclaimer To Continue"}
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
