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

type ReviewDecision = {
  score: number;
  result: string;
  notes: string;
  hardRejectReason: string;
  priorityGroup: string;
  selectionBucket: string;
  documentCompletenessScore: number;
  recommendedStatus: ApplicationStatus;
  isHardRejected: boolean;
};

type Application = {
  id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  omang: string;
  omangFile?: string | null;
  gender: string;
  age: string;
  citizenship: string;
  district?: string | null;
  constituency: string;
  townVillage?: string | null;
  disabilityStatus: string;
  disabilityProofFile?: string | null;
  certificateFile?: string | null;
  cvFile?: string | null;
  bgcseCertificateFile?: string | null;
  highestQualificationFile?: string | null;
  completedBgcseIgcse?: string | null;
  employmentStatus: string;
  interestArea: string;
  highestQualification: string;
  examinationBody?: string | null;
  bgcsePoints: string;
  preferredLanguage: string;
  englishComfort?: string | null;
  tertiaryCompleted?: string | null;
  tertiaryEducation?: string | null;
  tertiaryInstitution?: string | null;
  fieldOfStudy?: string | null;
  motivation?: string | null;
  postProgramPlan?: string | null;
  motivationWordCount?: number | null;
  postProgramWordCount?: number | null;
  status: ApplicationStatus;
  autoReviewScore?: number | null;
  autoReviewResult?: string | null;
  autoReviewNotes?: string | null;
  priorityGroup?: string | null;
  selectionBucket?: string | null;
  hardRejectReason?: string | null;
  documentCompletenessScore?: number | null;
  submittedAt?: string | null;
  adminMessage?: string | null;
};

const TOTAL_YOUTH_WOMEN = 435;
const TOTAL_YOUTH_MEN = 315;
const TOTAL_NON_YOUTH = 250;
const TOTAL_INTAKE = TOTAL_YOUTH_WOMEN + TOTAL_YOUTH_MEN + TOTAL_NON_YOUTH;
const DISABILITY_CAP = 8;
const MIN_BGCSE_POINTS = 25;
const MIN_MOTIVATION_WORDS = 40;
const MIN_POST_PROGRAM_WORDS = 30;
const PREFERRED_CONSTITUENCY_DEPTH = 3;

const constituencies = [
  "Okavango West",
  "Okavango East",
  "Ngami",
  "Maun North",
  "Maun East",
  "Maun West",
  "Chobe",
  "Nata-Gweta",
  "Nkange",
  "Shashe West",
  "Tati West",
  "Tati East",
  "Francistown West",
  "Francistown South",
  "Francistown East",
  "Tonota",
  "Boteti East",
  "Ghanzi North",
  "Ghanzi South",
  "Kgalagadi North",
  "Kgalagadi South",
  "Serowe North",
  "Serowe West",
  "Serowe South",
  "Shoshong",
  "Mahalapye West",
  "Mahalapye East",
  "Lerala-Maunatlala",
  "Palapye",
  "Mmadinare",
  "Bobonong",
  "Selebi Phikwe West",
  "Selebi Phikwe East",
  "Kgatleng West",
  "Kgatleng Central",
  "Kgatleng East",
  "Boteti West",
  "Boteti South",
  "Letlhakeng",
  "Takatokwane",
  "Jwaneng-Mabutsane",
  "Molepolole North",
  "Molepolole South",
  "Thamaga-Kumakwane",
  "Mmopane-Metsimotlhabe",
  "Lentsweletau",
  "Mogoditshane West",
  "Mogoditshane East",
  "Gaborone North",
  "Gaborone Central",
  "Gaborone North West",
  "Gaborone South",
  "Gaborone Bonnington North",
  "Gaborone Bonnington South",
  "Tlokweng-Mmokolodi",
  "Ramotswa",
  "Lobatse",
  "Goodhope-Mmathethe",
  "Kanye North",
  "Kanye South",
  "Moshupa-Manyana",
];

