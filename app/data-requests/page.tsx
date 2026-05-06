"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

type RequestType =
  | "access"
  | "correction"
  | "deletion"
  | "restriction"
  | "objection"
  | "portability";

type RequestStatus = "pending" | "in_review" | "completed" | "rejected";

type DataRequest = {
  id: string;
  user_id?: string | null;
  full_name?: string | null;
  email: string;
  phone?: string | null;
  request_type: RequestType;
  message?: string | null;
  status: RequestStatus;
  admin_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
};

type ApplicantProfile = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

const REQUEST_LABELS: Record<RequestType, string> = {
  access: "Access my data",
  correction: "Correct my data",
  deletion: "Delete my data",
  restriction: "Restrict processing",
  objection: "Object to processing",
  portability: "Get my data in a portable format",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  completed: "Completed",
  rejected: "Rejected",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function DataRequestsPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("access");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [profileSource, setProfileSource] = useState("Account profile");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests],
  );

  useEffect(() => {
    async function loadUserProfileAndRequests() {
      setHistoryLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const userEmail = user.email || "";
      setUserId(user.id);
      setEmail(userEmail);

      const metadataFirstName = String(user.user_metadata?.first_name || "");
      const metadataLastName = String(user.user_metadata?.last_name || "");
      const metadataName = `${metadataFirstName} ${metadataLastName}`.trim();

      if (metadataName) {
        setFullName(metadataName);
      }

      await loadApplicantProfile(userEmail, metadataName);
      await loadRequestHistory(user.id, userEmail);
      setHistoryLoading(false);
    }

    loadUserProfileAndRequests();
  }, []);

  async function loadApplicantProfile(userEmail: string, fallbackName = "") {
    if (!userEmail) return;

    const { data, error } = await supabase
      .from("applications")
      .select("first_name,last_name,phone,email")
      .eq("email", userEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to load applicant profile:", error);
      return;
    }

    const profile = data as ApplicantProfile | null;

    if (!profile) {
      if (fallbackName) setProfileSource("Account profile");
      return;
    }

    const applicationName = `${profile.first_name || ""} ${
      profile.last_name || ""
    }`.trim();

    if (applicationName) {
      setFullName(applicationName);
    }

    if (profile.phone) {
      setPhone(profile.phone);
    }

    setProfileSource("Latest application profile");
  }

  async function loadRequestHistory(currentUserId = userId, currentEmail = email) {
    if (!currentUserId && !currentEmail) return;

    setHistoryLoading(true);

    let query = supabase
      .from("data_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (currentUserId && currentEmail) {
      query = query.or(`user_id.eq.${currentUserId},email.eq.${currentEmail}`);
    } else if (currentUserId) {
      query = query.eq("user_id", currentUserId);
    } else {
      query = query.eq("email", currentEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load data request history:", error);
      setHistoryLoading(false);
      return;
    }

    setRequests((data || []) as DataRequest[]);
    setHistoryLoading(false);
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!userId || !email) {
      setError("You must be logged in to submit a data request.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("data_requests").insert({
      user_id: userId,
      full_name: fullName,
      email,
      phone,
      request_type: requestType,
      message,
      status: "pending",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Your request has been submitted successfully.");
    setRequestType("access");
    setMessage("");
    await loadRequestHistory(userId, email);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#eef1f7] px-4 py-6 text-slate-900 lg:px-10 lg:py-8">
      <section className="mx-auto max-w-6xl">
        <nav className="mb-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                BYWC Applicant Portal
              </p>
              <h1 className="mt-2 text-2xl font-black text-blue-950">
                Data & Privacy Requests
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Link
                href="/dashboard#profile"
                className="rounded-full border border-blue-950 px-4 py-2 text-center text-xs font-black text-blue-950 transition hover:bg-blue-50"
              >
                Back to Profile
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full bg-blue-950 px-4 py-2 text-center text-xs font-black text-white transition hover:bg-blue-900"
              >
                Dashboard
              </Link>

              <Link
                href="/inbox"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-center text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                Messages
              </Link>

              <Link
                href="/tracker"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-center text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                Tracker
              </Link>
            </div>
          </div>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                Manage Your Data
              </p>

              <h2 className="mt-3 text-3xl font-black text-blue-950 lg:text-4xl">
                Submit a Data Request
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Request access, correction, deletion, restriction, objection, or
                a portable copy of your personal data.
              </p>
            </div>

            {success && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-900">
                Profile information loaded
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Your name, email, and phone have been filled from your {profileSource.toLowerCase()}.
                You can still correct the name or phone number before submitting.
              </p>
            </div>

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-blue-950">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-blue-950">Email</label>
                <input
                  value={email}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-blue-950">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-blue-950">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as RequestType)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                >
                  <option value="access">Access my data</option>
                  <option value="correction">Correct my data</option>
                  <option value="deletion">Delete my data</option>
                  <option value="restriction">Restrict processing</option>
                  <option value="objection">Object to processing</option>
                  <option value="portability">Get my data in portable format</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-blue-950">Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
                  placeholder="Explain what you want the programme team to do with your data."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                  Request History
                </p>
                <h2 className="mt-2 text-2xl font-black text-blue-950">
                  Your Requests
                </h2>
              </div>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
                {pendingCount} Pending
              </span>
            </div>

            <button
              type="button"
              onClick={() => loadRequestHistory(userId, email)}
              disabled={historyLoading}
              className="mb-5 rounded-full bg-blue-950 px-4 py-2 text-xs font-bold text-white hover:bg-blue-900 disabled:opacity-50"
            >
              {historyLoading ? "Loading..." : "Refresh History"}
            </button>

            {historyLoading ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
                Loading your request history...
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                You have not submitted any data protection requests yet. Once you
                submit one, it will appear here with its status.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                        {REQUEST_LABELS[request.request_type]}
                      </span>
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700">
                        {STATUS_LABELS[request.status]}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Submitted: {formatDate(request.created_at)}
                    </p>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {request.message || "No details provided."}
                    </p>

                    {request.admin_notes && (
                      <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-700">
                          Admin Response
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {request.admin_notes}
                        </p>
                      </div>
                    )}

                    {request.completed_at && (
                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        Completed: {formatDate(request.completed_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
