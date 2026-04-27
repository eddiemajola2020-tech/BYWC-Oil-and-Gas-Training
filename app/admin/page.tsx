"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  phone: string;
  omang: string;
  gender: string;
  age: string;
  citizenship: string;
  constituency: string;
  disabilityStatus: string;
  disabilityProofFile?: string | null;
  certificateFile?: string | null;
  employmentStatus: string;
  interestArea: string;
  highestQualification: string;
  bgcsePoints: string;
  preferredLanguage: string;
  status: ApplicationStatus;
  eligibilityScore?: number | null;
  eligibilityResult?: string | null;
  submittedAt?: string | null;
  adminMessage?: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [masterSelecting, setMasterSelecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function loadApplications() {
    const { data: sessionData } = await supabase.auth.getSession();

if (!sessionData.session) {
  router.push("/admin-login");
  return;
}

      setLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load applications:", error);
        setLoading(false);
        return;
      }

      const formattedApplications: Application[] = (data || []).map((item) => ({
        id: item.id,
        applicationId: item.application_id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone,
        omang: item.omang,
        gender: item.gender,
        age: item.age?.toString() || "",
        citizenship: item.citizenship,
        constituency: item.constituency,
        disabilityStatus: item.disability_status,
        disabilityProofFile: item.disability_proof_file,
        certificateFile: item.certificate_file,
        employmentStatus: item.employment_status,
        interestArea: item.interest_area,
        highestQualification: item.highest_qualification,
        bgcsePoints: item.bgcse_points?.toString() || "",
        preferredLanguage: item.preferred_language,
        status: item.status || "Submitted",
        eligibilityScore: item.eligibility_score,
        eligibilityResult: item.eligibility_result,
        submittedAt: item.submitted_at,
        adminMessage: item.admin_message || "",
      }));

      setApplications(formattedApplications);
      setLoading(false);
    }

    loadApplications();
  }, [router]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.lastName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.omang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.applicationId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  function calculateEligibility(application: Application) {
    let score = 0;
    const reasons: string[] = [];

    const age = Number(application.age);
    const points = Number(application.bgcsePoints);
    const citizenship = application.citizenship?.toLowerCase() || "";

    if (
      citizenship === "botswana" ||
      citizenship === "botswana citizen" ||
      citizenship.includes("botswana")
    ) {
      score += 25;
      reasons.push("Citizen");
    }

    if (!Number.isNaN(age) && age <= 35) {
      score += 25;
      reasons.push("Youth applicant");
    }

    if (application.gender?.toLowerCase() === "female") {
      score += 20;
      reasons.push("Female applicant");
    }

    if (!Number.isNaN(points) && points >= 25) {
      score += 20;
      reasons.push("Meets BGCSE points requirement");
    }

    if (application.constituency) {
      score += 10;
      reasons.push("Constituency captured");
    }

    let result = "Needs manual review";

    if (score >= 80) result = "Strong candidate";
    else if (score >= 60) result = "Eligible";
    else if (score >= 40) result = "Borderline";
    else result = "Low eligibility";

    return {
      score,
      result,
      reasons: reasons.join(", "),
    };
  }

  async function handleStatusChange(
    application: Application,
    newStatus: ApplicationStatus
  ) {
    setSavingId(application.id);

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("application_id", application.applicationId);

    if (error) {
      console.error("Failed to update status:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? { ...item, status: newStatus }
          : item
      )
    );

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        status: newStatus,
      });
    }

    setSavingId(null);
  }

  async function handleAutoReview(application: Application) {
    setSavingId(application.id);

    const review = calculateEligibility(application);

    const { error } = await supabase
      .from("applications")
      .update({
        eligibility_score: review.score,
        eligibility_result: review.result,
        status: "Under Review",
      })
      .eq("application_id", application.applicationId);

    if (error) {
      console.error("Failed to auto-review application:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    const updatedApplication: Application = {
      ...application,
      eligibilityScore: review.score,
      eligibilityResult: review.result,
      status: "Under Review",
    };

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? updatedApplication
          : item
      )
    );

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication(updatedApplication);
    }

    setSavingId(null);
  }

  async function handleMasterSelection() {
    const confirmed = window.confirm(
      "Run quota-based master selection? This will update applicant statuses."
    );

    if (!confirmed) return;

    setMasterSelecting(true);

    const TOTAL_YOUTH_WOMEN = 435;
    const TOTAL_YOUTH_MEN = 315;
    const TOTAL_NON_YOUTH = 250;
    const DISABILITY_CAP = 8;
    const MIN_BGCSE_POINTS = 25;

    let disabledSelected = 0;

    const reviewed = applications.map((application) => {
      const review = calculateEligibility(application);
      const age = Number(application.age);
      const points = Number(application.bgcsePoints);

      const isCitizen =
        application.citizenship?.toLowerCase().includes("botswana") || false;

      const isYouth = !Number.isNaN(age) && age <= 35;
      const isFemale = application.gender?.toLowerCase() === "female";
      const isMale = application.gender?.toLowerCase() === "male";
      const hasMinimumBgcse =
        !Number.isNaN(points) && points >= MIN_BGCSE_POINTS;
      const hasCertificate = Boolean(application.certificateFile);
      const hasDisability =
        application.disabilityStatus?.toLowerCase() === "yes";

      return {
        ...application,
        score: review.score,
        result: review.result,
        isCitizen,
        isYouth,
        isFemale,
        isMale,
        hasMinimumBgcse,
        hasCertificate,
        hasDisability,
      };
    });

    const eligible = reviewed.filter(
      (app) => app.isCitizen && app.hasMinimumBgcse && app.hasCertificate
    );

    const missingDocuments = reviewed.filter(
      (app) => app.isCitizen && app.hasMinimumBgcse && !app.hasCertificate
    );

    const rejected = reviewed.filter(
      (app) => !app.isCitizen || !app.hasMinimumBgcse
    );

    function balancedPick(pool: typeof eligible, limit: number) {
      const selected: typeof eligible = [];
      const grouped: Record<string, typeof eligible> = {};

      pool
        .sort((a, b) => b.score - a.score)
        .forEach((app) => {
          const key = app.constituency || "Unknown";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(app);
        });

      const constituencies = Object.keys(grouped);

      while (selected.length < limit) {
        let addedThisRound = false;

        for (const constituency of constituencies) {
          if (selected.length >= limit) break;

          const group = grouped[constituency];
          if (!group || group.length === 0) continue;

          const candidate = group.shift();
          if (!candidate) continue;

          if (candidate.hasDisability && disabledSelected >= DISABILITY_CAP) {
            continue;
          }

          if (candidate.hasDisability) {
            disabledSelected += 1;
          }

          selected.push(candidate);
          addedThisRound = true;
        }

        if (!addedThisRound) break;
      }

      return selected;
    }

    const youthWomenPool = eligible.filter(
      (app) => app.isYouth && app.isFemale
    );
    const youthMenPool = eligible.filter((app) => app.isYouth && app.isMale);
    const nonYouthPool = eligible.filter((app) => !app.isYouth);

    const selectedYouthWomen = balancedPick(
      youthWomenPool,
      TOTAL_YOUTH_WOMEN
    );
    const selectedYouthMen = balancedPick(youthMenPool, TOTAL_YOUTH_MEN);
    const selectedNonYouth = balancedPick(nonYouthPool, TOTAL_NON_YOUTH);

    const shortlisted = [
      ...selectedYouthWomen,
      ...selectedYouthMen,
      ...selectedNonYouth,
    ];

    const shortlistedIds = new Set(
      shortlisted.map((app) => app.applicationId)
    );

    const waitingList = eligible.filter(
      (app) => !shortlistedIds.has(app.applicationId)
    );

    const updates = [
      ...shortlisted.map((app) => ({
        app,
        status: "Shortlisted" as ApplicationStatus,
      })),
      ...waitingList.map((app) => ({
        app,
        status: "Waiting List" as ApplicationStatus,
      })),
      ...missingDocuments.map((app) => ({
        app,
        status: "Under Review" as ApplicationStatus,
      })),
      ...rejected.map((app) => ({
        app,
        status: "Rejected" as ApplicationStatus,
      })),
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from("applications")
        .update({
          status: update.status,
          eligibility_score: update.app.score,
          eligibility_result: update.app.result,
        })
        .eq("application_id", update.app.applicationId);

      if (error) {
        console.error("Master selection update failed:", error);
        alert(error.message);
        setMasterSelecting(false);
        return;
      }
    }

    setApplications((prev) =>
      prev.map((application) => {
        const found = updates.find(
          (update) => update.app.applicationId === application.applicationId
        );

        if (!found) return application;

        return {
          ...application,
          status: found.status,
          eligibilityScore: found.app.score,
          eligibilityResult: found.app.result,
        };
      })
    );

    alert(
      `Master Selection Complete:
Shortlisted: ${shortlisted.length}
Waiting List: ${waitingList.length}
Under Review Missing Certificates: ${missingDocuments.length}
Rejected: ${rejected.length}
Disabled Selected: ${disabledSelected}`
    );

    setMasterSelecting(false);
  }

  async function handleSaveMessage(application: Application) {
    const message =
      messageDrafts[application.id] ?? selectedApplication?.adminMessage ?? "";

    setSavingId(application.id);

    const { error } = await supabase
      .from("applications")
      .update({
        admin_message: message,
      })
      .eq("application_id", application.applicationId);

    if (error) {
      console.error("Failed to save admin message:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    const updatedApplication = {
      ...application,
      adminMessage: message,
    };

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? updatedApplication
          : item
      )
    );

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        adminMessage: message,
      });
    }

    alert("Message saved successfully");
    setSavingId(null);
  }