function countWords(text?: string | null) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function normalize(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function hasValue(value?: string | null) {
  return Boolean((value || "").trim());
}

function isBotswanaCitizen(value?: string | null) {
  const citizenship = normalize(value);
  return citizenship === "botswana" || citizenship.includes("botswana");
}

function isYes(value?: string | null) {
  return normalize(value) === "yes";
}

function getPriorityGroup(application: Application) {
  const age = Number(application.age);
  const gender = normalize(application.gender);
  const isYouth = !Number.isNaN(age) && age <= 35;

  if (isYouth && gender === "female") return "Youth Woman";
  if (isYouth && gender === "male") return "Youth Man";
  return "Non-Youth";
}

function getAgeGroup(application: Application) {
  const age = Number(application.age);
  return !Number.isNaN(age) && age <= 35 ? "Youth" : "Non-Youth";
}

function getQualificationBonus(application: Application) {
  const qualification = normalize(application.highestQualification);

  if (qualification.includes("postgraduate")) return 12;
  if (qualification.includes("degree")) return 10;
  if (qualification.includes("diploma")) return 8;
  if (qualification.includes("certificate")) return 5;
  return 0;
}

function calculateEligibility(application: Application): ReviewDecision {
  let score = 0;
  let documentCompletenessScore = 0;
  const notes: string[] = [];
  const hardRejectReasons: string[] = [];

  const age = Number(application.age);
  const points = Number(application.bgcsePoints);
  const motivationWords =
    application.motivationWordCount ?? countWords(application.motivation);
  const postProgramWords =
    application.postProgramWordCount ?? countWords(application.postProgramPlan);
  const certificatePath =
    application.bgcseCertificateFile || application.certificateFile || "";
  const priorityGroup = getPriorityGroup(application);

  if (!hasValue(application.omang)) {
    hardRejectReasons.push("Missing Omang / ID number");
  }

  if (!hasValue(application.omangFile)) {
    hardRejectReasons.push("Missing Omang / ID upload");
  }

  if (!isBotswanaCitizen(application.citizenship)) {
    hardRejectReasons.push("Applicant is not marked as a Botswana citizen");
  }

  if (!isYes(application.completedBgcseIgcse)) {
    hardRejectReasons.push("BGCSE / IGCSE completion not confirmed");
  }

  if (!hasValue(certificatePath)) {
    hardRejectReasons.push("Missing BGCSE / IGCSE certificate or results slip");
  }

  if (motivationWords < MIN_MOTIVATION_WORDS) {
    hardRejectReasons.push(
      `Motivation is too short (${motivationWords}/${MIN_MOTIVATION_WORDS} words)`
    );
  }

  if (postProgramWords < MIN_POST_PROGRAM_WORDS) {
    hardRejectReasons.push(
      `Post-program plan is too short (${postProgramWords}/${MIN_POST_PROGRAM_WORDS} words)`
    );
  }

  if (isBotswanaCitizen(application.citizenship)) {
    score += 20;
    notes.push("Citizen");
  }

  if (!Number.isNaN(age) && age <= 35) {
    score += 20;
    notes.push("Youth applicant");
  }

  if (normalize(application.gender) === "female" && !Number.isNaN(age) && age <= 35) {
    score += 20;
    notes.push("Youth woman priority");
  } else if (normalize(application.gender) === "female") {
    score += 10;
    notes.push("Female applicant");
  }

  if (!Number.isNaN(points) && points >= MIN_BGCSE_POINTS) {
    score += 15;
    notes.push("Meets BGCSE / IGCSE points benchmark");
  } else if (!Number.isNaN(points) && points > 0) {
    score += 5;
    notes.push("BGCSE / IGCSE points captured but below benchmark");
  }

  if (hasValue(application.constituency)) {
    score += 10;
    notes.push("Constituency captured");
  }

  const qualificationBonus = getQualificationBonus(application);
  if (qualificationBonus > 0) {
    score += qualificationBonus;
    notes.push("Higher qualification captured");
  }

  if (hasValue(application.highestQualificationFile)) {
    score += 8;
    notes.push("Higher qualification proof uploaded");
  }

  if (hasValue(application.cvFile)) {
    score += 5;
    notes.push("CV uploaded");
  }

  if (isYes(application.disabilityStatus) && hasValue(application.disabilityProofFile)) {
    score += 5;
    notes.push("Disability proof uploaded");
  }

  if (hasValue(application.omangFile)) documentCompletenessScore += 25;
  if (hasValue(certificatePath)) documentCompletenessScore += 35;
  if (hasValue(application.cvFile)) documentCompletenessScore += 15;
  if (hasValue(application.highestQualificationFile)) documentCompletenessScore += 15;
  if (!isYes(application.disabilityStatus) || hasValue(application.disabilityProofFile)) {
    documentCompletenessScore += 10;
  }

  const isHardRejected = hardRejectReasons.length > 0;

  let result = "Eligible for ranking";
  let recommendedStatus: ApplicationStatus = "Under Review";

  if (isHardRejected) {
    result = "Hard reject";
    recommendedStatus = "Rejected";
  } else if (score >= 85) {
    result = "Strong candidate";
  } else if (score >= 70) {
    result = "Eligible candidate";
  } else if (score >= 55) {
    result = "Borderline but eligible";
  } else {
    result = "Weak but eligible";
  }

  return {
    score: Math.min(score, 100),
    result,
    notes: notes.join(", "),
    hardRejectReason: hardRejectReasons.join("; "),
    priorityGroup,
    selectionBucket: isHardRejected ? "Rejected - Hard Gate" : "Eligible Pool",
    documentCompletenessScore,
    recommendedStatus,
    isHardRejected,
  };
}

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
        omangFile: item.omang_file,
        gender: item.gender,
        age: item.age?.toString() || "",
        citizenship: item.citizenship,
        district: item.district,
        constituency: item.constituency,
        townVillage: item.town_village,
        disabilityStatus: item.disability_status,
        disabilityProofFile: item.disability_proof_file,
        certificateFile: item.certificate_file,
        cvFile: item.cv_file,
        bgcseCertificateFile: item.bgcse_certificate_file,
        highestQualificationFile: item.highest_qualification_file,
        completedBgcseIgcse: item.completed_bgcse_igcse,
        employmentStatus: item.employment_status,
        interestArea: item.interest_area,
        highestQualification: item.highest_qualification,
        examinationBody: item.examination_body,
        bgcsePoints: item.bgcse_points?.toString() || "",
        preferredLanguage: item.preferred_language,
        englishComfort: item.english_comfort,
        tertiaryCompleted: item.tertiary_completed,
        tertiaryEducation: item.tertiary_education,
        tertiaryInstitution: item.tertiary_institution,
        fieldOfStudy: item.field_of_study,
        motivation: item.motivation,
        postProgramPlan: item.post_program_plan,
        motivationWordCount: item.motivation_word_count,
        postProgramWordCount: item.post_program_word_count,
        status: item.status || "Submitted",
        autoReviewScore: item.auto_review_score,
        autoReviewResult: item.auto_review_result,
        autoReviewNotes: item.auto_review_notes,
        priorityGroup: item.priority_group,
        selectionBucket: item.selection_bucket,
        hardRejectReason: item.hard_reject_reason,
        documentCompletenessScore: item.document_completeness_score,
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
        application.constituency
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.applicationId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  async function updateReviewFields(
    application: Application,
    review: ReviewDecision,
    status: ApplicationStatus,
    selectionBucket = review.selectionBucket
  ) {
    const { error } = await supabase
      .from("applications")
      .update({
        status,
        auto_review_score: review.score,
        auto_review_result: review.result,
        auto_review_notes: review.notes,
        priority_group: review.priorityGroup,
        selection_bucket: selectionBucket,
        hard_reject_reason: review.hardRejectReason,
        document_completeness_score: review.documentCompletenessScore,
      })
      .eq("application_id", application.applicationId);

    if (error) throw error;
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

    try {
      await updateReviewFields(application, review, review.recommendedStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Auto-review failed";
      console.error("Failed to auto-review application:", error);
      alert(message);
      setSavingId(null);
      return;
    }

    const updatedApplication: Application = {
      ...application,
      autoReviewScore: review.score,
      autoReviewResult: review.result,
      autoReviewNotes: review.notes,
      priorityGroup: review.priorityGroup,
      selectionBucket: review.selectionBucket,
      hardRejectReason: review.hardRejectReason,
      documentCompletenessScore: review.documentCompletenessScore,
      status: review.recommendedStatus,
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

    const reviewed = applications.map((application) => {
      const review = calculateEligibility(application);
      const age = Number(application.age);
      const priorityGroup = review.priorityGroup;

      return {
        ...application,
        review,
        score: review.score,
        isHardRejected: review.isHardRejected,
        isYouth: !Number.isNaN(age) && age <= 35,
        isFemale: normalize(application.gender) === "female",
        isMale: normalize(application.gender) === "male",
        hasDisability: isYes(application.disabilityStatus),
      };
    });

    const hardRejected = reviewed.filter((app) => app.isHardRejected);
    const eligible = reviewed
      .filter((app) => !app.isHardRejected)
      .sort((a, b) => b.score - a.score);

    const selected = new Map<string, (typeof eligible)[number]>();
    const constituencyCounts: Record<string, number> = {};
    let disabledSelected = 0;

    function canSelect(candidate: (typeof eligible)[number]) {
      if (selected.has(candidate.applicationId)) return false;
      if (candidate.hasDisability && disabledSelected >= DISABILITY_CAP) {
        return false;
      }
      return true;
    }

    function addSelected(candidate: (typeof eligible)[number]) {
      selected.set(candidate.applicationId, candidate);
      const constituency = candidate.constituency || "Unknown";
      constituencyCounts[constituency] = (constituencyCounts[constituency] || 0) + 1;

      if (candidate.hasDisability) {
        disabledSelected += 1;
      }
    }

    function selectBestFromPool(
      pool: typeof eligible,
      limit: number,
      bucket: string,
      preferUnderConstituencyLimit = true
    ) {
      let added = 0;

      for (const candidate of pool) {
        if (added >= limit) break;
        if (selected.size >= TOTAL_INTAKE) break;
        if (!canSelect(candidate)) continue;

        const constituency = candidate.constituency || "Unknown";
        const currentConstituencyCount = constituencyCounts[constituency] || 0;

        if (
          preferUnderConstituencyLimit &&
          currentConstituencyCount >= PREFERRED_CONSTITUENCY_DEPTH
        ) {
          continue;
        }

        candidate.review.selectionBucket = bucket;
        addSelected(candidate);
        added += 1;
      }

      return added;
    }

    // Phase 1: protect the national promise — at least one eligible applicant per constituency where available.
    for (const constituency of constituencies) {
      if (selected.size >= TOTAL_INTAKE) break;

      const candidate = eligible
        .filter((app) => app.constituency === constituency)
        .sort((a, b) => b.score - a.score)
        .find((app) => canSelect(app));

      if (!candidate) continue;

      candidate.review.selectionBucket = "Constituency Minimum";
      addSelected(candidate);
    }

    const selectedArray = () => Array.from(selected.values());

    function currentCount(predicate: (app: (typeof eligible)[number]) => boolean) {
      return selectedArray().filter(predicate).length;
    }

    const youthWomenPool = eligible.filter((app) => app.isYouth && app.isFemale);
    const youthMenPool = eligible.filter((app) => app.isYouth && app.isMale);
    const nonYouthPool = eligible.filter((app) => !app.isYouth);

    selectBestFromPool(
      youthWomenPool,
      Math.max(0, TOTAL_YOUTH_WOMEN - currentCount((app) => app.isYouth && app.isFemale)),
      "Youth Women Priority"
    );

    selectBestFromPool(
      youthMenPool,
      Math.max(0, TOTAL_YOUTH_MEN - currentCount((app) => app.isYouth && app.isMale)),
      "Youth Men Priority"
    );

    selectBestFromPool(
      nonYouthPool,
      Math.max(0, TOTAL_NON_YOUTH - currentCount((app) => !app.isYouth)),
      "Non-Youth Allocation"
    );

    // Phase 3: if there are still seats, fill by strongest eligible applicants regardless of constituency depth.
    if (selected.size < TOTAL_INTAKE) {
      selectBestFromPool(
        eligible,
        TOTAL_INTAKE - selected.size,
        "Overflow Merit Fill",
        false
      );
    }

    const shortlistedIds = new Set(selectedArray().map((app) => app.applicationId));

    const waitingList = eligible.filter(
      (app) => !shortlistedIds.has(app.applicationId)
    );

    const updates = [
      ...selectedArray().map((app) => ({
        app,
        status: "Shortlisted" as ApplicationStatus,
        bucket: app.review.selectionBucket || "Shortlisted",
      })),
      ...waitingList.map((app) => ({
        app,
        status: "Waiting List" as ApplicationStatus,
        bucket: "Eligible Waiting List",
      })),
      ...hardRejected.map((app) => ({
        app,
        status: "Rejected" as ApplicationStatus,
        bucket: "Rejected - Hard Gate",
      })),
    ];

    for (const update of updates) {
      try {
        await updateReviewFields(
          update.app,
          update.app.review,
          update.status,
          update.bucket
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Master selection update failed";
        console.error("Master selection update failed:", error);
        alert(message);
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
          autoReviewScore: found.app.review.score,
          autoReviewResult: found.app.review.result,
          autoReviewNotes: found.app.review.notes,
          priorityGroup: found.app.review.priorityGroup,
          selectionBucket: found.bucket,
          hardRejectReason: found.app.review.hardRejectReason,
          documentCompletenessScore: found.app.review.documentCompletenessScore,
        };
      })
    );

    alert(
      `Master Selection Complete:\nShortlisted: ${selected.size}\nWaiting List: ${waitingList.length}\nRejected: ${hardRejected.length}\nDisabled Selected: ${disabledSelected}\nConstituencies Represented: ${Object.keys(constituencyCounts).length}`
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
  const rejectedCount = applications.filter(
    (item) => item.status === "Rejected"
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

        <section className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <StatCard title="Total" value={totalApplications} />
          <StatCard title="Submitted" value={submittedCount} />
          <StatCard title="Under Review" value={reviewCount} />
          <StatCard title="Shortlisted" value={shortlistedCount} />
          <StatCard title="Waiting List" value={waitingListCount} />
          <StatCard title="Accepted" value={acceptedCount} />
          <StatCard title="Rejected" value={rejectedCount} />
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, Omang, constituency or application ID"
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
                    <th className="text-left px-4 py-4">Auto Review</th>
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
                        <p>{application.constituency || "-"}</p>
                        <p className="text-slate-400 text-xs">
                          {application.gender}, {application.age}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {application.district || ""}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {application.autoReviewScore ?? "Not reviewed"}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {application.autoReviewResult || "-"}
                        </p>
                        {application.hardRejectReason && (
                          <p className="mt-1 text-red-300 text-xs">
                            {application.hardRejectReason}
                          </p>
                        )}
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
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
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
                <Detail label="District" value={selectedApplication.district} />
                <Detail
                  label="Constituency"
                  value={selectedApplication.constituency}
                />
                <Detail label="Town / Village" value={selectedApplication.townVillage} />
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
                  label="Completed BGCSE / IGCSE"
                  value={selectedApplication.completedBgcseIgcse}
                />
                <Detail
                  label="Examination Type"
                  value={selectedApplication.examinationBody}
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
                  label="English Comfort"
                  value={selectedApplication.englishComfort}
                />
                <Detail
                  label="Tertiary Completed"
                  value={selectedApplication.tertiaryCompleted}
                />
                <Detail
                  label="Tertiary Qualification"
                  value={selectedApplication.tertiaryEducation}
                />
                <Detail
                  label="Institution"
                  value={selectedApplication.tertiaryInstitution}
                />
                <Detail
                  label="Field of Study"
                  value={selectedApplication.fieldOfStudy}
                />
                <Detail
                  label="Disability Status"
                  value={selectedApplication.disabilityStatus}
                />
                <Detail label="Status" value={selectedApplication.status} />
                <Detail
                  label="Auto Review Score"
                  value={
                    selectedApplication.autoReviewScore?.toString() ||
                    "Not reviewed"
                  }
                />
                <Detail
                  label="Auto Review Result"
                  value={selectedApplication.autoReviewResult || "-"}
                />
                <Detail
                  label="Priority Group"
                  value={selectedApplication.priorityGroup || "-"}
                />
                <Detail
                  label="Selection Bucket"
                  value={selectedApplication.selectionBucket || "-"}
                />
                <Detail
                  label="Document Score"
                  value={
                    selectedApplication.documentCompletenessScore?.toString() ||
                    "-"
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <LongDetail
                  label="Auto Review Notes"
                  value={selectedApplication.autoReviewNotes || "-"}
                />
                <LongDetail
                  label="Hard Reject Reason"
                  value={selectedApplication.hardRejectReason || "-"}
                  danger
                />
                <LongDetail
                  label={`Motivation (${selectedApplication.motivationWordCount ?? countWords(selectedApplication.motivation)} words)`}
                  value={selectedApplication.motivation || "-"}
                />
                <LongDetail
                  label={`Post-Program Plan (${selectedApplication.postProgramWordCount ?? countWords(selectedApplication.postProgramPlan)} words)`}
                  value={selectedApplication.postProgramPlan || "-"}
                />
              </div>

              <AttachmentLink
                label="Omang / ID Copy"
                href={selectedApplication.omangFile}
              />

              <AttachmentLink
                label="BGCSE / IGCSE Certificate or Results Slip"
                href={
                  selectedApplication.bgcseCertificateFile ||
                  selectedApplication.certificateFile
                }
              />

              <AttachmentLink
                label="Higher Qualification Proof"
                href={selectedApplication.highestQualificationFile}
              />

              <AttachmentLink
                label="Disability Proof Attachment"
                href={selectedApplication.disabilityProofFile}
              />

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

function LongDetail({
  label,
  value,
  danger = false,
}: {
  label: string;
  value?: string | null;
  danger?: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p
        className={`text-xs uppercase tracking-wide ${
          danger ? "text-red-300" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
        {value || "-"}
      </p>
    </div>
  );
}

function AttachmentLink({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  if (!href) return null;

  return (
    <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-400 font-semibold underline"
      >
        Open uploaded file
      </a>
    </div>
  );
}
