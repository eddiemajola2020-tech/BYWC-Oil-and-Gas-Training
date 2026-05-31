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
  phone?: string | null;
  constituency?: string | null;
  status?: string | null;
  arrivalStatus?: string | null;
  arrivedAt?: string | null;
  arrivalDisclaimerAccepted?: boolean | null;
  arrivalDisclaimerAcceptedAt?: string | null;
  arrivalDisclaimerVersion?: string | null;
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  emergencyContactRelationship?: string | null;
  knownMedicalConditions?: string | null;
  currentMedication?: string | null;
  hasDietaryRestrictions?: boolean | null;
  dietaryRestrictionsDetails?: string | null;
};

export default function ArrivalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hasValidQrToken, setHasValidQrToken] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [knownMedicalConditions, setKnownMedicalConditions] = useState("");
  const [currentMedication, setCurrentMedication] = useState("");
  const [hasDietaryRestrictions, setHasDietaryRestrictions] = useState(false);
  const [dietaryRestrictionsDetails, setDietaryRestrictionsDetails] =
    useState("");

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

      const loadedApplication: Application = {
        id: data.id,
        applicationId: data.application_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        constituency: data.constituency,
        status: data.status,
        arrivalStatus: data.arrival_status || "Not Arrived",
        arrivedAt: data.arrived_at,
        arrivalDisclaimerAccepted: data.arrival_disclaimer_accepted || false,
        arrivalDisclaimerAcceptedAt: data.arrival_disclaimer_accepted_at,
        arrivalDisclaimerVersion: data.arrival_disclaimer_version,
        emergencyContactName: data.emergency_contact_name,
        emergencyContactNumber: data.emergency_contact_number,
        emergencyContactRelationship: data.emergency_contact_relationship,
        knownMedicalConditions: data.known_medical_conditions,
        currentMedication: data.current_medication,
        hasDietaryRestrictions: data.has_dietary_restrictions || false,
        dietaryRestrictionsDetails: data.dietary_restrictions_details,
      };

      setApplication(loadedApplication);
      setHasAcceptedDisclaimer(Boolean(data.arrival_disclaimer_accepted));
      setEmergencyContactName(data.emergency_contact_name || "");
      setEmergencyContactNumber(data.emergency_contact_number || "");
      setEmergencyContactRelationship(
        data.emergency_contact_relationship || "",
      );
      setKnownMedicalConditions(data.known_medical_conditions || "");
      setCurrentMedication(data.current_medication || "");
      setHasDietaryRestrictions(Boolean(data.has_dietary_restrictions));
      setDietaryRestrictionsDetails(data.dietary_restrictions_details || "");
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

  function validateArrivalForm() {
    if (!emergencyContactName.trim()) {
      return "Please enter your emergency contact name.";
    }

    if (!emergencyContactNumber.trim()) {
      return "Please enter your emergency contact number.";
    }

    if (!emergencyContactRelationship.trim()) {
      return "Please enter your relationship to the emergency contact.";
    }

    if (hasDietaryRestrictions && !dietaryRestrictionsDetails.trim()) {
      return "Please describe your dietary restrictions.";
    }

    if (!hasAcceptedDisclaimer) {
      return "Please read and accept the participant waiver before confirming your arrival.";
    }

    return "";
  }

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

    const validationMessage = validateArrivalForm();

    if (validationMessage) {
      setFeedback(validationMessage);
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
        registration_status: "Pending",
        emergency_contact_name: emergencyContactName.trim(),
        emergency_contact_number: emergencyContactNumber.trim(),
        emergency_contact_relationship: emergencyContactRelationship.trim(),
        known_medical_conditions: knownMedicalConditions.trim(),
        current_medication: currentMedication.trim(),
        has_dietary_restrictions: hasDietaryRestrictions,
        dietary_restrictions_details: hasDietaryRestrictions
          ? dietaryRestrictionsDetails.trim()
          : "",
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
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelationship,
      knownMedicalConditions,
      currentMedication,
      hasDietaryRestrictions,
      dietaryRestrictionsDetails: hasDietaryRestrictions
        ? dietaryRestrictionsDetails
        : "",
    });

    setFeedback("Arrival registration complete. Redirecting you to your dashboard...");
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
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/70 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:rounded-[40px] lg:p-8">
        <div className="rounded-[28px] bg-blue-950 p-6 text-white lg:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            BYWC Arrival Registration
          </p>

          <h1 className="mt-4 text-4xl font-black lg:text-5xl">
            Welcome, {fullName}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
            Complete this form only after you have physically arrived at the
            venue and scanned the official arrival QR code.
          </p>
        </div>

        {feedback && (
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm font-semibold leading-7 text-slate-700">
            {feedback}
          </div>
        )}

        {application && (
          <div className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 lg:grid-cols-2 lg:p-6">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Status</span>
              <p className="mt-1 text-sm font-black text-orange-600">
                {application.status || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Application ID</span>
              <p className="mt-1 text-sm font-black text-blue-950">
                {application.applicationId || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Constituency</span>
              <p className="mt-1 text-sm font-black text-blue-950">
                {application.constituency || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Arrival Status</span>
              <p
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${
                  application.arrivalStatus === "Arrived"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {application.arrivalStatus || "Not Arrived"}
              </p>
            </div>

            {application.arrivedAt && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 lg:col-span-2">
                <span className="text-sm text-slate-500">Arrived At</span>
                <p className="mt-1 text-sm font-black text-blue-950">
                  {new Date(application.arrivedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {application?.status === "Accepted" &&
          application?.arrivalStatus !== "Arrived" && (
            <>
              <section className="mt-6 rounded-[28px] border border-blue-200 bg-blue-50 p-5 lg:p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                  Registration Details
                </p>

                <h2 className="mt-2 text-2xl font-black text-blue-950">
                  Confirm missing arrival information
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  We will not ask again for information already captured in your
                  application. Please complete only the arrival-specific details
                  needed for safety, meals, accommodation coordination and
                  emergency support.
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Emergency contact name
                    </span>
                    <input
                      value={emergencyContactName}
                      onChange={(event) => setEmergencyContactName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      placeholder="Full name"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Emergency contact number
                    </span>
                    <input
                      value={emergencyContactNumber}
                      onChange={(event) => setEmergencyContactNumber(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      placeholder="Phone number"
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Relationship to participant
                    </span>
                    <input
                      value={emergencyContactRelationship}
                      onChange={(event) => setEmergencyContactRelationship(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      placeholder="Parent, guardian, spouse, sibling, friend, etc."
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Known medical conditions, allergies or disabilities
                    </span>
                    <textarea
                      value={knownMedicalConditions}
                      onChange={(event) => setKnownMedicalConditions(event.target.value)}
                      className="mt-2 min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      placeholder="Write none if not applicable."
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Current medication
                    </span>
                    <textarea
                      value={currentMedication}
                      onChange={(event) => setCurrentMedication(event.target.value)}
                      className="mt-2 min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      placeholder="Write none if not applicable."
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-sm font-black text-blue-950">
                    Do you have dietary restrictions?
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
                      <input
                        type="radio"
                        checked={!hasDietaryRestrictions}
                        onChange={() => {
                          setHasDietaryRestrictions(false);
                          setDietaryRestrictionsDetails("");
                        }}
                      />
                      No
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
                      <input
                        type="radio"
                        checked={hasDietaryRestrictions}
                        onChange={() => setHasDietaryRestrictions(true)}
                      />
                      Yes
                    </label>
                  </div>

                  {hasDietaryRestrictions && (
                    <textarea
                      value={dietaryRestrictionsDetails}
                      onChange={(event) => setDietaryRestrictionsDetails(event.target.value)}
                      className="mt-4 min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-600"
                      placeholder="Example: vegetarian, halal, allergies, no beef, diabetic meal, etc."
                    />
                  )}
                </div>
              </section>

              <section className="mt-6 rounded-[28px] border border-orange-200 bg-orange-50 p-5 lg:p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  Participant Waiver
                </p>

                <h2 className="mt-2 text-2xl font-black text-blue-950">
                  Read and accept before confirming
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  You must read and accept the BYWC Participant Waiver, Release
                  of Liability, Assumption of Risk and Code of Conduct Agreement
                  before confirming arrival.
                </p>

                <Link
                  href="/arrival/disclaimer"
                  target="_blank"
                  className="mt-4 inline-flex rounded-full border border-blue-950 px-5 py-3 text-sm font-bold text-blue-950 transition hover:bg-blue-50"
                >
                  Read Full Disclaimer & Waiver
                </Link>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[24px] bg-white p-4 text-sm font-semibold leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasAcceptedDisclaimer}
                    onChange={(event) => setHasAcceptedDisclaimer(event.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600"
                  />
                  <span>
                    I have read and understood the participant waiver and arrival
                    disclaimer, and I confirm that I am physically present at the
                    official registration venue.
                  </span>
                </label>
              </section>
            </>
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
                : "Accept Waiver To Continue"}
            </button>
          )}

        {application?.arrivalStatus === "Arrived" && (
          <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold leading-7 text-emerald-800">
            Arrival registration is complete. Your attendance has been recorded
            successfully. Please proceed to accommodation allocation and the
            registration desk for final verification.
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
