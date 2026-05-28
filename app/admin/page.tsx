"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import AttachmentLink from "@/components/AttachmentLink";

const ADMIN_EMAILS = [
  "eddiemajola2020@gmail.com",
  "bandaseilaneng@gmail.com",
  "oil-gas.training@sethresources.com",
  "tsmogotsi@yahoo.com",
];

type ApplicationStatus =
  | "Submitted"
  | "Remaining Eligible"
  | "Accepted"
  | "Rejected";

function normalizeApplicationStatus(value?: string | null): ApplicationStatus {
  if (value === "Accepted") return "Accepted";
  if (value === "Remaining Eligible") return "Remaining Eligible";
  if (value === "Rejected") return "Rejected";
  return "Submitted";
}

function getAdminSelectionLabel(application: Pick<Application, "status" | "selectionBucket">) {
  const bucket = application.selectionBucket || "";

  if (bucket.includes("Batch 1 -")) return "Batch 1 Selected";
  if (bucket.includes("Batch 2 -")) return "Batch 2 Reserved";
  if (bucket.includes("Remaining Eligible")) return "Remaining Eligible";
  if (bucket.includes("Rejected -")) return "Rejected";

  return normalizeApplicationStatus(application.status);
}

function getAdminSelectionStatus(application: Pick<Application, "status" | "selectionBucket">): ApplicationStatus {
  const label = getAdminSelectionLabel(application);

  if (label === "Batch 1 Selected") return "Accepted";
  if (label === "Batch 2 Reserved") return "Remaining Eligible";
  if (label === "Remaining Eligible") return "Remaining Eligible";
  if (label === "Rejected") return "Rejected";

  return normalizeApplicationStatus(application.status);
}

function isInternalBatchOneSelection(selectionBucket?: string | null) {
  return Boolean((selectionBucket || "").includes("Batch 1 -"));
}

type AuditAction =
  | "status_change"
  | "auto_review"
  | "master_selection"
  | "selection_publish"
  | "message_saved"
  | "data_request_update";

type AuditLog = {
  id: string | number;
  createdAt: string;
  adminEmail: string;
  applicationId?: string | null;
  action: AuditAction | string;
  details?: Record<string, unknown> | null;
};

type DashboardStats = {
  total: number;
  women: number;
  men: number;
  submitted: number;
  internalBatchOne: number;
  remainingEligible: number;
  accepted: number;
  rejected: number;
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  total: 0,
  women: 0,
  men: 0,
  submitted: 0,
  internalBatchOne: 0,
  remainingEligible: 0,
  accepted: 0,
  rejected: 0,
};

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
  databaseId?: string | null;
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
  ovcStatus?: string | null;
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

type DataRequestStatus = "pending" | "in_review" | "completed" | "rejected";

type DataRequest = {
  id: string;
  userId?: string | null;
  fullName?: string | null;
  email: string;
  phone?: string | null;
  requestType:
    | "access"
    | "correction"
    | "deletion"
    | "restriction"
    | "objection"
    | "portability";
  message?: string | null;
  status: DataRequestStatus;
  adminNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
};

type SelectionProgress = {
  active: boolean;
  title: string;
  phase: string;
  detail: string;
  current: number;
  total: number;
};

const EMPTY_SELECTION_PROGRESS: SelectionProgress = {
  active: false,
  title: "",
  phase: "",
  detail: "",
  current: 0,
  total: 0,
};

type ReportingConstituencyStats = {
  total: number;
  women: number;
  men: number;
  otherOrUnknown: number;
  youth: number;
  nonYouth: number;
  disability: number;
};

type ReportingStats = {
  generatedAt: Date;
  total: number;
  women: number;
  men: number;
  otherOrUnknown: number;
  youth: number;
  nonYouth: number;
  disability: number;
  constituenciesWithApplications: number;
  constituencyRows: [string, ReportingConstituencyStats][];
  extraConstituencyRows: [string, ReportingConstituencyStats][];
};

const CONSTITUENCY_COUNT = 61;
const BATCH_BASE_PER_CONSTITUENCY = 8;
const BATCH_1_INTAKE = BATCH_BASE_PER_CONSTITUENCY * CONSTITUENCY_COUNT; // 488 automatic seats: 8 per constituency
const BATCH_2_INTAKE = BATCH_BASE_PER_CONSTITUENCY * CONSTITUENCY_COUNT; // 488 automatic seats: 8 per constituency
const BATCH_1_MANUAL_REMAINING_SEATS = 12;
const BATCH_2_MANUAL_REMAINING_SEATS = 12;
const TOTAL_PROGRAMME_INTAKE = 1000;
const BATCH_EXTRA_CONSTITUENCIES = 0;
const BATCH_1_EXTRA_START_INDEX = 0;
const BATCH_2_EXTRA_START_INDEX = 0;
const SELECTION_RESULTS_VISIBLE_TO_APPLICANTS = false;
const TOTAL_YOUTH_WOMEN = 435;
const TOTAL_YOUTH_MEN = 315;
const TOTAL_NON_YOUTH = 250;
const TOTAL_AUTO_SELECTED_INTAKE = BATCH_1_INTAKE + BATCH_2_INTAKE;
const DISABILITY_CAP = 8;
const MIN_BGCSE_POINTS = 25;
const MIN_MOTIVATION_WORDS = 40;
const MIN_POST_PROGRAM_WORDS = 30;
const PREFERRED_CONSTITUENCY_DEPTH = 3;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const PAGE_SIZE = 50;
const APPLICATIONS_TABLE = "applications";
const WAITING_LIST_PER_CONSTITUENCY = 50;

const STRATEGIC_COVERAGE_BOOST = 15;
const STRATEGIC_COVERAGE_EMAILS = [
  "boitumelompulubusi98@gmail.com",
  "leepileone66@gmail.com",
  "krasebokwana@gmail.com",
  "",
  "dimpho@dichakenyane.com",
  "sadintseane@gmail.com",
  "seabekgosiphefo@gmail.com",
  "tlharesagae@gmail.com",
  "ilenykk01@gmail.com",
  "bkgotlele@gmail.com",
  "",
];

const constituencies = [
  "Bobirwa",
  "Boteti East",
  "Boteti West",
  "Charleshill",
  "Chobe",
  "Francistown East",
  "Francistown South",
  "Francistown West",
  "Gabane/ Mankgodi",
  "Gaborone Bonnington North",
  "Gaborone Bonnington South",
  "Gaborone Central",
  "Gaborone North",
  "Gaborone South",
  "Gamalete",
  "Ghanzi",
  "Goodhope - Mmathethe",
  "Jwaneng – Mabutsane",
  "Kanye East",
  "Kanye West",
  "Kgalagadi North",
  "Kgalagadi South",
  "Kgatleng Central",
  "Kgatleng East",
  "Kgatleng West",
  "Lentsweletau - Lephepe",
  "Letlhakeng",
  "Lobatse",
  "Mahalapye East",
  "Mahalapye West",
  "Maun East",
  "Maun North",
  "Maun West",
  "Mmadinare",
  "Mmopane - Metsimotlhabe",
  "Mogoditshane East",
  "Mogoditshane West",
  "Molepolole North",
  "Molepolole South",
  "Moshupa - Manyana",
  "Nata – Gweta",
  "Ngami",
  "Nkange",
  "Okavango East",
  "Okavango West",
  "Palapye",
  "Selibe Phikwe East",
  "Selibe Phikwe West",
  "Serowe North",
  "Serowe South",
  "Serowe West",
  "Shashe West",
  "Shoshong",
  "Takatokwane",
  "Tati East",
  "Tati West",
  "Thamaga - Kumakwane",
  "Tlokweng",
  "Tonota",
  "Tswapong North",
  "Tswapong South",
];

const VALID_CONSTITUENCIES = constituencies.map((constituency) =>
  normalize(constituency),
);

function isValidConstituency(value?: string | null) {
  return VALID_CONSTITUENCIES.includes(normalize(value));
}

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

function isStrategicCoverageParticipant(email?: string | null) {
  const normalizedEmail = normalize(email);

  if (!normalizedEmail) return false;

  return STRATEGIC_COVERAGE_EMAILS.some(
    (priorityEmail) => normalize(priorityEmail) === normalizedEmail,
  );
}

