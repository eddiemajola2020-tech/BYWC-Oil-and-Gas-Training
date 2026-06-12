"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

type Application = {
  id: string;
  applicationId?: string;
  submittedAt?: string;
  status?: string;
  arrivalStatus?: string;
  arrivedAt?: string | null;
  arrivalConfirmedBy?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  constituency?: string;
  omangFile?: string;
  cvFile?: string;
  certificateFile?: string;
};

type AdminMessage = {
  id: string;
  applicantEmail: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

const navItems = [
  ["Home", "/home", "⌂", false],
  ["Dashboard", "/dashboard", "▦", true],
  ["Profile", "#profile", "◉", false],
  ["Data Privacy", "/data-requests", "🔒", false],
  ["Messages", "/inbox", "✉", false],
  ["Tracker", "/tracker", "✓", false],
  ["Apply", "/apply", "+", false],
];

export default function DashboardPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [latestApplication, setLatestApplication] =
    useState<Application | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatestApplication() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Failed to load dashboard application:", error);

        const fallbackApplication: Application = {
          id: user.id,
          firstName:
            String(user.user_metadata?.first_name || "") || "Applicant",
          lastName: String(user.user_metadata?.last_name || ""),
          email: user.email,
          status: "No Application Yet",
        };

        setLatestApplication(fallbackApplication);
        setMessages([]);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const latest: Application = {
        id: data.id,
        applicationId: data.application_id,
        submittedAt: data.submitted_at,
        status: data.status,
        arrivalStatus: data.arrival_status || "Not Arrived",
        arrivedAt: data.arrived_at,
        arrivalConfirmedBy: data.arrival_confirmed_by,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        constituency: data.constituency,
        omangFile: data.omang_file,
        cvFile: data.cv_file,
        certificateFile: data.certificate_file,
      };

      setLatestApplication(latest);

      if (data.admin_message) {
        setMessages([
          {
            id: data.id,
            applicantEmail: data.email,
            title: "Message from Admin",
            message: data.admin_message,
            createdAt: data.submitted_at || new Date().toISOString(),
            read: false,
          },
        ]);
      } else {
        setMessages([]);
      }

      setLoading(false);
    }

    loadLatestApplication();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleDownloadLetter() {
    if (!latestApplication) return;

    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Load letterhead background — skip silently if missing
      try {
        const response = await fetch("/letterhead.png");
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          doc.addImage(`data:image/png;base64,${base64}`, "PNG", 0, 0, 210, 297);
        }
      } catch {
        // No letterhead — letter renders on plain white
      }

      const fullName =
        `${latestApplication.firstName ?? ""} ${latestApplication.lastName ?? ""}`.trim() ||
        "Applicant";
      const numericId = String(latestApplication.id ?? "").replace(/D/g, "");
      const letterId = `BYWC/OGT/2026/B2-${numericId.padStart(6, "0")}`;
      const constituency = latestApplication.constituency ?? "";
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Fetch template from admin_settings (falls back to built-in defaults if table missing)
      const defaultSubject = "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026 \u2014 BATCH 2";
      const defaultBody = `Congratulations, {{fullName}}!

You have been selected for Batch 2 of the Botswana Youth, Women and Citizen (BYWC) Oil and Gas Training Programme 2026. This letter is your official confirmation of acceptance and must be presented upon registration at the training venue.

Acceptance Details:
 •  Full Name: {{fullName}}
 •  Constituency: {{constituency}}
 •  Letter Reference: {{refNo}}
 •  Programme: BYWC Oil & Gas Training Programme 2026 Batch 2

The programme is a structured 10-day training covering the oil and gas industry, HSE standards, petroleum fundamentals, pipeline operations, energy sector business and entrepreneurship, and career development. Accommodation and meals are provided for all 10 days.

REPORTING & ORIENTATION
Venue: University of Botswana, in front of the Student Centre. Report on Sunday between 13:00 and 15:00 (1-3 pm). Formal orientation begins Monday at 08:00.

WHAT TO BRING
 •  This acceptance letter (printed or on your phone)
 •  Valid national identity document (Omang) — MANDATORY
 •  Pen and notebook

IMPORTANT NOTICE
Attendance from Day 1 is compulsory. If you are unable to attend, notify us immediately via your portal inbox to avoid forfeiture of your placement.

We look forward to welcoming you to the programme.

For enquiries call 355 2838 or WhatsApp 74781608.`;

      let rawSubject = defaultSubject;
      let rawBody = defaultBody;
      try {
        const { data: settingsData } = await supabase
          .from("admin_settings")
          .select("key, value")
          .in("key", ["acceptance_letter_subject", "acceptance_letter_body"]);
        if (settingsData && settingsData.length > 0) {
          const s = settingsData.find((r) => r.key === "acceptance_letter_subject")?.value;
          const b = settingsData.find((r) => r.key === "acceptance_letter_body")?.value;
          if (s) rawSubject = s;
          if (b) rawBody = b;
        }
      } catch {
        // admin_settings table not yet created — use built-in defaults
      }

      const fill = (text: string) =>
        text
          .replace(/\{\{fullName\}\}/g, fullName)
          .replace(/\{\{firstName\}\}/g, latestApplication.firstName ?? "")
          .replace(/\{\{refNo\}\}/g, letterId)
          .replace(/\{\{constituency\}\}/g, constituency)
          .replace(/\{\{date\}\}/g, today);

      const subject = fill(rawSubject);
      const paragraphs = fill(rawBody)
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      doc.setTextColor(25, 25, 25);
      const lineH = 6;

      // Date right-aligned
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(today, 195, 38, { align: "right" });

      // Letter ID — bold and prominent
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Letter Ref: ${letterId}`, 15, 47);

      // Addressee block
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(fullName.toUpperCase(), 15, 57);
      if (constituency) doc.text(`${constituency}, Botswana`, 15, 63);

      // Dear line
      doc.text(`Dear ${fullName},`, 15, 73);

      // Subject — bold
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const subjectLines = doc.splitTextToSize(subject, 180);
      doc.text(subjectLines, 15, 83);

      // Body paragraphs
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      let y = 83 + subjectLines.length * lineH + 7;

      for (const para of paragraphs) {
        const subLines = para.split("\n");
        const firstLine = subLines[0];
        const isBoldHeading =
          firstLine === firstLine.toUpperCase() && /[A-Z]/.test(firstLine);

        if (isBoldHeading && subLines.length > 1) {
          // Bold heading line + normal body
          doc.setFont("helvetica", "bold");
          const headLines = doc.splitTextToSize(firstLine, 180);
          doc.setFont("helvetica", "normal");
          const bodyLines = doc.splitTextToSize(subLines.slice(1).join("\n"), 180);
          if (y + (headLines.length + bodyLines.length) * lineH > 248) break;
          doc.setFont("helvetica", "bold");
          doc.text(headLines, 15, y);
          y += headLines.length * lineH;
          doc.setFont("helvetica", "normal");
          doc.text(bodyLines, 15, y);
          y += bodyLines.length * lineH + 5;
        } else {
          doc.setFont("helvetica", isBoldHeading ? "bold" : "normal");
          const lines = doc.splitTextToSize(para, 180);
          if (y + lines.length * lineH > 248) break;
          doc.text(lines, 15, y);
          y += lines.length * lineH + 5;
          doc.setFont("helvetica", "normal");
        }
      }

      doc.save(`BYWC-Acceptance-Letter-${fullName.replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error("Letter generation failed:", err);
      alert("Could not generate the letter. Please try again.");
    }
  }

  const unreadMessages = messages.filter((msg) => !msg.read).length;

  const status = latestApplication?.status || "No Application Yet";

  const progressWidth = useMemo(() => {
    if (status === "Submitted") return "25%";
    if (status === "Constituency Reserve Pool") return "25%";
    if (status === "Under Review") return "62%";
    if (status === "Shortlisted") return "78%";
    if (status === "Waiting List") return "78%";
    if (status === "Accepted") return "100%";
    if (status === "Rejected") return "100%";
    return "0%";
  }, [status]);

  const statusMessage = useMemo(() => {
    if (!latestApplication || status === "No Application Yet") {
      return "You have not submitted an application yet. Start your application to begin tracking your progress.";
    }

    if (status === "Accepted") {
      return "Congratulations. Your application has been accepted by the programme administration team.";
    }

    if (status === "Rejected") {
      return "Your application was reviewed and was not successful for this intake.";
    }

    if (status === "Constituency Reserve Pool") {
      return "Your application remains in the Constituency Reserve Pool and may be considered for additional placement opportunities as allocations are finalized.";
    }

    if (status === "Shortlisted") {
      return "You have been shortlisted. Please monitor your inbox for next steps from programme administration.";
    }

    if (status === "Waiting List") {
      return "Your application is eligible but currently on the waiting list due to available placement limits.";
    }

    if (status === "Under Review") {
      return "Your application is currently being reviewed by the programme administration team.";
    }

    return "Your application has been received and is awaiting admin review.";
  }, [latestApplication, status]);

  function handleProfileImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f7] text-slate-900">
        <p className="text-sm font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef1f7] px-4 py-5 text-slate-900 lg:px-10 lg:py-8">
      <section className="mx-auto grid max-w-7xl overflow-hidden rounded-[28px] border border-white/70 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[90px_1fr] lg:rounded-[36px]">
        <aside className="hidden flex-col items-center justify-between rounded-[30px] bg-blue-950 px-4 py-6 text-white lg:flex">
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/home"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-950"
            >
              B
            </Link>

            <nav className="flex flex-col items-center gap-4">
              {navItems.map(([label, href, icon, active]) => (
                <Link
                  key={String(label)}
                  href={String(href)}
                  title={String(label)}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-lg transition ${
                    active
                      ? "bg-orange-500 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  {icon}

                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg text-blue-100 transition hover:bg-white/10"
          >
            ↩
          </button>
        </aside>

        <section className="rounded-[24px] bg-[#f8fafc] p-4 lg:rounded-[30px] lg:p-8">
          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              {navItems.map(([label, href, icon, active]) => (
                <Link
                  key={String(label)}
                  href={String(href)}
                  className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-slate-200 bg-slate-50 text-blue-950 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>

                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-[10px] font-bold text-white">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-blue-950 hover:bg-slate-100"
              >
                <span className="text-lg">↩</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
                Applicant Dashboard
              </p>

              <h1 className="mt-3 text-4xl font-bold text-blue-950 lg:text-5xl">
                Welcome back, {latestApplication?.firstName || "Applicant"}
              </h1>
            </div>

            <div className="hidden items-center gap-4 lg:flex">
              <Link
                href="/inbox"
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-950 shadow-sm"
              >
                <span className="text-xl">🔔</span>
                {unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <a
                href="#profile"
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-950 text-lg font-bold text-white shadow-sm"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Applicant profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  latestApplication?.firstName?.[0] || "A"
                )}
              </a>

              <button
                onClick={handleLogout}
                className="rounded-full border border-blue-950 px-5 py-3 text-sm font-bold text-blue-950 hover:bg-blue-50"
              >
                Log Out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
            <div className="relative overflow-hidden rounded-[28px] bg-orange-500 p-6 text-white shadow-[0_18px_45px_rgba(249,115,22,0.22)] lg:rounded-[34px] lg:p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-blue-950/20" />

              <p className="text-sm font-semibold text-orange-100">
                Application Status
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
                {status}
              </h2>

              <div className="mt-8 h-3 rounded-full bg-white/25">
                <div
                  className="h-3 rounded-full bg-blue-950"
                  style={{ width: progressWidth }}
                />
              </div>

              <p className="mt-5 max-w-xl text-sm leading-7 text-orange-50">
                {statusMessage}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/tracker"
                  className="rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-950"
                >
                  View Tracker
                </Link>

                <Link
                  href="/inbox"
                  className="rounded-full bg-blue-950 px-5 py-3 text-sm font-bold text-white"
                >
                  View Messages
                </Link>
              </div>
            </div>

            {status === "Accepted" && (
              <>
                {/* Acceptance Letter download — always visible for accepted applicants */}
                <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:rounded-[34px] lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Official Documents
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-blue-950">
                    Your Acceptance Letter
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Your official letter of acceptance into the BYWC Oil &amp; Gas Training Programme 2026.
                    Download and keep a copy — you will need it at the venue.
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Ref: BYWC/OGT/2026/{latestApplication?.applicationId ?? latestApplication?.id}
                  </p>
                  <button
                    onClick={handleDownloadLetter}
                    className="mt-5 flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left transition hover:bg-emerald-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        Download Acceptance Letter
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Official BYWC programme confirmation — PDF
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      ↓
                    </span>
                  </button>
                </div>

                {/* Arrival Registration */}
                <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:rounded-[34px] lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Arrival Registration
                  </p>

                  <h3 className="mt-3 text-2xl font-bold text-blue-950">
                    {latestApplication?.arrivalStatus === "Arrived"
                      ? "Arrival Confirmed"
                      : "Scan Venue QR Code"}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {latestApplication?.arrivalStatus === "Arrived"
                      ? "Your arrival has been registered successfully. Please proceed with the programme registration process at the venue."
                      : "To register your arrival, scan the official BYWC arrival QR code displayed at the venue. The dashboard cannot confirm arrival without the QR page."}
                  </p>

                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Arrival Status
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        latestApplication?.arrivalStatus === "Arrived"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {latestApplication?.arrivalStatus || "Not Arrived"}
                      </span>
                    </div>

                    {latestApplication?.arrivedAt && (
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          Arrived At
                        </span>
                        <span className="text-sm font-bold text-blue-950">
                          {new Date(latestApplication.arrivedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {latestApplication?.arrivalStatus !== "Arrived" && (
                    <div className="mt-5 rounded-[24px] border border-orange-200 bg-orange-50 p-5 text-sm font-semibold leading-7 text-orange-800">
                      Please scan the official arrival QR code at the registration area. After reading the arrival disclaimer, tap Confirm My Arrival on the QR page to record your arrival time.
                    </div>
                  )}
                </div>
              </>
            )}
            <div
              id="profile"
              className="rounded-[28px] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:rounded-[34px] lg:p-8"
            >
              <div className="flex items-center gap-4">
                <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-blue-950 text-3xl font-bold text-white">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Applicant profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    latestApplication?.firstName?.[0] || "A"
                  )}

                  <div className="absolute inset-0 hidden items-center justify-center bg-black/45 text-xs font-bold text-white group-hover:flex">
                    Upload
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Applicant Profile
                  </p>
                  <h3 className="text-2xl font-bold text-blue-950">
                    {latestApplication
                      ? `${latestApplication.firstName || ""} ${
                          latestApplication.lastName || ""
                        }`
                      : "Applicant Name"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Click the avatar to upload a profile image.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Application ID
                  </span>
                  <span className="text-sm font-bold text-blue-950">
                    {latestApplication?.applicationId || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="text-sm font-bold text-orange-600">
                    {status}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">Submitted</span>
                  <span className="text-sm font-bold text-blue-950">
                    {latestApplication?.submittedAt
                      ? new Date(
                          latestApplication.submittedAt
                        ).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-orange-200 bg-orange-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  Data Rights
                </p>

                <h3 className="mt-2 text-xl font-black text-blue-950">
                  Your Data, Your Control
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Request access, correction, deletion, restriction, objection,
                  or a portable copy of your personal data.
                </p>

                <Link
                  href="/data-requests"
                  className="mt-4 inline-flex rounded-full bg-blue-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
                >
                  Manage My Data
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr_0.85fr] lg:gap-8">
            <div className="rounded-[28px] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:rounded-[30px] lg:p-7">
              <p className="text-sm font-semibold text-slate-500">
                Next Step
              </p>

              <h3 className="mt-3 text-2xl font-bold text-blue-950">
                {status === "Accepted"
                  ? "Prepare for Onboarding"
                  : status === "Rejected"
                  ? "Application Closed"
                  : status === "Waiting List"
                  ? "Await Placement Availability"
                  : status === "Shortlisted"
                  ? "Await Onboarding Details"
                  : status === "Constituency Reserve Pool"
                  ? "Constituency Reserve Pool"
                  : status === "No Application Yet"
                  ? "Start Your Application"
                  : "Admin Review In Progress"}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {statusMessage}
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:rounded-[30px] lg:p-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Messages
                </p>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                  {unreadMessages} New
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-blue-950">
                {messages[0]?.title || "No new messages"}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {messages[0]?.message ||
                  "Messages from programme administration will appear here."}
              </p>

              <Link
                href="/inbox"
                className="mt-6 inline-flex rounded-full bg-blue-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900"
              >
                Open Messages
              </Link>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:rounded-[30px] lg:p-7">
              <p className="text-sm font-semibold text-slate-500">
                Document Checklist
              </p>

              <div className="mt-5 space-y-3">
                {[
                  ["Omang / ID Copy", latestApplication?.omangFile],
                  ["CV", latestApplication?.cvFile],
                  [
                    "Certificates / Results Slip",
                    latestApplication?.certificateFile,
                  ],
                ].map(([item, value]) => (
                  <div
                    key={String(item)}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>

                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                        value ? "bg-orange-500" : "bg-slate-300"
                      }`}
                    >
                      {value ? "✓" : "!"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            id="contact"
            className="mt-8 rounded-[28px] bg-blue-950 p-6 text-white shadow-[0_16px_45px_rgba(15,23,42,0.16)] lg:rounded-[30px] lg:p-7"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-100">
                  Support
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  Need assistance?
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
                  Contact the programme administration team if you need help
                  with your application status, documents, messages, or account.
                </p>
              </div>

              <Link
                href="/inbox"
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Message Admin
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}