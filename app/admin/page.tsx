"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import AttachmentLink from "@/components/AttachmentLink";

const ADMIN_EMAILS = [
  "eddiemajola2020@gmail.com",
  "bandaseilaneng@gmail.com",
  "oil-gas.training@sethresources.com",
];

type ApplicationStatus =
  | "Submitted"
  | "Under Review"
  | "Shortlisted"
  | "Waiting List"
  | "Accepted"
  | "Rejected";

type AuditAction =
  | "status_change"
  | "auto_review"
  | "master_selection"
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
  underReview: number;
  shortlisted: number;
  waitingList: number;
  accepted: number;
  rejected: number;
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  total: 0,
  women: 0,
  men: 0,
  submitted: 0,
  underReview: 0,
  shortlisted: 0,
  waitingList: 0,
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

const TOTAL_YOUTH_WOMEN = 435;
const TOTAL_YOUTH_MEN = 315;
const TOTAL_NON_YOUTH = 250;
const TOTAL_INTAKE = TOTAL_YOUTH_WOMEN + TOTAL_YOUTH_MEN + TOTAL_NON_YOUTH;
const DISABILITY_CAP = 8;
const MIN_BGCSE_POINTS = 25;
const MIN_MOTIVATION_WORDS = 40;
const MIN_POST_PROGRAM_WORDS = 30;
const PREFERRED_CONSTITUENCY_DEPTH = 3;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const PAGE_SIZE = 50;

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
  const complianceRef = useRef<HTMLElement | null>(null);
  const auditRef = useRef<HTMLElement | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [masterSelecting, setMasterSelecting] = useState(false);
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
  const [insightTab, setInsightTab] = useState<"quota" | "constituency">(
    "quota",
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(
    EMPTY_DASHBOARD_STATS,
  );

  function formatApplication(item: any): Application {
    return {
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
    };
  }

  async function getApplicationCount(
    buildQuery?: (query: any) => any,
  ): Promise<number> {
    let query = supabase
      .from("applications")
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
        underReview,
        shortlisted,
        waitingList,
        accepted,
        rejected,
      ] = await Promise.all([
        getApplicationCount(),
        getApplicationCount((query) => query.ilike("gender", "female")),
        getApplicationCount((query) => query.ilike("gender", "male")),
        getApplicationCount((query) => query.eq("status", "Submitted")),
        getApplicationCount((query) => query.eq("status", "Under Review")),
        getApplicationCount((query) => query.eq("status", "Shortlisted")),
        getApplicationCount((query) => query.eq("status", "Waiting List")),
        getApplicationCount((query) => query.eq("status", "Accepted")),
        getApplicationCount((query) => query.eq("status", "Rejected")),
      ]);

      setDashboardStats({
        total,
        women,
        men,
        submitted,
        underReview,
        shortlisted,
        waitingList,
        accepted,
        rejected,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
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
      .from("applications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }

    if (cleanedSearch) {
      const safeSearch = cleanedSearch.replace(/[%_,]/g, "");
      query = query.or(
        `first_name.ilike.%${safeSearch}%,last_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,omang.ilike.%${safeSearch}%,constituency.ilike.%${safeSearch}%,application_id.ilike.%${safeSearch}%`,
      );
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
        auditRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  async function updateReviewFields(
    application: Application,
    review: ReviewDecision,
    status: ApplicationStatus,
    selectionBucket = review.selectionBucket,
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
    newStatus: ApplicationStatus,
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
      "Run quota-based master selection? This will update applicant statuses.",
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
      constituencyCounts[constituency] =
        (constituencyCounts[constituency] || 0) + 1;

      if (candidate.hasDisability) {
        disabledSelected += 1;
      }
    }

    function selectBestFromPool(
      pool: typeof eligible,
      limit: number,
      bucket: string,
      preferUnderConstituencyLimit = true,
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

    function currentCount(
      predicate: (app: (typeof eligible)[number]) => boolean,
    ) {
      return selectedArray().filter(predicate).length;
    }

    const youthWomenPool = eligible.filter(
      (app) => app.isYouth && app.isFemale,
    );
    const youthMenPool = eligible.filter((app) => app.isYouth && app.isMale);
    const nonYouthPool = eligible.filter((app) => !app.isYouth);

    selectBestFromPool(
      youthWomenPool,
      Math.max(
        0,
        TOTAL_YOUTH_WOMEN - currentCount((app) => app.isYouth && app.isFemale),
      ),
      "Youth Women Priority",
    );

    selectBestFromPool(
      youthMenPool,
      Math.max(
        0,
        TOTAL_YOUTH_MEN - currentCount((app) => app.isYouth && app.isMale),
      ),
      "Youth Men Priority",
    );

    selectBestFromPool(
      nonYouthPool,
      Math.max(0, TOTAL_NON_YOUTH - currentCount((app) => !app.isYouth)),
      "Non-Youth Allocation",
    );

    // Phase 3: if there are still seats, fill by strongest eligible applicants regardless of constituency depth.
    if (selected.size < TOTAL_INTAKE) {
      selectBestFromPool(
        eligible,
        TOTAL_INTAKE - selected.size,
        "Overflow Merit Fill",
        false,
      );
    }

    const shortlistedIds = new Set(
      selectedArray().map((app) => app.applicationId),
    );

    const waitingList = eligible.filter(
      (app) => !shortlistedIds.has(app.applicationId),
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
          update.bucket,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Master selection update failed";
        console.error("Master selection update failed:", error);
        alert(message);
        setMasterSelecting(false);
        return;
      }
    }

    setApplications((prev) =>
      prev.map((application) => {
        const found = updates.find(
          (update) => update.app.applicationId === application.applicationId,
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
      }),
    );

    loadDashboardStats();

    await logAdminAction({
      action: "master_selection",
      details: {
        shortlisted: selected.size,
        waitingList: waitingList.length,
        rejected: hardRejected.length,
        disabledSelected,
        constituenciesRepresented: Object.keys(constituencyCounts).length,
        totalIntake: TOTAL_INTAKE,
      },
    });

    alert(
      `Master Selection Complete:\nShortlisted: ${selected.size}\nWaiting List: ${waitingList.length}\nRejected: ${hardRejected.length}\nDisabled Selected: ${disabledSelected}\nConstituencies Represented: ${Object.keys(constituencyCounts).length}`,
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
          .from("applications")
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
  const reviewCount = dashboardStats.underReview;
  const shortlistedCount = dashboardStats.shortlisted;
  const waitingListCount = dashboardStats.waitingList;
  const acceptedCount = dashboardStats.accepted;
  const rejectedCount = dashboardStats.rejected;
  const womenCount = dashboardStats.women;
  const menCount = dashboardStats.men;

  const youthWomenCount = applications.filter((item) => {
    const age = Number(item.age);
    return (
      !Number.isNaN(age) && age <= 35 && normalize(item.gender) === "female"
    );
  }).length;

  const youthMenCount = applications.filter((item) => {
    const age = Number(item.age);
    return !Number.isNaN(age) && age <= 35 && normalize(item.gender) === "male";
  }).length;

  const nonYouthCount = applications.filter((item) => {
    const age = Number(item.age);
    return !Number.isNaN(age) && age > 35;
  }).length;

  const disabilityApplicantsCount = applications.filter((item) =>
    isYes(item.disabilityStatus),
  ).length;

  const youthTotal = youthWomenCount + youthMenCount;

  const constituencyStats = useMemo(() => {
    const stats = applications.reduce(
      (acc, application) => {
        const key = application.constituency || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(stats).sort((a, b) => Number(b[1]) - Number(a[1]));
  }, [applications]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, totalCount);
  const pendingRequestsCount = dataRequests.filter(
    (request) => request.status === "pending",
  ).length;

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
    { label: "Submitted", value: "Submitted", count: submittedCount },
    { label: "Under Review", value: "Under Review", count: reviewCount },
    { label: "Shortlisted", value: "Shortlisted", count: shortlistedCount },
    { label: "Waiting List", value: "Waiting List", count: waitingListCount },
    { label: "Accepted", value: "Accepted", count: acceptedCount },
    { label: "Rejected", value: "Rejected", count: rejectedCount },
  ];

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto min-h-screen max-w-[1800px] p-4 lg:p-6">
        <nav className="mb-5 rounded-[28px] border border-white/10 bg-[#0b1028] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="grid gap-4 xl:grid-cols-[170px_minmax(0,1fr)_220px] xl:items-start">
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

            <div className="grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4">
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

            <div className="flex items-start justify-start gap-2 xl:justify-end">
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
                    onClick={() => loadApplications(false, currentPage)}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-blue-300 transition hover:bg-white/10"
                  >
                    Refresh Dashboard
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                    Selection Tools
                  </p>
                  <h2 className="mt-1 text-lg font-black text-white">
                    Master Selection
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Quota-based status update. Records the action in the audit
                    log.
                  </p>
                </div>

                <button
                  onClick={handleMasterSelection}
                  disabled={masterSelecting}
                  className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {masterSelecting ? "Running..." : "Run Selection"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <StatCard title="Total" value={totalApplications} />
          <StatCard title="Women" value={womenCount} />
          <StatCard title="Men" value={menCount} />
          <StatCard title="Under Review" value={reviewCount} />
          <StatCard title="Rejected" value={rejectedCount} />
        </section>


        {pendingRequestsCount > 0 && (
          <section className="mb-5 rounded-[24px] border border-orange-500/30 bg-orange-500/10 p-4 shadow-[0_18px_45px_rgba(249,115,22,0.12)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-orange-300">
                  ⚠ {pendingRequestsCount} data protection request{pendingRequestsCount === 1 ? "" : "s"} pending
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
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Waiting List">Waiting List</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
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
                        key={application.id}
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
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Waiting List">Waiting List</option>
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
                Export Page downloads the visible filtered page. Full Backup
                exports all records in batches.
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
                  Target: {TOTAL_INTAKE}
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
                    Current page totals by constituency.
                  </p>
                </div>

                <p className="text-xs font-semibold text-slate-400">
                  {constituencyStats.length} represented
                </p>
              </div>

              {constituencyStats.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No constituency data yet.
                </p>
              ) : (
                <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                  {constituencyStats.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    >
                      <span className="break-words font-semibold leading-5 text-slate-300">
                        {name}
                      </span>
                      <span className="ml-3 rounded-full bg-orange-500/15 px-3 py-1 font-black text-orange-300">
                        {count}
                      </span>
                    </div>
                  ))}
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
              Compliance section is ready. Click Compliance to load data protection requests.
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
                    handleStatusChange(selectedApplication, "Waiting List")
                  }
                  disabled={savingId === selectedApplication.id}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-600 transition disabled:opacity-50"
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