function maskOmang(value?: string | null) {
  if (!value) return "-";

  const clean = value.replace(/\s+/g, "");

  if (clean.length <= 4) {
    return "****";
  }

  return `****${clean.slice(-4)}`;
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

const PROGRAMME_RELEVANT_FIELD_KEYWORDS = [
  "bsc major in chemistry",
  "bsc chemistry",
  "chemistry",
  "applied chemistry",
  "chemical science",
  "chemical engineering",

  "petroleum",
  "petroleum engineering",
  "oil and gas",
  "oil & gas",
  "lpg",
  "gas",
  "fuel",
  "energy",
  "renewable energy",
  "clean energy",

  "fire and safety",
  "fire safety",
  "health and safety",
  "occupational health and safety",
  "occupational safety",
  "safety management",
  "risk management",
  "emergency response",
  "hazard management",

  "cips",
  "procurement",
  "supply chain",
  "logistics",
  "transport management",
  "distribution",
  "warehouse",

  "environmental science",
  "environmental health",
  "physics",
  "geology",
  "earth science",
  "laboratory science",

  "mechanical engineering",
  "electrical engineering",
  "industrial engineering",
  "process engineering",
  "operations management",
];

function getProgrammeRelevantFieldBonus(application: Application) {
  const combinedFieldText = [
    application.fieldOfStudy,
    application.tertiaryEducation,
    application.highestQualification,
    application.interestArea,
  ]
    .map((value) => normalize(value))
    .filter(Boolean)
    .join(" ");

  if (!combinedFieldText) return 0;

  const hasProgrammeRelevantField = PROGRAMME_RELEVANT_FIELD_KEYWORDS.some(
    (keyword) => combinedFieldText.includes(keyword),
  );

  return hasProgrammeRelevantField ? 5 : 0;
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

  if (!isValidConstituency(application.constituency)) {
    hardRejectReasons.push("Invalid or unrecognised constituency");
  }

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
      `Motivation is too short (${motivationWords}/${MIN_MOTIVATION_WORDS} words)`,
    );
  }

  if (postProgramWords < MIN_POST_PROGRAM_WORDS) {
    hardRejectReasons.push(
      `Post-program plan is too short (${postProgramWords}/${MIN_POST_PROGRAM_WORDS} words)`,
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

  if (
    normalize(application.gender) === "female" &&
    !Number.isNaN(age) &&
    age <= 35
  ) {
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

  const programmeRelevantFieldBonus =
    getProgrammeRelevantFieldBonus(application);

  if (programmeRelevantFieldBonus > 0) {
    score += programmeRelevantFieldBonus;
    notes.push("Programme-relevant study or technical background");
  }

  if (
    isYes(application.disabilityStatus) &&
    hasValue(application.disabilityProofFile)
  ) {
    score += 5;
    notes.push("Disability proof uploaded");
  }

  if (hasValue(application.omangFile)) documentCompletenessScore += 25;
  if (hasValue(certificatePath)) documentCompletenessScore += 35;
  if (hasValue(application.cvFile)) documentCompletenessScore += 15;
  if (hasValue(application.highestQualificationFile))
    documentCompletenessScore += 15;
  if (
    !isYes(application.disabilityStatus) ||
    hasValue(application.disabilityProofFile)
  ) {
    documentCompletenessScore += 10;
  }

  const isHardRejected = hardRejectReasons.length > 0;

  let result = "Eligible for ranking";
  let recommendedStatus: ApplicationStatus = "Submitted";

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
  const complianceRef = useRef<HTMLElement | null>(null);
  const auditRef = useRef<HTMLElement | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [masterSelecting, setMasterSelecting] = useState(false);
  const [publishingSelection, setPublishingSelection] = useState(false);
  const [selectionProgress, setSelectionProgress] = useState<SelectionProgress>(
    EMPTY_SELECTION_PROGRESS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>(
    {},
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [dataRequestsLoading, setDataRequestsLoading] = useState(false);
  const [showDataRequests, setShowDataRequests] = useState(false);
  const [savingDataRequestId, setSavingDataRequestId] = useState<string | null>(
    null,
  );
  const [dataRequestNotes, setDataRequestNotes] = useState<
    Record<string, string>
  >({});
  const [fullBackupExporting, setFullBackupExporting] = useState(false);
  const [reportingStats, setReportingStats] = useState<ReportingStats | null>(
    null,
  );
  const [reportingStatsLoading, setReportingStatsLoading] = useState(false);
  const [insightTab, setInsightTab] = useState<"quota" | "constituency">(
    "quota",
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(
    EMPTY_DASHBOARD_STATS,
  );
  const [showConstituencyDispatch, setShowConstituencyDispatch] =
    useState(false);
  const [dispatchApplications, setDispatchApplications] = useState<
    Application[]
  >([]);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSavingKey, setDispatchSavingKey] = useState<string | null>(
    null,
  );
  const [dispatchDueDiligenceConfirm, setDispatchDueDiligenceConfirm] =
    useState<Record<string, boolean>>({});

  function formatApplication(item: any): Application {
    return {
      id:
        item.id?.toString() ||
        item.application_id ||
        item.email ||
        crypto.randomUUID(),
      databaseId: item.id?.toString() || null,
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
      ovcStatus: item.ovc_status,
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
      status: normalizeApplicationStatus(item.status),
      autoReviewScore: item.auto_review_score,
      autoReviewResult: item.auto_review_result,
      autoReviewNotes: item.auto_review_notes,
      priorityGroup: item.priority_group,
      selectionBucket: item.selection_bucket,
      hardRejectReason: item.hard_reject_reason,
      documentCompletenessScore: item.document_completeness_score,
      submittedAt: item.submitted_at,
      adminMessage: item.admin_message || "",
    };
  }

  async function getApplicationCount(
    buildQuery?: (query: any) => any,
  ): Promise<number> {
    let query = supabase
      .from(APPLICATIONS_TABLE)
      .select("id", { count: "exact", head: true });

    if (buildQuery) {
      query = buildQuery(query);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  }

  async function loadDashboardStats() {
    try {
      const [
        total,
        women,
        men,
        submitted,
        internalBatchOne,
        remainingEligible,
        accepted,
        rejected,
      ] = await Promise.all([
        getApplicationCount(),
        getApplicationCount((query) => query.ilike("gender", "female")),
        getApplicationCount((query) => query.ilike("gender", "male")),
        getApplicationCount((query) =>
          query
            .eq("status", "Submitted")
            .or("selection_bucket.is.null,selection_bucket.eq."),
        ),
        getApplicationCount((query) =>
          query.ilike("selection_bucket", "%Batch 1 -%"),
        ),
        getApplicationCount((query) =>
          query.ilike("selection_bucket", "%Remaining Eligible%"),
        ),
        getApplicationCount((query) => query.ilike("selection_bucket", "%Batch 1 -%")),
        getApplicationCount((query) =>
          query.ilike("selection_bucket", "%Rejected -%"),
        ),
      ]);

      setDashboardStats({
        total,
        women,
        men,
        submitted,
        internalBatchOne,
        remainingEligible,
        accepted,
        rejected,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  }
  function createEmptyReportingConstituencyStats(): ReportingConstituencyStats {
    return {
      total: 0,
      women: 0,
      men: 0,
      otherOrUnknown: 0,
      youth: 0,
      nonYouth: 0,
      disability: 0,
    };
  }

  function buildReportingStats(rows: any[]): ReportingStats {
    const constituencyBreakdown = rows.reduce(
      (acc, row) => {
        const constituency = row.constituency || "Unknown";
        const gender = normalize(row.gender);
        const age = Number(row.age);
        const isYouth = !Number.isNaN(age) && age <= 35;
        const hasDisability = isYes(row.disability_status);

        if (!acc[constituency]) {
          acc[constituency] = createEmptyReportingConstituencyStats();
        }

        acc[constituency].total += 1;

        if (gender === "female") {
          acc[constituency].women += 1;
        } else if (gender === "male") {
          acc[constituency].men += 1;
        } else {
          acc[constituency].otherOrUnknown += 1;
        }

        if (isYouth) {
          acc[constituency].youth += 1;
        } else {
          acc[constituency].nonYouth += 1;
        }

        if (hasDisability) {
          acc[constituency].disability += 1;
        }

        return acc;
      },
      {} as Record<string, ReportingConstituencyStats>,
    );

    const constituencyRows = constituencies.map((constituency) => [
      constituency,
      constituencyBreakdown[constituency] ||
        createEmptyReportingConstituencyStats(),
    ]) as [string, ReportingConstituencyStats][];

    const extraConstituencyRows = (
      Object.entries(constituencyBreakdown) as [
        string,
        ReportingConstituencyStats,
      ][]
    )
      .filter(([constituency]) => !constituencies.includes(constituency))
      .sort((a, b) => b[1].total - a[1].total);

    const totals = constituencyRows
      .concat(extraConstituencyRows)
      .reduce((acc, [, stats]) => {
        acc.total += stats.total;
        acc.women += stats.women;
        acc.men += stats.men;
        acc.otherOrUnknown += stats.otherOrUnknown;
        acc.youth += stats.youth;
        acc.nonYouth += stats.nonYouth;
        acc.disability += stats.disability;
        return acc;
      }, createEmptyReportingConstituencyStats());

    return {
      generatedAt: new Date(),
      ...totals,
      constituenciesWithApplications: constituencyRows.filter(
        ([, stats]) => stats.total > 0,
      ).length,
      constituencyRows,
      extraConstituencyRows,
    };
  }

  async function loadReportingStats() {
    setReportingStatsLoading(true);

    try {
      const batchSize = 1000;
      let from = 0;
      let rows: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("gender,constituency,district,status,age,disability_status")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Failed to load reporting stats:", error);
          setReportingStatsLoading(false);
          return;
        }

        rows = [...rows, ...(data || [])];

        if (!data || data.length < batchSize) break;

        from += batchSize;
      }

      setReportingStats(buildReportingStats(rows));
    } catch (error) {
      console.error("Failed to load reporting stats:", error);
    } finally {
      setReportingStatsLoading(false);
    }
  }

  async function fetchAllApplicationsForSelection(): Promise<Application[]> {
    const batchSize = 1000;
    let from = 0;
    let allApplications: Application[] = [];

    while (true) {
      const { data, error } = await supabase
        .from(APPLICATIONS_TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        throw error;
      }

      const batch = (data || []).map(formatApplication);
      allApplications = [...allApplications, ...batch];

      if (!data || data.length < batchSize) break;

      from += batchSize;
    }

    return allApplications;
  }

  async function loadApplications(showFullLoader = false, page = currentPage) {
    const { data: sessionData } = await supabase.auth.getSession();

    const session = sessionData.session;

    if (!session) {
      router.push("/admin-login");
      return;
    }

    const email = session.user.email;

    if (!email || !ADMIN_EMAILS.includes(email)) {
      console.warn("Unauthorized admin access attempt:", email);
      await supabase.auth.signOut();
      router.push("/admin-login");
      return;
    }

    if (showFullLoader) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const cleanedSearch = searchTerm.trim();

    let query = supabase
      .from(APPLICATIONS_TABLE)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter === "Internal Batch 1") {
      query = query.ilike("selection_bucket", "%Batch 1 -%");
    } else if (statusFilter === "Internal Remaining Eligible") {
      query = query.ilike("selection_bucket", "%Remaining Eligible%");
    } else if (statusFilter === "Internal Rejected") {
      query = query.ilike("selection_bucket", "%Rejected -%");
    } else if (statusFilter === "Submitted") {
      query = query
        .eq("status", "Submitted")
        .or("selection_bucket.is.null,selection_bucket.eq.");
    } else if (statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }

    if (cleanedSearch) {
      const safeSearch = cleanedSearch
        .replace(/[%_,]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const searchParts = safeSearch.split(" ").filter(Boolean);

      if (searchParts.length >= 2) {
        const firstPart = searchParts[0];
        const lastPart = searchParts.slice(1).join(" ");

        query = query.or(
          [
            `first_name.ilike.%${firstPart}%`,
            `last_name.ilike.%${lastPart}%`,
            `first_name.ilike.%${lastPart}%`,
            `last_name.ilike.%${firstPart}%`,
            `email.ilike.%${safeSearch}%`,
            `phone.ilike.%${safeSearch}%`,
            `omang.ilike.%${safeSearch}%`,
            `constituency.ilike.%${safeSearch}%`,
            `district.ilike.%${safeSearch}%`,
            `application_id.ilike.%${safeSearch}%`,
          ].join(","),
        );
      } else {
        query = query.or(
          [
            `first_name.ilike.%${safeSearch}%`,
            `last_name.ilike.%${safeSearch}%`,
            `email.ilike.%${safeSearch}%`,
            `phone.ilike.%${safeSearch}%`,
            `omang.ilike.%${safeSearch}%`,
            `constituency.ilike.%${safeSearch}%`,
            `district.ilike.%${safeSearch}%`,
            `application_id.ilike.%${safeSearch}%`,
          ].join(","),
        );
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Failed to load applications:", error);
      setLoading(false);
      setTableLoading(false);
      return;
    }

    const formattedApplications: Application[] = (data || []).map(
      formatApplication,
    );

    setApplications(formattedApplications);
    setTotalCount(count || 0);
    setLastUpdated(new Date());
    setLoading(false);
    setTableLoading(false);
    loadDashboardStats();
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadApplications(true, currentPage);

    const interval = setInterval(() => {
      loadApplications(false, currentPage);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [router, currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    loadAuditLogs();
    loadDataRequests();
  }, []);

  useEffect(() => {
    loadReportingStats();

    const interval = setInterval(() => {
      loadReportingStats();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const filteredApplications = applications;

  async function logAdminAction({
    action,
    applicationId,
    details,
  }: {
    action: AuditAction;
    applicationId?: string;
    details?: Record<string, unknown>;
  }) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const adminEmail = sessionData.session?.user.email || "unknown-admin";

      const { error } = await supabase.from("admin_audit_logs").insert([
        {
          admin_email: adminEmail,
          action,
          application_id: applicationId || null,
          details: details || {},
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn("Audit log failed:", error.message);
      } else if (showAuditLogs) {
        await loadAuditLogs();
      }
    } catch (error) {
      console.warn("Audit log failed:", error);
    }
  }

  async function loadAuditLogs() {
    setAuditLoading(true);

    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to load audit logs:", error);
      alert(error.message);
      setAuditLoading(false);
      return;
    }

    const formattedLogs: AuditLog[] = (data || []).map((item) => ({
      id: item.id,
      createdAt: item.created_at,
      adminEmail: item.admin_email,
      applicationId: item.application_id,
      action: item.action,
      details: item.details || {},
    }));

    setAuditLogs(formattedLogs);
    setAuditLoading(false);
  }

  async function handleToggleAuditLogs() {
    if (!showAuditLogs) {
      setShowAuditLogs(true);
      await loadAuditLogs();
      setTimeout(() => {
        auditRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
      return;
    }

    auditRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function formatDataRequest(item: any): DataRequest {
    return {
      id: item.id,
      userId: item.user_id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      requestType: item.request_type,
      status: item.status || "pending",
      message: item.message,
      adminNotes: item.admin_notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      completedAt: item.completed_at,
    };
  }

  async function loadDataRequests() {
    setDataRequestsLoading(true);

    const { data, error } = await supabase
      .from("data_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to load data requests:", error);
      setDataRequestsLoading(false);
      return;
    }

    const formattedRequests = (data || []).map(formatDataRequest);

    setDataRequests(formattedRequests);
    setDataRequestNotes(
      formattedRequests.reduce(
        (acc, request) => ({
          ...acc,
          [request.id]: request.adminNotes || "",
        }),
        {} as Record<string, string>,
      ),
    );
    setDataRequestsLoading(false);
  }

  async function handleToggleDataRequests() {
    setShowDataRequests(true);
    await loadDataRequests();

    setTimeout(() => {
      complianceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  async function handleDataRequestUpdate(
    request: DataRequest,
    status: DataRequestStatus,
  ) {
    setSavingDataRequestId(request.id);

    const now = new Date().toISOString();
    const adminNotes = dataRequestNotes[request.id] || "";

    const { error } = await supabase
      .from("data_requests")
      .update({
        status,
        admin_notes: adminNotes,
        updated_at: now,
        completed_at: status === "completed" ? now : null,
      })
      .eq("id", request.id);

    if (error) {
      console.error("Failed to update data request:", error);
      alert(error.message);
      setSavingDataRequestId(null);
      return;
    }

    await logAdminAction({
      action: "data_request_update",
      details: {
        dataRequestId: request.id,
        requesterEmail: request.email,
        requestType: request.requestType,
        previousStatus: request.status,
        newStatus: status,
      },
    });

    setDataRequests((prev) =>
      prev.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status,
              adminNotes,
              updatedAt: now,
              completedAt: status === "completed" ? now : null,
            }
          : item,
      ),
    );

    setSavingDataRequestId(null);
  }

  function handleExportDataRequest(request: DataRequest) {
    const payload = {
      id: request.id,
      fullName: request.fullName,
      email: request.email,
      phone: request.phone,
      requestType: request.requestType,
      status: request.status,
      message: request.message,
      adminNotes: dataRequestNotes[request.id] || request.adminNotes || "",
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      completedAt: request.completedAt,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    link.href = url;
    link.download = `BYWC-data-request-${request.email}-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function formatSelectionUpdateError(
    application: Application,
    action: string,
    error: unknown,
  ) {
    const applicantName = `${application.firstName || ""} ${application.lastName || ""}`
      .replace(/\s+/g, " ")
      .trim();
    const applicantLabel = [
      applicantName || "Unknown applicant",
      application.email || "no email",
      application.applicationId || "no application_id",
    ].join(" | ");

    if (error instanceof Error) {
      return new Error(`${action} failed for ${applicantLabel}: ${error.message}`);
    }

    if (error && typeof error === "object" && "message" in error) {
      return new Error(
        `${action} failed for ${applicantLabel}: ${String(
          (error as { message?: unknown }).message,
        )}`,
      );
    }

    return new Error(`${action} failed for ${applicantLabel}.`);
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isRetryableSelectionError(error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message)
          : String(error || "");

    return [
      "ERR_CONNECTION_CLOSED",
      "Failed to fetch",
      "NetworkError",
      "Load failed",
      "timeout",
      "connection",
      "fetch",
      "503",
      "504",
      "502",
      "429",
    ].some((fragment) =>
      message.toLowerCase().includes(fragment.toLowerCase()),
    );
  }

  async function retrySelectionUpdate(
    action: () => Promise<void>,
    maxAttempts = 4,
  ) {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await action();
        return;
      } catch (error) {
        lastError = error;

        if (!isRetryableSelectionError(error) || attempt === maxAttempts) {
          throw error;
        }

        await sleep(500 * attempt);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Selection update failed after retry attempts.");
  }

  async function updateApplicationBySafeKey(
    application: Application,
    payload: Record<string, unknown>,
    actionLabel: string,
  ) {
    const updateByIdFirst = Boolean(application.databaseId);

    if (updateByIdFirst) {
      const { data, error } = await supabase
        .from(APPLICATIONS_TABLE)
        .update(payload)
        .eq("id", application.databaseId)
        .select("id,application_id")
        .maybeSingle();

      if (error) {
        throw formatSelectionUpdateError(application, actionLabel, error);
      }

      if (data) return;
    }

    if (!application.applicationId) {
      throw formatSelectionUpdateError(
        application,
        actionLabel,
        new Error("Missing both database id and application_id for update."),
      );
    }

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update(payload)
      .eq("application_id", application.applicationId)
      .select("id,application_id")
      .maybeSingle();

    if (error) {
      throw formatSelectionUpdateError(application, actionLabel, error);
    }

    if (!data) {
      throw formatSelectionUpdateError(
        application,
        actionLabel,
        new Error("No matching database row was updated."),
      );
    }
  }

  async function updateReviewFields(
    application: Application,
    review: ReviewDecision,
    status: ApplicationStatus,
    selectionBucket = review.selectionBucket,
  ) {
    await updateApplicationBySafeKey(
      application,
      {
        status,
        auto_review_score: review.score,
        auto_review_result: review.result,
        auto_review_notes: review.notes,
        priority_group: review.priorityGroup,
        selection_bucket: selectionBucket,
        hard_reject_reason: review.hardRejectReason,
        document_completeness_score: review.documentCompletenessScore,
      },
      "Applicant review update",
    );
  }

  async function updateInternalSelectionFields(
    application: Application,
    review: ReviewDecision,
    selectionBucket = review.selectionBucket,
  ) {
    await updateApplicationBySafeKey(
      application,
      {
        auto_review_score: review.score,
        auto_review_result: review.result,
        auto_review_notes: review.notes,
        priority_group: review.priorityGroup,
        selection_bucket: selectionBucket,
        hard_reject_reason: review.hardRejectReason,
        document_completeness_score: review.documentCompletenessScore,
      },
      "Internal selection update",
    );
  }

  async function updateReviewFieldsInChunks(
    updates: {
      app: Application & { review: ReviewDecision };
      status: ApplicationStatus;
      bucket: string;
    }[],
    chunkSize = 25,
    onProgress?: (completed: number, total: number, failed: number) => void,
  ) {
    const failures: string[] = [];
    let completed = 0;

    for (let index = 0; index < updates.length; index += chunkSize) {
      const chunk = updates.slice(index, index + chunkSize);

      for (const update of chunk) {
        try {
          await retrySelectionUpdate(() =>
            updateInternalSelectionFields(
              update.app,
              update.app.review,
              update.bucket,
            ),
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown internal selection update failure";

          failures.push(message);
          console.error("Internal selection row failed:", message, update.app);
        } finally {
          completed += 1;
          onProgress?.(completed, updates.length, failures.length);
        }
      }

      await sleep(250);
    }

    return failures;
  }

  function getPublishedStatusFromSelectionBucket(
    selectionBucket?: string | null,
  ): ApplicationStatus | null {
    const bucket = selectionBucket || "";

    if (!bucket.includes("Internal Hold - Do Not Notify")) return null;
    if (bucket.includes("Batch 1 -")) return "Accepted";
    if (bucket.includes("Remaining Eligible")) return "Remaining Eligible";
    if (bucket.includes("Batch 2 -")) return "Remaining Eligible";
    if (bucket.includes("Rejected -")) return "Rejected";

    return null;
  }

  function getPublishedSelectionBucket(selectionBucket?: string | null) {
    return (selectionBucket || "")
      .replace("Internal Hold - Do Not Notify", "Published - Applicant Visible")
      .trim();
  }

  async function updatePublishedSelectionStatusesInChunks(
    updates: {
      application: Application;
      status: ApplicationStatus;
      selectionBucket: string;
    }[],
    chunkSize = 25,
    onProgress?: (completed: number, total: number, failed: number) => void,
  ) {
    const failures: string[] = [];
    let completed = 0;

    for (let index = 0; index < updates.length; index += chunkSize) {
      const chunk = updates.slice(index, index + chunkSize);

      for (const update of chunk) {
        try {
          await retrySelectionUpdate(() =>
            updateApplicationBySafeKey(
              update.application,
              {
                status: update.status,
                selection_bucket: update.selectionBucket,
              },
              "Selection publish update",
            ),
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown selection publish update failure";

          failures.push(message);
          console.error("Selection publish row failed:", message, update.application);
        } finally {
          completed += 1;
          onProgress?.(completed, updates.length, failures.length);
        }
      }

      await sleep(250);
    }

    return failures;
  }

  async function handlePublishSelectionResults() {
    const confirmed = window.confirm(
      "Publish selection results to applicant dashboards? This will change visible statuses from Submitted to Accepted, Remaining Eligible, or Rejected based on the internal selection buckets. This does not send emails or SMS messages.",
    );

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Final confirmation: applicants will be able to see their updated status after this. Continue?",
    );

    if (!secondConfirm) return;

    setPublishingSelection(true);
    setSelectionProgress({
      active: true,
      title: "Publishing selection results",
      phase: "Loading applications",
      detail: "Fetching internal held selection results...",
      current: 0,
      total: 1,
    });

    let selectionApplications: Application[] = [];

    try {
      selectionApplications = await fetchAllApplicationsForSelection();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load applications for publishing";
      console.error("Failed to load applications for publishing:", error);
      alert(message);
      setPublishingSelection(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Publishing selection results",
      phase: "Preparing updates",
      detail: `Checking ${selectionApplications.length.toLocaleString()} applications for publishable internal results...`,
      current: 0,
      total: selectionApplications.length || 1,
    });

    const updates = selectionApplications
      .map((application) => {
        const publishedStatus = getPublishedStatusFromSelectionBucket(
          application.selectionBucket,
        );

        if (!publishedStatus) return null;

        return {
          application,
          status: publishedStatus,
          selectionBucket: getPublishedSelectionBucket(
            application.selectionBucket,
          ),
        };
      })
      .filter(
        (update): update is {
          application: Application;
          status: ApplicationStatus;
          selectionBucket: string;
        } => Boolean(update),
      );

    if (updates.length === 0) {
      alert(
        "No internal held selection results were found to publish. Run selection first, then publish.",
      );
      setPublishingSelection(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Publishing selection results",
      phase: "Updating applicant dashboards",
      detail: "Changing visible statuses in safe chunks. This does not send emails or SMS.",
      current: 0,
      total: updates.length || 1,
    });

    let publishFailures: string[] = [];

    try {
      publishFailures = await updatePublishedSelectionStatusesInChunks(updates, 25, (completed, total, failed) => {
        setSelectionProgress({
          active: true,
          title: "Publishing selection results",
          phase: "Updating applicant dashboards",
          detail: `Processed ${completed.toLocaleString()} of ${total.toLocaleString()} dashboard statuses. Failed: ${failed.toLocaleString()}.`,
          current: completed,
          total,
        });
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Selection publish failed";
      console.error("Selection publish failed:", error);
      alert(message);
      setPublishingSelection(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    const acceptedCount = updates.filter(
      (update) => update.status === "Accepted",
    ).length;
    const remainingEligibleCount = updates.filter(
      (update) => update.status === "Remaining Eligible",
    ).length;
    const rejectedCount = updates.filter(
      (update) => update.status === "Rejected",
    ).length;

    await logAdminAction({
      action: "selection_publish",
      details: {
        totalPublished: updates.length - publishFailures.length,
        failedToPublish: publishFailures.length,
        firstPublishFailures: publishFailures.slice(0, 10),
        accepted: acceptedCount,
        remainingEligible: remainingEligibleCount,
        rejected: rejectedCount,
        sentEmailOrSms: false,
      },
    });

    setApplications((prev) =>
      prev.map((application) => {
        const found = updates.find(
          (update) =>
            update.application.applicationId === application.applicationId,
        );

        if (!found) return application;

        return {
          ...application,
          status: found.status,
          selectionBucket: found.selectionBucket,
        };
      }),
    );

    await loadDashboardStats();

    alert(
      `Selection results published to applicant dashboards.\nAccepted: ${acceptedCount}\nRemaining Eligible: ${remainingEligibleCount}\nRejected: ${rejectedCount}\nEmails/SMS sent: NO`,
    );

    setSelectionProgress({
      active: false,
      title: "Publishing complete",
      phase: "Complete",
      detail: "Applicant dashboard statuses were updated. No emails or SMS were sent.",
      current: updates.length,
      total: updates.length || 1,
    });
    setPublishingSelection(false);
  }

  async function handleStatusChange(
    application: Application,
    newStatus: ApplicationStatus,
  ) {
    setSavingId(application.id);

    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update({ status: newStatus })
      .eq("application_id", application.applicationId);

    if (error) {
      console.error("Failed to update status:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    await logAdminAction({
      action: "status_change",
      applicationId: application.applicationId,
      details: {
        previousStatus: application.status,
        newStatus,
        applicantEmail: application.email,
        applicantName: `${application.firstName} ${application.lastName}`,
      },
    });

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? { ...item, status: newStatus }
          : item,
      ),
    );

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        status: newStatus,
      });
    }

    loadDashboardStats();
    setSavingId(null);
  }

  async function handleAutoReview(application: Application) {
    setSavingId(application.id);

    const review = calculateEligibility(application);

    try {
      await updateReviewFields(application, review, review.recommendedStatus);

      await logAdminAction({
        action: "auto_review",
        applicationId: application.applicationId,
        details: {
          recommendedStatus: review.recommendedStatus,
          score: review.score,
          result: review.result,
          priorityGroup: review.priorityGroup,
          selectionBucket: review.selectionBucket,
          hardRejectReason: review.hardRejectReason,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Auto-review failed";
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
          : item,
      ),
    );

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication(updatedApplication);
    }

    loadDashboardStats();
    setSavingId(null);
  }

  async function handleMasterSelection() {
    const confirmed = window.confirm(
      "Run Batch 1 hidden selection now? This will select up to 488 applicants internally only: 8 per constituency. Applicant-facing statuses will remain unchanged until you publish results later.",
    );

    if (!confirmed) return;

    setMasterSelecting(true);
    setSelectionProgress({
      active: true,
      title: "Running Batch 1 hidden selection",
      phase: "Loading applications",
      detail: "Fetching all applications from Supabase...",
      current: 0,
      total: 1,
    });

    let selectionApplications: Application[] = [];

    try {
      selectionApplications = await fetchAllApplicationsForSelection();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load all applications for Batch 1 selection";
      console.error(
        "Failed to load all applications for Batch 1 selection:",
        error,
      );
      alert(message);
      setMasterSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Running Batch 1 hidden selection",
      phase: "Scoring applications",
      detail: `Scoring ${selectionApplications.length.toLocaleString()} applications and checking hard-reject rules...`,
      current: 0,
      total: selectionApplications.length || 1,
    });

    const reviewed = selectionApplications.map((application, index) => {
      if (index % 500 === 0) {
        setSelectionProgress({
          active: true,
          title: "Running Batch 1 hidden selection",
          phase: "Scoring applications",
          detail: `Scoring application ${index.toLocaleString()} of ${selectionApplications.length.toLocaleString()}...`,
          current: index,
          total: selectionApplications.length || 1,
        });
      }

      const review = calculateEligibility(application);
      const age = Number(application.age);
      const isStrategicCoverage =
        !review.isHardRejected &&
        isStrategicCoverageParticipant(application.email);
      const rankingScore =
        review.score + (isStrategicCoverage ? STRATEGIC_COVERAGE_BOOST : 0);

      return {
        ...application,
        review,
        score: review.score,
        rankingScore,
        isStrategicCoverage,
        isHardRejected: review.isHardRejected,
        isYouth: !Number.isNaN(age) && age <= 35,
        isFemale: normalize(application.gender) === "female",
        isMale: normalize(application.gender) === "male",
        hasDisability: isYes(application.disabilityStatus),
      };
    });

    setSelectionProgress({
      active: true,
      title: "Running Batch 1 hidden selection",
      phase: "Building Batch 1",
      detail: "Selecting up to 8 eligible applicants per constituency for today's Batch 1 only.",
      current: 0,
      total: constituencies.length,
    });

    type ReviewedApplication = (typeof reviewed)[number];

    const hardRejected = reviewed.filter((app) => app.isHardRejected);
    const eligible = reviewed
      .filter((app) => !app.isHardRejected)
      .sort((a, b) => {
        if (b.rankingScore !== a.rankingScore) {
          return b.rankingScore - a.rankingScore;
        }

        return (
          (b.review.documentCompletenessScore || 0) -
          (a.review.documentCompletenessScore || 0)
        );
      });

    const batchOneSelected = new Map<string, ReviewedApplication>();
    const batchOneConstituencyCounts: Record<string, number> = {};
    let disabledSelected = 0;

    function canSelect(candidate: ReviewedApplication) {
      if (!candidate.applicationId) return false;
      if (batchOneSelected.has(candidate.applicationId)) return false;
      if (candidate.hasDisability && disabledSelected >= DISABILITY_CAP) {
        return false;
      }
      return true;
    }

    function getNormalSelectionBucket(candidate: ReviewedApplication) {
      if (candidate.isYouth && candidate.isFemale) {
        return "Youth Women Priority";
      }
      if (candidate.isYouth && candidate.isMale) return "Youth Men Priority";
      return "Non-Youth Allocation";
    }

    function addToBatchOne(candidate: ReviewedApplication, bucket: string) {
      if (batchOneSelected.size >= BATCH_1_INTAKE) return false;
      if (!canSelect(candidate)) return false;

      candidate.review.selectionBucket = bucket;
      batchOneSelected.set(candidate.applicationId, candidate);

      const constituency = candidate.constituency || "Unknown";
      batchOneConstituencyCounts[constituency] =
        (batchOneConstituencyCounts[constituency] || 0) + 1;

      if (candidate.hasDisability) {
        disabledSelected += 1;
      }

      return true;
    }

    // Batch 1 rule for today: 8 applicants per constituency only.
    // This creates 488 internal selections: 61 constituencies x 8.
    // The extra 12 seats to reach 500 are deliberately left for manual admin allocation.
    for (const [constituencyIndex, constituency] of constituencies.entries()) {
      setSelectionProgress({
        active: true,
        title: "Running Batch 1 hidden selection",
        phase: "Building Batch 1",
        detail: `Batch 1: processing ${constituency} (${constituencyIndex + 1}/${constituencies.length})`,
        current: constituencyIndex + 1,
        total: constituencies.length,
      });

      if (batchOneSelected.size >= BATCH_1_INTAKE) break;

      const constituencyPool = eligible.filter(
        (app) => app.constituency === constituency,
      );

      for (const candidate of constituencyPool) {
        if (batchOneSelected.size >= BATCH_1_INTAKE) break;

        const currentConstituencyCount =
          batchOneConstituencyCounts[constituency] || 0;

        if (currentConstituencyCount >= BATCH_BASE_PER_CONSTITUENCY) {
          break;
        }

        addToBatchOne(
          candidate,
          `Batch 1 - Constituency Quota ${BATCH_BASE_PER_CONSTITUENCY} / ${getNormalSelectionBucket(candidate)}`,
        );
      }
    }

    const batchOneSelectedIds = new Set(
      Array.from(batchOneSelected.values()).map((app) => app.applicationId),
    );
    const constituencyWaitingListCounts: Record<string, number> = {};

    const waitingListEligible = eligible.filter((app) => {
      if (batchOneSelectedIds.has(app.applicationId)) return false;

      const constituency = app.constituency || "Unknown";

      if (!constituencyWaitingListCounts[constituency]) {
        constituencyWaitingListCounts[constituency] = 0;
      }

      if (
        constituencyWaitingListCounts[constituency] >=
        WAITING_LIST_PER_CONSTITUENCY
      ) {
        return false;
      }

      constituencyWaitingListCounts[constituency] += 1;
      app.review.selectionBucket = `Remaining Eligible - Constituency Waitlist / ${getNormalSelectionBucket(app)}`;
      return true;
    });

    const updates = [
      ...Array.from(batchOneSelected.values()).map((app) => ({
        app,
        status: "Submitted" as ApplicationStatus,
        bucket: `Internal Hold - Do Not Notify / ${app.review.selectionBucket || "Batch 1 Selected"}`,
      })),
      ...waitingListEligible.map((app) => ({
        app,
        status: "Submitted" as ApplicationStatus,
        bucket: `Internal Hold - Do Not Notify / ${app.review.selectionBucket || "Remaining Eligible - Constituency Waitlist"}`,
      })),
      ...hardRejected.map((app) => ({
        app,
        status: "Submitted" as ApplicationStatus,
        bucket: app.review.hardRejectReason.includes(
          "Invalid or unrecognised constituency",
        )
          ? "Internal Hold - Do Not Notify / Rejected - Invalid Constituency"
          : "Internal Hold - Do Not Notify / Rejected - Hard Gate",
      })),
    ];

    setSelectionProgress({
      active: true,
      title: "Running Batch 1 hidden selection",
      phase: "Saving Batch 1, waitlist, and failed-gate internal results",
      detail: "Writing Batch 1 selections, constituency waitlist, and failed-gate internal buckets. Applicants still see Submitted.",
      current: 0,
      total: updates.length || 1,
    });

    let internalSelectionFailures: string[] = [];

    try {
      internalSelectionFailures = await updateReviewFieldsInChunks(
        updates,
        25,
        (completed, total, failed) => {
          setSelectionProgress({
            active: true,
            title: "Running Batch 1 hidden selection",
            phase: "Saving Batch 1, waitlist, and failed-gate internal results",
            detail: `Processed ${completed.toLocaleString()} of ${total.toLocaleString()} internal result records. Failed: ${failed.toLocaleString()}.`,
            current: completed,
            total,
          });
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Batch 1 selection update failed";
      console.error("Batch 1 selection update failed:", error);
      alert(message);
      setMasterSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Running Batch 1 hidden selection",
      phase: "Refreshing dashboard",
      detail: "Updating admin view and dashboard stats...",
      current: updates.length,
      total: updates.length || 1,
    });

    setApplications((prev) =>
      prev.map((application) => {
        const found = updates.find(
          (update) => update.app.applicationId === application.applicationId,
        );

        if (!found) return application;

        return {
          ...application,
          autoReviewScore: found.app.review.score,
          autoReviewResult: found.app.review.result,
          autoReviewNotes: found.app.review.notes,
          priorityGroup: found.app.review.priorityGroup,
          selectionBucket: found.bucket,
          hardRejectReason: found.app.review.hardRejectReason,
          documentCompletenessScore: found.app.review.documentCompletenessScore,
        };
      }),
    );

    await loadDashboardStats();

    const constituenciesWithFullBatchOneQuota = constituencies.filter(
      (constituency) =>
        (batchOneConstituencyCounts[constituency] || 0) >=
        BATCH_BASE_PER_CONSTITUENCY,
    ).length;

    await logAdminAction({
      action: "master_selection",
      details: {
        resultsVisibleToApplicants: SELECTION_RESULTS_VISIBLE_TO_APPLICANTS,
        selectionMode: "Batch 1 only - hidden internal selection",
        internalSelectionUpdatesAttempted: updates.length,
        internalSelectionUpdatesSaved:
          updates.length - internalSelectionFailures.length,
        internalSelectionUpdatesFailed: internalSelectionFailures.length,
        firstInternalSelectionFailures: internalSelectionFailures.slice(0, 10),
        batchOneRule:
          "Constituency quota only: all 61 constituencies receive up to 8 automatic seats; 12 seats remain for manual admin allocation",
        batchOneSelected: batchOneSelected.size,
        batchTwoSelected: 0,
        remainingEligiblePersisted: waitingListEligible.length,
        rejectedPersisted: hardRejected.length,
        hardRejectedCountedOnly: 0,
        disabledSelected,
        constituenciesWithFullBatchOneQuota,
        batchOneIntake: BATCH_1_INTAKE,
        batchBasePerConstituency: BATCH_BASE_PER_CONSTITUENCY,
        batchOneManualRemainingSeats: BATCH_1_MANUAL_REMAINING_SEATS,
        totalProgrammeIntake: TOTAL_PROGRAMME_INTAKE,
      },
    });

    alert(
      `Batch 1 Hidden Selection Complete:\nApplicant-facing results visible: NO\nBatch 1 Internal Selected: ${batchOneSelected.size}/${BATCH_1_INTAKE}\nRule: ${BATCH_BASE_PER_CONSTITUENCY} per constituency across ${constituencies.length} constituencies\nFull Constituency Quotas: ${constituenciesWithFullBatchOneQuota}/${constituencies.length}\nManual seats left for today: ${BATCH_1_MANUAL_REMAINING_SEATS}\nFailed-gate applicants saved internally: ${hardRejected.length}\nDisabled selected: ${disabledSelected}\nFailed row updates: ${internalSelectionFailures.length}`,
    );

    setSelectionProgress({
      active: false,
      title: "Batch 1 hidden selection complete",
      phase: "Complete",
      detail: internalSelectionFailures.length
        ? "Batch 1 completed with some failed row updates. Applicants were not notified and visible statuses were not changed."
        : "Batch 1 internal selections were saved. Applicants were not notified and visible statuses were not changed.",
      current: updates.length,
      total: updates.length || 1,
    });
    setMasterSelecting(false);
  }

  async function handleSaveMessage(application: Application) {
    const message =
      messageDrafts[application.id] ?? selectedApplication?.adminMessage ?? "";

    setSavingId(application.id);

    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
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

    await logAdminAction({
      action: "message_saved",
      applicationId: application.applicationId,
      details: {
        applicantEmail: application.email,
        applicantName: `${application.firstName} ${application.lastName}`,
        messageLength: message.length,
      },
    });

    const updatedApplication = {
      ...application,
      adminMessage: message,
    };

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? updatedApplication
          : item,
      ),
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

  async function loadConstituencyDispatch() {
    setDispatchLoading(true);

    try {
      const batchSize = 1000;
      let from = 0;
      let allApplications: Application[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("*")
          .order("constituency", { ascending: true })
          .order("status", { ascending: true })
          .order("auto_review_score", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Failed to load constituency dispatch:", error);
          alert(error.message || "Failed to load constituency dispatch.");
          setDispatchLoading(false);
          return;
        }

        const batch = (data || []).map(formatApplication);
        allApplications = [...allApplications, ...batch];

        if (!data || data.length < batchSize) break;

        from += batchSize;
      }

      setDispatchApplications(allApplications);
    } catch (error) {
      console.error("Failed to load constituency dispatch:", error);
      alert("Failed to load constituency dispatch. Please try again.");
    } finally {
      setDispatchLoading(false);
    }
  }

  async function handleToggleConstituencyDispatch() {
    setShowConstituencyDispatch(true);
    await loadConstituencyDispatch();
  }

  function getSuccessfulApplicantMessage(application: Application) {
    return `Congratulations! 🎉

You have been successfully selected to participate in the Botswana Youth, Women & Citizen Oil & Gas Training Programme 2026.

Participants are expected to arrive at the University of Botswana, Gaborone Campus on 31 May 2026 before 12:00 noon to allow for accommodation allocation and settling in well on time.

Participants are expected to attend the official programme launch on 01 June 2026 at Ba Isago University from 8:00 AM.

Please bring your Omang/ID card or a copy for registration and verification purposes.

Welcome to the programme.`;
  }

  async function handleSaveGroupMessage(
    constituency: string,
    status: ApplicationStatus,
    groupApplications: Application[],
  ) {
    const groupKey = `${constituency}-${status}`;

    if (!dispatchDueDiligenceConfirm[groupKey]) {
      alert(
        "Please confirm that due diligence has been completed for this constituency group before saving the group message.",
      );
      return;
    }

    if (groupApplications.length === 0) {
      alert("There are no applicants in this group.");
      return;
    }

    const confirmed = window.confirm(
      `Save personalised successful-applicant messages for ${groupApplications.length} ${status} applicant(s) in ${constituency}?`,
    );

    if (!confirmed) return;

    setDispatchSavingKey(groupKey);

    try {
      for (const application of groupApplications) {
        const message = getSuccessfulApplicantMessage(application);

        const { error } = await supabase
          .from(APPLICATIONS_TABLE)
          .update({
            admin_message: message,
          })
          .eq("application_id", application.applicationId);

        if (error) {
          throw error;
        }
      }

      await logAdminAction({
        action: "message_saved",
        details: {
          constituency,
          status,
          groupCount: groupApplications.length,
          messageType: "constituency_successful_applicant_group_message",
          dueDiligenceConfirmed: true,
        },
      });

      setDispatchApplications((prev) =>
        prev.map((application) => {
          const shouldUpdate = groupApplications.some(
            (item) => item.applicationId === application.applicationId,
          );

          if (!shouldUpdate) return application;

          return {
            ...application,
            adminMessage: getSuccessfulApplicantMessage(application),
          };
        }),
      );

      setApplications((prev) =>
        prev.map((application) => {
          const shouldUpdate = groupApplications.some(
            (item) => item.applicationId === application.applicationId,
          );

          if (!shouldUpdate) return application;

          return {
            ...application,
            adminMessage: getSuccessfulApplicantMessage(application),
          };
        }),
      );

      alert(
        `Group messages saved for ${groupApplications.length} applicant(s) in ${constituency}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Group message save failed";
      console.error("Group message save failed:", error);
      alert(message);
    } finally {
      setDispatchSavingKey(null);
    }
  }

  function escapeCsvValue(value?: unknown) {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  function handleExportCurrentPageCsv() {
    if (filteredApplications.length === 0) {
      alert("There are no applications to export on this page.");
      return;
    }

    const headers = [
      "Application ID",
      "Submitted At",
      "Status",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Omang",
      "Gender",
      "Age",
      "Citizenship",
      "District",
      "Constituency",
      "Town / Village",
      "OVC Status",
      "Disability Status",
      "Employment Status",
      "Interest Area",
      "Highest Qualification",
      "Completed BGCSE / IGCSE",
      "BGCSE Points",
      "Preferred Language",
      "Auto Review Score",
      "Auto Review Result",
      "Priority Group",
      "Selection Bucket",
      "Hard Reject Reason",
      "Document Score",
      "Omang File",
      "BGCSE Certificate File",
      "Highest Qualification File",
      "CV File",
      "Disability Proof File",
    ];

    const rows = filteredApplications.map((application) => [
      application.applicationId,
      application.submittedAt,
      application.status,
      application.firstName,
      application.lastName,
      application.email,
      application.phone,
      application.omang,
      application.gender,
      application.age,
      application.citizenship,
      application.district,
      application.constituency,
      application.townVillage,
      application.ovcStatus,
      application.disabilityStatus,
      application.employmentStatus,
      application.interestArea,
      application.highestQualification,
      application.completedBgcseIgcse,
      application.bgcsePoints,
      application.preferredLanguage,
      application.autoReviewScore,
      application.autoReviewResult,
      application.priorityGroup,
      application.selectionBucket,
      application.hardRejectReason,
      application.documentCompletenessScore,
      application.omangFile,
      application.bgcseCertificateFile || application.certificateFile,
      application.highestQualificationFile,
      application.cvFile,
      application.disabilityProofFile,
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `bywc-applications-page-${currentPage}-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function handleExportStatsCsv() {
    const confirmed = window.confirm(
      "Export stats only? This downloads totals and constituency breakdowns without applicant names, Omang numbers, emails or phone numbers.",
    );

    if (!confirmed) return;

    try {
      const batchSize = 1000;
      let from = 0;
      let statsRows: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("gender,constituency,district,status,age,disability_status")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Stats export failed:", error);
          alert(error.message || "Stats export failed.");
          return;
        }

        statsRows = [...statsRows, ...(data || [])];

        if (!data || data.length < batchSize) break;

        from += batchSize;
      }

      if (statsRows.length === 0) {
        alert("No application stats found to export.");
        return;
      }

      const genderCounts = statsRows.reduce(
        (acc, row) => {
          const gender = normalize(row.gender);

          if (gender === "female") {
            acc.women += 1;
          } else if (gender === "male") {
            acc.men += 1;
          } else {
            acc.otherOrUnknown += 1;
          }

          return acc;
        },
        { women: 0, men: 0, otherOrUnknown: 0 },
      );

      const statusCounts = statsRows.reduce(
        (acc, row) => {
          const key = row.status || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const constituencyBreakdown = statsRows.reduce(
        (acc, row) => {
          const constituency = row.constituency || "Unknown";
          const gender = normalize(row.gender);
          const age = Number(row.age);
          const isYouth = !Number.isNaN(age) && age <= 35;
          const hasDisability = isYes(row.disability_status);

          if (!acc[constituency]) {
            acc[constituency] = {
              total: 0,
              women: 0,
              men: 0,
              otherOrUnknown: 0,
              youth: 0,
              nonYouth: 0,
              disability: 0,
            };
          }

          acc[constituency].total += 1;

          if (gender === "female") {
            acc[constituency].women += 1;
          } else if (gender === "male") {
            acc[constituency].men += 1;
          } else {
            acc[constituency].otherOrUnknown += 1;
          }

          if (isYouth) {
            acc[constituency].youth += 1;
          } else {
            acc[constituency].nonYouth += 1;
          }

          if (hasDisability) {
            acc[constituency].disability += 1;
          }

          return acc;
        },
        {} as Record<
          string,
          {
            total: number;
            women: number;
            men: number;
            otherOrUnknown: number;
            youth: number;
            nonYouth: number;
            disability: number;
          }
        >,
      );

      const emptyConstituencyStats = {
        total: 0,
        women: 0,
        men: 0,
        otherOrUnknown: 0,
        youth: 0,
        nonYouth: 0,
        disability: 0,
      };

      const officialConstituencyRows = constituencies.map((constituency) => [
        constituency,
        constituencyBreakdown[constituency] || emptyConstituencyStats,
      ]) as [
        string,
        {
          total: number;
          women: number;
          men: number;
          otherOrUnknown: number;
          youth: number;
          nonYouth: number;
          disability: number;
        },
      ][];

      const extraConstituencyRows = (
        Object.entries(constituencyBreakdown) as [
          string,
          {
            total: number;
            women: number;
            men: number;
            otherOrUnknown: number;
            youth: number;
            nonYouth: number;
            disability: number;
          },
        ][]
      )
        .filter(([constituency]) => !constituencies.includes(constituency))
        .sort((a, b) => b[1].total - a[1].total);

      const constituenciesWithApplications = officialConstituencyRows.filter(
        ([, stats]) => stats.total > 0,
      ).length;

      const csvRows = [
        ["BYWC Stats Export"],
        ["Generated At", new Date().toISOString()],
        [],
        ["Summary"],
        ["Metric", "Count"],
        ["Total Applications", statsRows.length],
        ["Women", genderCounts.women],
        ["Men", genderCounts.men],
        ["Other / Unknown Gender", genderCounts.otherOrUnknown],
        ["Official Constituencies Listed", constituencies.length],
        [
          "Official Constituencies With Applications",
          constituenciesWithApplications,
        ],
        [],
        ["Status Breakdown"],
        ["Status", "Count"],
        ...Object.entries(statusCounts)
          .sort()
          .map(([status, count]) => [status, count]),
        [],
        ["Constituency Breakdown - All 61 Official Constituencies"],
        [
          "Constituency",
          "Total Applicants",
          "Women",
          "Men",
          "Other / Unknown Gender",
          "Youth",
          "Non-Youth",
          "Disability Declared",
        ],
        ...officialConstituencyRows.map(([constituency, stats]) => [
          constituency,
          stats.total,
          stats.women,
          stats.men,
          stats.otherOrUnknown,
          stats.youth,
          stats.nonYouth,
          stats.disability,
        ]),
        ...(extraConstituencyRows.length > 0
          ? [
              [],
              ["Extra / Unmatched Constituency Values From Database"],
              [
                "Constituency",
                "Total Applicants",
                "Women",
                "Men",
                "Other / Unknown Gender",
                "Youth",
                "Non-Youth",
                "Disability Declared",
              ],
              ...extraConstituencyRows.map(([constituency, stats]) => [
                constituency,
                stats.total,
                stats.women,
                stats.men,
                stats.otherOrUnknown,
                stats.youth,
                stats.nonYouth,
                stats.disability,
              ]),
            ]
          : []),
      ];

      const csvContent = csvRows
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      link.href = url;
      link.download = `BYWC-stats-only-export-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      alert(`Stats export complete. ${statsRows.length} applications counted.`);
    } catch (error) {
      console.error("Stats export failed:", error);
      alert("Stats export failed. Please try again.");
    }
  }

  async function handleExportFullBackupCsv() {
    const confirmed = window.confirm(
      "Export a full applications backup? This will fetch all records in safe batches and download one CSV file.",
    );

    if (!confirmed) return;

    setFullBackupExporting(true);

    try {
      const batchSize = 1000;
      let from = 0;
      let allApplications: Application[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Full backup export failed:", error);
          alert(error.message || "Full backup export failed.");
          setFullBackupExporting(false);
          return;
        }

        const batch = (data || []).map(formatApplication);
        allApplications = [...allApplications, ...batch];

        if (!data || data.length < batchSize) break;

        from += batchSize;
      }

      if (allApplications.length === 0) {
        alert("No applications found to export.");
        setFullBackupExporting(false);
        return;
      }

      const headers = [
        "Application ID",
        "Submitted At",
        "Status",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Omang",
        "Gender",
        "Age",
        "Citizenship",
        "District",
        "Constituency",
        "Town / Village",
        "OVC Status",
        "Disability Status",
        "Employment Status",
        "Interest Area",
        "Highest Qualification",
        "Completed BGCSE / IGCSE",
        "BGCSE Points",
        "Preferred Language",
        "Auto Review Score",
        "Auto Review Result",
        "Priority Group",
        "Selection Bucket",
        "Hard Reject Reason",
        "Document Score",
        "Omang File",
        "BGCSE Certificate File",
        "Highest Qualification File",
        "CV File",
        "Disability Proof File",
        "Admin Message",
      ];

      const rows = allApplications.map((application) => [
        application.applicationId,
        application.submittedAt,
        application.status,
        application.firstName,
        application.lastName,
        application.email,
        application.phone,
        application.omang,
        application.gender,
        application.age,
        application.citizenship,
        application.district,
        application.constituency,
        application.townVillage,
        application.ovcStatus,
        application.disabilityStatus,
        application.employmentStatus,
        application.interestArea,
        application.highestQualification,
        application.completedBgcseIgcse,
        application.bgcsePoints,
        application.preferredLanguage,
        application.autoReviewScore,
        application.autoReviewResult,
        application.priorityGroup,
        application.selectionBucket,
        application.hardRejectReason,
        application.documentCompletenessScore,
        application.omangFile,
        application.bgcseCertificateFile || application.certificateFile,
        application.highestQualificationFile,
        application.cvFile,
        application.disabilityProofFile,
        application.adminMessage,
      ]);

      const csvContent = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row) => row.map(escapeCsvValue).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      link.href = url;
      link.download = `BYWC-full-applications-backup-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      alert(
        `Full backup complete. ${allApplications.length} records exported.`,
      );
    } catch (error) {
      console.error("Full backup export failed:", error);
      alert("Full backup export failed. Please try again.");
    } finally {
      setFullBackupExporting(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin-login");
  }

  const totalApplications = dashboardStats.total;
  const submittedCount = dashboardStats.submitted;
  const internalBatchOneCount = dashboardStats.internalBatchOne;
  const remainingEligibleCount = dashboardStats.remainingEligible;
  const acceptedCount = dashboardStats.accepted;
  const rejectedCount = dashboardStats.rejected;
  const womenCount = dashboardStats.women;
  const menCount = dashboardStats.men;

  const youthWomenCount = reportingStats
    ? reportingStats.constituencyRows.reduce(
        (sum, [, stats]) => sum + stats.women,
        0,
      )
    : applications.filter((item) => {
        const age = Number(item.age);
        return (
          !Number.isNaN(age) && age <= 35 && normalize(item.gender) === "female"
        );
      }).length;

  const youthMenCount = reportingStats
    ? reportingStats.constituencyRows.reduce(
        (sum, [, stats]) => sum + stats.men,
        0,
      )
    : applications.filter((item) => {
        const age = Number(item.age);
        return (
          !Number.isNaN(age) && age <= 35 && normalize(item.gender) === "male"
        );
      }).length;

  const nonYouthCount = reportingStats
    ? reportingStats.nonYouth
    : applications.filter((item) => {
        const age = Number(item.age);
        return !Number.isNaN(age) && age > 35;
      }).length;

  const disabilityApplicantsCount = reportingStats
    ? reportingStats.disability
    : applications.filter((item) => isYes(item.disabilityStatus)).length;

  const youthTotal = reportingStats
    ? reportingStats.youth
    : youthWomenCount + youthMenCount;

  const constituencyStats = useMemo(() => {
    if (reportingStats) {
      return reportingStats.constituencyRows;
    }

    const stats = applications.reduce(
      (acc, application) => {
        const key = application.constituency || "Unknown";

        if (!acc[key]) {
          acc[key] = createEmptyReportingConstituencyStats();
        }

        acc[key].total += 1;

        if (normalize(application.gender) === "female") {
          acc[key].women += 1;
        } else if (normalize(application.gender) === "male") {
          acc[key].men += 1;
        } else {
          acc[key].otherOrUnknown += 1;
        }

        const age = Number(application.age);
        if (!Number.isNaN(age) && age <= 35) {
          acc[key].youth += 1;
        } else {
          acc[key].nonYouth += 1;
        }

        if (isYes(application.disabilityStatus)) {
          acc[key].disability += 1;
        }

        return acc;
      },
      {} as Record<string, ReportingConstituencyStats>,
    );

    return constituencies.map((constituency) => [
      constituency,
      stats[constituency] || createEmptyReportingConstituencyStats(),
    ]) as [string, ReportingConstituencyStats][];
  }, [applications, reportingStats]);

  const topConstituencies = [...constituencyStats]
    .filter(([, stats]) => stats.total > 0)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  const lowestConstituencies = [...constituencyStats]
    .sort((a, b) => a[1].total - b[1].total)
    .slice(0, 10);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, totalCount);
  const pendingRequestsCount = dataRequests.filter(
    (request) => request.status === "pending",
  ).length;
  const selectionProgressPercent = selectionProgress.total
    ? Math.min(
        100,
        Math.round((selectionProgress.current / selectionProgress.total) * 100),
      )
    : 0;

  const constituencyDispatchGroups = useMemo(() => {
    const createEmptyDispatchStatusGroup = () =>
      ({
        "Remaining Eligible": [],
        Rejected: [],
        Submitted: [],
        Accepted: [],
      }) as Record<ApplicationStatus, Application[]>;

    const grouped = constituencies.reduce(
      (acc, constituency) => {
        acc[constituency] = createEmptyDispatchStatusGroup();
        return acc;
      },
      {} as Record<string, Record<ApplicationStatus, Application[]>>,
    );

    const otherConstituencyGroup = "Other / Invalid Constituencies";

    for (const application of dispatchApplications) {
      const rawConstituency = application.constituency || "";
      const officialConstituency = constituencies.find(
        (constituency) => normalize(constituency) === normalize(rawConstituency),
      );
      const dispatchConstituency = officialConstituency || otherConstituencyGroup;
      const status = getAdminSelectionStatus(application);

      if (!grouped[dispatchConstituency]) {
        grouped[dispatchConstituency] = createEmptyDispatchStatusGroup();
      }

      grouped[dispatchConstituency][status].push(application);
    }

    const officialGroups = constituencies.map((constituency) => [
      constituency,
      grouped[constituency] || createEmptyDispatchStatusGroup(),
    ]) as [string, Record<ApplicationStatus, Application[]>][];

    const otherGroup = grouped[otherConstituencyGroup];
    const otherGroupTotal = otherGroup
      ? Object.values(otherGroup).reduce((total, list) => total + list.length, 0)
      : 0;

    if (otherGroup && otherGroupTotal > 0) {
      return [
        ...officialGroups,
        [otherConstituencyGroup, otherGroup] as [
          string,
          Record<ApplicationStatus, Application[]>,
        ],
      ];
    }

    return officialGroups;
  }, [dispatchApplications]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="rounded-[28px] border border-white/10 bg-[#0b1028] px-8 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
          <p className="text-sm font-semibold text-slate-300">
            Loading applications...
          </p>
        </div>
      </main>
    );
  }

  const statusNavItems = [
    { label: "All Applications", value: "All", count: totalApplications },
    {
      label: "Batch 1 Selected",
      value: "Internal Batch 1",
      count: internalBatchOneCount,
    },
    {
      label: "Waitlist / Remaining Eligible",
      value: "Internal Remaining Eligible",
      count: remainingEligibleCount,
    },
    { label: "Submitted / Unselected", value: "Submitted", count: submittedCount },
    { label: "Rejected / Failed Gates", value: "Internal Rejected", count: rejectedCount },
  ];

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto min-h-screen max-w-[1800px] p-4 lg:p-6">
        <nav className="mb-5 rounded-[28px] border border-white/10 bg-[#0b1028] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="grid gap-4 2xl:grid-cols-[170px_minmax(0,1fr)_300px] 2xl:items-start">
            <div className="flex h-full items-start">
              <div className="flex w-full max-w-[160px] items-center gap-2 rounded-2xl border border-orange-500/25 bg-white/5 px-3 py-2 text-white">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-black">
                  BY
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-orange-300">
                    BYWC
                  </p>
                  <p className="truncate text-[11px] font-bold">
                    Admin Control
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:max-w-4xl">
              {statusNavItems.map((item) => {
                const isActive = statusFilter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(item.value);
                      setCurrentPage(1);
                    }}
                    className={`flex min-h-[36px] items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition ${
                      isActive
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    } ${item.value === "Rejected" ? "sm:col-start-1" : ""}`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-start justify-start gap-2 xl:col-span-2 2xl:col-span-1 2xl:justify-end">
              <button
                type="button"
                onClick={handleToggleAuditLogs}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10"
              >
                Activity Log
              </button>

              <button
                type="button"
                onClick={handleToggleDataRequests}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10"
              >
                Compliance
              </button>

              <details className="group relative">
                <summary className="list-none rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700 [&::-webkit-details-marker]:hidden">
                  More Actions ▾
                </summary>

                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                  <button
                    type="button"
                    onClick={handleExportCurrentPageCsv}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-emerald-300 transition hover:bg-white/10"
                  >
                    Export Page
                  </button>

                  <button
                    type="button"
                    onClick={handleExportFullBackupCsv}
                    disabled={fullBackupExporting}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-purple-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {fullBackupExporting
                      ? "Exporting Backup..."
                      : "Full Backup"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportStatsCsv}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-orange-300 transition hover:bg-white/10"
                  >
                    Export Stats Only
                  </button>

                  <button
                    type="button"
                    onClick={() => loadApplications(false, currentPage)}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-blue-300 transition hover:bg-white/10"
                  >
                    Refresh Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleConstituencyDispatch}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-yellow-300 transition hover:bg-white/10"
                  >
                    Constituency Dispatch
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-white transition hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              </details>
            </div>
          </div>
        </nav>

        <header className="mb-5 rounded-[30px] border border-white/10 bg-[#0b1028] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] lg:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">
                BYWC Oil & Gas Training
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Review applications, update statuses, run auto-review, export
                backups and manage applicant messages.
              </p>
              {lastUpdated && (
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Last updated: {lastUpdated.toLocaleTimeString()} ·
                  Auto-refreshes every 15 minutes
                </p>
              )}
            </div>

            <div className="rounded-[24px] border border-orange-500/25 bg-orange-500/10 p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                    Selection Tools
                  </p>
                  <h2 className="mt-1 text-lg font-black text-white">
                    Master Selection
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Run selection internally first. Applicants will still see
                    Submitted until you manually publish the results.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleMasterSelection}
                    disabled={masterSelecting || publishingSelection}
                    className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
                  >
                    {masterSelecting ? "Running..." : "Run Hidden Selection"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishSelectionResults}
                    disabled={masterSelecting || publishingSelection}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {publishingSelection
                      ? "Publishing..."
                      : "Publish Results to Dashboard"}
                  </button>
                </div>

                <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-slate-300">
                  Current safety mode: hidden selection does not notify
                  applicants. The publish button changes applicant dashboard
                  statuses only; it does not send email, SMS or WhatsApp.
                </p>

                {(selectionProgress.active || masterSelecting || publishingSelection) && (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                          {selectionProgress.title || "Processing"}
                        </p>
                        <h3 className="mt-1 text-sm font-black text-white">
                          {selectionProgress.phase || "Working..."}
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
                          {selectionProgress.detail || "Please keep this page open while the operation runs."}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                        {selectionProgressPercent}%
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${selectionProgressPercent}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>
                        {selectionProgress.current.toLocaleString()} / {selectionProgress.total.toLocaleString()}
                      </span>
                      <span>Keep page open</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total" value={totalApplications} />
          <StatCard title="Batch 1 Selected" value={internalBatchOneCount} />
          <StatCard title="Waitlist" value={remainingEligibleCount} />
          <StatCard title="Submitted / Unselected" value={submittedCount} />
          <StatCard title="Failed Gates" value={rejectedCount} />
          <StatCard title="Women" value={womenCount} />
        </section>

        <section className="mb-5 rounded-[30px] border border-orange-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                Admin Selection Results
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Hidden Batch 1 results are visible to admins only
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                Applicants still see Submitted. These numbers come from internal selection buckets, not public status.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleConstituencyDispatch}
              className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white transition hover:bg-orange-600"
            >
              Open Constituency Breakdown
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Batch 1 Rule</p>
              <p className="mt-2 text-2xl font-black text-white">8 × 61</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">488 hidden selections</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Selected</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{internalBatchOneCount}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Internal Batch 1 only</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Waitlist</p>
              <p className="mt-2 text-2xl font-black text-yellow-300">{remainingEligibleCount}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Remaining eligible by constituency</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Failed Gates</p>
              <p className="mt-2 text-2xl font-black text-red-300">{rejectedCount}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Hidden internal rejection bucket</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Applicant View</p>
              <p className="mt-2 text-2xl font-black text-blue-300">Hidden</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Until Publish Results is pressed</p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[30px] border border-white/10 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                National Reporting Snapshot
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Stats-only view, refreshed every 15 minutes
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                This section shows reporting totals only. No names, Omang
                numbers, phone numbers, emails or documents are displayed here.
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Last stats refresh:{" "}
                {reportingStats?.generatedAt.toLocaleTimeString() ||
                  "Loading..."}
                {reportingStatsLoading
                  ? " · Refreshing..."
                  : " · Auto-refresh every 15 minutes"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadReportingStats}
                disabled={reportingStatsLoading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {reportingStatsLoading ? "Refreshing..." : "Refresh Stats"}
              </button>

              <button
                type="button"
                onClick={handleExportStatsCsv}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700"
              >
                Export Stats Only
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MiniStatCard
              title="Stats Total"
              value={reportingStats?.total ?? totalApplications}
              helper="All counted applications"
            />
            <MiniStatCard
              title="Women"
              value={reportingStats?.women ?? womenCount}
              helper="Female applicants"
            />
            <MiniStatCard
              title="Men"
              value={reportingStats?.men ?? menCount}
              helper="Male applicants"
            />
            <MiniStatCard
              title="Constituencies"
              value={reportingStats?.constituenciesWithApplications ?? 0}
              helper={`of ${constituencies.length} represented`}
            />
            <MiniStatCard
              title="Youth"
              value={reportingStats?.youth ?? youthTotal}
              helper="35 and below"
            />
            <MiniStatCard
              title="Non-Youth"
              value={reportingStats?.nonYouth ?? nonYouthCount}
              helper="Above 35"
            />
            <MiniStatCard
              title="Disability Declared"
              value={reportingStats?.disability ?? disabilityApplicantsCount}
              helper="Declared disability"
            />
            <MiniStatCard
              title="Other / Unknown"
              value={reportingStats?.otherOrUnknown ?? 0}
              helper="Gender not captured clearly"
            />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-[#111827] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">
                  Top Constituencies
                </h3>
                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[10px] font-black text-orange-300">
                  Top 10
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-3 py-2 font-black">Constituency</th>
                      <th className="px-3 py-2 text-right font-black">Total</th>
                      <th className="px-3 py-2 text-right font-black">Women</th>
                      <th className="px-3 py-2 text-right font-black">Men</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topConstituencies.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-4 text-center font-semibold text-slate-400"
                        >
                          No stats loaded yet.
                        </td>
                      </tr>
                    ) : (
                      topConstituencies.map(([name, stats]) => (
                        <tr key={name} className="border-t border-white/10">
                          <td className="px-3 py-2 font-semibold text-slate-200">
                            {name}
                          </td>
                          <td className="px-3 py-2 text-right font-black text-white">
                            {stats.total}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-300">
                            {stats.women}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-300">
                            {stats.men}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#111827] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">
                  Lowest Constituencies
                </h3>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-black text-blue-300">
                  Bottom 10
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-3 py-2 font-black">Constituency</th>
                      <th className="px-3 py-2 text-right font-black">Total</th>
                      <th className="px-3 py-2 text-right font-black">Women</th>
                      <th className="px-3 py-2 text-right font-black">Men</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowestConstituencies.map(([name, stats]) => (
                      <tr key={name} className="border-t border-white/10">
                        <td className="px-3 py-2 font-semibold text-slate-200">
                          {name}
                        </td>
                        <td className="px-3 py-2 text-right font-black text-white">
                          {stats.total}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.women}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.men}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {pendingRequestsCount > 0 && (
          <section className="mb-5 rounded-[24px] border border-orange-500/30 bg-orange-500/10 p-4 shadow-[0_18px_45px_rgba(249,115,22,0.12)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-orange-300">
                  ⚠ {pendingRequestsCount} data protection request
                  {pendingRequestsCount === 1 ? "" : "s"} pending
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Review them in the Compliance section below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDataRequests(true);
                  loadDataRequests();
                }}
                className="w-fit rounded-2xl bg-orange-500 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-600"
              >
                Open Compliance
              </button>
            </div>
          </section>
        )}
        <section className="rounded-[32px] border border-white/10 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.30)]">
          <div className="mb-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,640px)] 2xl:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">Applications</h2>
              <p className="mt-1 text-sm text-slate-400">
                Showing {pageStart}–{pageEnd} of {totalCount} filtered
                applications. Loading {PAGE_SIZE} records at a time.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_180px]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setSearchTerm(searchInput.trim());
                      setCurrentPage(1);
                    }
                  }}
                  placeholder="Search name, email, Omang or ID"
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400 focus:bg-[#0f172a]"
                />

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm(searchInput.trim());
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white transition hover:bg-orange-600"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-xs font-black text-white transition hover:bg-white/10"
                >
                  Clear
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400 focus:bg-[#0f172a]"
              >
                <option value="All">All Applications</option>
                <option value="Internal Batch 1">Batch 1 Selected (Admin)</option>
                <option value="Internal Remaining Eligible">Waitlist / Remaining Eligible (Admin)</option>
                <option value="Submitted">Submitted / Unselected</option>
                <option value="Internal Rejected">Rejected / Failed Gates (Admin)</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]">
            {tableLoading ? (
              <div className="p-10 text-center text-sm font-semibold text-slate-400">
                Loading page...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-10 text-center text-sm font-semibold text-slate-400">
                No applications found.
              </div>
            ) : (
              <div className="max-h-[62vh] overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed text-[12px]">
                  <colgroup>
                    <col className="w-[17%]" />
                    <col className="w-[22%]" />
                    <col className="w-[17%]" />
                    <col className="w-[17%]" />
                    <col className="w-[14%]" />
                    <col className="w-[13%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                    <tr>
                      <th className="px-3 py-3 text-left font-black">
                        Applicant
                      </th>
                      <th className="px-3 py-3 text-left font-black">
                        Contact
                      </th>
                      <th className="px-3 py-3 text-left font-black">
                        Constituency
                      </th>
                      <th className="px-3 py-3 text-left font-black">
                        Auto Review
                      </th>
                      <th className="px-3 py-3 text-left font-black">Status</th>
                      <th className="px-3 py-3 text-left font-black">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr
                        key={
                          application.applicationId ||
                          application.id ||
                          application.email
                        }
                        className="border-t border-white/10 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-3 py-3 align-top">
                          <p className="truncate font-black text-white">
                            {application.firstName} {application.lastName}
                          </p>
                          <p className="mt-1 break-words text-[10px] font-semibold leading-4 text-slate-400">
                            {application.applicationId}
                          </p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
                            Omang: {maskOmang(application.omang)}
                          </p>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <p className="break-words font-semibold leading-5 text-slate-300">
                            {application.email}
                          </p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
                            {application.phone}
                          </p>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <p className="break-words font-semibold leading-5 text-slate-300">
                            {application.constituency || "-"}
                          </p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
                            {application.gender}, {application.age}
                          </p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
                            {application.district || ""}
                          </p>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <p className="truncate font-black text-white">
                            {application.autoReviewScore ?? "Not reviewed"}
                          </p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
                            {application.autoReviewResult || "-"}
                          </p>
                          {application.hardRejectReason && (
                            <p className="mt-1 max-h-20 overflow-y-auto pr-1 text-[11px] leading-4 text-red-400">
                              {application.hardRejectReason}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-3 align-top">
                          <p className="mb-2 rounded-xl bg-orange-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-orange-300">
                            Admin: {getAdminSelectionLabel(application)}
                          </p>
                          <p className="mb-2 text-[10px] font-semibold text-slate-500">
                            Applicant sees: {application.status}
                          </p>
                          <select
                            value={application.status}
                            onChange={(event) =>
                              handleStatusChange(
                                application,
                                event.target.value as ApplicationStatus,
                              )
                            }
                            disabled={savingId === application.id}
                            className="w-full rounded-xl border border-white/10 bg-[#111827] px-2 py-2 text-[12px] font-bold text-white outline-none disabled:opacity-50"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Remaining Eligible">
                              Remaining Eligible
                            </option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-nowrap gap-2">
                            <button
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                              className="rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-blue-700"
                            >
                              View
                            </button>

                            <button
                              onClick={() => handleAutoReview(application)}
                              disabled={savingId === application.id}
                              className="rounded-xl bg-orange-500 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                            >
                              Auto
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">
                Page {currentPage} of {totalPages}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Export Page downloads the visible filtered page. Export Stats
                Only downloads totals and constituency breakdowns without
                applicant records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || tableLoading}
                className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-2 text-xs font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages || tableLoading}
                className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-2 text-xs font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {showConstituencyDispatch && (
          <section className="mt-5 rounded-[30px] border border-yellow-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
                  Constituency Dispatch
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Grouped Due Diligence &amp; Messaging
                </h2>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                  Use this after Master Selection. The selection outcome remains
                  unchanged; this view only groups applicants by constituency so
                  the team can verify documents first, then save personalised
                  successful-applicant messages for each confirmed group.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadConstituencyDispatch}
                  disabled={dispatchLoading}
                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {dispatchLoading ? "Refreshing..." : "Refresh Dispatch"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConstituencyDispatch(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10"
                >
                  Hide Dispatch
                </button>
              </div>
            </div>

            {dispatchLoading ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-[#0f172a] p-8 text-center text-sm font-semibold text-slate-400">
                Loading constituency groups...
              </div>
            ) : constituencyDispatchGroups.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-[#0f172a] p-8 text-center text-sm font-semibold text-slate-400">
                No dispatch groups loaded yet. Click Refresh Dispatch.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {constituencyDispatchGroups.map(
                  ([constituency, statusGroups]) => {
                    const acceptedGroup = statusGroups.Accepted || [];
                    const remainingEligibleGroup =
                      statusGroups["Remaining Eligible"] || [];
                    const rejectedGroup = statusGroups.Rejected || [];
                    const submittedGroup = statusGroups.Submitted || [];
                    const groupKey = `${constituency}-Accepted`;

                    return (
                      <details
                        key={constituency}
                        className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]"
                      >
                        <summary className="flex cursor-pointer list-none flex-col gap-3 bg-[#111827] px-5 py-4 text-white transition hover:bg-[#172033] md:flex-row md:items-center md:justify-between [&::-webkit-details-marker]:hidden">
                          <div>
                            <p className="text-lg font-black">{constituency}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              Batch 1 Selected: {acceptedGroup.length} • Remaining
                              Eligible: {remainingEligibleGroup.length} •
                              Rejected: {rejectedGroup.length}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[11px] font-black">
                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">
                              {acceptedGroup.length} Batch 1 Selected
                            </span>
                            <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-yellow-300">
                              {remainingEligibleGroup.length} Remaining Eligible
                            </span>
                            <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-300">
                              {rejectedGroup.length} Rejected
                            </span>
                          </div>
                        </summary>

                        <div className="space-y-5 p-5">
                          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                              <div>
                                <h3 className="text-base font-black text-emerald-300">
                                  Batch 1 Selected — due diligence before messaging
                                </h3>
                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                  Check Omang, BGCSE/IGCSE proof, higher
                                  qualification evidence where applicable,
                                  disability proof where applicable, duplicate
                                  risks, and suspicious uploads. Only confirm
                                  this group after the review is complete.
                                </p>
                              </div>

                              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111827] p-3 xl:w-[360px]">
                                <label className="flex items-start gap-3 text-xs font-semibold leading-5 text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={
                                      dispatchDueDiligenceConfirm[groupKey] ||
                                      false
                                    }
                                    onChange={(event) =>
                                      setDispatchDueDiligenceConfirm(
                                        (prev) => ({
                                          ...prev,
                                          [groupKey]: event.target.checked,
                                        }),
                                      )
                                    }
                                    className="mt-1 h-4 w-4"
                                  />
                                  I confirm due diligence is complete for
                                  accepted applicants in {constituency}.
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveGroupMessage(
                                      constituency,
                                      "Accepted",
                                      acceptedGroup,
                                    )
                                  }
                                  disabled={
                                    dispatchSavingKey === groupKey ||
                                    acceptedGroup.length === 0 ||
                                    !dispatchDueDiligenceConfirm[groupKey]
                                  }
                                  className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {dispatchSavingKey === groupKey
                                    ? "Saving Messages..."
                                    : "Save Successful Messages"}
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                              {acceptedGroup.length === 0 ? (
                                <div className="p-4 text-sm font-semibold text-slate-400">
                                  No accepted applicants in this constituency.
                                </div>
                              ) : (
                                <table className="w-full table-fixed text-[12px]">
                                  <colgroup>
                                    <col className="w-[24%]" />
                                    <col className="w-[26%]" />
                                    <col className="w-[16%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[16%]" />
                                  </colgroup>
                                  <thead className="bg-[#111827] text-slate-300">
                                    <tr>
                                      <th className="px-3 py-3 text-left font-black">
                                        Name
                                      </th>
                                      <th className="px-3 py-3 text-left font-black">
                                        Contact
                                      </th>
                                      <th className="px-3 py-3 text-left font-black">
                                        Score
                                      </th>
                                      <th className="px-3 py-3 text-left font-black">
                                        Documents
                                      </th>
                                      <th className="px-3 py-3 text-left font-black">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {acceptedGroup.map((application) => (
                                      <tr
                                        key={
                                          application.applicationId ||
                                          application.id ||
                                          application.email
                                        }
                                        className="border-t border-white/10"
                                      >
                                        <td className="px-3 py-3 align-top">
                                          <p className="font-black text-white">
                                            {application.firstName}{" "}
                                            {application.lastName}
                                          </p>
                                          <p className="mt-1 text-[10px] text-slate-400">
                                            {application.applicationId}
                                          </p>
                                        </td>
                                        <td className="px-3 py-3 align-top">
                                          <p className="break-words font-semibold text-slate-300">
                                            {application.email}
                                          </p>
                                          <p className="mt-1 text-[11px] text-slate-400">
                                            {application.phone}
                                          </p>
                                        </td>
                                        <td className="px-3 py-3 align-top">
                                          <p className="font-black text-white">
                                            {application.autoReviewScore ?? "-"}
                                          </p>
                                          <p className="mt-1 text-[11px] text-slate-400">
                                            {application.selectionBucket || "-"}
                                          </p>
                                        </td>
                                        <td className="px-3 py-3 align-top">
                                          <p className="text-[11px] leading-5 text-slate-300">
                                            Omang:{" "}
                                            {application.omangFile
                                              ? "Yes"
                                              : "No"}
                                          </p>
                                          <p className="text-[11px] leading-5 text-slate-300">
                                            BGCSE:{" "}
                                            {application.bgcseCertificateFile ||
                                            application.certificateFile
                                              ? "Yes"
                                              : "No"}
                                          </p>
                                          <p className="text-[11px] leading-5 text-slate-300">
                                            Highest:{" "}
                                            {application.highestQualificationFile
                                              ? "Yes"
                                              : "No"}
                                          </p>
                                        </td>
                                        <td className="px-3 py-3 align-top">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedApplication(
                                                application,
                                              )
                                            }
                                            className="rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-blue-700"
                                          >
                                            View
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 xl:grid-cols-2">
                            <DispatchMiniGroup
                              title="Remaining Eligible"
                              count={remainingEligibleGroup.length}
                              applications={remainingEligibleGroup}
                              onView={setSelectedApplication}
                            />

                            <DispatchMiniGroup
                              title="Rejected"
                              count={rejectedGroup.length}
                              applications={rejectedGroup}
                              onView={setSelectedApplication}
                              danger
                            />

                            {submittedGroup.length > 0 && (
                              <DispatchMiniGroup
                                title="Submitted"
                                count={submittedGroup.length}
                                applications={submittedGroup}
                                onView={setSelectedApplication}
                              />
                            )}
                          </div>
                        </div>
                      </details>
                    );
                  },
                )}
              </div>
            )}
          </section>
        )}

        <section className="mt-5 rounded-[30px] border border-white/10 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInsightTab("quota")}
              className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
                insightTab === "quota"
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Quota Tracker
            </button>
            <button
              type="button"
              onClick={() => setInsightTab("constituency")}
              className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
                insightTab === "constituency"
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Constituency Breakdown
            </button>
          </div>

          {insightTab === "quota" ? (
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Quota Tracker
                  </h2>
                  <p className="text-sm text-slate-400">
                    Current page sample compared with planned intake.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
                  Target: {TOTAL_AUTO_SELECTED_INTAKE}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <QuotaTrackerCard
                  title="Youth Women"
                  value={youthWomenCount}
                  target={TOTAL_YOUTH_WOMEN}
                  helper="Priority pool"
                  accent="orange"
                />
                <QuotaTrackerCard
                  title="Youth Men"
                  value={youthMenCount}
                  target={TOTAL_YOUTH_MEN}
                  helper="Youth allocation"
                  accent="blue"
                />
                <QuotaTrackerCard
                  title="Non-Youth"
                  value={nonYouthCount}
                  target={TOTAL_NON_YOUTH}
                  helper="Experienced applicants"
                  accent="slate"
                />
                <QuotaTrackerCard
                  title="Youth Total"
                  value={youthTotal}
                  target={TOTAL_YOUTH_WOMEN + TOTAL_YOUTH_MEN}
                  helper="Combined youth pool"
                  accent="blue"
                />
                <QuotaTrackerCard
                  title="Disability"
                  value={disabilityApplicantsCount}
                  target={DISABILITY_CAP}
                  helper="Cap-aware tracking"
                  accent="orange"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Constituency Breakdown
                  </h2>
                  <p className="text-sm text-slate-400">
                    Full national totals by constituency. This uses the
                    reporting snapshot and refreshes every 15 minutes.
                  </p>
                </div>

                <p className="text-xs font-semibold text-slate-400">
                  {reportingStats?.constituenciesWithApplications ?? 0} of{" "}
                  {constituencies.length} represented
                </p>
              </div>

              <div className="max-h-[520px] overflow-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                    <tr>
                      <th className="px-3 py-3 font-black">Constituency</th>
                      <th className="px-3 py-3 text-right font-black">Total</th>
                      <th className="px-3 py-3 text-right font-black">Women</th>
                      <th className="px-3 py-3 text-right font-black">Men</th>
                      <th className="px-3 py-3 text-right font-black">Youth</th>
                      <th className="px-3 py-3 text-right font-black">
                        Non-Youth
                      </th>
                      <th className="px-3 py-3 text-right font-black">
                        Disability
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {constituencyStats.map(([name, stats]) => (
                      <tr key={name} className="border-t border-white/10">
                        <td className="px-3 py-2 font-semibold text-slate-200">
                          {name}
                        </td>
                        <td className="px-3 py-2 text-right font-black text-white">
                          {stats.total}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.women}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.men}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.youth}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.nonYouth}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {stats.disability}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {reportingStats?.extraConstituencyRows &&
                reportingStats.extraConstituencyRows.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                    <p className="text-sm font-black text-orange-300">
                      Unmatched constituency values found
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      These values exist in the database but do not match the
                      official 61-name list exactly. Export Stats Only includes
                      them separately for cleanup.
                    </p>
                  </div>
                )}
            </div>
          )}
        </section>
        <section
          ref={complianceRef}
          className="mb-5 scroll-mt-24 rounded-[24px] border border-white/10 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
        >
          {showDataRequests ? (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                    Compliance
                  </p>
                  <h2 className="mt-1 text-lg font-black text-white">
                    Data Protection Requests
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Manage access, correction, deletion, restriction, objection
                    and portability requests.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadDataRequests}
                  disabled={dataRequestsLoading}
                  className="w-fit rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {dataRequestsLoading ? "Loading" : "Refresh Requests"}
                </button>
              </div>

              {dataRequestsLoading ? (
                <div className="rounded-xl bg-white/5 p-4 text-center text-xs font-semibold text-slate-300">
                  Loading data requests...
                </div>
              ) : dataRequests.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-4 text-center text-xs font-semibold text-slate-300">
                  No data protection requests yet.
                </div>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {dataRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-300">
                              {request.requestType}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                              {request.status.replace("_", " ")}
                            </span>
                          </div>

                          <h3 className="mt-3 break-words text-base font-black text-white">
                            {request.fullName || "Unnamed requester"}
                          </h3>
                          <p className="mt-1 break-all text-xs font-semibold text-slate-400">
                            {request.email}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {request.createdAt
                              ? new Date(request.createdAt).toLocaleString()
                              : "-"}
                          </p>
                        </div>

                        <select
                          value={request.status}
                          onChange={(event) =>
                            handleDataRequestUpdate(
                              request,
                              event.target.value as DataRequestStatus,
                            )
                          }
                          disabled={savingDataRequestId === request.id}
                          className="rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-xs font-bold text-white outline-none disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_review">In Review</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="mt-4 rounded-xl bg-[#0f172a] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                          Request Details
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-300">
                          {request.message || "No message provided."}
                        </p>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-black text-white">
                          Admin Notes
                        </label>
                        <textarea
                          value={dataRequestNotes[request.id] || ""}
                          onChange={(event) =>
                            setDataRequestNotes((prev) => ({
                              ...prev,
                              [request.id]: event.target.value,
                            }))
                          }
                          className="min-h-24 w-full rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-xs text-white outline-none focus:border-orange-400"
                          placeholder="Record what was done: data exported, corrected, deleted, rejected, etc."
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleDataRequestUpdate(request, request.status)
                          }
                          disabled={savingDataRequestId === request.id}
                          className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
                        >
                          Save Notes
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportDataRequest(request)}
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                        >
                          Export Request JSON
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-white/5 p-4 text-center text-xs font-semibold text-slate-300">
              Compliance section is ready. Click Compliance to load data
              protection requests.
            </div>
          )}
        </section>

        {showAuditLogs && (
          <section
            ref={auditRef}
            className="mb-5 scroll-mt-6 rounded-[24px] border border-white/10 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                  Activity
                </p>
                <h2 className="mt-1 text-lg font-black text-white">
                  Audit Log
                </h2>
              </div>

              <button
                type="button"
                onClick={loadAuditLogs}
                disabled={auditLoading}
                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {auditLoading ? "Loading" : "Refresh"}
              </button>
            </div>

            {auditLoading ? (
              <div className="rounded-xl bg-white/5 p-4 text-center text-xs font-semibold text-slate-300">
                Loading audit log...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-4 text-center text-xs font-semibold text-slate-300">
                No audit logs yet.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {auditLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="break-all text-xs font-black text-white">
                        {log.action}
                      </p>
                      <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[9px] font-black text-orange-300">
                        log
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </p>
                    <p className="mt-2 break-all text-[11px] leading-5 text-slate-400">
                      {log.applicationId || "No application"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedApplication && (
          <section className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <div className="bg-[#0b1028] border border-white/10 rounded-2xl text-white max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
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
                  className="border border-white/10 bg-[#111827] text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10"
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
                <Detail
                  label="Town / Village"
                  value={selectedApplication.townVillage}
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
                <Detail
                  label="OVC Status"
                  value={selectedApplication.ovcStatus}
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
                label="Curriculum Vitae (CV)"
                href={selectedApplication.cvFile}
              />

              <AttachmentLink
                label="Disability Proof Attachment"
                href={selectedApplication.disabilityProofFile}
              />

              <div className="bg-[#111827] border border-white/10 rounded-xl p-4 mb-6">
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
                  className="w-full min-h-32 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400"
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
                    handleStatusChange(
                      selectedApplication,
                      "Remaining Eligible",
                    )
                  }
                  disabled={savingId === selectedApplication.id}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-600 transition disabled:opacity-50"
                >
                  Move to Remaining Eligible
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MiniStatCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[#0b1028] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.30)]">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function QuotaTrackerCard({
  title,
  value,
  target,
  helper,
  accent = "orange",
}: {
  title: string;
  value: number;
  target: number;
  helper: string;
  accent?: "orange" | "blue" | "slate";
}) {
  const percentage =
    target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;
  const isOverTarget = target > 0 && value > target;
  const barClass =
    accent === "orange"
      ? "bg-orange-500"
      : accent === "blue"
        ? "bg-blue-500"
        : "bg-slate-400";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-white">{title}</p>
          <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
            {helper}
          </p>
        </div>

        {isOverTarget && (
          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
            Above target
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="pb-1 text-xs font-bold text-slate-400">/ {target}</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-1 text-[10px] text-slate-400">
        {percentage}% of target pool reached
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium">{value || "-"}</p>
    </div>
  );
}

function DispatchMiniGroup({
  title,
  count,
  applications,
  onView,
  danger = false,
}: {
  title: string;
  count: number;
  applications: Application[];
  onView: (application: Application) => void;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3
          className={`text-sm font-black ${
            danger ? "text-red-300" : "text-slate-200"
          }`}
        >
          {title}
        </h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-slate-300">
          {count}
        </span>
      </div>

      {applications.length === 0 ? (
        <p className="mt-4 text-xs font-semibold text-slate-500">
          No applicants in this group.
        </p>
      ) : (
        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {applications.map((application) => (
            <div
              key={
                application.applicationId || application.id || application.email
              }
              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#0f172a] p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-white">
                  {application.firstName} {application.lastName}
                </p>
                <p className="mt-1 break-words text-[11px] text-slate-400">
                  {application.email}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Score: {application.autoReviewScore ?? "-"} •{" "}
                  {application.selectionBucket || application.status}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onView(application)}
                className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-blue-700"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
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
    <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
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