async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/admin-login");
}

  const totalApplications = applications.length;
  const submittedCount = applications.filter(
    (item) => item.status === "Submitted"
  ).length;
  const reviewCount = applications.filter(
    (item) => item.status === "Under Review"
  ).length;
  const shortlistedCount = applications.filter(
    (item) => item.status === "Shortlisted"
  ).length;
  const waitingListCount = applications.filter(
    (item) => item.status === "Waiting List"
  ).length;
  const acceptedCount = applications.filter(
    (item) => item.status === "Accepted"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">Loading applications...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-wide">
              BYWC Oil & Gas Training
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Review applications, update statuses, run auto-review and manage
              applicant messages.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMasterSelection}
              disabled={masterSelecting}
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {masterSelecting ? "Running Selection..." : "Run Master Selection"}
            </button>

            <button
              onClick={handleLogout}
              className="bg-white text-slate-950 px-5 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total" value={totalApplications} />
          <StatCard title="Submitted" value={submittedCount} />
          <StatCard title="Under Review" value={reviewCount} />
          <StatCard title="Shortlisted" value={shortlistedCount} />
          <StatCard title="Waiting List" value={waitingListCount} />
          <StatCard title="Accepted" value={acceptedCount} />
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, Omang or application ID"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Waiting List">Waiting List</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-4">Applicant</th>
                    <th className="text-left px-4 py-4">Contact</th>
                    <th className="text-left px-4 py-4">Constituency</th>
                    <th className="text-left px-4 py-4">Score</th>
                    <th className="text-left px-4 py-4">Status</th>
                    <th className="text-left px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {application.firstName} {application.lastName}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {application.applicationId}
                        </p>
                        <p className="text-slate-500 text-xs">
                          Omang: {application.omang}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p>{application.email}</p>
                        <p className="text-slate-400">{application.phone}</p>
                      </td>

                      <td className="px-4 py-4">
                        <p>{application.constituency}</p>
                        <p className="text-slate-400 text-xs">
                          {application.gender}, {application.age}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {application.eligibilityScore ?? "Not reviewed"}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {application.eligibilityResult || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={application.status}
                          onChange={(event) =>
                            handleStatusChange(
                              application,
                              event.target.value as ApplicationStatus
                            )
                          }
                          disabled={savingId === application.id}
                          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white outline-none disabled:opacity-50"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Waiting List">Waiting List</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="bg-white text-slate-950 px-3 py-2 rounded-lg font-semibold hover:bg-slate-200 transition"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleAutoReview(application)}
                            disabled={savingId === application.id}
                            className="bg-orange-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                          >
                            Auto Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedApplication && (
          <section className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedApplication.firstName}{" "}
                    {selectedApplication.lastName}
                  </h2>
                  <p className="text-slate-400">
                    {selectedApplication.applicationId}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApplication(null)}
                  className="bg-white text-slate-950 px-4 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Detail label="Email" value={selectedApplication.email} />
                <Detail label="Phone" value={selectedApplication.phone} />
                <Detail label="Omang" value={selectedApplication.omang} />
                <Detail label="Gender" value={selectedApplication.gender} />
                <Detail label="Age" value={selectedApplication.age} />
                <Detail
                  label="Citizenship"
                  value={selectedApplication.citizenship}
                />
                <Detail
                  label="Constituency"
                  value={selectedApplication.constituency}
                />
                <Detail
                  label="Employment Status"
                  value={selectedApplication.employmentStatus}
                />
                <Detail
                  label="Interest Area"
                  value={selectedApplication.interestArea}
                />
                <Detail
                  label="Highest Qualification"
                  value={selectedApplication.highestQualification}
                />
                <Detail
                  label="BGCSE Points"
                  value={selectedApplication.bgcsePoints}
                />
                <Detail
                  label="Preferred Language"
                  value={selectedApplication.preferredLanguage}
                />
                <Detail
                  label="Disability Status"
                  value={selectedApplication.disabilityStatus}
                />
                <Detail label="Status" value={selectedApplication.status} />
                <Detail
                  label="Eligibility Score"
                  value={
                    selectedApplication.eligibilityScore?.toString() ||
                    "Not reviewed"
                  }
                />
                <Detail
                  label="Eligibility Result"
                  value={selectedApplication.eligibilityResult || "-"}
                />
              </div>

              {selectedApplication.disabilityProofFile && (
                <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-2">
                    Disability Proof Attachment
                  </p>
                  <a
                    href={selectedApplication.disabilityProofFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 font-semibold underline"
                  >
                    Open uploaded proof
                  </a>
                </div>
              )}

              {selectedApplication.certificateFile && (
                <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-2">
                    Certificate / Results Slip
                  </p>
                  <a
                    href={selectedApplication.certificateFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 font-semibold underline"
                  >
                    Open uploaded certificate
                  </a>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="font-semibold mb-3">Admin Message</p>

                <textarea
                  value={
                    messageDrafts[selectedApplication.id] ??
                    selectedApplication.adminMessage ??
                    ""
                  }
                  onChange={(event) =>
                    setMessageDrafts((prev) => ({
                      ...prev,
                      [selectedApplication.id]: event.target.value,
                    }))
                  }
                  placeholder="Write an internal/app message for this applicant..."
                  className="w-full min-h-32 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
                />

                <button
                  onClick={() => handleSaveMessage(selectedApplication)}
                  disabled={savingId === selectedApplication.id}
                  className="mt-3 bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                >
                  Save Message
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAutoReview(selectedApplication)}
                  disabled={savingId === selectedApplication.id}
                  className="bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                >
                  Run Auto Review
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(selectedApplication, "Accepted")
                  }
                  disabled={savingId === selectedApplication.id}
                  className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(selectedApplication, "Rejected")
                  }
                  disabled={savingId === selectedApplication.id}
                  className="bg-red-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(selectedApplication, "Waiting List")
                  }
                  disabled={savingId === selectedApplication.id}
                  className="bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-600 transition disabled:opacity-50"
                >
                  Move to Waiting List
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium">{value || "-"}</p>
    </div>
  );
}