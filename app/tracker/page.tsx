"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

type ApplicationStatus =
  | "Submitted"
  | "Under Review"
  | "Shortlisted"
  | "Waiting List"
  | "Accepted"
  | "Rejected";

type Application = {
  id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: ApplicationStatus;
  submittedAt?: string | null;
  adminMessage?: string | null;
};

type Stage = {
  title: string;
  status: string;
  date: string;
  description: string;
  active: boolean;
  completed: boolean;
};

const statusOrder: ApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Waiting List",
  "Accepted",
  "Rejected",
];

export default function TrackerPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplication() {
      setLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Failed to load tracker application:", error);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setApplication({
        id: data.id,
        applicationId: data.application_id,
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        status: data.status || "Submitted",
        submittedAt: data.submitted_at,
        adminMessage: data.admin_message || "",
      });

      setLoading(false);
    }

    loadApplication();
  }, []);

  const status = application?.status || "Submitted";

  const progress = useMemo(() => {
    if (!application) return 0;
    if (status === "Submitted") return 20;
    if (status === "Under Review") return 45;
    if (status === "Shortlisted") return 70;
    if (status === "Waiting List") return 70;
    if (status === "Accepted") return 100;
    if (status === "Rejected") return 100;
    return 0;
  }, [application, status]);

  const currentStageTitle = useMemo(() => {
    if (!application) return "No Application Yet";
    if (status === "Submitted") return "Application Submitted";
    if (status === "Under Review") return "Eligibility Review";
    if (status === "Shortlisted") return "Shortlisting";
    if (status === "Waiting List") return "Waiting List";
    if (status === "Accepted") return "Final Approval";
    if (status === "Rejected") return "Application Closed";
    return "Application Submitted";
  }, [application, status]);

  const currentMessage = useMemo(() => {
    if (!application) {
      return "You have not submitted an application yet. Start your application to begin tracking your progress.";
    }

    if (status === "Submitted") {
      return "Your application has been received and is awaiting programme administration review.";
    }

    if (status === "Under Review") {
      return "Your application is currently being reviewed by the programme administration team.";
    }

    if (status === "Shortlisted") {
      return "You have been shortlisted. Please monitor your inbox and dashboard for next steps.";
    }

    if (status === "Waiting List") {
      return "Your application is eligible but currently on the waiting list due to available placement limits.";
    }

    if (status === "Accepted") {
      return "Congratulations. Your application has been accepted by programme administration.";
    }

    if (status === "Rejected") {
      return "Your application has been reviewed and was not successful for this intake.";
    }

    return "Your application status is being updated.";
  }, [application, status]);

  const stages: Stage[] = useMemo(() => {
    const submittedAt = application?.submittedAt
      ? new Date(application.submittedAt).toLocaleDateString()
      : "Pending";

    const baseStages = [
      {
        key: "Submitted",
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      },
      {
        key: "Under Review",
        title: "Eligibility Review",
        description:
          "The programme administration team is reviewing your eligibility.",
      },
      {
        key: "Shortlisted",
        title: "Shortlisting",
        description:
          "Eligible applicants are considered for shortlisting based on selection rules and available spaces.",
      },
      {
        key: "Accepted",
        title: "Final Approval",
        description:
          "Final approval is confirmed by programme administration after review.",
      },
      {
        key: "Accepted",
        title: "Training Allocation",
        description:
          "Accepted applicants will be allocated to a training group when onboarding begins.",
      },
      {
        key: "Accepted",
        title: "Onboarding Complete",
        description:
          "Final onboarding details will be shared before training starts.",
      },
    ];

    const currentIndex =
      status === "Rejected"
        ? 1
        : status === "Waiting List"
        ? 2
        : statusOrder.indexOf(status);

    return baseStages.map((stage, index) => {
      const active =
        status === "Rejected"
          ? index === 1
          : status === "Waiting List"
          ? stage.title === "Shortlisting"
          : stage.title === currentStageTitle;

      const completed =
        status === "Accepted" ? index < 6 : index < currentIndex;

      return {
        title: stage.title,
        status: active ? "Current Stage" : completed ? "Completed" : "Pending",
        date:
          stage.title === "Application Submitted"
            ? submittedAt
            : completed
            ? "Completed"
            : active
            ? "In Progress"
            : "Pending",
        description:
          status === "Rejected" && active
            ? "Your application has been reviewed and closed for this intake."
            : status === "Waiting List" && active
            ? "Your application is eligible but currently waiting for available placement."
            : stage.description,
        active,
        completed,
      };
    });
  }, [application, status, currentStageTitle]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f7] text-slate-900">
        <p className="text-sm font-semibold text-slate-600">
          Loading tracker...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef1f7] px-6 py-8 text-slate-900 lg:px-10">
      <section className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[36px] border border-white/70 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[30px] bg-blue-950 p-6 text-white">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-bold text-blue-950">
              {application?.firstName?.[0] || "A"}
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              {application
                ? `${application.firstName} ${application.lastName}`
                : "Applicant Name"}
            </h2>

            <span className="mt-3 inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-bold">
              {application?.status || "No Application"}
            </span>
          </div>

          <nav className="mt-14 space-y-3">
            {[
              ["Dashboard", "/dashboard", false],
              ["Tracker", "/tracker", true],
              ["Inbox", "/inbox", false],
              ["Program", "/program", false],
              ["Apply", "/apply", false],
              ["Documents", "/dashboard#documents", false],
              ["Contacts", "/dashboard#contact", false],
            ].map(([label, href, active]) => (
              <Link
                key={String(label)}
                href={String(href)}
                className={`flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <span>{label}</span>

                {label === "Inbox" && application?.adminMessage && (
                  <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">
                    1
                  </span>
                )}

                {active && (
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                )}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="p-5 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
                Application Tracker
              </p>

              <h1 className="mt-3 text-4xl font-bold text-blue-950 lg:text-5xl">
                Track Your Application
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Follow each stage of your BYWC Oil & Gas Training Programme
                application from submission to onboarding.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-full border border-blue-900 px-6 py-3 text-sm font-bold text-blue-900 hover:bg-blue-50"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[30px] bg-orange-500 p-8 text-white shadow-[0_18px_45px_rgba(249,115,22,0.22)]">
              <p className="text-sm font-semibold text-orange-100">
                Current Stage
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                {currentStageTitle}
              </h2>

              <div className="mt-8 h-3 rounded-full bg-white/25">
                <div
                  className="h-3 rounded-full bg-blue-950"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-orange-50">
                {currentMessage}
              </p>
            </div>

            <div className="rounded-[30px] bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold text-slate-500">
                Application Progress
              </p>

              <h3 className="mt-4 text-5xl font-bold text-blue-950">
                {progress}%
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {application
                  ? `Your current application status is ${application.status}.`
                  : "No application has been found for tracking yet."}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[30px] bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Full Application Journey
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-950">
                  Status Timeline
                </h2>
              </div>

              <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700">
                Live Status
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {stages.map((stage, index) => (
                <div
                  key={`${stage.title}-${index}`}
                  className={`grid gap-5 rounded-[24px] border p-5 transition lg:grid-cols-[64px_1fr_160px] lg:items-center ${
                    stage.active
                      ? "border-orange-200 bg-orange-50"
                      : stage.completed
                      ? "border-blue-100 bg-blue-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold ${
                      stage.completed
                        ? "bg-blue-950 text-white"
                        : stage.active
                        ? "bg-orange-500 text-white"
                        : "bg-white text-slate-400"
                    }`}
                  >
                    {stage.completed ? "✓" : index + 1}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-blue-950">
                      {stage.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {stage.description}
                    </p>
                  </div>

                  <div className="lg:text-right">
                    <p
                      className={`text-sm font-bold ${
                        stage.active
                          ? "text-orange-600"
                          : stage.completed
                          ? "text-blue-950"
                          : "text-slate-400"
                      }`}
                    >
                      {stage.status}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {stage.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[30px] bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold text-slate-500">
                Admin Update
              </p>

              <h3 className="mt-3 text-2xl font-bold text-blue-950">
                {application?.adminMessage
                  ? "New Message Available"
                  : "No New Admin Message"}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {application?.adminMessage ||
                  "Messages from programme administration will appear here when available."}
              </p>

              <Link
                href="/inbox"
                className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                View Message
              </Link>
            </div>

            <div className="rounded-[30px] bg-blue-950 p-8 text-white shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
              <p className="text-sm font-semibold text-blue-100">
                Expected Next Step
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                {status === "Accepted"
                  ? "Prepare for Onboarding"
                  : status === "Rejected"
                  ? "Application Closed"
                  : status === "Waiting List"
                  ? "Wait for Placement Availability"
                  : status === "Shortlisted"
                  ? "Await Final Confirmation"
                  : "Continue Monitoring Your Status"}
              </h3>

              <p className="mt-4 text-sm leading-7 text-blue-100">
                {currentMessage}
              </p>

              <div className="mt-6 rounded-2xl bg-white/10 px-4 py-4">
                <p className="text-sm font-bold text-white">
                  Status: {application?.status || "No Application"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}