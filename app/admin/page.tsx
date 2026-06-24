"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import AttachmentLink from "@/components/AttachmentLink";


const DEFAULT_LETTER_SUBJECT = `RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026 — BATCH 2`;

const DEFAULT_LETTER_BODY = `Congratulations, {{fullName}}!

You have been selected for Batch 2 of the BYWC Oil and Gas Training Programme 2026. This letter is your official confirmation of acceptance.

Acceptance Details:
 •  Full Name: {{fullName}}
 •  Constituency: {{constituency}}
 •  Letter Reference: {{refNo}}
 •  Programme: BYWC Oil & Gas Training Programme 2026 Batch 2

REPORTING & ORIENTATION
Venue: University of Botswana, in front of the Student Centre. Report on Sunday between 13:00 and 15:00 (1-3 pm). Formal orientation begins Monday at 08:00. Accommodation and meals are provided for all 10 days.

WHAT TO BRING
 •  This acceptance letter (printed or on your phone)
 •  Valid national identity document (Omang) — MANDATORY
 •  Pen and notebook

IMPORTANT NOTICE
Attendance from Day 1 is compulsory. If you are unable to attend, notify us immediately via your portal inbox.

We look forward to welcoming you. For enquiries call 355 2838 or WhatsApp 74781608.`;
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
  | "Rejected"
  | "Deferred"
  | "Completed";

function normalizeApplicationStatus(value?: string | null): ApplicationStatus {
  if (value === "Completed") return "Completed";
  if (value === "Accepted") return "Accepted";
  if (value === "Remaining Eligible") return "Remaining Eligible";
  if (value === "Rejected") return "Rejected";
  if (value === "Deferred") return "Deferred";
  return "Submitted";
}

function getAdminSelectionLabel(application: Pick<Application, "status" | "selectionBucket">) {
  const bucket = application.selectionBucket || "";

  if (bucket.includes("Batch 1 -")) return "Batch 1 Selected";
  if (bucket.includes("Batch 2 -")) return "Batch 2 Selected";
  if (bucket.includes("Remaining Eligible")) return "Remaining Eligible";
  if (bucket.includes("Rejected -")) return "Rejected";

  return normalizeApplicationStatus(application.status);
}

function getAdminSelectionStatus(application: Pick<Application, "status" | "selectionBucket">): ApplicationStatus {
  const label = getAdminSelectionLabel(application);

  if (label === "Batch 1 Selected") return "Accepted";
  if (label === "Batch 2 Selected") return "Accepted";
  if (label === "Remaining Eligible") return "Remaining Eligible";
  if (label === "Rejected") return "Rejected";

  return normalizeApplicationStatus(application.status);
}

function isInternalBatchOneSelection(selectionBucket?: string | null) {
  const b = selectionBucket || "";
  return b.includes("Batch 1 -");
}

function isInternalBatchTwoSelection(selectionBucket?: string | null) {
  const b = selectionBucket || "";
  return b.includes("Batch 2 -");
}

type AuditAction =
  | "status_change"
  | "auto_review"
  | "master_selection"
  | "selection_publish"
  | "nearby_reserve_selection"
  | "message_saved"
  | "data_request_update"
  | "profile_edit";

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
  batch2: number;
  remainingEligible: number;
  accepted: number;
  rejected: number;
  deferred: number;
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  total: 0,
  women: 0,
  men: 0,
  submitted: 0,
  internalBatchOne: 0,
  batch2: 0,
  remainingEligible: 0,
  accepted: 0,
  rejected: 0,
  deferred: 0,
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
  arrivalStatus?: string | null;
  arrivedAt?: string | null;
  arrivalConfirmedBy?: string | null;
  arrivalDisclaimerAccepted?: boolean | null;
  arrivalDisclaimerAcceptedAt?: string | null;
  arrivalDisclaimerVersion?: string | null;
  registrationStatus?: string | null;
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  emergencyContactRelationship?: string | null;
  knownMedicalConditions?: string | null;
  currentMedication?: string | null;
  hasDietaryRestrictions?: boolean | null;
  dietaryRestrictionsDetails?: string | null;
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
const BATCH_1_INTAKE = 488; // Batch 1 legacy size
const BATCH_2_INTAKE = 480; // Batch 2: 480 seats with new rules
const BATCH_1_MANUAL_REMAINING_SEATS = 12;
const BATCH_2_MANUAL_REMAINING_SEATS = 0;
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
const BATCH_2_MAX_PER_CONSTITUENCY = 16;
const BATCH_2_DEFERRED_SPRINKLE = 25;
const BATCH_2_MIN_MEN_TARGET = 200;
const BATCH_2_MIN_MEN_FALLBACK = 180;
const MIN_BGCSE_POINTS = 25;
const MIN_MOTIVATION_WORDS = 40;
const MIN_POST_PROGRAM_WORDS = 30;
const PREFERRED_CONSTITUENCY_DEPTH = 3;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const PAGE_SIZE = 50;
const APPLICATIONS_TABLE = "applications";
const WAITING_LIST_PER_CONSTITUENCY = 50;
const SPECIALLY_ELECTED_SEATS = 20;

const STRATEGIC_COVERAGE_BOOST = 15;
const STRATEGIC_COVERAGE_EMAILS = [
  "boitumelompulubusi98@gmail.com",
  "leepileone66@gmail.com",
  "krasebokwana@gmail.com",
  "gapebanda0200@gmail.com",
  "dimpho@dichakenyane.com",
  "sadintseane@gmail.com",
  "seabekgosiphefo@gmail.com",
  "tlharesagae@gmail.com",
  "ilenykk01@gmail.com",
  "bkgotlele@gmail.com",
  "otukileisrael3@gmail.com",
  "lindiwematlhaku@gmail.com",
  "phefokitso1@gmail.com",
 "dianakwati@gmail.com",
 "edmondkgosi@gmail.com",
 "beautypelaelo6@gmail.com",
 "tebomafote1996@gmail.com",
  // Priority candidates — next batch
  "lesenyaonalenna@gmail.com",
  "pearlsithole21@gmail.com",
  "thatomakw982@gmail.com",
  "friedahherbert27@gmail.com",
  "malopemopati@gmail.com",
  "babantshomatilda@gmail.com",
  "pifelog@gmail.com",
  "bafetetelo@gmail.com",
  "rantshabokatlo@gmail.com",
  "tefobagali@gmail.com",
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
  "Gabane / Mankgodi",
  "Gaborone Bonnington North",
  "Gaborone Bonnington South",
  "Gaborone Central",
  "Gaborone North",
  "Gaborone South",
  "Gamalete",
  "Ghanzi",
  "Goodhope - Mmathethe",
  "Jwaneng - Mabutsane",
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
  "Nata - Gweta",
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

const NEARBY_350KM_CONSTITUENCIES = [
  "Gaborone Central",
  "Gaborone North",
  "Gaborone South",
  "Gaborone Bonnington North",
  "Gaborone Bonnington South",
  "Tlokweng",
  "Mogoditshane East",
  "Mogoditshane West",
  "Mmopane - Metsimotlhabe",
  "Gabane / Mankgodi",
  "Thamaga - Kumakwane",
  "Molepolole North",
  "Molepolole South",
  "Letlhakeng",
  "Lentsweletau - Lephepe",
  "Kgatleng Central",
  "Kgatleng East",
  "Kgatleng West",
  "Gamalete",
  "Lobatse",
  "Kanye East",
  "Kanye West",
  "Moshupa - Manyana",
  "Goodhope - Mmathethe",
  "Jwaneng - Mabutsane",
  "Takatokwane",
  "Mahalapye East",
  "Mahalapye West",
  "Palapye",
  "Shoshong",
  "Serowe North",
  "Serowe South",
  "Serowe West",
  "Mmadinare",
  "Selibe Phikwe East",
  "Selibe Phikwe West",
  "Tswapong North",
  "Tswapong South",
];

// Constituencies 450km+ from Gaborone — get major priority in Batch 2 selection
const FAR_450KM_CONSTITUENCIES = [
  "Chobe",           // ~700km – Kasane
  "Ngami",           // ~650km – Maun area
  "Maun East",       // ~650km
  "Maun North",      // ~650km
  "Maun West",       // ~650km
  "Okavango East",   // ~750km
  "Okavango West",   // ~800km – Shakawe
  "Boteti East",     // ~500km
  "Boteti West",     // ~500km
  "Nata - Gweta",    // ~500km
  "Tutume",          // ~450km
  "Ghanzi",          // ~600km
  "Charleshill",     // ~600km – far west
  "Kgalagadi North", // ~500km
];

const NEARBY_RESERVE_TARGET = 50;
const NEARBY_RESERVE_BASE_PER_CONSTITUENCY = 1;
const NEARBY_RESERVE_EXTRA_SEATS =
  NEARBY_RESERVE_TARGET - NEARBY_350KM_CONSTITUENCIES.length;
const NEARBY_RESERVE_BUCKET =
  "Confirmation Pool - 350km Nearby Reserve - Top 50";

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

function isNearby350kmConstituency(value?: string | null) {
  const normalizedValue = normalize(value);

  return NEARBY_350KM_CONSTITUENCIES.some(
    (constituency) => normalize(constituency) === normalizedValue,
  );
}

function getEmploymentPriorityRank(value?: string | null) {
  const employmentStatus = normalize(value);

  if (employmentStatus.includes("unemployed")) return 1;
  if (employmentStatus.includes("self")) return 2;
  return 3;
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
  const [publishingBatch2, setPublishingBatch2] = useState(false);
  const [sendingBatch2Messages, setSendingBatch2Messages] = useState(false);
  const [publishingRejected, setPublishingRejected] = useState(false);
  const [markingBatch1Arrived, setMarkingBatch1Arrived] = useState(false);

  // ── Constituency Breakdown state ─────────────────────────────────────────
  type ConstituencyRow = { total: number; women: number; men: number; other: number };
  const [constituencyBreakdown, setConstituencyBreakdown] = useState<[string, ConstituencyRow][]>([]);
  const [constituencyBreakdownLoading, setConstituencyBreakdownLoading] = useState(false);
  const [constituencyBatch1Count, setConstituencyBatch1Count] = useState(0);
  const [constituencyBatch2Count, setConstituencyBatch2Count] = useState(0);

  async function loadConstituencyBreakdown() {
    setConstituencyBreakdownLoading(true);
    try {
      // Batch 1: all accepted (arrived or not)
      // Batch 2: accepted + arrived only
      const fetchAll = async (buildQuery: (q: any) => any) => {
        let rows: any[] = [];
        let from = 0;
        const batchSize = 1000;
        while (true) {
          let q = supabase
            .from(APPLICATIONS_TABLE)
            .select("constituency,gender,arrival_status,selection_bucket")
            .range(from, from + batchSize - 1);
          q = buildQuery(q);
          const { data, error } = await q;
          if (error || !data || data.length === 0) break;
          rows = rows.concat(data);
          if (data.length < batchSize) break;
          from += batchSize;
        }
        return rows;
      };

      const [batch1, batch2Arrived] = await Promise.all([
        fetchAll((q) => q.ilike("selection_bucket", "%Batch 1 -%")),
        fetchAll((q) => q.ilike("selection_bucket", "%Batch 2 -%").eq("arrival_status", "Arrived")),
      ]);

      const map: Record<string, ConstituencyRow> = {};
      const add = (a: any) => {
        const c = (a.constituency || "(No Constituency)").trim();
        if (!map[c]) map[c] = { total: 0, women: 0, men: 0, other: 0 };
        map[c].total++;
        const g = (a.gender || "").toLowerCase();
        if (g === "female") map[c].women++;
        else if (g === "male") map[c].men++;
        else map[c].other++;
      };
      [...batch1, ...batch2Arrived].forEach(add);

      setConstituencyBatch1Count(batch1.length);
      setConstituencyBatch2Count(batch2Arrived.length);
      const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
      setConstituencyBreakdown(sorted);
    } finally {
      setConstituencyBreakdownLoading(false);
    }
  }

  // ── Tools section state ──────────────────────────────────────────────────
  const [toolsPersonQuery, setToolsPersonQuery] = useState("");
  const [toolsPersonResults, setToolsPersonResults] = useState<Application[]>([]);
  const [toolsPersonSearching, setToolsPersonSearching] = useState(false);
  const [toolsPersonStatusMap, setToolsPersonStatusMap] = useState<Record<string, ApplicationStatus>>({});
  const [toolsPersonSavingId, setToolsPersonSavingId] = useState<string | null>(null);
  const [toolsDiagnostics, setToolsDiagnostics] = useState<{
    accepted: number; completed: number; rejected: number;
    remainingEligible: number; deferred: number; internalHold: number;
    reservePool: number; anomalies: Application[];
  } | null>(null);
  const [toolsDiagnosticsLoading, setToolsDiagnosticsLoading] = useState(false);
  const [toolsPublishingAll, setToolsPublishingAll] = useState(false);
  const [toolsFixingAnomalies, setToolsFixingAnomalies] = useState(false);
  const [toolsMessage, setToolsMessage] = useState("");
  const [addApplicantLoading, setAddApplicantLoading] = useState(false);
  const [addApplicantError, setAddApplicantError] = useState("");
  const [addApplicantSuccess, setAddApplicantSuccess] = useState("");
  const emptyAddForm = {
    firstName: "", lastName: "", email: "", phone: "", omang: "",
    gender: "Female", dateOfBirth: "", district: "", townVillage: "",
    constituency: constituencies[0] || "",
    highestQualification: "BGCSE/IGCSE", bgcsePoints: "",
    employmentStatus: "Unemployed", disabilityStatus: "No", ovcStatus: "No",
    preferredLanguage: "English", status: "Remaining Eligible" as ApplicationStatus,
  };
  const [addApplicantForm, setAddApplicantForm] = useState(emptyAddForm);
  const [nearbyReserveSelecting, setNearbyReserveSelecting] = useState(false);
  const [selectionProgress, setSelectionProgress] = useState<SelectionProgress>(
    EMPTY_SELECTION_PROGRESS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [profileApp, setProfileApp] = useState<Application | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileEditDraft, setProfileEditDraft] = useState<Partial<Application>>({});
  const [profileEditSaving, setProfileEditSaving] = useState(false);
  const [addSpecialOpen, setAddSpecialOpen] = useState(false);
  const [addSpecialSaving, setAddSpecialSaving] = useState(false);
  const [addSpecialDraft, setAddSpecialDraft] = useState({
    firstName: "", lastName: "", email: "", phone: "", omang: "",
    gender: "", age: "", constituency: "", group: "Boteti",
  });
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
  const [batchOneExporting, setBatchOneExporting] = useState(false);
  const [batchOneStatsExporting, setBatchOneStatsExporting] = useState(false);
  const [batchTwoExporting, setBatchTwoExporting] = useState(false);
  const [acceptedApplications, setAcceptedApplications] = useState<Application[]>(
    [],
  );
  const [acceptedApplicationsLoading, setAcceptedApplicationsLoading] =
    useState(false);
  const [acceptedApplicationsSearchInput, setAcceptedApplicationsSearchInput] =
    useState("");
  const [batch2SearchInput, setBatch2SearchInput] = useState("");
  const [batch2Applications, setBatch2Applications] = useState<Application[]>([]);
  const [batch2Loading, setBatch2Loading] = useState(false);
  const [batch2ExportMenuOpen, setBatch2ExportMenuOpen] = useState(false);
  const [nearbyReserveApplications, setNearbyReserveApplications] = useState<Application[]>(
    [],
  );
  const [nearbyReserveApplicationsLoading, setNearbyReserveApplicationsLoading] =
    useState(false);
  const [nearbyReserveSearchInput, setNearbyReserveSearchInput] =
    useState("");
  const [arrivalSearchInput, setArrivalSearchInput] = useState("");
  const [arrivalFilter, setArrivalFilter] = useState<
    "all" | "arrived" | "not_arrived" | "dietary" | "disability" | "medical"
  >("all");
  const [nearbyReservePublishAmount, setNearbyReservePublishAmount] =
    useState("0");
  const [nearbyReservePublishing, setNearbyReservePublishing] = useState(false);
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

  const [quotaStats, setQuotaStats] = useState({
    youthWomen: 0,
    youthMen: 0,
    nonYouth: 0,
    disability: 0,
    total: 0,
  });
  const [quotaStatsLoading, setQuotaStatsLoading] = useState(false);
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

  const [activeSection, setActiveSection] = useState<
    "applications" | "programme" | "selection" | "compliance" | "tools" |
    "batch1" | "waitlist" | "rejected" | "deferred" | "women" | "men" | "lucky-ones" |
    "constituency-breakdown"
  >("applications");
  const [luckyOnesApplications, setLuckyOnesApplications] = useState<Application[]>([]);
  const [luckyOnesGraduated, setLuckyOnesGraduated] = useState<Application[]>([]);
  const [luckyOnesLoading, setLuckyOnesLoading] = useState(false);
  const [luckyOnesSaving, setLuckyOnesSaving] = useState(false);

  const [selectedArrivalIds, setSelectedArrivalIds] = useState<Set<string>>(new Set());
  const [bulkDeferring, setBulkDeferring] = useState(false);

  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [syncAuthEmail, setSyncAuthEmail] = useState("");
  const [syncAuthLoading, setSyncAuthLoading] = useState(false);
  const [syncAuthResult, setSyncAuthResult] = useState<{ ok?: boolean; created?: boolean; message?: string; error?: string } | null>(null);

  const [letterSubject, setLetterSubject] = useState(DEFAULT_LETTER_SUBJECT);
  const [letterBody, setLetterBody] = useState(DEFAULT_LETTER_BODY);
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterSaving, setLetterSaving] = useState(false);
  const [letterSaved, setLetterSaved] = useState(false);

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
      arrivalStatus: item.arrival_status || "Not Arrived",
      arrivedAt: item.arrived_at,
      arrivalConfirmedBy: item.arrival_confirmed_by,
      arrivalDisclaimerAccepted: item.arrival_disclaimer_accepted || false,
      arrivalDisclaimerAcceptedAt: item.arrival_disclaimer_accepted_at,
      arrivalDisclaimerVersion: item.arrival_disclaimer_version,
      registrationStatus: item.registration_status || "Pending",
      emergencyContactName: item.emergency_contact_name,
      emergencyContactNumber: item.emergency_contact_number,
      emergencyContactRelationship: item.emergency_contact_relationship,
      knownMedicalConditions: item.known_medical_conditions,
      currentMedication: item.current_medication,
      hasDietaryRestrictions: item.has_dietary_restrictions || false,
      dietaryRestrictionsDetails: item.dietary_restrictions_details,
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
        batch2,
        remainingEligible,
        accepted,
        rejected,
        deferred,
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
          query.or("selection_bucket.ilike.Internal Hold - Do Not Notify / Batch 2 -%,selection_bucket.ilike.Published - Applicant Visible / Batch 2 -%"),
        ),
        getApplicationCount((query) =>
          query.or("selection_bucket.ilike.%Remaining Eligible%,selection_bucket.eq.Lucky Ones"),
        ),
        getApplicationCount((query) => query.eq("status", "Accepted")),
        getApplicationCount((query) =>
          query.ilike("selection_bucket", "%Rejected -%"),
        ),
        getApplicationCount((query) => query.eq("status", "Deferred")),
      ]);

      setDashboardStats({
        total,
        women,
        men,
        submitted,
        internalBatchOne,
        batch2,
        remainingEligible,
        accepted,
        rejected,
        deferred,
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

    setCurrentAdminEmail(email);

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
    } else if (statusFilter === "Internal Batch 2") {
      query = query.or("selection_bucket.ilike.Internal Hold - Do Not Notify / Batch 2 -%,selection_bucket.ilike.Published - Applicant Visible / Batch 2 -%");
    } else if (statusFilter === "Internal Remaining Eligible") {
      query = query.or("selection_bucket.ilike.%Remaining Eligible%,selection_bucket.eq.Lucky Ones");
    } else if (statusFilter === "Internal Rejected") {
      query = query.ilike("selection_bucket", "%Rejected -%");
    } else if (statusFilter === "Submitted") {
      query = query
        .eq("status", "Submitted")
        .or("selection_bucket.is.null,selection_bucket.eq.");
    } else if (statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }

    if (genderFilter !== "All") {
      query = query.ilike("gender", genderFilter);
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

  async function loadAcceptedApplications() {
    setAcceptedApplicationsLoading(true);

    try {
      const batchSize = 1000;
      let from = 0;
      let allAcceptedApplications: Application[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("*")
          .in("status", ["Accepted", "Completed"])
          .order("constituency", { ascending: true })
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Failed to load accepted applicants:", error);
          alert(error.message || "Failed to load accepted applicants.");
          setAcceptedApplicationsLoading(false);
          return;
        }

        const batch = (data || []).map(formatApplication);
        allAcceptedApplications = [...allAcceptedApplications, ...batch];

        if (!data || data.length < batchSize) break;

        from += batchSize;
      }

      setAcceptedApplications(allAcceptedApplications);
    } catch (error) {
      console.error("Failed to load accepted applicants:", error);
      alert("Failed to load accepted applicants. Please try again.");
    } finally {
      setAcceptedApplicationsLoading(false);
    }
  }

  async function loadBatch2Applications() {
    setBatch2Loading(true);
    try {
      const batchSize = 1000;
      let from = 0;
      let all: Application[] = [];
      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("*")
          .or("selection_bucket.ilike.Internal Hold - Do Not Notify / Batch 2 -%,selection_bucket.ilike.Published - Applicant Visible / Batch 2 -%")
          .order("constituency", { ascending: true })
          .order("first_name", { ascending: true })
          .range(from, from + batchSize - 1);
        if (error) { console.error(error); break; }
        all = [...all, ...(data || []).map(formatApplication)];
        if (!data || data.length < batchSize) break;
        from += batchSize;
      }
      setBatch2Applications(all);
    } finally {
      setBatch2Loading(false);
    }
  }

  async function loadLuckyOnes() {
    setLuckyOnesLoading(true);
    try {
      const [activeRes, graduatedRes] = await Promise.all([
        supabase.from(APPLICATIONS_TABLE).select("*").eq("selection_bucket", "Lucky Ones").order("first_name", { ascending: true }),
        supabase.from(APPLICATIONS_TABLE).select("*").ilike("selection_bucket", "%Lucky Ones Promoted%").order("first_name", { ascending: true }),
      ]);
      if (!activeRes.error) setLuckyOnesApplications((activeRes.data || []).map(formatApplication));
      if (!graduatedRes.error) setLuckyOnesGraduated((graduatedRes.data || []).map(formatApplication));
    } finally {
      setLuckyOnesLoading(false);
    }
  }

  async function handleMarkLuckyOne(application: Application) {
    setLuckyOnesSaving(true);
    try {
      const isAlready = (application.selectionBucket || "") === "Lucky Ones";
      const newBucket = isAlready ? "Remaining Eligible - Reviewed" : "Lucky Ones";
      const { error } = await supabase
        .from(APPLICATIONS_TABLE)
        .update({ selection_bucket: newBucket })
        .eq("id", application.databaseId);
      if (error) { alert("Failed: " + error.message); return; }
      const updated = { ...application, selectionBucket: newBucket };
      setSelectedApplication(updated);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      if (!isAlready) {
        setLuckyOnesApplications(prev => [...prev.filter(a => a.id !== updated.id), updated].sort((a, b) => (a.firstName || "").localeCompare(b.firstName || "")));
      } else {
        setLuckyOnesApplications(prev => prev.filter(a => a.id !== updated.id));
      }
    } finally {
      setLuckyOnesSaving(false);
    }
  }

  async function handlePromoteLuckyOne(application: Application) {
    setLuckyOnesSaving(true);
    try {
      const newBucket = "Published - Applicant Visible / Batch 2 - Lucky Ones Promoted";
      const { error } = await supabase
        .from(APPLICATIONS_TABLE)
        .update({ selection_bucket: newBucket, status: "Accepted" })
        .eq("id", application.databaseId);
      if (error) { alert("Failed: " + error.message); return; }
      const updated = { ...application, selectionBucket: newBucket, status: "Accepted" as const };
      setLuckyOnesApplications(prev => prev.filter(a => a.id !== updated.id));
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      if (selectedApplication?.id === updated.id) setSelectedApplication(updated);
      await loadBatch2Applications();
    } finally {
      setLuckyOnesSaving(false);
    }
  }

  async function loadNearbyReserveApplications() {
    setNearbyReserveApplicationsLoading(true);

    try {
      const batchSize = 1000;
      let from = 0;
      let allNearbyReserveApplications: Application[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(APPLICATIONS_TABLE)
          .select("*")
          .eq("selection_bucket", NEARBY_RESERVE_BUCKET)
          .order("constituency", { ascending: true })
          .order("auto_review_score", { ascending: false })
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("Failed to load nearby reserve applicants:", error);
          alert(error.message || "Failed to load nearby reserve applicants.");
          setNearbyReserveApplicationsLoading(false);
          return;
        }

        const batch = (data || []).map(formatApplication);
        allNearbyReserveApplications = [
          ...allNearbyReserveApplications,
          ...batch,
        ];

        if (!data || data.length < batchSize) break;

        from += batchSize;
      }

      setNearbyReserveApplications(allNearbyReserveApplications);
    } catch (error) {
      console.error("Failed to load nearby reserve applicants:", error);
      alert("Failed to load nearby reserve applicants. Please try again.");
    } finally {
      setNearbyReserveApplicationsLoading(false);
    }
  }


  async function refreshAdminNumbers(showCurrentPageLoader = false) {
    await Promise.all([
      loadDashboardStats(),
      loadAcceptedApplications(),
      loadBatch2Applications(),
      loadNearbyReserveApplications(),
      loadReportingStats(),
      loadApplications(showCurrentPageLoader, currentPage),
    ]);

    if (showConstituencyDispatch) {
      await loadConstituencyDispatch();
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, genderFilter]);

  useEffect(() => {
    loadApplications(true, currentPage);

    const interval = setInterval(() => {
      loadApplications(false, currentPage);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [router, currentPage, searchTerm, statusFilter, genderFilter]);

  async function loadQuotaStats() {
    setQuotaStatsLoading(true);
    const batchSize = 1000;
    let from = 0;
    let rows: { gender: string; age: string | number; disability_status: string }[] = [];

    while (true) {
      const { data, error } = await supabase
        .from("applications")
        .select("gender,age,disability_status")
        .in("status", ["Shortlisted", "Accepted"])
        .range(from, from + batchSize - 1);

      if (error || !data) break;
      rows = [...rows, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }

    let youthWomen = 0;
    let youthMen = 0;
    let nonYouth = 0;
    let disability = 0;

    for (const row of rows) {
      const age = Number(row.age);
      const gender = normalize(row.gender);
      const isYouth = !Number.isNaN(age) && age <= 35;

      if (isYouth && gender === "female") youthWomen += 1;
      else if (isYouth && gender === "male") youthMen += 1;
      else nonYouth += 1;

      if (isYes(row.disability_status)) disability += 1;
    }

    setQuotaStats({ youthWomen, youthMen, nonYouth, disability, total: rows.length });
    setQuotaStatsLoading(false);
  }

  useEffect(() => {
    loadAuditLogs();
    loadDataRequests();
    loadQuotaStats();
  }, []);

  useEffect(() => {
    loadReportingStats();

    const interval = setInterval(() => {
      loadReportingStats();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadAcceptedApplications();

    const interval = setInterval(() => {
      loadAcceptedApplications();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadNearbyReserveApplications();

    const interval = setInterval(() => {
      loadNearbyReserveApplications();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSection === "compliance" && !letterSubject && !letterBody) {
      loadLetterTemplate();
    }
    if (activeSection === "selection") {
      loadBatch2Applications();
    }
    if (activeSection === "lucky-ones") {
      loadLuckyOnes();
    }
    if (activeSection === "constituency-breakdown" && constituencyBreakdown.length === 0) {
      loadConstituencyBreakdown();
    }
  }, [activeSection]);

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
    if (bucket.includes("Batch 2 -")) return "Accepted";
    if (bucket.includes("Remaining Eligible")) return "Remaining Eligible";
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

    await refreshAdminNumbers(false);

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

  async function handlePublishBatch2() {
    const confirmed = window.confirm(
      "Publish Batch 2 acceptance letters?\n\nThis will make the acceptance letter visible on the dashboard for all applicants in the 'Internal Hold - Batch 2' selection bucket, setting their status to Accepted.\n\nNo emails or SMS messages will be sent."
    );
    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Second confirmation: publish Batch 2 to applicant dashboards now?"
    );
    if (!secondConfirm) return;

    setPublishingBatch2(true);
    setSelectionProgress({
      active: true,
      title: "Publishing Batch 2",
      phase: "Loading",
      detail: "Fetching Internal Hold Batch 2 records...",
      current: 0,
      total: 1,
    });

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE)
      .select("*")
      .ilike("selection_bucket", "Internal Hold - Do Not Notify / Batch 2 -%");

    if (error || !data) {
      alert("Failed to load Batch 2 applications: " + (error?.message ?? "no data"));
      setPublishingBatch2(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    const unpublished = data.map(formatApplication).filter(
      (app) => app.selectionBucket?.startsWith("Internal Hold - Do Not Notify")
    );

    if (unpublished.length === 0) {
      alert("No unpublished Batch 2 records found. They may already be published.");
      setPublishingBatch2(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    const updates = unpublished.map((app) => ({
      application: app,
      status: "Accepted" as ApplicationStatus,
      selectionBucket: getPublishedSelectionBucket(app.selectionBucket),
    }));

    setSelectionProgress({
      active: true,
      title: "Publishing Batch 2",
      phase: "Updating dashboards",
      detail: `Publishing ${updates.length} Batch 2 applicants...`,
      current: 0,
      total: updates.length,
    });

    let failures: string[] = [];
    try {
      failures = await updatePublishedSelectionStatusesInChunks(updates, 25, (completed, total, failed) => {
        setSelectionProgress({
          active: true,
          title: "Publishing Batch 2",
          phase: "Updating dashboards",
          detail: `Processed ${completed} of ${total}. Failed: ${failed}.`,
          current: completed,
          total,
        });
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Batch 2 publish failed: " + message);
      setPublishingBatch2(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    alert(
      `Batch 2 published.\n\nSuccessfully published: ${updates.length - failures.length}\nFailed: ${failures.length}\n\nApplicant dashboards now show the acceptance letter.`
    );

    setSelectionProgress({
      active: true,
      title: "Publishing Batch 2",
      phase: "Complete",
      detail: `${updates.length - failures.length} Batch 2 applicants published. No emails or SMS sent.`,
      current: updates.length,
      total: updates.length || 1,
    });
    setPublishingBatch2(false);
  }

  async function handlePublishRejected() {
    const confirmed = window.confirm(
      "Publish rejection results to applicant dashboards?\n\nThis will make the 'Rejected' status visible for all Internal Hold Rejected applicants. No emails or SMS will be sent."
    );
    if (!confirmed) return;

    setPublishingRejected(true);
    setSelectionProgress({
      active: true,
      title: "Publishing Rejected",
      phase: "Loading",
      detail: "Fetching Internal Hold Rejected records...",
      current: 0,
      total: 1,
    });

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE)
      .select("*")
      .ilike("selection_bucket", "Internal Hold - Do Not Notify / Rejected -%");

    if (error || !data) {
      alert("Failed to load rejected applications: " + (error?.message ?? "no data"));
      setPublishingRejected(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    const unpublished = data.map(formatApplication).filter(
      (app) => app.selectionBucket?.startsWith("Internal Hold - Do Not Notify")
    );

    if (unpublished.length === 0) {
      alert("No unpublished rejected records found. They may already be published.");
      setPublishingRejected(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    const updates = unpublished.map((app) => ({
      application: app,
      status: "Rejected" as ApplicationStatus,
      selectionBucket: getPublishedSelectionBucket(app.selectionBucket),
    }));

    setSelectionProgress({
      active: true,
      title: "Publishing Rejected",
      phase: "Updating dashboards",
      detail: `Publishing ${updates.length} rejected applicants...`,
      current: 0,
      total: updates.length,
    });

    let failures: string[] = [];
    try {
      failures = await updatePublishedSelectionStatusesInChunks(updates, 25, (completed, total, failed) => {
        setSelectionProgress({
          active: true,
          title: "Publishing Rejected",
          phase: "Updating dashboards",
          detail: `Processed ${completed} of ${total}. Failed: ${failed}.`,
          current: completed,
          total,
        });
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Rejected publish failed: " + message);
      setPublishingRejected(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    alert(
      `Rejected results published.\n\nPublished: ${updates.length - failures.length}\nFailed: ${failures.length}`
    );
    setSelectionProgress({
      active: true,
      title: "Publishing Rejected",
      phase: "Complete",
      detail: `${updates.length - failures.length} rejected applicants notified on dashboard.`,
      current: updates.length,
      total: updates.length || 1,
    });
    setPublishingRejected(false);
  }

  async function handleMarkBatch1Arrived() {
    const confirmed = window.confirm(
      "Mark all Batch 1 applicants as Arrived?\n\nThis will set arrival_status = 'Arrived' for all applicants in the Batch 1 selection bucket. Use this to bulk-confirm that Batch 1 participants attended the programme."
    );
    if (!confirmed) return;

    setMarkingBatch1Arrived(true);

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE)
      .select("id")
      .ilike("selection_bucket", "%Batch 1 -%");

    if (error || !data) {
      alert("Failed to load Batch 1 applications: " + (error?.message ?? "no data"));
      setMarkingBatch1Arrived(false);
      return;
    }

    const arrivedAt = new Date().toISOString();
    const ids = data.map((r) => r.id);
    const CHUNK = 50;
    let updated = 0;

    for (let i = 0; i < ids.length; i += CHUNK) {
      const chunk = ids.slice(i, i + CHUNK);
      const { error: upErr } = await supabase
        .from(APPLICATIONS_TABLE)
        .update({
          arrival_status: "Arrived",
          arrived_at: arrivedAt,
          arrival_confirmed_by: "Admin Bulk Mark",
        })
        .in("id", chunk);
      if (upErr) console.error("Chunk failed:", upErr.message);
      else updated += chunk.length;
    }

    alert(`Batch 1 marked as Arrived.\n\nUpdated: ${updated} of ${ids.length}`);
    setMarkingBatch1Arrived(false);
  }

  // ── Tools: person search ────────────────────────────────────────────────
  async function handleToolsPersonSearch() {
    const q = toolsPersonQuery.trim();
    if (!q) return;
    setToolsPersonSearching(true);
    setToolsPersonResults([]);

    const isOmang = /^\d{6,}$/.test(q);
    let query = supabase
      .from(APPLICATIONS_TABLE)
      .select("id, application_id, first_name, last_name, email, omang, status, selection_bucket, arrival_status")
      .limit(20);

    if (isOmang) {
      query = query.eq("omang", q);
    } else if (q.includes("@")) {
      query = query.ilike("email", `%${q}%`);
    } else {
      const parts = q.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        query = query.ilike("first_name", `%${parts[0]}%`).ilike("last_name", `%${parts[1]}%`);
      } else {
        query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`);
      }
    }

    const { data } = await query;
    const mapped: Application[] = (data || []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      databaseId: String(r.id),
      applicationId: String(r.application_id ?? r.id),
      firstName: String(r.first_name ?? ""),
      lastName: String(r.last_name ?? ""),
      email: String(r.email ?? ""),
      phone: "",
      omang: String(r.omang ?? ""),
      gender: "",
      age: "",
      citizenship: "",
      constituency: "",
      disabilityStatus: "",
      employmentStatus: "",
      interestArea: "",
      highestQualification: "",
      bgcsePoints: "",
      preferredLanguage: "",
      status: normalizeApplicationStatus(String(r.status ?? "")),
      selectionBucket: r.selection_bucket ? String(r.selection_bucket) : null,
      arrivalStatus: r.arrival_status ? String(r.arrival_status) : null,
    }));
    setToolsPersonResults(mapped);
    const init: Record<string, ApplicationStatus> = {};
    mapped.forEach((r) => { init[r.id] = r.status; });
    setToolsPersonStatusMap(init);
    setToolsPersonSearching(false);
  }

  async function handleToolsSavePersonStatus(person: Application) {
    const newStatus = toolsPersonStatusMap[person.id];
    if (!newStatus || newStatus === person.status) return;
    const confirmed = window.confirm(
      `Change ${person.firstName} ${person.lastName} from "${person.status}" to "${newStatus}"?`
    );
    if (!confirmed) return;
    setToolsPersonSavingId(person.id);
    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update({ status: newStatus })
      .eq("id", person.databaseId ?? person.id);
    if (error) {
      alert("Failed: " + error.message);
    } else {
      setToolsPersonResults((prev) =>
        prev.map((p) => p.id === person.id ? { ...p, status: newStatus } : p)
      );
      setToolsMessage(`${person.firstName} ${person.lastName} updated to ${newStatus}`);
    }
    setToolsPersonSavingId(null);
  }

  // ── Tools: diagnostics ───────────────────────────────────────────────────
  async function handleToolsLoadDiagnostics() {
    setToolsDiagnosticsLoading(true);
    const statuses = ["Accepted", "Completed", "Rejected", "Remaining Eligible", "Deferred"] as const;
    const counts: Record<string, number> = {};
    for (const s of statuses) {
      const { count } = await supabase.from(APPLICATIONS_TABLE).select("id", { count: "exact", head: true }).eq("status", s);
      counts[s] = count ?? 0;
    }
    const { count: ihCount } = await supabase.from(APPLICATIONS_TABLE).select("id", { count: "exact", head: true }).ilike("selection_bucket", "Internal Hold%");
    const { count: rpCount } = await supabase.from(APPLICATIONS_TABLE).select("id", { count: "exact", head: true }).eq("status", "Constituency Reserve Pool");
    const { data: anomalyData } = await supabase
      .from(APPLICATIONS_TABLE)
      .select("id, application_id, first_name, last_name, email, omang, status, selection_bucket, arrival_status")
      .eq("status", "Accepted")
      .eq("arrival_status", "Arrived");
    const anomalies: Application[] = (anomalyData || []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      databaseId: String(r.id),
      applicationId: String(r.application_id ?? r.id),
      firstName: String(r.first_name ?? ""),
      lastName: String(r.last_name ?? ""),
      email: String(r.email ?? ""),
      phone: "", omang: String(r.omang ?? ""), gender: "", age: "",
      citizenship: "", constituency: "", disabilityStatus: "",
      employmentStatus: "", interestArea: "", highestQualification: "",
      bgcsePoints: "", preferredLanguage: "",
      status: normalizeApplicationStatus(String(r.status ?? "")),
      selectionBucket: r.selection_bucket ? String(r.selection_bucket) : null,
      arrivalStatus: r.arrival_status ? String(r.arrival_status) : null,
    }));
    setToolsDiagnostics({
      accepted: counts["Accepted"] ?? 0,
      completed: counts["Completed"] ?? 0,
      rejected: counts["Rejected"] ?? 0,
      remainingEligible: counts["Remaining Eligible"] ?? 0,
      deferred: counts["Deferred"] ?? 0,
      internalHold: ihCount ?? 0,
      reservePool: rpCount ?? 0,
      anomalies,
    });
    setToolsDiagnosticsLoading(false);
  }

  // ── Tools: publish all remaining Internal Hold ───────────────────────────
  async function handleToolsPublishAllRemaining() {
    const confirmed = window.confirm(
      "Publish ALL remaining Internal Hold records?\n\nThis will flip every 'Internal Hold - Do Not Notify' bucket to 'Published - Applicant Visible' and set status based on bucket content. Cannot be undone."
    );
    if (!confirmed) return;
    setToolsPublishingAll(true);
    setToolsMessage("Fetching Internal Hold records...");

    let published = 0;
    let offset = 0;
    const CHUNK = 200;

    while (true) {
      const { data } = await supabase
        .from(APPLICATIONS_TABLE)
        .select("id, selection_bucket, status")
        .ilike("selection_bucket", "Internal Hold%")
        .range(offset, offset + CHUNK - 1);
      if (!data || data.length === 0) break;

      for (const row of data) {
        const bucket = String(row.selection_bucket ?? "");
        const newBucket = bucket.replace("Internal Hold - Do Not Notify", "Published - Applicant Visible");
        let newStatus: ApplicationStatus = normalizeApplicationStatus(String(row.status ?? ""));
        if (bucket.includes("Rejected")) newStatus = "Rejected";
        else if (bucket.includes("Remaining Eligible")) newStatus = "Remaining Eligible";
        else if (bucket.includes("Batch 1")) newStatus = "Completed";
        else if (bucket.includes("Batch 2")) newStatus = "Accepted";
        const { error } = await supabase
          .from(APPLICATIONS_TABLE)
          .update({ status: newStatus, selection_bucket: newBucket })
          .eq("id", row.id);
        if (!error) published++;
      }
      offset += CHUNK;
    }

    setToolsMessage(`Done. Published ${published} records.`);
    setToolsPublishingAll(false);
    await handleToolsLoadDiagnostics();
  }

  // ── Tools: fix anomalies (Accepted + Arrived → Completed) ────────────────
  async function handleToolsFixAnomalies() {
    if (!toolsDiagnostics?.anomalies.length) return;
    const ids = toolsDiagnostics.anomalies.map((a) => a.databaseId ?? a.id);
    const confirmed = window.confirm(
      `Move ${ids.length} Accepted+Arrived applicant(s) to Completed?\n\nThese people attended Batch 1 but are still marked Accepted for Batch 2.`
    );
    if (!confirmed) return;
    setToolsFixingAnomalies(true);
    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update({ status: "Completed", selection_bucket: "Published - Applicant Visible / Batch 1 - Completed" })
      .in("id", ids);
    if (error) {
      alert("Failed: " + error.message);
    } else {
      setToolsMessage(`Fixed ${ids.length} anomaly(ies). Refreshing diagnostics...`);
      await handleToolsLoadDiagnostics();
    }
    setToolsFixingAnomalies(false);
  }

  async function handleSaveProfileEdit() {
    if (!selectedApplication?.databaseId) return;
    setProfileEditSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (profileEditDraft.phone !== undefined) payload.phone = profileEditDraft.phone;
      if (profileEditDraft.email !== undefined) payload.email = profileEditDraft.email;
      if (profileEditDraft.omang !== undefined) payload.omang = profileEditDraft.omang;
      if (profileEditDraft.constituency !== undefined) payload.constituency = profileEditDraft.constituency;
      if (profileEditDraft.district !== undefined) payload.district = profileEditDraft.district;
      if (profileEditDraft.townVillage !== undefined) payload.town_village = profileEditDraft.townVillage;
      if (profileEditDraft.firstName !== undefined) payload.first_name = profileEditDraft.firstName;
      if (profileEditDraft.lastName !== undefined) payload.last_name = profileEditDraft.lastName;

      const { error } = await supabase
        .from(APPLICATIONS_TABLE)
        .update(payload)
        .eq("id", selectedApplication.databaseId);

      if (error) { alert("Failed to save: " + error.message); return; }

      const updated = { ...selectedApplication, ...profileEditDraft };
      setSelectedApplication(updated);
      setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      setAcceptedApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      setBatch2Applications((prev) => prev.map((a) => a.id === updated.id ? updated : a));

      await logAdminAction({
        action: "profile_edit",
        applicationId: selectedApplication.applicationId,
        details: {
          fieldsUpdated: Object.keys(profileEditDraft),
          applicantName: `${updated.firstName} ${updated.lastName}`,
        },
      });

      setProfileEditMode(false);
      setProfileEditDraft({});
    } finally {
      setProfileEditSaving(false);
    }
  }

  async function handleStatusChange(
    application: Application,
    newStatus: ApplicationStatus,
  ) {
    setSavingId(application.id);

    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (newStatus === "Accepted") {
      updatePayload.selection_bucket =
        "Published - Applicant Visible / Batch 2 - Priority Override / Accepted Manually";
    } else if (newStatus === "Rejected" || newStatus === "Remaining Eligible") {
      updatePayload.selection_bucket = null;
    }

    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update(updatePayload)
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

    if (newStatus === "Rejected" || newStatus === "Remaining Eligible") {
      setBatch2Applications((prev) =>
        prev.filter((a) => a.applicationId !== application.applicationId),
      );
    }

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        status: newStatus,
      });
    }

    await refreshAdminNumbers(false);
    setSavingId(null);
  }

  async function handleDeferApplication(application: Application) {
    const confirmed = window.confirm(
      `Move ${application.firstName} ${application.lastName} to the Deferred – Next Intake pool?\n\nThey will NOT be rejected. Their application will be considered in the next intake without priority over new applicants.`,
    );
    if (!confirmed) return;

    setSavingId(application.id);

    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update({ status: "Deferred", selection_bucket: "Deferred - Next Intake" })
      .eq("application_id", application.applicationId);

    if (error) {
      console.error("Failed to defer application:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    await logAdminAction({
      action: "status_change",
      applicationId: application.applicationId,
      details: {
        previousStatus: application.status,
        newStatus: "Deferred",
        selectionBucket: "Deferred - Next Intake",
        applicantEmail: application.email,
        applicantName: `${application.firstName} ${application.lastName}`,
      },
    });

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? { ...item, status: "Deferred", selectionBucket: "Deferred - Next Intake" }
          : item,
      ),
    );

    setBatch2Applications((prev) =>
      prev.filter((a) => a.applicationId !== application.applicationId),
    );

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        status: "Deferred",
        selectionBucket: "Deferred - Next Intake",
      });
    }

    await refreshAdminNumbers(false);
    setSavingId(null);
  }

  async function handleMoveToBatch2Deferred(application: Application) {
    const confirmed = window.confirm(
      `Move ${application.firstName} ${application.lastName} to Batch 2 — Deferred Sprinkle?\n\nThis places them inside the Batch 2 internal selection (not visible to the applicant until published). Their selectionBucket will be set to "Batch 2 - Deferred-Sprinkle".`
    );
    if (!confirmed) return;

    setSavingId(application.id);
    const newBucket = "Internal Hold - Do Not Notify / Batch 2 - Deferred-Sprinkle";

    const { error } = await supabase
      .from(APPLICATIONS_TABLE)
      .update({ status: "Submitted", selection_bucket: newBucket })
      .eq("application_id", application.applicationId);

    if (error) {
      console.error("Failed to move to Batch 2 Deferred:", error);
      alert(error.message);
      setSavingId(null);
      return;
    }

    await logAdminAction({
      action: "status_change",
      applicationId: application.applicationId,
      details: {
        previousStatus: application.status,
        newStatus: "Submitted",
        selectionBucket: newBucket,
        applicantEmail: application.email,
        applicantName: `${application.firstName} ${application.lastName}`,
      },
    });

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationId === application.applicationId
          ? { ...item, status: "Submitted" as ApplicationStatus, selectionBucket: newBucket }
          : item,
      ),
    );

    setBatch2Applications((prev) => {
      const already = prev.some((a) => a.applicationId === application.applicationId);
      if (already) return prev.map((a) => a.applicationId === application.applicationId ? { ...a, selectionBucket: newBucket } : a);
      return [...prev, { ...application, status: "Submitted" as ApplicationStatus, selectionBucket: newBucket }];
    });

    if (selectedApplication?.applicationId === application.applicationId) {
      setSelectedApplication({
        ...selectedApplication,
        status: "Submitted" as ApplicationStatus,
        selectionBucket: newBucket,
      });
    }

    await refreshAdminNumbers(false);
    setSavingId(null);
  }

  async function handleSyncAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!syncAuthEmail.trim()) return;
    setSyncAuthLoading(true);
    setSyncAuthResult(null);
    try {
      const res = await fetch("/api/admin/sync-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: syncAuthEmail.trim(), callerEmail: currentAdminEmail }),
      });
      const data = await res.json();
      setSyncAuthResult(data);
      if (data.ok) setSyncAuthEmail("");
    } catch {
      setSyncAuthResult({ error: "Network error." });
    } finally {
      setSyncAuthLoading(false);
    }
  }

  async function handleBulkDefer(applications: Application[]) {
    const targets = applications.filter((a) => selectedArrivalIds.has(a.id));
    if (targets.length === 0) return;

    const confirmed = window.confirm(
      `Defer ${targets.length} selected applicant${targets.length === 1 ? "" : "s"} to Next Intake? They will not be rejected.`,
    );
    if (!confirmed) return;

    setBulkDeferring(true);

    for (const application of targets) {
      const { error } = await supabase
        .from(APPLICATIONS_TABLE)
        .update({ status: "Deferred", selection_bucket: "Deferred - Next Intake" })
        .eq("application_id", application.applicationId);

      if (!error) {
        await logAdminAction({
          action: "status_change",
          applicationId: application.applicationId,
          details: {
            previousStatus: application.status,
            newStatus: "Deferred",
            selectionBucket: "Deferred - Next Intake",
            applicantEmail: application.email,
            applicantName: `${application.firstName} ${application.lastName}`,
            bulkAction: true,
          },
        });
      }
    }

    setSelectedArrivalIds(new Set());
    await refreshAdminNumbers(false);
    await loadAcceptedApplications();
    setBulkDeferring(false);
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

    await refreshAdminNumbers(false);
    setSavingId(null);
  }

  async function handleMasterSelection() {
    const confirmed = window.confirm(
      `Run Batch 2 hidden selection? 480 seats total.\n\n` +
      `Rules:\n` +
      `• Priority override emails forced in first\n` +
      `• 450km+ constituencies (Chobe, Maun, Okavango, Ghanzi etc.) get major priority\n` +
      `• Equal constituency distribution, hard cap ${BATCH_2_MAX_PER_CONSTITUENCY} per constituency\n` +
      `• Gender floor: ${BATCH_2_MIN_MEN_TARGET} men — HARD REQUIREMENT (3-pass guarantee)\n` +
      `• Disability: fill all ${DISABILITY_CAP} slots\n` +
      `• Deferred: up to ${BATCH_2_DEFERRED_SPRINKLE} sprinkled in, far areas first\n` +
      `• Already-Accepted applicants are excluded\n\n` +
      `Applicant-facing statuses stay as Submitted until you publish.`
    );

    if (!confirmed) return;

    setMasterSelecting(true);
    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
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
          : "Failed to load applications for Batch 2 selection";
      console.error("Failed to load applications for Batch 2 selection:", error);
      alert(message);
      setMasterSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Scoring applications",
      detail: `Scoring ${selectionApplications.length.toLocaleString()} applications...`,
      current: 0,
      total: selectionApplications.length || 1,
    });

    const reviewed = selectionApplications.map((application, index) => {
      if (index % 500 === 0) {
        setSelectionProgress({
          active: true,
          title: "Running Batch 2 hidden selection",
          phase: "Scoring applications",
          detail: `Scoring ${index.toLocaleString()} / ${selectionApplications.length.toLocaleString()}...`,
          current: index,
          total: selectionApplications.length || 1,
        });
      }
      const review = calculateEligibility(application);
      const age = Number(application.age);
      const isStrategicCoverage = isStrategicCoverageParticipant(application.email);
      const rankingScore = review.score + (isStrategicCoverage ? STRATEGIC_COVERAGE_BOOST : 0);
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

    type ReviewedApplication = (typeof reviewed)[number];

    const hardRejectedAll = reviewed.filter((app) => app.isHardRejected);
    const farSet = new Set(FAR_450KM_CONSTITUENCIES);

    // Separate deferred pool from main eligible pool. Exclude already-Accepted.
    const deferredPool = reviewed
      .filter((app) =>
        !app.isHardRejected &&
        app.status !== "Accepted" &&
        (app.status === "Deferred" || (app.selectionBucket || "").includes("Deferred"))
      )
      .sort((a, b) => {
        const aFar = farSet.has(a.constituency || "");
        const bFar = farSet.has(b.constituency || "");
        if (aFar !== bFar) return aFar ? -1 : 1;
        if (a.isYouth !== b.isYouth) return a.isYouth ? -1 : 1;
        return b.rankingScore - a.rankingScore;
      });

    const deferredIds = new Set(deferredPool.map((a) => a.applicationId));

    // Main eligible pool: youth first, score second. Excludes Accepted and Deferred.
    const eligibleAll = reviewed
      .filter((app) =>
        !app.isHardRejected &&
        app.status !== "Accepted" &&
        !deferredIds.has(app.applicationId)
      )
      .sort((a, b) => {
        if (a.isYouth !== b.isYouth) return a.isYouth ? -1 : 1;
        if (b.rankingScore !== a.rankingScore) return b.rankingScore - a.rankingScore;
        return (b.review.documentCompletenessScore || 0) - (a.review.documentCompletenessScore || 0);
      });

    // Fast lookup: eligible candidates per constituency (already sorted)
    const eligibleByConstituency = new Map<string, ReviewedApplication[]>();
    for (const app of eligibleAll) {
      const c = app.constituency || "Unknown";
      if (!eligibleByConstituency.has(c)) eligibleByConstituency.set(c, []);
      eligibleByConstituency.get(c)!.push(app);
    }

    const selected = new Map<string, ReviewedApplication>();
    const constituencyCounts: Record<string, number> = {};
    let disabledSelected = 0;

    function canSelect(candidate: ReviewedApplication, forceOverride = false) {
      if (!candidate.applicationId) return false;
      if (selected.has(candidate.applicationId)) return false;
      if (!forceOverride && candidate.hasDisability && disabledSelected >= DISABILITY_CAP) return false;
      return true;
    }

    function getNormalSelectionBucket(candidate: ReviewedApplication) {
      if (candidate.isYouth && candidate.isFemale) return "Youth Women Priority";
      if (candidate.isYouth && candidate.isMale) return "Youth Men Priority";
      return "Non-Youth Allocation";
    }

    function addToSelected(candidate: ReviewedApplication, bucket: string, forceOverride = false) {
      if (selected.size >= BATCH_2_INTAKE) return false;
      if (!canSelect(candidate, forceOverride)) return false;
      candidate.review.selectionBucket = bucket;
      selected.set(candidate.applicationId, candidate);
      const c = candidate.constituency || "Unknown";
      constituencyCounts[c] = (constituencyCounts[c] || 0) + 1;
      if (candidate.hasDisability) disabledSelected++;
      return true;
    }

    // PHASE 1 — Priority overrides (bypass hard-gate, bypass constituency cap)
    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Phase 1: Priority overrides",
      detail: `Forcing ${STRATEGIC_COVERAGE_EMAILS.length} priority emails into selection...`,
      current: 0,
      total: STRATEGIC_COVERAGE_EMAILS.length,
    });

    const priorityOverrideSelected: ReviewedApplication[] = [];
    for (const priorityEmail of STRATEGIC_COVERAGE_EMAILS) {
      if (selected.size >= BATCH_2_INTAKE) break;
      const candidate = reviewed.find(
        (app) => normalize(app.email) === normalize(priorityEmail) && app.isStrategicCoverage
      );
      if (!candidate) continue;
      candidate.review.notes = [
        candidate.review.notes,
        candidate.review.hardRejectReason
          ? `Priority override bypassed hard gate: ${candidate.review.hardRejectReason}`
          : "Priority override selected before normal ranking",
      ].filter(Boolean).join(", ");
      candidate.review.result = candidate.review.isHardRejected
        ? "Priority override - selected despite hard gate"
        : "Priority override - selected before normal ranking";
      candidate.review.recommendedStatus = "Submitted";
      const added = addToSelected(
        candidate,
        `Batch 2 - Constituency Quota / ${getNormalSelectionBucket(candidate)}`,
        true,
      );
      if (added) priorityOverrideSelected.push(candidate);
    }

    // PHASE 2 — Round-robin constituency fill from eligible pool.
    // 450km+ constituencies come first in every round — they get first pick each pass.
    // Continue until we reach the eligible-pool target (leaving 25 slots for deferred).
    const ELIGIBLE_SOFT_TARGET = BATCH_2_INTAKE - BATCH_2_DEFERRED_SPRINKLE;

    // Ordered list: far constituencies first, then the rest
    const orderedConstituencies = [
      ...constituencies.filter((c) => farSet.has(c)),
      ...constituencies.filter((c) => !farSet.has(c)),
    ];

    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Phase 2: Constituency fill (450km+ priority)",
      detail: "Round-robin fill — 450km+ constituencies lead each pass...",
      current: 0,
      total: ELIGIBLE_SOFT_TARGET,
    });

    for (let round = 0; round < BATCH_2_MAX_PER_CONSTITUENCY; round++) {
      if (selected.size >= ELIGIBLE_SOFT_TARGET) break;
      let addedThisRound = false;

      // Sort within each round: lower-count constituencies first (equalizes representation)
      const sortedThisRound = [...orderedConstituencies].sort((a, b) => {
        const ca = constituencyCounts[a] || 0;
        const cb = constituencyCounts[b] || 0;
        if (ca !== cb) return ca - cb;
        // Within same count: far still leads
        const aFar = farSet.has(a);
        const bFar = farSet.has(b);
        if (aFar !== bFar) return aFar ? -1 : 1;
        return 0;
      });

      for (const c of sortedThisRound) {
        if (selected.size >= ELIGIBLE_SOFT_TARGET) break;
        if ((constituencyCounts[c] || 0) >= BATCH_2_MAX_PER_CONSTITUENCY) continue;

        const pool = eligibleByConstituency.get(c) || [];
        const candidate = pool.find((app) => !selected.has(app.applicationId));
        if (!candidate) continue;

        const label = farSet.has(c) ? "450km+ Priority" : "Constituency Quota";
        addToSelected(candidate, `Batch 2 - ${label} / ${getNormalSelectionBucket(candidate)}`);
        addedThisRound = true;
      }

      if (!addedThisRound) break;

      setSelectionProgress({
        active: true,
        title: "Running Batch 2 hidden selection",
        phase: "Phase 2: Constituency fill (450km+ priority)",
        detail: `Round ${round + 1} complete — ${selected.size.toLocaleString()} / ${ELIGIBLE_SOFT_TARGET} selected`,
        current: selected.size,
        total: ELIGIBLE_SOFT_TARGET,
      });
    }

    // PHASE 3 — Gender balance: MUST hit exactly 200 men. Hard requirement, no fallback.
    // Pass A: respect constituency cap, use up to BATCH_2_INTAKE slots.
    // Pass B: relax constituency cap if still under 200.
    // Pass C: pull from deferred pool if still under 200.
    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Phase 3: Gender balance — 200 men required",
      detail: "Topping up men to hit the 200 hard floor...",
      current: selected.size,
      total: BATCH_2_INTAKE,
    });

    const menCount = () => Array.from(selected.values()).filter((a) => a.isMale).length;

    if (menCount() < BATCH_2_MIN_MEN_TARGET) {
      const allUnselectedMen = eligibleAll
        .filter((app) => app.isMale && !selected.has(app.applicationId));

      // Sort: underrepresented constituencies first, then youth, then score
      const menByConstituency: Record<string, number> = {};
      for (const app of selected.values()) {
        if (app.isMale) {
          const c = app.constituency || "Unknown";
          menByConstituency[c] = (menByConstituency[c] || 0) + 1;
        }
      }
      allUnselectedMen.sort((a, b) => {
        const ca = menByConstituency[a.constituency || ""] || 0;
        const cb = menByConstituency[b.constituency || ""] || 0;
        if (ca !== cb) return ca - cb;
        if (a.isYouth !== b.isYouth) return a.isYouth ? -1 : 1;
        return b.rankingScore - a.rankingScore;
      });

      // Pass A — respect constituency cap
      for (const man of allUnselectedMen) {
        if (menCount() >= BATCH_2_MIN_MEN_TARGET) break;
        if (selected.size >= BATCH_2_INTAKE) break;
        const count = constituencyCounts[man.constituency || ""] || 0;
        if (count >= BATCH_2_MAX_PER_CONSTITUENCY) continue;
        addToSelected(man, `Batch 2 - Gender Balance Men / ${getNormalSelectionBucket(man)}`);
      }

      // Pass B — relax constituency cap to guarantee 200
      if (menCount() < BATCH_2_MIN_MEN_TARGET) {
        for (const man of allUnselectedMen) {
          if (menCount() >= BATCH_2_MIN_MEN_TARGET) break;
          if (selected.size >= BATCH_2_INTAKE) break;
          if (selected.has(man.applicationId)) continue;
          addToSelected(man, `Batch 2 - Gender Balance Men / ${getNormalSelectionBucket(man)}`);
        }
      }

      // Pass C — pull from deferred pool if still under 200
      if (menCount() < BATCH_2_MIN_MEN_TARGET) {
        const deferredMen = deferredPool.filter((m) => m.isMale && !selected.has(m.applicationId));
        deferredMen.sort((a, b) => b.rankingScore - a.rankingScore);
        for (const man of deferredMen) {
          if (menCount() >= BATCH_2_MIN_MEN_TARGET) break;
          if (selected.size >= BATCH_2_INTAKE) break;
          addToSelected(man, `Batch 2 - Gender Balance Men / Deferred`, true);
        }
      }
    }

    // PHASE 4 — Disability top-up: fill all 8 slots
    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Phase 4: Disability allocation",
      detail: `Filling disability slots (${disabledSelected}/${DISABILITY_CAP})...`,
      current: selected.size,
      total: ELIGIBLE_SOFT_TARGET,
    });

    if (disabledSelected < DISABILITY_CAP && selected.size < ELIGIBLE_SOFT_TARGET) {
      const eligibleDisabled = eligibleAll.filter(
        (app) => app.hasDisability && !selected.has(app.applicationId)
      );
      for (const person of eligibleDisabled) {
        if (disabledSelected >= DISABILITY_CAP) break;
        if (selected.size >= ELIGIBLE_SOFT_TARGET) break;
        const count = constituencyCounts[person.constituency || ""] || 0;
        if (count >= BATCH_2_MAX_PER_CONSTITUENCY) continue;
        // Force-override the disability cap so we can add them
        if (!selected.has(person.applicationId) && person.applicationId) {
          person.review.selectionBucket = `Batch 2 - Disability Allocation / ${getNormalSelectionBucket(person)}`;
          selected.set(person.applicationId, person);
          const c = person.constituency || "Unknown";
          constituencyCounts[c] = (constituencyCounts[c] || 0) + 1;
          disabledSelected++;
        }
      }
    }

    // PHASE 5 — Deferred sprinkle: up to 25, far areas first, youth first
    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Phase 5: Deferred sprinkle (far areas first)",
      detail: `Adding up to ${BATCH_2_DEFERRED_SPRINKLE} deferred candidates — 450km+ priority...`,
      current: selected.size,
      total: BATCH_2_INTAKE,
    });

    let deferredAdded = 0;
    for (const person of deferredPool) {
      if (selected.size >= BATCH_2_INTAKE) break;
      if (deferredAdded >= BATCH_2_DEFERRED_SPRINKLE) break;
      const count = constituencyCounts[person.constituency || ""] || 0;
      if (count >= BATCH_2_MAX_PER_CONSTITUENCY) continue;
      if (!canSelect(person)) continue;
      const farLabel = farSet.has(person.constituency || "") ? "Deferred-Far Priority" : "Deferred-Sprinkle";
      addToSelected(person, `Batch 2 - ${farLabel} / ${getNormalSelectionBucket(person)}`);
      deferredAdded++;
    }

    // If still below BATCH_2_INTAKE after deferred, fill remaining from eligible
    if (selected.size < BATCH_2_INTAKE) {
      for (const app of eligibleAll) {
        if (selected.size >= BATCH_2_INTAKE) break;
        const count = constituencyCounts[app.constituency || ""] || 0;
        if (count >= BATCH_2_MAX_PER_CONSTITUENCY) continue;
        addToSelected(app, `Batch 2 - Constituency Quota / ${getNormalSelectionBucket(app)}`);
      }
    }

    // Build waitlist and rejected lists
    const selectedIds = new Set(Array.from(selected.values()).map((a) => a.applicationId));
    const hardRejected = hardRejectedAll.filter((app) => !selectedIds.has(app.applicationId));
    const constituencyWaitingListCounts: Record<string, number> = {};

    const waitingListEligible = [...eligibleAll, ...deferredPool].filter((app) => {
      if (selectedIds.has(app.applicationId)) return false;
      const c = app.constituency || "Unknown";
      if (!constituencyWaitingListCounts[c]) constituencyWaitingListCounts[c] = 0;
      if (constituencyWaitingListCounts[c] >= WAITING_LIST_PER_CONSTITUENCY) return false;
      constituencyWaitingListCounts[c]++;
      app.review.selectionBucket = `Remaining Eligible - Constituency Waitlist / ${getNormalSelectionBucket(app)}`;
      return true;
    });

    const updates = [
      ...Array.from(selected.values()).map((app) => ({
        app,
        status: "Submitted" as ApplicationStatus,
        bucket: `Internal Hold - Do Not Notify / ${app.review.selectionBucket || "Batch 2 Selected"}`,
      })),
      ...waitingListEligible.map((app) => ({
        app,
        status: "Submitted" as ApplicationStatus,
        bucket: `Internal Hold - Do Not Notify / ${app.review.selectionBucket || "Remaining Eligible - Constituency Waitlist"}`,
      })),
      ...hardRejected.map((app) => ({
        app,
        status: "Submitted" as ApplicationStatus,
        bucket: app.review.hardRejectReason.includes("Invalid or unrecognised constituency")
          ? "Internal Hold - Do Not Notify / Rejected - Invalid Constituency"
          : "Internal Hold - Do Not Notify / Rejected - Hard Gate",
      })),
    ];

    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Saving results",
      detail: `Writing ${updates.length.toLocaleString()} internal result records. Applicants still see Submitted.`,
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
            title: "Running Batch 2 hidden selection",
            phase: "Saving results",
            detail: `Saved ${completed.toLocaleString()} / ${total.toLocaleString()} records. Failed: ${failed.toLocaleString()}.`,
            current: completed,
            total,
          });
        },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Batch 2 selection update failed";
      console.error("Batch 2 selection update failed:", error);
      alert(message);
      setMasterSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Running Batch 2 hidden selection",
      phase: "Refreshing dashboard",
      detail: "Updating admin view...",
      current: updates.length,
      total: updates.length || 1,
    });

    setApplications((prev) =>
      prev.map((application) => {
        const found = updates.find((u) => u.app.applicationId === application.applicationId);
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

    await refreshAdminNumbers(false);

    const finalMenCount = Array.from(selected.values()).filter((a) => a.isMale).length;
    const finalWomenCount = Array.from(selected.values()).filter((a) => a.isFemale).length;
    const farSelected = Array.from(selected.values()).filter((a) => farSet.has(a.constituency || "")).length;
    const constituenciesHit = Object.keys(constituencyCounts).filter((c) => constituencyCounts[c] > 0).length;

    await logAdminAction({
      action: "master_selection",
      details: {
        selectionMode: "Batch 2 — 480 seats, 450km+ priority, gender floor, deferred sprinkle",
        batchTwoSelected: selected.size,
        priorityOverrideSelected: priorityOverrideSelected.length,
        deferredAdded,
        farConstituencySelected: farSelected,
        menSelected: finalMenCount,
        womenSelected: finalWomenCount,
        disabledSelected,
        constituenciesRepresented: constituenciesHit,
        remainingEligiblePersisted: waitingListEligible.length,
        rejectedPersisted: hardRejected.length,
        failures: internalSelectionFailures.length,
        batchTwoIntake: BATCH_2_INTAKE,
        maxPerConstituency: BATCH_2_MAX_PER_CONSTITUENCY,
        totalProgrammeIntake: TOTAL_PROGRAMME_INTAKE,
      },
    });

    const menTargetMet = finalMenCount >= BATCH_2_MIN_MEN_TARGET;

    alert(
      `Batch 2 Hidden Selection Complete\n` +
      `══════════════════════════════════\n` +
      `Total selected: ${selected.size} / ${BATCH_2_INTAKE}\n` +
      `Priority overrides: ${priorityOverrideSelected.length}\n` +
      `Deferred sprinkled: ${deferredAdded} / ${BATCH_2_DEFERRED_SPRINKLE}\n` +
      `450km+ far-area selected: ${farSelected}\n` +
      `Constituencies represented: ${constituenciesHit} / ${constituencies.length}\n` +
      `\n` +
      `Gender:\n` +
      `  Women: ${finalWomenCount} ${finalWomenCount > finalMenCount ? "(majority — youth women prioritised)" : ""}\n` +
      `  Men: ${finalMenCount} ${menTargetMet ? "✓ 200 men met" : "✗ WARNING: below 200 — check eligible male pool"}\n` +
      `\n` +
      `Disability allocated: ${disabledSelected} / ${DISABILITY_CAP}\n` +
      `Applicant-facing status: NO change (publish separately)\n` +
      `Failed row updates: ${internalSelectionFailures.length}`
    );

    setSelectionProgress({
      active: false,
      title: "Batch 2 hidden selection complete",
      phase: "Complete",
      detail: internalSelectionFailures.length
        ? "Completed with some failed row updates. Applicants were not notified."
        : "Internal selections saved. Publish when ready to notify applicants.",
      current: updates.length,
      total: updates.length || 1,
    });
    setMasterSelecting(false);
    // Auto-load Batch 2 list so it's immediately visible
    loadBatch2Applications();
    setActiveSection("selection");
  }

  async function handleAddApplicant(e: React.FormEvent) {
    e.preventDefault();
    setAddApplicantError("");
    setAddApplicantSuccess("");
    setAddApplicantLoading(true);

    const f = addApplicantForm;
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.omang.trim()) {
      setAddApplicantError("First name, last name, email, and Omang are required.");
      setAddApplicantLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .ilike("omang", f.omang.trim())
      .limit(1);

    if (existing && existing.length > 0) {
      setAddApplicantError(`An application with Omang ${f.omang.trim()} already exists.`);
      setAddApplicantLoading(false);
      return;
    }

    const calcAge = (dob: string) => {
      const diff = Date.now() - new Date(dob).getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };
    const payload: Record<string, unknown> = {
      first_name: f.firstName.trim(),
      last_name: f.lastName.trim(),
      email: f.email.trim().toLowerCase(),
      phone: f.phone.trim(),
      omang: f.omang.trim(),
      gender: f.gender,
      date_of_birth: f.dateOfBirth || null,
      age: f.dateOfBirth ? calcAge(f.dateOfBirth) : null,
      district: f.district.trim() || null,
      town_village: f.townVillage.trim() || null,
      constituency: f.constituency,
      highest_qualification: f.highestQualification,
      bgcse_points: f.bgcsePoints ? Number(f.bgcsePoints) : null,
      employment_status: f.employmentStatus,
      disability_status: f.disabilityStatus,
      ovc_status: f.ovcStatus,
      preferred_language: f.preferredLanguage,
      status: f.status,
      selection_bucket: f.status === "Accepted"
        ? "Published - Applicant Visible / Batch 2 - Manual Add"
        : f.status === "Remaining Eligible"
          ? "Published - Applicant Visible / Remaining Eligible - Manual Add"
          : null,
      auto_review_score: 50,
      submitted_at: new Date().toISOString(),
      interest_area: "Oil and Gas",
      citizenship: "Citizen",
    };

    const { error } = await supabase.from("applications").insert(payload);

    if (error) {
      setAddApplicantError(`Failed to add applicant: ${error.message}`);
      setAddApplicantLoading(false);
      return;
    }

    setAddApplicantSuccess(
      `Successfully added ${f.firstName} ${f.lastName} (${f.email}) with status ${f.status}.`
    );
    setAddApplicantForm(emptyAddForm);
    setAddApplicantLoading(false);
    await refreshAdminNumbers(false);
  }

  async function handleNearbyReserveSelection() {
    const confirmed = window.confirm(
      "Create the 350km nearby reserve selection now? This will tag 50 applicants only from Remaining Eligible / Waitlist / Submitted applicants in the 38 nearby constituencies. Batch 1 and already accepted applicants will not be touched.",
    );

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Safety confirmation: Batch 1 has already been published and notified. This action must not touch Batch 1 or Accepted applicants. Continue only if you want to create/update the separate 350km reserve pool.",
    );

    if (!secondConfirm) return;

    setNearbyReserveSelecting(true);
    setSelectionProgress({
      active: true,
      title: "Creating 350km nearby reserve",
      phase: "Loading applications",
      detail: "Fetching all applications from Supabase without touching Batch 1...",
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
          : "Failed to load applications for nearby reserve selection";
      console.error("Failed to load applications for nearby reserve selection:", error);
      alert(message);
      setNearbyReserveSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Creating 350km nearby reserve",
      phase: "Scoring eligible applicants",
      detail: `Checking ${selectionApplications.length.toLocaleString()} applications. Batch 1 and Accepted applicants are locked out.`,
      current: 0,
      total: selectionApplications.length || 1,
    });

    type NearbyReviewedApplication = Application & {
      review: ReviewDecision;
      employmentPriorityRank: number;
      isHardRejected: boolean;
    };

    const reviewed = selectionApplications.map((application, index) => {
      if (index % 500 === 0) {
        setSelectionProgress({
          active: true,
          title: "Creating 350km nearby reserve",
          phase: "Scoring eligible applicants",
          detail: `Scoring application ${index.toLocaleString()} of ${selectionApplications.length.toLocaleString()}...`,
          current: index,
          total: selectionApplications.length || 1,
        });
      }

      const review = calculateEligibility(application);

      return {
        ...application,
        review,
        employmentPriorityRank: getEmploymentPriorityRank(
          application.employmentStatus,
        ),
        isHardRejected: review.isHardRejected,
      };
    });

    const eligiblePool = reviewed.filter((application) => {
      const bucket = application.selectionBucket || "";
      const status = application.status;
      const isBatchOne = bucket.includes("Batch 1 -");
      const isAccepted = status === "Accepted";
      const isRejected = bucket.includes("Rejected") || status === "Rejected";
      const isInNearbyRadius = isNearby350kmConstituency(
        application.constituency,
      );
      const isAllowedSource =
        bucket.includes("Remaining Eligible") ||
        bucket.includes("Waitlist") ||
        status === "Submitted";

      return (
        isInNearbyRadius &&
        isAllowedSource &&
        !isBatchOne &&
        !isAccepted &&
        !isRejected &&
        !application.isHardRejected
      );
    });

    function sortNearbyReserveCandidates(
      first: NearbyReviewedApplication,
      second: NearbyReviewedApplication,
    ) {
      if (first.employmentPriorityRank !== second.employmentPriorityRank) {
        return first.employmentPriorityRank - second.employmentPriorityRank;
      }

      if ((second.review.score || 0) !== (first.review.score || 0)) {
        return (second.review.score || 0) - (first.review.score || 0);
      }

      if (
        (second.review.documentCompletenessScore || 0) !==
        (first.review.documentCompletenessScore || 0)
      ) {
        return (
          (second.review.documentCompletenessScore || 0) -
          (first.review.documentCompletenessScore || 0)
        );
      }

      return (first.submittedAt || "").localeCompare(second.submittedAt || "");
    }

    const selectedMap = new Map<string, NearbyReviewedApplication>();
    const selectedOmangs = new Set<string>();
    const selectedEmails = new Set<string>();
    const selectedPhones = new Set<string>();
    const selectedConstituencyCounts: Record<string, number> = {};

    function candidateKey(candidate: NearbyReviewedApplication) {
      return (
        candidate.applicationId ||
        candidate.databaseId ||
        candidate.email ||
        candidate.id
      );
    }

    function canAddCandidate(candidate: NearbyReviewedApplication) {
      const key = candidateKey(candidate);
      const omang = normalize(candidate.omang);
      const email = normalize(candidate.email);
      const phone = normalize(candidate.phone);

      if (!key) return false;
      if (selectedMap.has(key)) return false;
      if (omang && selectedOmangs.has(omang)) return false;
      if (email && selectedEmails.has(email)) return false;
      if (phone && selectedPhones.has(phone)) return false;

      return true;
    }

    function addCandidate(candidate: NearbyReviewedApplication) {
      if (selectedMap.size >= NEARBY_RESERVE_TARGET) return false;
      if (!canAddCandidate(candidate)) return false;

      const key = candidateKey(candidate);
      selectedMap.set(key, candidate);

      const omang = normalize(candidate.omang);
      const email = normalize(candidate.email);
      const phone = normalize(candidate.phone);

      if (omang) selectedOmangs.add(omang);
      if (email) selectedEmails.add(email);
      if (phone) selectedPhones.add(phone);

      const constituency = candidate.constituency || "Unknown";
      selectedConstituencyCounts[constituency] =
        (selectedConstituencyCounts[constituency] || 0) + 1;

      return true;
    }

    setSelectionProgress({
      active: true,
      title: "Creating 350km nearby reserve",
      phase: "Guaranteeing representation",
      detail: "Selecting one strongest applicant from each of the 38 nearby constituencies first.",
      current: 0,
      total: NEARBY_350KM_CONSTITUENCIES.length,
    });

    for (const [index, constituency] of NEARBY_350KM_CONSTITUENCIES.entries()) {
      setSelectionProgress({
        active: true,
        title: "Creating 350km nearby reserve",
        phase: "Guaranteeing representation",
        detail: `Selecting reserve representative for ${constituency} (${index + 1}/${NEARBY_350KM_CONSTITUENCIES.length}).`,
        current: index + 1,
        total: NEARBY_350KM_CONSTITUENCIES.length,
      });

      const constituencyCandidates = eligiblePool
        .filter(
          (candidate) =>
            normalize(candidate.constituency) === normalize(constituency),
        )
        .sort(sortNearbyReserveCandidates);

      const representative = constituencyCandidates.find(canAddCandidate);

      if (representative) {
        addCandidate(representative);
      }
    }

    const extraCandidates = eligiblePool
      .filter(canAddCandidate)
      .sort(sortNearbyReserveCandidates);

    for (const candidate of extraCandidates) {
      if (selectedMap.size >= NEARBY_RESERVE_TARGET) break;
      addCandidate(candidate);
    }

    const selectedReserve = Array.from(selectedMap.values());
    const batchOneOrAcceptedContamination = selectedReserve.filter(
      (application) =>
        (application.selectionBucket || "").includes("Batch 1 -") ||
        application.status === "Accepted",
    );

    if (batchOneOrAcceptedContamination.length > 0) {
      alert(
        `Safety stop: ${batchOneOrAcceptedContamination.length} Batch 1 or Accepted applicants were found in the reserve preview. No records were changed.`,
      );
      setNearbyReserveSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    if (selectedReserve.length === 0) {
      alert(
        "No eligible nearby reserve applicants were found. No records were changed.",
      );
      setNearbyReserveSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    if (selectedReserve.length < NEARBY_RESERVE_TARGET) {
      const proceed = window.confirm(
        `Only ${selectedReserve.length}/${NEARBY_RESERVE_TARGET} eligible applicants were found. Continue and tag the available applicants?`,
      );

      if (!proceed) {
        setNearbyReserveSelecting(false);
        setSelectionProgress(EMPTY_SELECTION_PROGRESS);
        return;
      }
    }

    const constituenciesRepresented = Object.keys(
      selectedConstituencyCounts,
    ).length;

    const finalConfirm = window.confirm(
      `Final confirmation before saving:\n\nNearby reserve selected: ${selectedReserve.length}/${NEARBY_RESERVE_TARGET}\nConstituencies represented: ${constituenciesRepresented}/${NEARBY_350KM_CONSTITUENCIES.length}\nBatch 1 / Accepted contamination: 0\n\nThis will tag these applicants as: ${NEARBY_RESERVE_BUCKET}\n\nContinue?`,
    );

    if (!finalConfirm) {
      setNearbyReserveSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Creating 350km nearby reserve",
      phase: "Saving reserve pool",
      detail: "Tagging the selected 50 applicants. Batch 1 and Accepted applicants remain untouched.",
      current: 0,
      total: selectedReserve.length || 1,
    });

    const updates = selectedReserve.map((app) => ({
      app,
      status: "Submitted" as ApplicationStatus,
      bucket: NEARBY_RESERVE_BUCKET,
    }));

    let nearbyReserveFailures: string[] = [];

    try {
      nearbyReserveFailures = await updateReviewFieldsInChunks(
        updates,
        25,
        (completed, total, failed) => {
          setSelectionProgress({
            active: true,
            title: "Creating 350km nearby reserve",
            phase: "Saving reserve pool",
            detail: `Processed ${completed.toLocaleString()} of ${total.toLocaleString()} reserve applicants. Failed: ${failed.toLocaleString()}.`,
            current: completed,
            total,
          });
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nearby reserve selection update failed";
      console.error("Nearby reserve selection update failed:", error);
      alert(message);
      setNearbyReserveSelecting(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setApplications((prev) =>
      prev.map((application) => {
        const found = selectedReserve.find(
          (selected) => selected.applicationId === application.applicationId,
        );

        if (!found) return application;

        return {
          ...application,
          autoReviewScore: found.review.score,
          autoReviewResult: found.review.result,
          autoReviewNotes: found.review.notes,
          priorityGroup: found.review.priorityGroup,
          selectionBucket: NEARBY_RESERVE_BUCKET,
          hardRejectReason: found.review.hardRejectReason,
          documentCompletenessScore: found.review.documentCompletenessScore,
        };
      }),
    );

    await refreshAdminNumbers(false);

    await logAdminAction({
      action: "nearby_reserve_selection",
      details: {
        reserveBucket: NEARBY_RESERVE_BUCKET,
        selected: selectedReserve.length,
        target: NEARBY_RESERVE_TARGET,
        nearbyConstituencies: NEARBY_350KM_CONSTITUENCIES.length,
        constituenciesRepresented,
        baseRepresentationRule:
          "One strongest eligible applicant from each nearby constituency first, then best remaining applicants for extra seats.",
        extraSeats: NEARBY_RESERVE_EXTRA_SEATS,
        batchOneOrAcceptedContamination: 0,
        sources:
          "Remaining Eligible, Waitlist, and Submitted only. Batch 1, Accepted, and Rejected are excluded.",
        failedUpdates: nearbyReserveFailures.length,
        firstFailures: nearbyReserveFailures.slice(0, 10),
      },
    });

    alert(
      `350km Nearby Reserve Complete:\nSelected: ${selectedReserve.length}/${NEARBY_RESERVE_TARGET}\nConstituencies represented: ${constituenciesRepresented}/${NEARBY_350KM_CONSTITUENCIES.length}\nBatch 1 / Accepted touched: 0\nFailed row updates: ${nearbyReserveFailures.length}`,
    );

    setSelectionProgress({
      active: false,
      title: "350km nearby reserve complete",
      phase: "Complete",
      detail:
        "Nearby reserve applicants were tagged. Batch 1 and Accepted applicants were not touched.",
      current: selectedReserve.length,
      total: selectedReserve.length || 1,
    });
    setNearbyReserveSelecting(false);
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

  function getSuccessfulApplicantMessage(_application: Application) {
    return `Congratulations! 🎉

You have been successfully selected to participate in the Botswana Youth, Women & Citizen Oil & Gas Training Programme 2026 — Batch 2.

Reporting & Orientation:

Venue: University of Botswana, in front of the Student Centre. Report on Sunday between 13:00 and 15:00 (1–3 pm). Formal orientation begins Monday at 08:00. Accommodation and meals are provided for all 10 days.

Important Information:

• Bring your Omang/ID for registration.
• Attendance throughout the programme is mandatory.
• Meals will be provided during the training period.
• Download your acceptance letter from your dashboard and bring it (printed or on your phone).

We look forward to welcoming you to this exciting opportunity within Botswana's growing oil and gas sector.

BYWC Programme Administration`;
  }

  async function handleSendBatch2InboxMessages() {
    const confirmed = window.confirm(
      "Send inbox messages to all published Batch 2 applicants?\n\nThis will write a success notification to the portal inbox of every applicant whose selection bucket starts with 'Published - Applicant Visible / Batch 2'. Existing messages will be overwritten.\n\nNo emails or SMS will be sent."
    );
    if (!confirmed) return;

    setSendingBatch2Messages(true);
    setSelectionProgress({
      active: true,
      title: "Sending Batch 2 Inbox Messages",
      phase: "Loading",
      detail: "Fetching published Batch 2 applicants...",
      current: 0,
      total: 1,
    });

    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE)
      .select("id, application_id, first_name, last_name, email, selection_bucket")
      .ilike("selection_bucket", "Published - Applicant Visible / Batch 2 -%");

    if (error || !data) {
      alert("Failed to load Batch 2 applicants: " + (error?.message ?? "no data"));
      setSendingBatch2Messages(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    if (data.length === 0) {
      alert("No published Batch 2 applicants found.");
      setSendingBatch2Messages(false);
      setSelectionProgress(EMPTY_SELECTION_PROGRESS);
      return;
    }

    setSelectionProgress({
      active: true,
      title: "Sending Batch 2 Inbox Messages",
      phase: "Sending",
      detail: `Sending to ${data.length} applicants...`,
      current: 0,
      total: data.length,
    });

    let completed = 0;
    let failed = 0;

    for (const row of data) {
      try {
        const app = formatApplication(row);
        const message = getSuccessfulApplicantMessage(app);
        await updateApplicationBySafeKey(app, { admin_message: message }, "batch2 inbox message");
      } catch {
        failed += 1;
      } finally {
        completed += 1;
        setSelectionProgress({
          active: true,
          title: "Sending Batch 2 Inbox Messages",
          phase: "Sending",
          detail: `Processed ${completed} of ${data.length}. Failed: ${failed}.`,
          current: completed,
          total: data.length,
        });
      }
    }

    alert(`Batch 2 inbox messages sent.\n\nSuccessful: ${data.length - failed}\nFailed: ${failed}`);
    setSendingBatch2Messages(false);
    setSelectionProgress(EMPTY_SELECTION_PROGRESS);
  }

  function getReservePublishOrderedApplications() {
    return [...nearbyReserveApplications].sort((a, b) => {
      const employmentRankDiff =
        getEmploymentPriorityRank(a.employmentStatus) -
        getEmploymentPriorityRank(b.employmentStatus);

      if (employmentRankDiff !== 0) return employmentRankDiff;

      const scoreDiff =
        (b.autoReviewScore || 0) - (a.autoReviewScore || 0);

      if (scoreDiff !== 0) return scoreDiff;

      return (a.submittedAt || "").localeCompare(b.submittedAt || "");
    });
  }

  async function handlePublishNearbyReserveAmount() {
    const amount = Number.parseInt(nearbyReservePublishAmount, 10);

    if (Number.isNaN(amount) || amount <= 0) {
      alert("Enter a valid publish amount greater than 0.");
      return;
    }

    if (nearbyReserveApplications.length === 0) {
      alert("No 350km reserve applicants are available to publish.");
      return;
    }

    if (programmeRemainingSeats <= 0) {
      alert(
        `The programme target of ${TOTAL_PROGRAMME_INTAKE.toLocaleString()} accepted applicants has already been reached. No more reserve applicants can be published.`,
      );
      return;
    }

    if (amount > nearbyReserveMaxPublishable) {
      alert(
        `You can publish a maximum of ${nearbyReserveMaxPublishable.toLocaleString()} reserve applicant(s) right now. Current accepted: ${programmeAcceptedCount.toLocaleString()} / ${TOTAL_PROGRAMME_INTAKE.toLocaleString()}.`,
      );
      return;
    }

    const orderedReserveApplications = getReservePublishOrderedApplications();
    const selectedForPublish = orderedReserveApplications.slice(0, amount);

    const confirmed = window.confirm(
      `Publish ${selectedForPublish.length.toLocaleString()} applicant(s) from the 350km reserve pool as Accepted?\n\nCurrent accepted: ${programmeAcceptedCount.toLocaleString()} / ${TOTAL_PROGRAMME_INTAKE.toLocaleString()}\nRemaining seats before publish: ${programmeRemainingSeats.toLocaleString()}\nRemaining seats after publish: ${(programmeRemainingSeats - selectedForPublish.length).toLocaleString()}\n\nThis will update only the selected reserve applicants. Batch 1 remains untouched. No emails or SMS will be sent.`,
    );

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Final confirmation: this will make these reserve applicants visible as Accepted on their dashboards. Continue?",
    );

    if (!secondConfirm) return;

    setNearbyReservePublishing(true);
    setSelectionProgress({
      active: true,
      title: "Publishing 350km reserve applicants",
      phase: "Updating accepted statuses",
      detail:
        "Publishing selected reserve applicants as Accepted. Batch 1 remains untouched. No emails or SMS are sent.",
      current: 0,
      total: selectedForPublish.length || 1,
    });

    const failures: string[] = [];
    let completed = 0;

    for (const application of selectedForPublish) {
      try {
        await retrySelectionUpdate(() =>
          updateApplicationBySafeKey(
            application,
            {
              status: "Accepted",
              selection_bucket:
                "Batch 2 - 350km Nearby Reserve Published / Accepted Manually",
              admin_message: getSuccessfulApplicantMessage(application),
            },
            "350km reserve publish update",
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown 350km reserve publish failure";

        failures.push(message);
        console.error("350km reserve publish row failed:", message, application);
      } finally {
        completed += 1;
        setSelectionProgress({
          active: true,
          title: "Publishing 350km reserve applicants",
          phase: "Updating accepted statuses",
          detail: `Processed ${completed.toLocaleString()} of ${selectedForPublish.length.toLocaleString()} reserve applicants. Failed: ${failures.length.toLocaleString()}.`,
          current: completed,
          total: selectedForPublish.length || 1,
        });
      }
    }

    await logAdminAction({
      action: "selection_publish",
      details: {
        publishType: "350km nearby reserve amount",
        requestedAmount: amount,
        attempted: selectedForPublish.length,
        published: selectedForPublish.length - failures.length,
        failed: failures.length,
        firstFailures: failures.slice(0, 10),
        previousAcceptedCount: programmeAcceptedCount,
        newAcceptedCount:
          programmeAcceptedCount + selectedForPublish.length - failures.length,
        programmeTarget: TOTAL_PROGRAMME_INTAKE,
        batchOneTouched: false,
        sentEmailOrSms: false,
      },
    });

    await refreshAdminNumbers(false);

    alert(
      `350km reserve publish complete.\nPublished: ${(selectedForPublish.length - failures.length).toLocaleString()}\nFailed: ${failures.length.toLocaleString()}\nEmails/SMS sent: NO`,
    );

    setSelectionProgress({
      active: false,
      title: "350km reserve publish complete",
      phase: "Complete",
      detail:
        "Selected reserve applicants were marked as Accepted. Batch 1 was not touched and no emails/SMS were sent.",
      current: selectedForPublish.length,
      total: selectedForPublish.length || 1,
    });
    setNearbyReservePublishAmount("0");
    setNearbyReservePublishing(false);
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

  async function handleExportBatchOneSelectedCsv() {
    setBatchOneExporting(true);

    try {
      const { data, error } = await supabase.rpc(
        "export_batch_1_selected_applicants",
      );

      if (error) {
        console.error("Batch 1 selected export failed:", error);
        alert(error.message || "Batch 1 selected export failed.");
        setBatchOneExporting(false);
        return;
      }

      if (!data || data.length === 0) {
        alert("No Batch 1 selected applicants found to export.");
        setBatchOneExporting(false);
        return;
      }

      const headers = [
        "Constituency",
        "Full Name",
        "Omang",
        "Phone",
      ];

      const rows = data.map((row: any) => [
        row.constituency,
        row.full_name,
        row.omang,
        row.phone,
      ]);

      const csvContent = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row: any[]) => row.map(escapeCsvValue).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      link.href = url;
      link.download = `BYWC-batch-1-selected-by-constituency-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Batch 1 selected export complete. ${data.length} records exported.`);
    } catch (error) {
      console.error("Batch 1 selected export failed:", error);
      alert("Batch 1 selected export failed. Please try again.");
    } finally {
      setBatchOneExporting(false);
    }
  }

  function handleExportBatch1Stats() {
    setBatchOneStatsExporting(true);
    try {
      const b1 = acceptedApplications.filter(
        a => isInternalBatchOneSelection(a.selectionBucket)
          && !(a.selectionBucket || "").includes("Phikwe Special")
          && !(a.selectionBucket || "").includes("Gamalete-GoodHope Special")
      );

      if (b1.length === 0) { alert("No Batch 1 data loaded."); return; }

      const isF = (a: Application) => (a.gender || "").toLowerCase().startsWith("f");
      const isM = (a: Application) => (a.gender || "").toLowerCase().startsWith("m");
      const isYouth = (a: Application) => { const age = Number(a.age); return !Number.isNaN(age) && age <= 35; };

      // Group by constituency
      const map: Record<string, Application[]> = {};
      for (const a of b1) {
        const c = a.constituency || "Unknown";
        if (!map[c]) map[c] = [];
        map[c].push(a);
      }

      const headers = [
        "Constituency",
        "Total",
        "Women",
        "Men",
        "Youth (≤35)",
        "Youth Women",
        "Youth Men",
        "Non-Youth (>35)",
        "Non-Youth Women",
        "Non-Youth Men",
      ];

      const rows = Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([constituency, people]) => {
          const women = people.filter(isF).length;
          const men = people.filter(isM).length;
          const youth = people.filter(isYouth).length;
          const youthW = people.filter(a => isF(a) && isYouth(a)).length;
          const youthM = people.filter(a => isM(a) && isYouth(a)).length;
          const nonYouth = people.length - youth;
          const nonYouthW = people.filter(a => isF(a) && !isYouth(a)).length;
          const nonYouthM = people.filter(a => isM(a) && !isYouth(a)).length;
          return [constituency, people.length, women, men, youth, youthW, youthM, nonYouth, nonYouthW, nonYouthM];
        });

      // Totals row
      const totals = ["TOTAL", b1.length,
        b1.filter(isF).length,
        b1.filter(isM).length,
        b1.filter(isYouth).length,
        b1.filter(a => isF(a) && isYouth(a)).length,
        b1.filter(a => isM(a) && isYouth(a)).length,
        b1.filter(a => !isYouth(a)).length,
        b1.filter(a => isF(a) && !isYouth(a)).length,
        b1.filter(a => isM(a) && !isYouth(a)).length,
      ];

      const csv = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map(r => r.map(escapeCsvValue).join(",")),
        totals.map(escapeCsvValue).join(","),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BYWC-batch1-constituency-stats-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setBatchOneStatsExporting(false);
    }
  }

  async function handleExportBatchTwoSelectedCsv() {
    setBatchTwoExporting(true);
    try {
      const { data, error } = await supabase
        .from(APPLICATIONS_TABLE)
        .select("constituency, first_name, last_name, omang, phone, email, gender, district")
        .eq("status", "Accepted")
        .order("constituency", { ascending: true });

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        alert("No Batch 2 accepted applicants found.");
        return;
      }

      const headers = ["Constituency", "Full Name", "Omang", "Phone", "Email", "Gender", "District"];
      const rows = data.map((r: any) => [
        r.constituency,
        `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
        r.omang,
        r.phone,
        r.email,
        r.gender,
        r.district,
      ]);

      const csvContent = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row: any[]) => row.map(escapeCsvValue).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `BYWC-batch-2-accepted-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(`Batch 2 export complete. ${data.length} records exported.`);
    } catch (err: any) {
      alert("Batch 2 export failed: " + err.message);
    } finally {
      setBatchTwoExporting(false);
    }
  }

  function handleExportAcceptedApplicantsCsv() {
    if (acceptedApplications.length === 0) {
      alert("No accepted applicants found to export.");
      return;
    }

    const headers = [
      "Constituency",
      "First Name",
      "Last Name",
      "Omang",
      "Phone",
      "Email",
      "Status",
      "Selection Bucket",
    ];

    const rows = acceptedApplications.map((application) => [
      application.constituency,
      application.firstName,
      application.lastName,
      application.omang,
      application.phone,
      application.email,
      application.status,
      application.selectionBucket,
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
    link.download = `BYWC-overall-accepted-applicants-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportNearbyReserveApplicantsCsv() {
    if (nearbyReserveApplications.length === 0) {
      alert("No 350km reserve applicants found to export.");
      return;
    }

    const headers = [
      "Constituency",
      "First Name",
      "Last Name",
      "Omang",
      "Phone",
      "Email",
      "Employment Status",
      "Score",
      "Status",
      "Selection Bucket",
    ];

    const rows = nearbyReserveApplications.map((application) => [
      application.constituency,
      application.firstName,
      application.lastName,
      application.omang,
      application.phone,
      application.email,
      application.employmentStatus,
      application.autoReviewScore ?? "",
      application.status,
      application.selectionBucket,
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
    link.download = `BYWC-350km-nearby-reserve-top-50-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportArrivalRegisterCsv() {
    if (acceptedApplications.length === 0) {
      alert("No accepted applicants found to export for arrival registration.");
      return;
    }

    const headers = [
      "Arrival Status",
      "Arrived At",
      "Registration Status",
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Constituency",
      "Dietary Restrictions",
      "Dietary Details",
      "Medical Conditions / Allergies",
      "Current Medication",
      "Emergency Contact Name",
      "Emergency Contact Number",
      "Emergency Contact Relationship",
      "Disclaimer Accepted",
      "Disclaimer Accepted At",
    ];

    const rows = acceptedApplications.map((application) => [
      application.arrivalStatus || "Not Arrived",
      application.arrivedAt ? new Date(application.arrivedAt).toLocaleString() : "",
      application.registrationStatus || "Pending",
      application.firstName,
      application.lastName,
      application.phone,
      application.email,
      application.constituency,
      application.hasDietaryRestrictions ? "Yes" : "No",
      application.dietaryRestrictionsDetails || "",
      application.knownMedicalConditions || "",
      application.currentMedication || "",
      application.emergencyContactName || "",
      application.emergencyContactNumber || "",
      application.emergencyContactRelationship || "",
      application.arrivalDisclaimerAccepted ? "Yes" : "No",
      application.arrivalDisclaimerAcceptedAt
        ? new Date(application.arrivalDisclaimerAcceptedAt).toLocaleString()
        : "",
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
    link.download = `BYWC-arrival-register-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportArrivedCsv() {
    const arrived = acceptedApplications.filter(
      (a) => a.arrivalStatus === "Arrived",
    );
    if (arrived.length === 0) {
      alert("No arrived participants found.");
      return;
    }
    const headers = [
      "Arrived At",
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Constituency",
      "Dietary Restrictions",
      "Dietary Details",
      "Medical Conditions / Allergies",
      "Emergency Contact Name",
      "Emergency Contact Number",
    ];
    const rows = arrived.map((a) => [
      a.arrivedAt ? new Date(a.arrivedAt).toLocaleString() : "",
      a.firstName,
      a.lastName,
      a.phone,
      a.email,
      a.constituency,
      a.hasDietaryRestrictions ? "Yes" : "No",
      a.dietaryRestrictionsDetails || "",
      a.knownMedicalConditions || "",
      a.emergencyContactName || "",
      a.emergencyContactNumber || "",
    ]);
    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `BYWC-arrived-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportNotArrivedCsv() {
    const notArrived = acceptedApplications.filter(
      (a) => a.arrivalStatus !== "Arrived",
    );
    if (notArrived.length === 0) {
      alert("No pending participants found.");
      return;
    }
    const headers = [
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Constituency",
      "Dietary Restrictions",
      "Dietary Details",
      "Medical Conditions / Allergies",
      "Emergency Contact Name",
      "Emergency Contact Number",
    ];
    const rows = notArrived.map((a) => [
      a.firstName,
      a.lastName,
      a.phone,
      a.email,
      a.constituency,
      a.hasDietaryRestrictions ? "Yes" : "No",
      a.dietaryRestrictionsDetails || "",
      a.knownMedicalConditions || "",
      a.emergencyContactName || "",
      a.emergencyContactNumber || "",
    ]);
    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `BYWC-not-arrived-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportBatch2NotArrivedCsv() {
    const notArrived = batch2Applications.filter(a => a.arrivalStatus !== "Arrived");
    if (notArrived.length === 0) { alert("All Batch 2 participants have arrived!"); return; }
    const headers = ["First Name","Last Name","Omang","Phone","Email","Constituency","Gender","Label"];
    const rows = notArrived.map(a => {
      const bucket = a.selectionBucket || "";
      const labelMatch = bucket.match(/Batch 2 - ([^/]+)/);
      return [a.firstName, a.lastName, a.omang, a.phone, a.email, a.constituency, a.gender, labelMatch ? labelMatch[1].trim() : "Batch 2"];
    });
    const csvContent = [headers.map(escapeCsvValue).join(","), ...rows.map(r => r.map(escapeCsvValue).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BYWC-Batch2-NotArrived-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleAddSpecialMember() {
    const d = addSpecialDraft;
    if (!d.firstName.trim() || !d.lastName.trim()) { alert("First and last name are required."); return; }
    setAddSpecialSaving(true);
    const bucketMap: Record<string, string> = {
      "Boteti":    "Published - Applicant Visible / Batch 2 - Boteti Special",
      "Chomeleng": "Published - Applicant Visible / Batch 2 - Chomeleng Special",
      "BERA":      "Published - Applicant Visible / Batch 2 - BERA Special",
    };
    const bucket = bucketMap[d.group] || bucketMap["Boteti"];
    const slug = `${d.firstName.toLowerCase().replace(/\s+/g,"")}.${d.lastName.toLowerCase().replace(/\s+/g,"")}`;
    const appId = `BYWC-2026-${d.group.toUpperCase()}-MANUAL-${Date.now()}`;
    const record = {
      application_id: appId,
      first_name: d.firstName.trim(),
      last_name: d.lastName.trim(),
      email: d.email.trim() || `noemail.${slug}.manual@bywc.internal`,
      phone: d.phone.trim() || null,
      omang: d.omang.trim() || null,
      gender: d.gender || null,
      age: d.age ? parseInt(d.age) : null,
      constituency: d.constituency.trim() || null,
      town_village: null,
      disability_status: "No",
      citizenship: "Citizen",
      employment_status: "",
      interest_area: "",
      highest_qualification: "",
      bgcse_points: null,
      preferred_language: "",
      status: "Accepted",
      selection_bucket: bucket,
      arrival_status: "Arrived",
      arrived_at: new Date().toISOString(),
      arrival_confirmed_by: currentAdminEmail || "admin",
      submitted_at: new Date().toISOString(),
    };
    try {
      const { error } = await supabase.from(APPLICATIONS_TABLE).insert(record);
      if (error) { alert("Failed to add: " + error.message); return; }
      await loadBatch2Applications();
      setAddSpecialOpen(false);
      setAddSpecialDraft({ firstName: "", lastName: "", email: "", phone: "", omang: "", gender: "", age: "", constituency: "", group: "Boteti" });
    } finally {
      setAddSpecialSaving(false);
    }
  }

  function handleExportBatch2Csv(mode: "combined" | "actual" | "special" | "chomeleng" | "bera") {
    const all = batch2Applications;
    const people =
      mode === "combined"  ? all :
      mode === "actual"    ? all.filter(a => !isBatch2Special(a)) :
      mode === "chomeleng" ? all.filter(isChomelenSpecial) :
      mode === "bera"      ? all.filter(isBeraSpecial) :
                             all.filter(isBotetiSpecial);
    if (people.length === 0) { alert("No records for this selection."); return; }
    const label = mode === "combined" ? "Combined" : mode === "actual" ? "Actual" : mode === "chomeleng" ? "ChomelenSpecial" : mode === "bera" ? "BERASpecial" : "BotetiSpecial";
    const headers = ["First Name","Last Name","Omang","Phone","Email","Constituency","Gender","Arrival","Group"];
    const rows = people.map(a => {
      const bucket = a.selectionBucket || "";
      const groupMatch = bucket.match(/Batch 2 - ([^/]+)/);
      return [a.firstName, a.lastName, a.omang, a.phone, a.email, a.constituency, a.gender,
        a.arrivalStatus || "Not Arrived",
        groupMatch ? groupMatch[1].trim() : "Batch 2"];
    });
    const csv = [headers.map(escapeCsvValue).join(","), ...rows.map(r => r.map(escapeCsvValue).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BYWC-Batch2-${label}-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setBatch2ExportMenuOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin-login");
  }

  async function loadLetterTemplate() {
    setLetterLoading(true);
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["acceptance_letter_subject", "acceptance_letter_body"]);
      if (data && data.length > 0) {
        const subj = data.find((r) => r.key === "acceptance_letter_subject")?.value;
        const body = data.find((r) => r.key === "acceptance_letter_body")?.value;
        if (subj) setLetterSubject(subj);
        if (body) setLetterBody(body);
      }
    } catch {
      // admin_settings table may not exist yet — keep code defaults
    }
    setLetterLoading(false);
  }

  async function saveLetterTemplate() {
    setLetterSaving(true);
    await supabase.from("admin_settings").upsert([
      {
        key: "acceptance_letter_subject",
        value: letterSubject,
        updated_at: new Date().toISOString(),
      },
      {
        key: "acceptance_letter_body",
        value: letterBody,
        updated_at: new Date().toISOString(),
      },
    ]);
    setLetterSaving(false);
    setLetterSaved(true);
    setTimeout(() => setLetterSaved(false), 3000);
  }

  async function handlePreviewLetter() {
    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Try to load letterhead background — skip silently if missing
      try {
        const response = await fetch("/letterhead.png");
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((d, b) => d + String.fromCharCode(b), ""),
          );
          doc.addImage(`data:image/png;base64,${base64}`, "PNG", 0, 0, 210, 297);
        }
      } catch {
        // No letterhead — letter will render on plain white
      }

      const fullName = "SAMPLE APPLICANT";
      const letterId = "BYWC/OGT/2026/B2-PREVIEW";
      const constituency = "Serowe North";
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      });

      const fill = (text: string) =>
        text
          .replace(/\{\{fullName\}\}/g, fullName)
          .replace(/\{\{firstName\}\}/g, "Sample")
          .replace(/\{\{refNo\}\}/g, letterId)
          .replace(/\{\{constituency\}\}/g, constituency)
          .replace(/\{\{date\}\}/g, today);

      const rawSubject = letterSubject || "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026";
      const rawBody = letterBody || "We are pleased to inform you that your application has been successful.";

      const subject = fill(rawSubject);
      const paragraphs = fill(rawBody).split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

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
      doc.text(fullName, 15, 57);
      doc.text(`${constituency}, Botswana`, 15, 63);

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
        const lines = doc.splitTextToSize(para, 180);
        if (y + lines.length * lineH > 248) break;
        doc.text(lines, 15, y);
        y += lines.length * lineH + 5;
      }

      doc.save("BYWC-Acceptance-Letter-PREVIEW.pdf");
    } catch (err) {
      console.error("Letter preview failed:", err);
      alert("Could not generate preview. Please try again.");
    }
  }

  const totalApplications = dashboardStats.total;
  const submittedCount = dashboardStats.submitted;
  const internalBatchOneCount = dashboardStats.internalBatchOne;
  const batch2Count = dashboardStats.batch2;
  const remainingEligibleCount = dashboardStats.remainingEligible;
  const acceptedCount = dashboardStats.accepted;
  const rejectedCount = dashboardStats.rejected;
  const deferredCount = dashboardStats.deferred;
  const womenCount = dashboardStats.women;
  const menCount = dashboardStats.men;
  const constituenciesRepresentedCount = reportingStats?.constituenciesWithApplications ?? 0;
  const batch2DeferredCount = useMemo(
    () => batch2Applications.filter(a => (a.selectionBucket || "").includes("Deferred")).length,
    [batch2Applications]
  );

  const acceptedApplicationsSearchTerm = normalize(
    acceptedApplicationsSearchInput,
  );

  const visibleAcceptedApplications = useMemo(() => {
    if (!acceptedApplicationsSearchTerm) return acceptedApplications;

    return acceptedApplications.filter((application) => {
      const searchableText = [
        application.firstName,
        application.lastName,
        application.email,
        application.phone,
        application.omang,
        application.constituency,
        application.selectionBucket,
      ]
        .map((value) => normalize(value))
        .join(" " );

      return searchableText.includes(acceptedApplicationsSearchTerm);
    });
  }, [acceptedApplications, acceptedApplicationsSearchTerm]);

  const acceptedBatchOneCount = acceptedApplications.filter((application) =>
    isInternalBatchOneSelection(application.selectionBucket),
  ).length;

  const acceptedBatch2Applications = useMemo(
    () => acceptedApplications.filter((a) => isInternalBatchTwoSelection(a.selectionBucket)),
    [acceptedApplications],
  );

  const acceptedBatch2Count = acceptedBatch2Applications.length;

  const acceptedManualOrOtherCount = acceptedApplications.filter(
    (a) => !isInternalBatchOneSelection(a.selectionBucket) && !isInternalBatchTwoSelection(a.selectionBucket),
  ).length;

  const batch2SearchTerm = normalize(batch2SearchInput);
  const visibleBatch2Applications = useMemo(() => {
    if (!batch2SearchTerm) return batch2Applications;
    return batch2Applications.filter((application) => {
      const text = [
        application.firstName, application.lastName, application.email,
        application.omang, application.phone, application.constituency,
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(batch2SearchTerm);
    });
  }, [batch2Applications, batch2SearchTerm]);

  const isBotetiSpecial = (a: Application) => (a.selectionBucket || "").includes("Boteti Special");
  const isChomelenSpecial = (a: Application) => (a.selectionBucket || "").includes("Chomeleng Special");
  const isBeraSpecial = (a: Application) => (a.selectionBucket || "").includes("BERA Special");
  const isBatch2Special = (a: Application) => isBotetiSpecial(a) || isChomelenSpecial(a) || isBeraSpecial(a);
  const isLuckyOnesPromoted = (a: Application) => (a.selectionBucket || "").includes("Lucky Ones Promoted");
  const isLuckyOnesReviewed = (a: Application) => (a.selectionBucket || "").includes("Remaining Eligible - Reviewed");

  const batch2ConstituencyRows = useMemo(() => {
    const breakdown = batch2Applications.reduce(
      (acc, application) => {
        if (isBatch2Special(application)) return acc; // exclude special groups from constituency count
        const constituency = application.constituency || "Unknown";
        acc[constituency] = (acc[constituency] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(breakdown).sort((a, b) => a[0].localeCompare(b[0]));
  }, [batch2Applications]);

  const acceptedConstituencyRows = useMemo(() => {
    const breakdown = acceptedApplications.reduce(
      (acc, application) => {
        const constituency = application.constituency || "Unknown";
        acc[constituency] = (acc[constituency] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(breakdown).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [acceptedApplications]);

  const nearbyReserveSearchTerm = normalize(nearbyReserveSearchInput);

  const visibleNearbyReserveApplications = useMemo(() => {
    if (!nearbyReserveSearchTerm) return nearbyReserveApplications;

    return nearbyReserveApplications.filter((application) => {
      const searchableText = [
        application.firstName,
        application.lastName,
        application.email,
        application.phone,
        application.omang,
        application.constituency,
        application.employmentStatus,
        application.selectionBucket,
      ]
        .map((value) => normalize(value))
        .join(" " );

      return searchableText.includes(nearbyReserveSearchTerm);
    });
  }, [nearbyReserveApplications, nearbyReserveSearchTerm]);

  const nearbyReserveConstituencyRows = useMemo(() => {
    const breakdown = nearbyReserveApplications.reduce(
      (acc, application) => {
        const constituency = application.constituency || "Unknown";
        acc[constituency] = (acc[constituency] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(breakdown).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [nearbyReserveApplications]);

  const nearbyReserveUnemployedCount = nearbyReserveApplications.filter(
    (application) => normalize(application.employmentStatus).includes("unemployed"),
  ).length;

  const nearbyReserveSelfEmployedCount = nearbyReserveApplications.filter(
    (application) => normalize(application.employmentStatus).includes("self"),
  ).length;

  const programmeAcceptedCount = acceptedApplications.length;
  const programmeRemainingSeats = Math.max(
    TOTAL_PROGRAMME_INTAKE - programmeAcceptedCount,
    0,
  );
  const nearbyReserveAvailableToPublishCount = nearbyReserveApplications.length;
  const nearbyReserveMaxPublishable = Math.min(
    programmeRemainingSeats,
    nearbyReserveAvailableToPublishCount,
  );
  const arrivalSearchTerm = normalize(arrivalSearchInput);

  const arrivedApplicationsCount = acceptedApplications.filter(
    (application) => application.arrivalStatus === "Arrived",
  ).length;

  const pendingArrivalApplicationsCount = Math.max(
    acceptedApplications.length - arrivedApplicationsCount,
    0,
  );

  const arrivalRate = acceptedApplications.length
    ? Math.round((arrivedApplicationsCount / acceptedApplications.length) * 1000) / 10
    : 0;

  const dietaryRestrictionsCount = acceptedApplications.filter(
    (application) => Boolean(application.hasDietaryRestrictions),
  ).length;

  const medicalDeclarationsCount = acceptedApplications.filter((application) =>
    Boolean((application.knownMedicalConditions || "").trim() || (application.currentMedication || "").trim()),
  ).length;

  const disabilityCount = acceptedApplications.filter(
    (application) => isYes(application.disabilityStatus),
  ).length;

  const visibleArrivalApplications = useMemo(() => {
    let filtered = acceptedApplications;

    if (arrivalFilter === "arrived") {
      filtered = filtered.filter((application) => application.arrivalStatus === "Arrived");
    } else if (arrivalFilter === "not_arrived") {
      filtered = filtered.filter((application) => application.arrivalStatus !== "Arrived");
    } else if (arrivalFilter === "dietary") {
      filtered = filtered.filter((application) => Boolean(application.hasDietaryRestrictions));
    } else if (arrivalFilter === "disability") {
      filtered = filtered.filter((application) => isYes(application.disabilityStatus));
    } else if (arrivalFilter === "medical") {
      filtered = filtered.filter((application) =>
        Boolean((application.knownMedicalConditions || "").trim() || (application.currentMedication || "").trim()),
      );
    }

    if (!arrivalSearchTerm) return filtered;

    return filtered.filter((application) => {
      const searchableText = [
        application.firstName,
        application.lastName,
        application.email,
        application.phone,
        application.omang,
        application.constituency,
        application.arrivalStatus,
        application.registrationStatus,
        application.dietaryRestrictionsDetails,
        application.knownMedicalConditions,
        application.currentMedication,
        application.emergencyContactName,
        application.emergencyContactNumber,
      ]
        .map((value) => normalize(value))
        .join(" ");

      return searchableText.includes(arrivalSearchTerm);
    });
  }, [acceptedApplications, arrivalFilter, arrivalSearchTerm]);

  const latestArrivals = acceptedApplications
    .filter((application) => application.arrivalStatus === "Arrived" && application.arrivedAt)
    .sort((a, b) => (b.arrivedAt || "").localeCompare(a.arrivedAt || ""))
    .slice(0, 10);

  // Constituency breakdown: arrived + accepted only (excludes deferred — acceptedApplications is already status=Accepted)
  const arrivedConstituencyBreakdown = useMemo(() => {
    const arrived = acceptedApplications.filter(
      (app) => app.arrivalStatus === "Arrived",
    );
    const map: Record<string, { women: number; men: number; total: number }> = {};
    for (const app of arrived) {
      const c = app.constituency || "Unknown";
      if (!map[c]) map[c] = { women: 0, men: 0, total: 0 };
      const g = normalize(app.gender);
      if (g === "female") map[c].women++;
      else if (g === "male") map[c].men++;
      map[c].total++;
    }
    const official = constituencies.map(
      (c) => [c, map[c] ?? { women: 0, men: 0, total: 0 }] as const,
    );
    const extras = Object.entries(map)
      .filter(([c]) => !constituencies.includes(c))
      .map(([c, s]) => [c, s] as const);
    return [...official, ...extras];
  }, [acceptedApplications]);

  const arrivedWomenTotal = arrivedConstituencyBreakdown.reduce((s, [, r]) => s + r.women, 0);
  const arrivedMenTotal = arrivedConstituencyBreakdown.reduce((s, [, r]) => s + r.men, 0);
  const arrivedGrandTotal = arrivedWomenTotal + arrivedMenTotal;

  // Batch 2 pool tracker: eligible candidates by constituency (excludes Accepted, Deferred)
  const batchPoolTracker = useMemo(() => {
    const eligiblePool = applications.filter((app) =>
      app.status !== "Accepted" &&
      app.status !== "Rejected" &&
      app.status !== "Deferred" &&
      !(app.selectionBucket || "").includes("Rejected") &&
      !(app.selectionBucket || "").includes("Batch 2 -")
    );
    const deferredPool2 = applications.filter((app) =>
      app.status === "Deferred" || (app.selectionBucket || "").includes("Deferred")
    );
    const map: Record<string, { eligible: number; women: number; men: number; youth: number; deferred: number; isFar: boolean }> = {};
    for (const c of constituencies) {
      map[c] = { eligible: 0, women: 0, men: 0, youth: 0, deferred: 0, isFar: FAR_450KM_CONSTITUENCIES.includes(c) };
    }
    for (const app of eligiblePool) {
      const c = app.constituency || "Unknown";
      if (!map[c]) map[c] = { eligible: 0, women: 0, men: 0, youth: 0, deferred: 0, isFar: false };
      map[c].eligible++;
      const g = normalize(app.gender);
      if (g === "female") map[c].women++;
      else if (g === "male") map[c].men++;
      const age = Number(app.age);
      if (!Number.isNaN(age) && age <= 35) map[c].youth++;
    }
    for (const app of deferredPool2) {
      const c = app.constituency || "Unknown";
      if (!map[c]) map[c] = { eligible: 0, women: 0, men: 0, youth: 0, deferred: 0, isFar: false };
      map[c].deferred++;
    }
    return constituencies
      .map((c) => [c, map[c] ?? { eligible: 0, women: 0, men: 0, youth: 0, deferred: 0, isFar: false }] as const)
      .sort((a, b) => {
        // Far first, then by eligible count descending
        if (a[1].isFar !== b[1].isFar) return a[1].isFar ? -1 : 1;
        return b[1].eligible - a[1].eligible;
      });
  }, [applications]);

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
        Deferred: [],
        Completed: [],
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
    { label: "All", value: "All", count: totalApplications },
    {
      label: "Batch 1",
      value: "Internal Batch 1",
      count: internalBatchOneCount,
    },
    {
      label: "Batch 2",
      value: "Internal Batch 2",
      count: batch2Count,
    },
    {
      label: "Waitlist",
      value: "Internal Remaining Eligible",
      count: remainingEligibleCount,
    },
    { label: "Accepted", value: "Accepted", count: acceptedCount },
    { label: "Unselected", value: "Submitted", count: submittedCount },
    { label: "Rejected", value: "Internal Rejected", count: rejectedCount },
    { label: "Deferred", value: "Deferred", count: deferredCount },
  ];

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto min-h-screen max-w-[1800px] p-4 lg:p-6">
        <nav className="mb-4 rounded-[24px] border border-white/[0.08] bg-[#0b1028] px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-orange-500/20 bg-white/[0.04] px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-[10px] font-black text-white">
                BY
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-orange-400">BYWC</p>
                <p className="text-[11px] font-bold text-white">Admin Control</p>
              </div>
            </div>

            {/* Section tabs — centred */}
            <div className="flex flex-1 items-center justify-center gap-1">
              {(
                [
                  { id: "applications", label: "Applicants" },
                  { id: "programme", label: "Programme" },
                  { id: "selection", label: "Selection" },
                  { id: "constituency-breakdown", label: "Constituencies" },
                  { id: "compliance", label: "Compliance" },
                  { id: "tools", label: "Tools" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                    activeSection === item.id ||
                    (item.id === "applications" && ["batch1","waitlist","rejected","deferred","women","men"].includes(activeSection))
                      ? "bg-white text-[#050816] shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Action buttons — right */}
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleAuditLogs}
                className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Activity Log
              </button>

              <button
                type="button"
                onClick={handleToggleDataRequests}
                className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Compliance
              </button>

              <details className="group relative">
                <summary className="list-none cursor-pointer rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 [&::-webkit-details-marker]:hidden">
                  Actions ▾
                </summary>

                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                  <button
                    type="button"
                    onClick={handleExportCurrentPageCsv}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-emerald-300 transition hover:bg-white/10"
                  >
                    Export Current Page
                  </button>

                  <button
                    type="button"
                    onClick={handleExportFullBackupCsv}
                    disabled={fullBackupExporting}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-purple-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {fullBackupExporting ? "Exporting..." : "Full Backup"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBatchOneSelectedCsv}
                    disabled={batchOneExporting}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-emerald-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {batchOneExporting ? "Exporting..." : "Export Batch 1"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBatch1Stats}
                    disabled={batchOneStatsExporting}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-sky-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {batchOneStatsExporting ? "Exporting..." : "Batch 1 — Constituency Stats"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBatchTwoSelectedCsv}
                    disabled={batchTwoExporting}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-teal-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {batchTwoExporting ? "Exporting..." : "Export Batch 2"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportStatsCsv}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-orange-300 transition hover:bg-white/10"
                  >
                    Export Stats
                  </button>

                  <button
                    type="button"
                    onClick={() => loadApplications(false, currentPage)}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-blue-300 transition hover:bg-white/10"
                  >
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleConstituencyDispatch}
                    className="block w-full rounded-xl px-4 py-3 text-left text-xs font-black text-yellow-300 transition hover:bg-white/10"
                  >
                    Dispatch
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


        <header className="mb-5 rounded-[26px] border border-white/[0.07] bg-[#0b1028] p-5 lg:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                BYWC Oil &amp; Gas Training
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage applications, selections, arrivals and compliance in one place.
              </p>
              {lastUpdated && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live · updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="rounded-[20px] border border-orange-500/20 bg-orange-500/[0.06] p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">
                    Selection Tools
                  </p>
                  <h2 className="mt-0.5 text-base font-black text-white">
                    Master Selection
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    Run Batch 2 hidden selection — 480 seats, 450km+ priority, gender floor, deferred sprinkle. Applicants see Submitted until published.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleMasterSelection}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting}
                    className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
                  >
                    {masterSelecting ? "Running..." : "Run Hidden Selection"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishSelectionResults}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting || publishingBatch2}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {publishingSelection
                      ? "Publishing..."
                      : "Publish Results to Dashboard"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishBatch2}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting || publishingBatch2 || publishingRejected || markingBatch1Arrived || sendingBatch2Messages}
                    className="rounded-2xl bg-teal-500 px-5 py-3 text-xs font-black text-white transition hover:bg-teal-600 disabled:opacity-50"
                  >
                    {publishingBatch2
                      ? "Publishing Batch 2..."
                      : "Publish Batch 2"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendBatch2InboxMessages}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting || publishingBatch2 || publishingRejected || markingBatch1Arrived || sendingBatch2Messages}
                    className="rounded-2xl bg-indigo-500 px-5 py-3 text-xs font-black text-white transition hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {sendingBatch2Messages
                      ? "Sending Messages..."
                      : "Send Batch 2 Inbox Messages"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishRejected}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting || publishingBatch2 || publishingRejected || markingBatch1Arrived}
                    className="rounded-2xl bg-red-500 px-5 py-3 text-xs font-black text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {publishingRejected
                      ? "Publishing Rejected..."
                      : "Publish Rejected"}
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkBatch1Arrived}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting || publishingBatch2 || publishingRejected || markingBatch1Arrived}
                    className="rounded-2xl bg-violet-500 px-5 py-3 text-xs font-black text-white transition hover:bg-violet-600 disabled:opacity-50"
                  >
                    {markingBatch1Arrived
                      ? "Marking Arrived..."
                      : "Mark Batch 1 Arrived"}
                  </button>

                  <button
                    type="button"
                    onClick={handleNearbyReserveSelection}
                    disabled={masterSelecting || publishingSelection || nearbyReserveSelecting}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-50 sm:col-span-2"
                  >
                    {nearbyReserveSelecting
                      ? "Creating Reserve..."
                      : "Create 350km Reserve Top 50"}
                  </button>
                </div>

                <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-slate-300">
                  Current safety mode: hidden selection does not notify
                  applicants. The 350km reserve creates a separate confirmation
                  pool from eligible/waitlist/submitted applicants only. Batch 1
                  and already accepted applicants are locked out.
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

        {/* Stats bar — always visible regardless of active tab */}
        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <StatCard title="Total" value={totalApplications} accent="slate" onClick={() => { setActiveSection("applications"); setStatusFilter("All"); setCurrentPage(1); }} />
          <StatCard title="Batch 1" value={internalBatchOneCount} accent="orange" onClick={() => { setActiveSection("batch1"); setStatusFilter("Internal Batch 1"); setSearchInput(""); setSearchTerm(""); setGenderFilter("All"); setCurrentPage(1); }} />
          <StatCard title="Batch 2" value={batch2Count} accent="orange" onClick={() => { setActiveSection("selection"); }} />
          <StatCard title="Waitlist" value={remainingEligibleCount} accent="yellow" onClick={() => { setActiveSection("waitlist"); setStatusFilter("Internal Remaining Eligible"); setSearchInput(""); setSearchTerm(""); setGenderFilter("All"); setCurrentPage(1); }} />
          <StatCard title="Lucky Ones" value={luckyOnesApplications.length} accent="yellow" onClick={() => { setActiveSection("lucky-ones"); loadLuckyOnes(); }} />
          <StatCard title="B2 Deferred" value={batch2DeferredCount} accent="amber" onClick={() => { setActiveSection("selection"); }} />
          <StatCard title="Rejected" value={rejectedCount} accent="red" onClick={() => { setActiveSection("rejected"); setStatusFilter("Internal Rejected"); setSearchInput(""); setSearchTerm(""); setGenderFilter("All"); setCurrentPage(1); }} />
          <StatCard title="Deferred" value={deferredCount} accent="amber" onClick={() => { setActiveSection("deferred"); setStatusFilter("Deferred"); setSearchInput(""); setSearchTerm(""); setGenderFilter("All"); setCurrentPage(1); }} />
          <StatCard title="Women" value={womenCount} accent="pink" onClick={() => { setActiveSection("women"); setStatusFilter("All"); setGenderFilter("Female"); setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} />
          <StatCard title="Men" value={menCount} accent="slate" onClick={() => { setActiveSection("men"); setStatusFilter("All"); setGenderFilter("Male"); setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} />
          <StatCard title="Constituencies" value={constituenciesRepresentedCount} accent="emerald" onClick={() => { setActiveSection("compliance"); }} />
        </section>

        {/* ── Programme & Arrivals tab ── */}
        {activeSection === "programme" && (
        <>

        {/* Manual Add Applicant */}
        <section className="mb-5 rounded-[30px] border border-blue-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-400">
              Admin Tool
            </p>
            <h2 className="mt-0.5 text-base font-black text-white">
              Add Applicant Manually
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Directly insert a person into the database. Duplicate Omang check is enforced. Use for manual entries that bypassed the online form.
            </p>
          </div>

          <form onSubmit={handleAddApplicant} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name *</span>
              <input required value={addApplicantForm.firstName}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, firstName: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="Katlego" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name *</span>
              <input required value={addApplicantForm.lastName}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, lastName: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="Mosweu" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email *</span>
              <input required type="email" value={addApplicantForm.email}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="email@example.com" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Omang / ID *</span>
              <input required value={addApplicantForm.omang}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, omang: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="1234567890" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</span>
              <input value={addApplicantForm.phone}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, phone: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="+267 7X XXX XXX" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</span>
              <input type="date" value={addApplicantForm.dateOfBirth}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</span>
              <select value={addApplicantForm.gender}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, gender: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                <option>Female</option><option>Male</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Constituency</span>
              <select value={addApplicantForm.constituency}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, constituency: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                {constituencies.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">District</span>
              <input value={addApplicantForm.district}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, district: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="Central" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Town / Village</span>
              <input value={addApplicantForm.townVillage}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, townVillage: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="Maun" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Highest Qualification</span>
              <select value={addApplicantForm.highestQualification}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, highestQualification: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                <option>BGCSE/IGCSE</option>
                <option>Certificate</option>
                <option>Diploma</option>
                <option>Degree</option>
                <option>Postgraduate</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">BGCSE Points</span>
              <input type="number" min="0" max="120" value={addApplicantForm.bgcsePoints}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, bgcsePoints: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
                placeholder="36" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employment Status</span>
              <select value={addApplicantForm.employmentStatus}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, employmentStatus: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                <option>Unemployed</option>
                <option>Employed Part-Time</option>
                <option>Employed Full-Time</option>
                <option>Self-Employed</option>
                <option>Student</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disability</span>
              <select value={addApplicantForm.disabilityStatus}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, disabilityStatus: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                <option>No</option><option>Yes</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">OVC Status</span>
              <select value={addApplicantForm.ovcStatus}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, ovcStatus: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                <option>No</option><option>Yes</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
              <select value={addApplicantForm.status}
                onChange={(e) => setAddApplicantForm((p) => ({ ...p, status: e.target.value as ApplicationStatus }))}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                <option value="Remaining Eligible">Remaining Eligible</option>
                <option value="Accepted">Accepted</option>
                <option value="Submitted">Submitted (unreviewed)</option>
                <option value="Deferred">Deferred</option>
              </select>
            </label>

            {/* Feedback messages + submit — span full width */}
            {addApplicantError && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                {addApplicantError}
              </div>
            )}
            {addApplicantSuccess && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300">
                {addApplicantSuccess}
              </div>
            )}
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={addApplicantLoading}
                className="rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {addApplicantLoading ? "Adding..." : "Add Applicant"}
              </button>
              <button
                type="button"
                onClick={() => { setAddApplicantForm(emptyAddForm); setAddApplicantError(""); setAddApplicantSuccess(""); }}
                className="rounded-2xl border border-white/10 px-6 py-2.5 text-xs font-black text-slate-400 transition hover:text-white"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="mb-5 rounded-[30px] border border-emerald-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                Overall Accepted Applicants
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                All people currently marked as Accepted
              </h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                This section shows all status = Accepted records. Use the Batch 2 section below for the full Batch 2 breakdown.
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Total accepted: {acceptedApplications.length.toLocaleString()} • Batch 1: {acceptedBatchOneCount.toLocaleString()} • Batch 2: {acceptedBatch2Count.toLocaleString()} • Other: {acceptedManualOrOtherCount.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadAcceptedApplications}
                disabled={acceptedApplicationsLoading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {acceptedApplicationsLoading ? "Refreshing..." : "Refresh Accepted"}
              </button>

              <button
                type="button"
                onClick={handleExportAcceptedApplicantsCsv}
                disabled={acceptedApplications.length === 0}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export Accepted CSV
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Overall Accepted</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{acceptedApplications.length.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">All status = Accepted records</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Batch 1 Accepted</p>
              <p className="mt-2 text-2xl font-black text-blue-300">{acceptedBatchOneCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Accepted with Batch 1 bucket</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Batch 2 Accepted</p>
              <p className="mt-2 text-2xl font-black text-orange-300">{acceptedBatch2Count.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Accepted with Batch 2 bucket</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="search"
                  value={acceptedApplicationsSearchInput}
                  onChange={(event) =>
                    setAcceptedApplicationsSearchInput(event.target.value)
                  }
                  placeholder="Search accepted by name, Omang, phone, email or constituency..."
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:bg-[#0f172a]"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                {acceptedApplicationsLoading ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">
                    Loading accepted applicants...
                  </div>
                ) : visibleAcceptedApplications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">
                    No accepted applicants found.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup>
                        <col className="w-[24%]" />
                        <col className="w-[18%]" />
                        <col className="w-[17%]" />
                        <col className="w-[17%]" />
                        <col className="w-[24%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Bucket</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {visibleAcceptedApplications.map((application) => (
                          <tr
                            key={application.id}
                            className="align-top text-slate-300 transition hover:bg-white/[0.03]"
                          >
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => setSelectedApplication(application)}
                                className="text-left"
                              >
                                <p className="font-black text-white underline-offset-2 hover:underline">
                                  {application.firstName} {application.lastName}
                                </p>
                                <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                                  {application.email || "No email"}
                                </p>
                              </button>
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.omang || "-"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.phone || "-"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.constituency || "Unknown"}
                            </td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-300">
                                {application.selectionBucket || "Accepted"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Accepted By Constituency</p>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {acceptedConstituencyRows.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">
                    No accepted constituency data yet.
                  </p>
                ) : (
                  acceptedConstituencyRows.map(([constituency, count]) => (
                    <div
                      key={constituency}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2"
                    >
                      <span className="text-xs font-bold text-slate-300">
                        {constituency}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-white">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[30px] border border-orange-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">
                Batch 2 Selections
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Batch 2 — {batch2Applications.length.toLocaleString()} people selected
              </h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                All applicants assigned a Batch 2 bucket. 480 seats, 450km+ constituency priority, gender floor, deferred sprinkle.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadAcceptedApplications}
                disabled={acceptedApplicationsLoading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {acceptedApplicationsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Total Batch 2</p>
              <p className="mt-2 text-2xl font-black text-orange-300">{acceptedBatch2Count.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
              <p className="mt-2 text-2xl font-black text-white">{batch2ConstituencyRows.length}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">out of 61</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Women</p>
              <p className="mt-2 text-2xl font-black text-pink-300">
                {acceptedBatch2Applications.filter(a => (a.gender || "").toLowerCase() === "female").length.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Men</p>
              <p className="mt-2 text-2xl font-black text-blue-300">
                {acceptedBatch2Applications.filter(a => (a.gender || "").toLowerCase() === "male").length.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
              <div className="mb-3">
                <input
                  type="search"
                  value={batch2SearchInput}
                  onChange={(e) => setBatch2SearchInput(e.target.value)}
                  placeholder="Search Batch 2 by name, Omang, phone, email or constituency..."
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:bg-[#0f172a]"
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                {acceptedApplicationsLoading ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">Loading...</div>
                ) : visibleBatch2Applications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">No Batch 2 applicants found.</div>
                ) : (
                  <div className="max-h-[480px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup>
                        <col className="w-[26%]" />
                        <col className="w-[16%]" />
                        <col className="w-[14%]" />
                        <col className="w-[16%]" />
                        <col className="w-[12%]" />
                        <col className="w-[16%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Gender</th>
                          <th className="px-3 py-3 text-left font-black">Label</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {visibleBatch2Applications.map((application) => {
                          const bucket = application.selectionBucket || "";
                          const labelMatch = bucket.match(/Batch 2 - ([^/]+)/);
                          const label = labelMatch ? labelMatch[1].trim() : "Batch 2";
                          return (
                            <tr key={application.id} className="align-top text-slate-300 transition hover:bg-white/[0.03]">
                              <td className="px-3 py-3">
                                <button type="button" onClick={() => setSelectedApplication(application)} className="text-left">
                                  <p className="font-black text-white underline-offset-2 hover:underline">
                                    {application.firstName} {application.lastName}
                                  </p>
                                  <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                                    {application.email || "No email"}
                                  </p>
                                </button>
                              </td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "-"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "-"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.gender || "-"}</td>
                              <td className="px-3 py-3">
                                <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-black text-orange-300">
                                  {label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Batch 2 By Constituency</p>
              <div className="mt-3 max-h-[480px] space-y-2 overflow-y-auto pr-1">
                {batch2ConstituencyRows.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">No data yet.</p>
                ) : (
                  batch2ConstituencyRows.map(([constituency, count]) => (
                    <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                      <span className="text-xs font-bold text-slate-300">{constituency}</span>
                      <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs font-black text-orange-300">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <details className="mb-5 group">
          <summary className="mb-3 flex cursor-pointer list-none items-center gap-3 rounded-2xl border border-cyan-500/20 bg-white/[0.02] px-5 py-3 text-xs font-black text-cyan-300 hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
            <span className="transition-transform group-open:rotate-90">▶</span>
            350km Nearby Reserve Pool
            <span className="ml-auto font-semibold text-slate-500">Expand to manage</span>
          </summary>
        <section className="rounded-[30px] border border-cyan-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                350km Nearby Reserve Pool
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Selected 50 reserve applicants for confirmation
              </h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                This section shows applicants tagged as {NEARBY_RESERVE_BUCKET}. It is admin-only until you publish a chosen amount. Published reserve applicants count toward the 1,000 programme target, but they never replace or modify Batch 1.
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Reserve total: {nearbyReserveApplications.length.toLocaleString()} • Accepted: {programmeAcceptedCount.toLocaleString()} / {TOTAL_PROGRAMME_INTAKE.toLocaleString()} • Remaining seats: {programmeRemainingSeats.toLocaleString()} • Max publish now: {nearbyReserveMaxPublishable.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadNearbyReserveApplications}
                disabled={nearbyReserveApplicationsLoading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {nearbyReserveApplicationsLoading ? "Refreshing..." : "Refresh Reserve"}
              </button>

              <button
                type="button"
                onClick={handleExportNearbyReserveApplicantsCsv}
                disabled={nearbyReserveApplications.length === 0}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export Reserve CSV
              </button>

              <div className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-black/20 p-2">
                <input
                  type="number"
                  min="0"
                  max={nearbyReserveMaxPublishable}
                  value={nearbyReservePublishAmount}
                  onChange={(event) => setNearbyReservePublishAmount(event.target.value)}
                  placeholder="Amount"
                  className="w-24 rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-xs font-black text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handlePublishNearbyReserveAmount}
                  disabled={
                    nearbyReservePublishing ||
                    nearbyReserveMaxPublishable <= 0 ||
                    Number.parseInt(nearbyReservePublishAmount, 10) <= 0
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {nearbyReservePublishing ? "Publishing..." : "Publish Amount"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Reserve Selected</p>
              <p className="mt-2 text-2xl font-black text-cyan-300">{nearbyReserveApplications.length.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Target: {NEARBY_RESERVE_TARGET}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Accepted / Target</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{programmeAcceptedCount.toLocaleString()} / {TOTAL_PROGRAMME_INTAKE.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Live accepted count</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Remaining Seats</p>
              <p className="mt-2 text-2xl font-black text-yellow-300">{programmeRemainingSeats.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Reserve can publish up to {nearbyReserveMaxPublishable}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
              <p className="mt-2 text-2xl font-black text-blue-300">{nearbyReserveConstituencyRows.length.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Nearby radius list: {NEARBY_350KM_CONSTITUENCIES.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Unemployed</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{nearbyReserveUnemployedCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Prioritised first</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Self-employed</p>
              <p className="mt-2 text-2xl font-black text-yellow-300">{nearbyReserveSelfEmployedCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Second priority</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="search"
                  value={nearbyReserveSearchInput}
                  onChange={(event) => setNearbyReserveSearchInput(event.target.value)}
                  placeholder="Search reserve by name, Omang, phone, email, employment or constituency..."
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#0f172a]"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                {nearbyReserveApplicationsLoading ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">
                    Loading nearby reserve applicants...
                  </div>
                ) : visibleNearbyReserveApplications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">
                    No 350km reserve applicants found yet. Run Create 350km Reserve Top 50, then refresh this section.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup>
                        <col className="w-[23%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                        <col className="w-[17%]" />
                        <col className="w-[16%]" />
                        <col className="w-[14%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Employment</th>
                          <th className="px-3 py-3 text-left font-black">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {visibleNearbyReserveApplications.map((application) => (
                          <tr
                            key={application.id}
                            className="align-top text-slate-300 transition hover:bg-white/[0.03]"
                          >
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => setSelectedApplication(application)}
                                className="text-left"
                              >
                                <p className="font-black text-white underline-offset-2 hover:underline">
                                  {application.firstName} {application.lastName}
                                </p>
                                <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                                  {application.email || "No email"}
                                </p>
                              </button>
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.omang || "-"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.phone || "-"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.constituency || "Unknown"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.employmentStatus || "-"}
                            </td>
                            <td className="px-3 py-3 font-black text-cyan-300">
                              {application.autoReviewScore ?? "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Reserve By Constituency</p>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {nearbyReserveConstituencyRows.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">
                    No reserve constituency data yet.
                  </p>
                ) : (
                  nearbyReserveConstituencyRows.map(([constituency, count]) => (
                    <div
                      key={constituency}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2"
                    >
                      <span className="text-xs font-bold text-slate-300">
                        {constituency}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-white">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
        </details>

        <section className="mb-5 rounded-[30px] border border-emerald-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                Arrival Operations
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Live registration and participant arrival tracking
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                These numbers update from accepted applicants only. Applicants must scan the venue QR code, accept the waiver, complete missing arrival details, then confirm arrival.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => refreshAdminNumbers(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10"
              >
                Refresh Arrivals
              </button>
              <button
                type="button"
                onClick={handleExportArrivedCsv}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700"
              >
                Export Arrived
              </button>
              <button
                type="button"
                onClick={handleExportNotArrivedCsv}
                className="rounded-2xl bg-yellow-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-yellow-700"
              >
                Export Not Arrived
              </button>
              <button
                type="button"
                onClick={handleExportArrivalRegisterCsv}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10"
              >
                Full Register
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <button type="button" onClick={() => setArrivalFilter("all")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Accepted</p>
              <p className="mt-2 text-2xl font-black text-white">{acceptedApplications.length.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Eligible to arrive</p>
            </button>
            <button type="button" onClick={() => setArrivalFilter("arrived")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Arrived</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{arrivedApplicationsCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">QR confirmed</p>
            </button>
            <button type="button" onClick={() => setArrivalFilter("not_arrived")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Not Arrived</p>
              <p className="mt-2 text-2xl font-black text-yellow-300">{pendingArrivalApplicationsCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Still pending</p>
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Arrival Rate</p>
              <p className="mt-2 text-2xl font-black text-blue-300">{arrivalRate}%</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Arrived / Accepted</p>
            </div>
            <button type="button" onClick={() => setArrivalFilter("dietary")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Dietary</p>
              <p className="mt-2 text-2xl font-black text-orange-300">{dietaryRestrictionsCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Special meals</p>
            </button>
            <button type="button" onClick={() => setArrivalFilter("disability")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Disability</p>
              <p className="mt-2 text-2xl font-black text-purple-300">{disabilityCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Declared</p>
            </button>
            <button type="button" onClick={() => setArrivalFilter("medical")} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Medical</p>
              <p className="mt-2 text-2xl font-black text-red-300">{medicalDeclarationsCount.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Declared notes</p>
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
              {/* Filter buttons — prominent so arrived vs not-arrived is one click */}
              <div className="mb-3 flex flex-wrap gap-2">
                {(
                  [
                    { value: "all", label: `All (${acceptedApplications.length})`, color: "bg-white/10 text-white" },
                    { value: "arrived", label: `Arrived (${arrivedApplicationsCount})`, color: "bg-emerald-600 text-white" },
                    { value: "not_arrived", label: `Not Arrived (${pendingArrivalApplicationsCount})`, color: "bg-yellow-600 text-white" },
                    { value: "dietary", label: `Dietary (${dietaryRestrictionsCount})`, color: "bg-orange-600 text-white" },
                    { value: "disability", label: `Disability (${disabilityCount})`, color: "bg-purple-600 text-white" },
                    { value: "medical", label: `Medical (${medicalDeclarationsCount})`, color: "bg-red-600 text-white" },
                  ] as const
                ).map((btn) => (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => setArrivalFilter(btn.value)}
                    className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
                      arrivalFilter === btn.value
                        ? `${btn.color} ring-2 ring-white/30`
                        : "border border-white/10 bg-[#111827] text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={arrivalSearchInput}
                onChange={(event) => setArrivalSearchInput(event.target.value)}
                placeholder="Search by name, phone, email, constituency, dietary or medical..."
                className="mb-3 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:bg-[#0f172a]"
              />

              {/* Bulk action bar — appears when checkboxes are ticked */}
              {selectedArrivalIds.size > 0 && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                  <p className="text-sm font-black text-amber-300">
                    {selectedArrivalIds.size} selected
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkDefer(visibleArrivalApplications)}
                      disabled={bulkDeferring}
                      className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white transition hover:bg-amber-600 disabled:opacity-50"
                    >
                      {bulkDeferring ? "Deferring..." : "Defer Selected — Next Intake"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedArrivalIds(new Set())}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300 transition hover:bg-white/10"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-white/10">
                {acceptedApplicationsLoading ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">
                    Loading arrival register...
                  </div>
                ) : visibleArrivalApplications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-semibold text-slate-400">
                    No arrival records match this filter.
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-[12px]">
                      <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                        <tr>
                          <th className="w-8 px-3 py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded"
                              checked={
                                visibleArrivalApplications.length > 0 &&
                                visibleArrivalApplications.every((a) => selectedArrivalIds.has(a.id))
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedArrivalIds(new Set(visibleArrivalApplications.map((a) => a.id)));
                                } else {
                                  setSelectedArrivalIds(new Set());
                                }
                              }}
                            />
                          </th>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Arrival</th>
                          <th className="px-3 py-3 text-left font-black">Actions</th>
                          <th className="px-3 py-3 text-left font-black">Dietary</th>
                          <th className="px-3 py-3 text-left font-black">Medical</th>
                          <th className="px-3 py-3 text-left font-black">Emergency Contact</th>
                          <th className="px-3 py-3 text-left font-black">Waiver</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {visibleArrivalApplications.map((application) => (
                          <tr
                            key={application.id}
                            className={`align-top text-slate-300 transition hover:bg-white/[0.03] ${
                              selectedArrivalIds.has(application.id) ? "bg-amber-500/5" : ""
                            }`}
                          >
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded"
                                checked={selectedArrivalIds.has(application.id)}
                                onChange={(e) => {
                                  setSelectedArrivalIds((prev) => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(application.id);
                                    else next.delete(application.id);
                                    return next;
                                  });
                                }}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => setSelectedApplication(application)}
                                className="text-left"
                              >
                                <p className="font-black text-white underline-offset-2 hover:underline">
                                  {application.firstName} {application.lastName}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                  {application.email || "No email"}
                                </p>
                              </button>
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.phone || "-"}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-300">
                              {application.constituency || "Unknown"}
                            </td>
                            {/* Arrival status */}
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                                  application.arrivalStatus === "Arrived"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-yellow-500/15 text-yellow-300"
                                }`}
                              >
                                {application.arrivalStatus || "Not Arrived"}
                              </span>
                              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                {application.arrivedAt ? new Date(application.arrivedAt).toLocaleString() : "No time yet"}
                              </p>
                            </td>
                            {/* Actions — directly after Arrival for quick access */}
                            <td className="px-3 py-3">
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedApplication(application)}
                                  className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-black text-white transition hover:bg-white/20"
                                >
                                  View Profile
                                </button>
                                {application.arrivalStatus !== "Arrived" && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeferApplication(application)}
                                    disabled={savingId === application.id}
                                    className="rounded-lg bg-amber-500/20 px-2 py-1 text-[11px] font-black text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-50"
                                  >
                                    Defer
                                  </button>
                                )}
                              </div>
                            </td>
                            {/* Dietary */}
                            <td className="px-3 py-3">
                              <p className={`font-black ${application.hasDietaryRestrictions ? "text-orange-300" : "text-emerald-300"}`}>
                                {application.hasDietaryRestrictions ? "Yes" : "No"}
                              </p>
                              <p className="mt-1 max-w-[180px] text-[11px] leading-5 text-slate-500">
                                {application.dietaryRestrictionsDetails || "-"}
                              </p>
                            </td>
                            {/* Medical */}
                            <td className="px-3 py-3">
                              <p className="max-w-[190px] text-[11px] leading-5 text-slate-400">
                                {application.knownMedicalConditions || "No medical conditions captured"}
                              </p>
                              {application.currentMedication && (
                                <p className="mt-1 max-w-[190px] text-[11px] leading-5 text-slate-500">
                                  Medication: {application.currentMedication}
                                </p>
                              )}
                            </td>
                            {/* Emergency Contact */}
                            <td className="px-3 py-3">
                              <p className="font-semibold text-slate-300">
                                {application.emergencyContactName || "-"}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {application.emergencyContactNumber || ""}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {application.emergencyContactRelationship || ""}
                              </p>
                            </td>
                            {/* Waiver */}
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                                  application.arrivalDisclaimerAccepted
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-red-500/15 text-red-300"
                                }`}
                              >
                                {application.arrivalDisclaimerAccepted ? "Accepted" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Latest Arrivals</p>
              <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {latestArrivals.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">
                    No arrivals confirmed yet.
                  </p>
                ) : (
                  latestArrivals.map((application) => (
                    <div
                      key={application.id}
                      className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedApplication(application)}
                            className="text-left"
                          >
                            <p className="text-xs font-black text-white underline-offset-2 hover:underline">
                              {application.firstName} {application.lastName}
                            </p>
                          </button>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            {application.constituency || "Unknown"}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-black text-emerald-300">
                          Arrived
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        {application.arrivedAt ? new Date(application.arrivedAt).toLocaleString() : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Constituency Count by Gender (arrived, accepted, not deferred) ── */}
        <section className="mb-5 rounded-[30px] border border-sky-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300">
                Constituency Breakdown — Confirmed Arrivals
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Accepted &amp; Arrived by Constituency
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                Counts only applicants with status = Accepted who have confirmed arrival. Deferred and not-arrived are excluded for a clean in-programme estimate.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Arrived total</p>
              <p className="text-2xl font-black text-sky-300">{arrivedGrandTotal.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500">
                {arrivedWomenTotal.toLocaleString()} women · {arrivedMenTotal.toLocaleString()} men
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-[#0f172a]">
                  <tr>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-[0.12em] text-slate-400">#</th>
                    <th className="px-4 py-3 text-left font-black uppercase tracking-[0.12em] text-slate-400">Constituency</th>
                    <th className="px-4 py-3 text-right font-black uppercase tracking-[0.12em] text-pink-400">Women</th>
                    <th className="px-4 py-3 text-right font-black uppercase tracking-[0.12em] text-blue-400">Men</th>
                    <th className="px-4 py-3 text-right font-black uppercase tracking-[0.12em] text-emerald-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {arrivedConstituencyBreakdown.map(([name, stats], idx) => (
                    <tr
                      key={name}
                      className={`border-t border-white/5 ${stats.total === 0 ? "opacity-30" : "hover:bg-white/[0.03]"}`}
                    >
                      <td className="px-4 py-2.5 text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-white">{name}</td>
                      <td className="px-4 py-2.5 text-right font-black text-pink-300">{stats.women || "—"}</td>
                      <td className="px-4 py-2.5 text-right font-black text-blue-300">{stats.men || "—"}</td>
                      <td className="px-4 py-2.5 text-right font-black text-emerald-300">{stats.total || "—"}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-sky-500/30 bg-sky-500/5">
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-sky-300">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-black text-pink-300">{arrivedWomenTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm font-black text-blue-300">{arrivedMenTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm font-black text-emerald-300">{arrivedGrandTotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Specially Elected Pool ── */}
        <section className="mb-5 rounded-[30px] border border-violet-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">
                Specially Elected
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Reserved — {SPECIALLY_ELECTED_SEATS} Seats
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                This pool is reserved for specially elected participants. These seats count towards the {TOTAL_PROGRAMME_INTAKE.toLocaleString()} programme total.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Seats</p>
              <p className="text-2xl font-black text-violet-300">{SPECIALLY_ELECTED_SEATS}</p>
              <p className="text-xs font-semibold text-slate-500">
                {SPECIALLY_ELECTED_SEATS} of {TOTAL_PROGRAMME_INTAKE.toLocaleString()} total
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: SPECIALLY_ELECTED_SEATS }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-violet-500/20 bg-violet-500/[0.03] px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/30 text-[10px] font-black text-violet-400">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-slate-500">Open seat</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-semibold text-slate-600">
            Specially Elected seats are filled outside the constituency quota process and do not affect constituency allocations.
          </p>
        </section>

        {/* ── Account Sync Tool ── */}
        <section className="mb-5 rounded-[30px] border border-white/10 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Account Management
          </p>
          <h2 className="mt-1 text-lg font-black text-white">
            Create Account &amp; Send Reset Link
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Use this for applicants who were manually added and have never created a password. Creates their auth account if missing, then sends a reset link to their email.
          </p>

          <form onSubmit={handleSyncAuth} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                Applicant Email
              </label>
              <input
                type="email"
                required
                value={syncAuthEmail}
                onChange={(e) => { setSyncAuthEmail(e.target.value); setSyncAuthResult(null); }}
                placeholder="applicant@email.com"
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={syncAuthLoading || !syncAuthEmail.trim()}
              className="shrink-0 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {syncAuthLoading ? "Sending..." : "Create Account + Send Reset"}
            </button>
          </form>

          {syncAuthResult && (
            <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold ${syncAuthResult.ok ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border border-red-500/30 bg-red-500/10 text-red-300"}`}>
              {syncAuthResult.message || syncAuthResult.error}
              {syncAuthResult.created === false && syncAuthResult.ok && (
                <span className="ml-2 text-xs text-emerald-400">(account already existed)</span>
              )}
            </div>
          )}
        </section>

        {/* Batch 2 Pool Tracker */}
        <section className="mb-5 rounded-[30px] border border-yellow-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400">
              Batch 2 Prep
            </p>
            <h2 className="mt-0.5 text-base font-black text-white">
              Pool Tracker — Eligible by Constituency
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Eligible = not Accepted, not Rejected, not in Batch 2 selection. 450km+ constituencies shown first.
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
              <span>Total eligible: <span className="text-white">{batchPoolTracker.reduce((s, [, r]) => s + r.eligible, 0).toLocaleString()}</span></span>
              <span>Total deferred: <span className="text-amber-300">{batchPoolTracker.reduce((s, [, r]) => s + r.deferred, 0).toLocaleString()}</span></span>
              <span>Youth eligible: <span className="text-emerald-300">{batchPoolTracker.reduce((s, [, r]) => s + r.youth, 0).toLocaleString()}</span></span>
              <span>Far (450km+) eligible: <span className="text-orange-300">{batchPoolTracker.filter(([, r]) => r.isFar).reduce((s, [, r]) => s + r.eligible, 0).toLocaleString()}</span></span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-400">Constituency</th>
                  <th className="px-3 py-2.5 text-right font-black uppercase tracking-wider text-slate-400">Eligible</th>
                  <th className="px-3 py-2.5 text-right font-black uppercase tracking-wider text-slate-400">Women</th>
                  <th className="px-3 py-2.5 text-right font-black uppercase tracking-wider text-slate-400">Men</th>
                  <th className="px-3 py-2.5 text-right font-black uppercase tracking-wider text-slate-400">Youth</th>
                  <th className="px-3 py-2.5 text-right font-black uppercase tracking-wider text-amber-400">Deferred</th>
                </tr>
              </thead>
              <tbody>
                {batchPoolTracker.map(([name, stats], idx) => (
                  <tr key={name} className={`border-b border-white/5 ${stats.isFar ? "bg-orange-500/[0.05]" : idx % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                    <td className="px-3 py-2 font-semibold text-white">
                      {stats.isFar && <span className="mr-1.5 text-orange-400">★</span>}
                      {name}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-white">{stats.eligible || <span className="text-slate-600">—</span>}</td>
                    <td className="px-3 py-2 text-right text-pink-300">{stats.women || <span className="text-slate-600">—</span>}</td>
                    <td className="px-3 py-2 text-right text-blue-300">{stats.men || <span className="text-slate-600">—</span>}</td>
                    <td className="px-3 py-2 text-right text-emerald-300">{stats.youth || <span className="text-slate-600">—</span>}</td>
                    <td className="px-3 py-2 text-right text-amber-300">{stats.deferred || <span className="text-slate-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        </> )} {/* end programme tab */}

        {/* ── Selection & Reporting tab ── */}
        {activeSection === "selection" && (
        <>

        {/* ── Batch 2 standalone section — top of Selection tab ── */}
        <section className="mb-5 rounded-[30px] border border-orange-500/30 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">
                Batch 2 Selections
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Batch 2 — {batch2Applications.length.toLocaleString()} selected
              </h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                480 seats · 450km+ priority · 200 men floor · deferred sprinkle · click any name to view full profile
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadBatch2Applications}
                disabled={batch2Loading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {batch2Loading ? "Loading..." : "Refresh Batch 2"}
              </button>
              <button
                type="button"
                onClick={() => setAddSpecialOpen(true)}
                className="rounded-2xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-xs font-black text-violet-300 transition hover:bg-violet-500/20"
              >
                + Add to Special Group
              </button>
              <button
                type="button"
                onClick={handleExportBatch2NotArrivedCsv}
                className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-black text-orange-300 transition hover:bg-orange-500/20"
              >
                Export Not Arrived
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBatch2ExportMenuOpen(o => !o)}
                  className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-xs font-black text-teal-300 transition hover:bg-teal-500/20"
                >
                  Export ▾
                </button>
                {batch2ExportMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-2xl border border-white/10 bg-[#111827] py-1 shadow-xl">
                    <button type="button" onClick={() => handleExportBatch2Csv("combined")}
                      className="block w-full px-4 py-2.5 text-left text-xs font-black text-white hover:bg-white/10">
                      Combined (incl. all special)
                    </button>
                    <button type="button" onClick={() => handleExportBatch2Csv("actual")}
                      className="block w-full px-4 py-2.5 text-left text-xs font-black text-teal-300 hover:bg-white/10">
                      Actual (excl. special)
                    </button>
                    <button type="button" onClick={() => handleExportBatch2Csv("special")}
                      className="block w-full px-4 py-2.5 text-left text-xs font-black text-purple-300 hover:bg-white/10">
                      Boteti Special only
                    </button>
                    <button type="button" onClick={() => handleExportBatch2Csv("chomeleng")}
                      className="block w-full px-4 py-2.5 text-left text-xs font-black text-violet-300 hover:bg-white/10">
                      Chomeleng Special only
                    </button>
                    <button type="button" onClick={() => handleExportBatch2Csv("bera")}
                      className="block w-full px-4 py-2.5 text-left text-xs font-black text-cyan-300 hover:bg-white/10">
                      BERA Special only
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Total Selected</p>
              <p className="mt-2 text-3xl font-black text-orange-300">{batch2Applications.length.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">incl. special groups · of 480 seats</p>
              <p className="mt-1 text-xs font-black text-slate-300">{batch2Applications.filter(a => !isBatch2Special(a)).length.toLocaleString()} <span className="font-semibold text-slate-500">excl. special</span></p>
            </div>
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400">Arrived</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">{batch2Applications.filter(a => a.arrivalStatus === "Arrived").length.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{batch2Applications.length > 0 ? Math.round((batch2Applications.filter(a => a.arrivalStatus === "Arrived").length / batch2Applications.length) * 100) : 0}% attendance</p>
            </div>
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Not Arrived</p>
              <p className="mt-2 text-3xl font-black text-orange-300">{(batch2Applications.length - batch2Applications.filter(a => a.arrivalStatus === "Arrived").length).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
              <p className="mt-2 text-3xl font-black text-white">{batch2ConstituencyRows.length}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">of 61 represented</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
              <div className="mb-3">
                <input
                  type="search"
                  value={batch2SearchInput}
                  onChange={(e) => setBatch2SearchInput(e.target.value)}
                  placeholder="Search by name, Omang, phone, email or constituency..."
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:bg-[#0f172a]"
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                {batch2Loading ? (
                  <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading Batch 2...</div>
                ) : visibleBatch2Applications.length === 0 ? (
                  <div className="p-8 text-center text-sm font-semibold text-slate-400">
                    {batch2Applications.length === 0
                      ? 'No Batch 2 data yet — run master selection or click "Refresh Batch 2".'
                      : "No results for this search."}
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup>
                        <col className="w-[28%]" />
                        <col className="w-[15%]" />
                        <col className="w-[14%]" />
                        <col className="w-[18%]" />
                        <col className="w-[10%]" />
                        <col className="w-[15%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Gender</th>
                          <th className="px-3 py-3 text-left font-black">Arrival</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {visibleBatch2Applications.map((application) => {
                          const isMale = (application.gender || "").toLowerCase() === "male";
                          const arrived = application.arrivalStatus === "Arrived";
                          const fromLucky = isLuckyOnesPromoted(application);
                          return (
                            <tr key={application.id} className={`align-top transition cursor-pointer ${fromLucky ? "bg-yellow-500/[0.07] hover:bg-yellow-500/[0.12]" : "hover:bg-white/[0.04]"}`} onClick={() => setSelectedApplication(application)}>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <p className={`font-black underline-offset-2 hover:underline ${fromLucky ? "text-yellow-300" : "text-orange-300"}`}>
                                    {application.firstName} {application.lastName}
                                  </p>
                                  {fromLucky && <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-black text-yellow-300">⭐ Lucky</span>}
                                </div>
                                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                                  {application.email || "No email"}
                                </p>
                              </td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                              <td className="px-3 py-3">
                                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                                  {isMale ? "M" : "F"}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>
                                  {arrived ? "✓ Arrived" : "Not Arrived"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-3">By Constituency</p>
              <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                {batch2ConstituencyRows.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">No data — refresh above.</p>
                ) : (
                  batch2ConstituencyRows.map(([constituency, count]) => (
                    <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                      <span className="text-xs font-bold text-slate-300">{constituency}</span>
                      <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs font-black text-orange-300">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Boteti Special List */}
          {(() => {
            const boteti = batch2Applications.filter(isBotetiSpecial);
            const botetiWomen = boteti.filter(a => (a.gender || "").toLowerCase() === "female").length;
            const botetiMen = boteti.filter(a => (a.gender || "").toLowerCase() === "male").length;
            const botetiArrived = boteti.filter(a => a.arrivalStatus === "Arrived").length;
            return (
              <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-400">Boteti Special List</p>
                    <p className="mt-0.5 text-xs text-slate-400">Counts toward Women/Men totals · excluded from constituency quota</p>
                  </div>
                  <div className="flex gap-3 text-xs font-black">
                    <span className="rounded-full bg-pink-500/10 px-3 py-1 text-pink-300">{botetiWomen} Women</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">{botetiMen} Men</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">{botetiArrived} Arrived</span>
                  </div>
                </div>
                {boteti.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">No Boteti Special entries yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup><col className="w-[30%]"/><col className="w-[18%]"/><col className="w-[16%]"/><col className="w-[12%]"/><col className="w-[12%]"/><col className="w-[12%]"/></colgroup>
                      <thead className="bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Gender</th>
                          <th className="px-3 py-3 text-left font-black">Arrival</th>
                          <th className="px-3 py-3 text-left font-black">Label</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {boteti.map(a => {
                          const isMale = (a.gender || "").toLowerCase() === "male";
                          const arrived = a.arrivalStatus === "Arrived";
                          return (
                            <tr key={a.id} className="cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(a)}>
                              <td className="px-3 py-3"><p className="font-black text-violet-300">{a.firstName} {a.lastName}</p></td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.omang || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.phone || "—"}</td>
                              <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>{isMale ? "M" : "F"}</span></td>
                              <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>{arrived ? "✓ Arrived" : "Not Arrived"}</span></td>
                              <td className="px-3 py-3"><span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-black text-violet-300">Boteti</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Chomeleng Special List */}
          {(() => {
            const chomeleng = batch2Applications.filter(isChomelenSpecial);
            const chomelengWomen = chomeleng.filter(a => (a.gender || "").toLowerCase() === "female").length;
            const chomelengMen = chomeleng.filter(a => (a.gender || "").toLowerCase() === "male").length;
            const chomelengArrived = chomeleng.filter(a => a.arrivalStatus === "Arrived").length;
            return (
              <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-400">Chomeleng Multi-Purpose Special List</p>
                    <p className="mt-0.5 text-xs text-slate-400">Counts toward Women/Men totals · excluded from constituency quota</p>
                  </div>
                  <div className="flex gap-3 text-xs font-black">
                    <span className="rounded-full bg-pink-500/10 px-3 py-1 text-pink-300">{chomelengWomen} Women</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">{chomelengMen} Men</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">{chomelengArrived} Arrived</span>
                  </div>
                </div>
                {chomeleng.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">No Chomeleng Special entries yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup><col className="w-[30%]"/><col className="w-[18%]"/><col className="w-[16%]"/><col className="w-[16%]"/><col className="w-[12%]"/><col className="w-[8%]"/></colgroup>
                      <thead className="bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Arrival</th>
                          <th className="px-3 py-3 text-left font-black">Label</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {chomeleng.map(a => {
                          const arrived = a.arrivalStatus === "Arrived";
                          return (
                            <tr key={a.id} className="cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(a)}>
                              <td className="px-3 py-3"><p className="font-black text-violet-300">{a.firstName} {a.lastName}</p></td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.omang || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.phone || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.constituency || "Unknown"}</td>
                              <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>{arrived ? "✓ Arrived" : "Not Arrived"}</span></td>
                              <td className="px-3 py-3"><span className="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-black text-violet-300">Chomeleng</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* BERA Special List */}
          {(() => {
            const bera = batch2Applications.filter(isBeraSpecial);
            const beraWomen = bera.filter(a => (a.gender || "").toLowerCase() === "female").length;
            const beraMen = bera.filter(a => (a.gender || "").toLowerCase() === "male").length;
            const beraArrived = bera.filter(a => a.arrivalStatus === "Arrived").length;
            return (
              <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-400">BERA Special List</p>
                    <p className="mt-0.5 text-xs text-slate-400">Counts toward Women/Men totals · excluded from constituency quota</p>
                  </div>
                  <div className="flex gap-3 text-xs font-black">
                    <span className="rounded-full bg-pink-500/10 px-3 py-1 text-pink-300">{beraWomen} Women</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">{beraMen} Men</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">{beraArrived} Arrived</span>
                  </div>
                </div>
                {bera.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">No BERA Special entries yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full table-fixed text-[12px]">
                      <colgroup><col className="w-[30%]"/><col className="w-[18%]"/><col className="w-[16%]"/><col className="w-[16%]"/><col className="w-[12%]"/><col className="w-[8%]"/></colgroup>
                      <thead className="bg-[#111827] text-slate-300">
                        <tr>
                          <th className="px-3 py-3 text-left font-black">Applicant</th>
                          <th className="px-3 py-3 text-left font-black">Omang</th>
                          <th className="px-3 py-3 text-left font-black">Phone</th>
                          <th className="px-3 py-3 text-left font-black">Constituency</th>
                          <th className="px-3 py-3 text-left font-black">Arrival</th>
                          <th className="px-3 py-3 text-left font-black">Label</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bera.map(a => {
                          const arrived = a.arrivalStatus === "Arrived";
                          return (
                            <tr key={a.id} className="cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(a)}>
                              <td className="px-3 py-3"><p className="font-black text-cyan-300">{a.firstName} {a.lastName}</p></td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.omang || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.phone || "—"}</td>
                              <td className="px-3 py-3 font-semibold text-slate-300">{a.constituency || "Unknown"}</td>
                              <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>{arrived ? "✓ Arrived" : "Not Arrived"}</span></td>
                              <td className="px-3 py-3"><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-black text-cyan-300">BERA</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Recent Sign-ins */}
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400 mb-3">Recent Sign-ins — Batch 2</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(() => {
                const recentB2 = batch2Applications
                  .filter(a => a.arrivalStatus === "Arrived")
                  .sort((a, b) => (b.arrivedAt || "").localeCompare(a.arrivedAt || ""))
                  .slice(0, 12);
                if (recentB2.length === 0) return (
                  <p className="col-span-full text-sm font-semibold text-slate-400">No Batch 2 arrivals confirmed yet.</p>
                );
                return recentB2.map(application => (
                  <div
                    key={application.id}
                    className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 cursor-pointer hover:bg-white/[0.06] transition"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{application.firstName} {application.lastName}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500 truncate">{application.constituency || "Unknown"}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-black text-emerald-300">✓</span>
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                      {application.arrivedAt ? new Date(application.arrivedAt).toLocaleString() : "—"}
                    </p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>

        {/* ── Combined B1 + B2 Constituency Arrival Tally ── */}
        {(() => {
          const b1All = acceptedApplications.filter(a => isInternalBatchOneSelection(a.selectionBucket) && !(a.selectionBucket || "").includes("Phikwe Special") && !(a.selectionBucket || "").includes("Gamalete-GoodHope Special"));
          const b2All = batch2Applications.filter(a => !isBatch2Special(a));
          const allSelected = [...b1All, ...b2All];
          const constituencyList = Array.from(new Set(allSelected.map(a => a.constituency || "Unknown"))).sort();
          const isF = (a: Application) => (a.gender || "").toLowerCase().startsWith("f");
          const isM = (a: Application) => (a.gender || "").toLowerCase().startsWith("m");
          const totalWomen = allSelected.filter(isF).length;
          const totalMen = allSelected.filter(isM).length;
          const totalAll = allSelected.length;
          const totalArrived = allSelected.filter(a => a.arrivalStatus === "Arrived").length;
          return (
            <>
            <section className="mb-5 rounded-[30px] border border-sky-500/20 bg-[#030b0f] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">Live Constituency Tally</p>
                  <h2 className="mt-1 text-xl font-black text-white">Batch 1 + Batch 2 — Arrived vs Not Arrived by Constituency</h2>
                  <p className="mt-1 text-sm text-slate-400">Excludes all special groups. Monitor replacements — find constituencies with absences and pull from the waitlist.</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 px-4 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-pink-300">Women</p>
                    <p className="text-xl font-black text-pink-200">{totalWomen}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-300">Men</p>
                    <p className="text-xl font-black text-blue-200">{totalMen}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Total</p>
                    <p className="text-xl font-black text-white">{totalAll}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">Arrived</p>
                    <p className="text-xl font-black text-emerald-200">{totalArrived}</p>
                  </div>
                </div>
              </div>
              <div className="overflow-auto rounded-2xl border border-white/10">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#111827] text-slate-300">
                    <tr>
                      <th className="px-3 py-3 text-left font-black">Constituency</th>
                      <th className="px-3 py-3 text-center font-black text-pink-300">Women</th>
                      <th className="px-3 py-3 text-center font-black text-blue-300">Men</th>
                      <th className="px-3 py-3 text-center font-black text-white">Total</th>
                      <th className="px-3 py-3 text-center font-black text-emerald-400">B1 Arr</th>
                      <th className="px-3 py-3 text-center font-black text-orange-400">B1 Absent</th>
                      <th className="px-3 py-3 text-center font-black text-emerald-400">B2 Arr</th>
                      <th className="px-3 py-3 text-center font-black text-orange-400">B2 Absent</th>
                      <th className="px-3 py-3 text-center font-black text-emerald-300">Arrived</th>
                      <th className="px-3 py-3 text-center font-black text-orange-300">Absent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {constituencyList.map(c => {
                      const b1c = b1All.filter(a => (a.constituency || "Unknown") === c);
                      const b2c = b2All.filter(a => (a.constituency || "Unknown") === c);
                      const all = [...b1c, ...b2c];
                      const b1Arr = b1c.filter(a => a.arrivalStatus === "Arrived").length;
                      const b2Arr = b2c.filter(a => a.arrivalStatus === "Arrived").length;
                      const women = all.filter(isF).length;
                      const men = all.filter(isM).length;
                      const total = all.length;
                      const totalArr = b1Arr + b2Arr;
                      const totalAbs = total - totalArr;
                      return (
                        <tr key={c} className={`hover:bg-white/[0.03] ${totalAbs > 0 ? "bg-orange-500/[0.02]" : ""}`}>
                          <td className="px-3 py-2 font-bold text-slate-200">{c}</td>
                          <td className="px-3 py-2 text-center font-black text-pink-300">{women}</td>
                          <td className="px-3 py-2 text-center font-black text-blue-300">{men}</td>
                          <td className="px-3 py-2 text-center font-black text-white">{total}</td>
                          <td className="px-3 py-2 text-center font-black text-emerald-300">{b1Arr}</td>
                          <td className="px-3 py-2 text-center font-black text-orange-300">{b1c.length - b1Arr}</td>
                          <td className="px-3 py-2 text-center font-black text-emerald-300">{b2Arr}</td>
                          <td className="px-3 py-2 text-center font-black text-orange-300">{b2c.length - b2Arr}</td>
                          <td className="px-3 py-2 text-center font-black text-emerald-300">{totalArr}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${totalAbs > 0 ? "bg-orange-500/15 text-orange-300" : "bg-emerald-500/10 text-emerald-400"}`}>
                              {totalAbs > 0 ? `${totalAbs} absent` : "✓ All"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#0f172a] text-slate-200">
                    <tr>
                      <td className="px-3 py-3 font-black text-sky-300">TOTALS</td>
                      <td className="px-3 py-3 text-center font-black text-pink-300">{totalWomen}</td>
                      <td className="px-3 py-3 text-center font-black text-blue-300">{totalMen}</td>
                      <td className="px-3 py-3 text-center font-black text-white">{totalAll}</td>
                      <td className="px-3 py-3 text-center font-black text-emerald-300">{b1All.filter(a => a.arrivalStatus === "Arrived").length}</td>
                      <td className="px-3 py-3 text-center font-black text-orange-300">{b1All.filter(a => a.arrivalStatus !== "Arrived").length}</td>
                      <td className="px-3 py-3 text-center font-black text-emerald-300">{b2All.filter(a => a.arrivalStatus === "Arrived").length}</td>
                      <td className="px-3 py-3 text-center font-black text-orange-300">{b2All.filter(a => a.arrivalStatus !== "Arrived").length}</td>
                      <td className="px-3 py-3 text-center font-black text-emerald-300">{totalArrived}</td>
                      <td className="px-3 py-3 text-center font-black text-orange-300">{totalAll - totalArrived}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
            </>
          );
        })()}

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
        </> )} {/* end selection tab */}

        {/* ── Add to Special Group modal ── */}
        {addSpecialOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[28px] border border-violet-500/30 bg-[#0f172a] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-400">Special Group</p>
                  <h3 className="mt-0.5 text-lg font-black text-white">Add Member Manually</h3>
                </div>
                <button type="button" onClick={() => setAddSpecialOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">✕</button>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Group</label>
                <select
                  value={addSpecialDraft.group}
                  onChange={e => setAddSpecialDraft(d => ({ ...d, group: e.target.value }))}
                  className="w-full rounded-2xl border border-violet-500/30 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400"
                >
                  <option value="Boteti">Batch 2 — Boteti Special</option>
                  <option value="Chomeleng">Batch 2 — Chomeleng Special</option>
                  <option value="BERA">Batch 2 — BERA Special</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">First Name *</label>
                  <input value={addSpecialDraft.firstName} onChange={e => setAddSpecialDraft(d => ({ ...d, firstName: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="First name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Last Name *</label>
                  <input value={addSpecialDraft.lastName} onChange={e => setAddSpecialDraft(d => ({ ...d, lastName: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="Last name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Phone</label>
                  <input value={addSpecialDraft.phone} onChange={e => setAddSpecialDraft(d => ({ ...d, phone: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="7xxxxxxx" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Omang / ID</label>
                  <input value={addSpecialDraft.omang} onChange={e => setAddSpecialDraft(d => ({ ...d, omang: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="ID number" />
                </div>
              </div>

              <div className="mb-3">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Email</label>
                <input value={addSpecialDraft.email} onChange={e => setAddSpecialDraft(d => ({ ...d, email: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="email@example.com (leave blank for placeholder)" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Gender</label>
                  <select value={addSpecialDraft.gender} onChange={e => setAddSpecialDraft(d => ({ ...d, gender: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400">
                    <option value="">—</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Age</label>
                  <input type="number" value={addSpecialDraft.age} onChange={e => setAddSpecialDraft(d => ({ ...d, age: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="Age" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Constituency</label>
                  <input value={addSpecialDraft.constituency} onChange={e => setAddSpecialDraft(d => ({ ...d, constituency: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400" placeholder="Optional" />
                </div>
              </div>

              <p className="mb-4 text-[11px] text-slate-500">Member will be added as <span className="text-emerald-400 font-black">Arrived</span> automatically.</p>

              <div className="flex gap-3">
                <button type="button" onClick={handleAddSpecialMember} disabled={addSpecialSaving}
                  className="flex-1 rounded-2xl bg-violet-600 py-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-50">
                  {addSpecialSaving ? "Saving..." : "Add Member"}
                </button>
                <button type="button" onClick={() => setAddSpecialOpen(false)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending data-protection banner — always visible so it's never missed */}
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
        {/* ── Applications tab ── */}
        {activeSection === "applications" && (
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
                    setGenderFilter("All");
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

              <select
                value={genderFilter}
                onChange={(event) => { setGenderFilter(event.target.value); setCurrentPage(1); }}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400 focus:bg-[#0f172a]"
              >
                <option value="All">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <div className={`overflow-hidden rounded-3xl border bg-[#0f172a] ${
            statusFilter === "Internal Batch 1"            ? "border-emerald-500/20" :
            statusFilter === "Internal Remaining Eligible" ? "border-yellow-500/20" :
            statusFilter === "Internal Rejected"           ? "border-red-500/20" :
            statusFilter === "Deferred"                    ? "border-amber-500/20" :
            "border-white/10"
          }`}>
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
                    {filteredApplications.map((application) => {
                      const isReviewedRow = isLuckyOnesReviewed(application);
                      return (
                      <tr
                        key={
                          application.applicationId ||
                          application.id ||
                          application.email
                        }
                        className={`border-t border-white/10 transition ${isReviewedRow ? "bg-slate-500/[0.05] opacity-60 hover:bg-slate-500/[0.09]" : "hover:bg-white/[0.03]"}`}
                      >
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center gap-1.5">
                            <p className={`truncate font-black ${isReviewedRow ? "text-slate-400" : "text-white"}`}>
                              {application.firstName} {application.lastName}
                            </p>
                            {isReviewedRow && (
                              <span className="shrink-0 rounded-full bg-slate-500/20 px-1.5 py-0.5 text-[9px] font-black text-slate-400">Reviewed</span>
                            )}
                          </div>
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
                          {(statusFilter === "Internal Batch 1" || statusFilter === "Internal Batch 2" || application.arrivalStatus === "Arrived") && (
                            <p className={`mb-2 rounded-xl px-2 py-1 text-[10px] font-black ${application.arrivalStatus === "Arrived" ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-slate-500"}`}>
                              {application.arrivalStatus === "Arrived" ? "✓ Arrived" : "Not Arrived"}
                            </p>
                          )}
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
                      );
                    })}
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
        )} {/* end applications tab */}

        {/* ══════════════════════════════════════════════════════════════
            BATCH 1 DEDICATED SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "batch1" && (() => {
          const b1All = acceptedApplications.filter(a => isInternalBatchOneSelection(a.selectionBucket));
          const isB1PhikweSpecial = (a: Application) => (a.selectionBucket || "").includes("Phikwe Special");
          const isB1GoodhopeSpecial = (a: Application) => (a.selectionBucket || "").includes("Gamalete-GoodHope Special");
          const isB1Special = (a: Application) => isB1PhikweSpecial(a) || isB1GoodhopeSpecial(a);
          const b1Core = b1All.filter(a => !isB1Special(a));
          const b1Phikwe = b1All.filter(isB1PhikweSpecial);
          const b1Goodhope = b1All.filter(isB1GoodhopeSpecial);
          const searchLow = searchInput.toLowerCase();
          const visibleB1 = searchInput
            ? b1Core.filter(a => `${a.firstName} ${a.lastName} ${a.email || ""} ${a.omang || ""} ${a.phone || ""} ${a.constituency || ""}`.toLowerCase().includes(searchLow))
            : b1Core;
          const b1Arrived = b1All.filter(a => a.arrivalStatus === "Arrived").length;
          const b1NotArrived = b1All.length - b1Arrived;
          const b1ConstRows = Object.entries(
            b1Core.reduce((acc, a) => { const c = a.constituency || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a);
          return (
            <section className="rounded-[32px] border border-emerald-500/30 bg-[#030f08] p-5 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400">Batch 1 — Accepted</p>
                  <h2 className="mt-1 text-xl font-black text-white">Batch 1 — {b1All.length.toLocaleString()} participants</h2>
                  <p className="mt-1 text-sm text-slate-400">BYWC Oil &amp; Gas Training Programme 2026 · First intake · click any name to view full profile</p>
                </div>
                <button type="button" onClick={() => { setActiveSection("applications"); setSearchInput(""); setSearchTerm(""); }} className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">← Back to All</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Total Selected</p>
                  <p className="mt-2 text-3xl font-black text-emerald-300">{b1All.length.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400">Arrived</p>
                  <p className="mt-2 text-3xl font-black text-emerald-300">{b1Arrived.toLocaleString()}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{b1All.length > 0 ? Math.round((b1Arrived / b1All.length) * 100) : 0}% attendance</p>
                </div>
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Not Arrived</p>
                  <p className="mt-2 text-3xl font-black text-orange-300">{b1NotArrived.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
                  <p className="mt-2 text-3xl font-black text-white">{b1ConstRows.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">of 61 represented</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
                  <div className="mb-3">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      placeholder="Search by name, Omang, phone, email or constituency..."
                      className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:bg-[#0f172a]"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {visibleB1.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">{searchInput ? "No results for this search." : "No Batch 1 data found."}</div>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full table-fixed text-[12px]">
                          <colgroup>
                            <col className="w-[28%]" />
                            <col className="w-[15%]" />
                            <col className="w-[14%]" />
                            <col className="w-[18%]" />
                            <col className="w-[10%]" />
                            <col className="w-[15%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                            <tr>
                              <th className="px-3 py-3 text-left font-black">Applicant</th>
                              <th className="px-3 py-3 text-left font-black">Omang</th>
                              <th className="px-3 py-3 text-left font-black">Phone</th>
                              <th className="px-3 py-3 text-left font-black">Constituency</th>
                              <th className="px-3 py-3 text-left font-black">Gender</th>
                              <th className="px-3 py-3 text-left font-black">Arrival</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {visibleB1.map(application => {
                              const isMale = (application.gender || "").toLowerCase() === "male";
                              const arrived = application.arrivalStatus === "Arrived";
                              return (
                                <tr key={application.id} className="align-top cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(application)}>
                                  <td className="px-3 py-3">
                                    <p className="font-black text-emerald-300 underline-offset-2 hover:underline">{application.firstName} {application.lastName}</p>
                                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                                  <td className="px-3 py-3">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                                      {isMale ? "M" : "F"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>
                                      {arrived ? "✓ Arrived" : "Not Arrived"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">By Constituency</p>
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {b1ConstRows.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400">No data.</p>
                    ) : (
                      b1ConstRows.map(([constituency, count]) => (
                        <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                          <span className="text-xs font-bold text-slate-300">{constituency}</span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-black text-emerald-300">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── Phikwe Special Group ── */}
              {b1Phikwe.length > 0 && (
                <div className="mt-6 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-purple-300">Phikwe Special Group</span>
                    <span className="text-[11px] font-semibold text-slate-400">{b1Phikwe.filter(a => a.arrivalStatus === "Arrived").length} arrived / {b1Phikwe.length} total</span>
                    <span className="text-[11px] font-semibold text-pink-300">{b1Phikwe.filter(a => (a.gender || "").toLowerCase().includes("female")).length}F</span>
                    <span className="text-[11px] font-semibold text-blue-300">{b1Phikwe.filter(a => (a.gender || "").toLowerCase().includes("male") && !(a.gender || "").toLowerCase().includes("female")).length}M</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full table-fixed text-[12px]">
                        <colgroup><col className="w-[30%]" /><col className="w-[18%]" /><col className="w-[16%]" /><col className="w-[12%]" /><col className="w-[14%]" /></colgroup>
                        <thead className="sticky top-0 z-10 bg-[#1a0a2e] text-slate-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-black">Applicant</th>
                            <th className="px-3 py-2 text-left font-black">Omang</th>
                            <th className="px-3 py-2 text-left font-black">Phone</th>
                            <th className="px-3 py-2 text-left font-black">Gender</th>
                            <th className="px-3 py-2 text-left font-black">Arrival</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {b1Phikwe.map(a => {
                            const arrived = a.arrivalStatus === "Arrived";
                            const isMale = (a.gender || "").toLowerCase().includes("male") && !(a.gender || "").toLowerCase().includes("female");
                            return (
                              <tr key={a.id} className="cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(a)}>
                                <td className="px-3 py-2 font-black text-purple-300">{a.firstName} {a.lastName}</td>
                                <td className="px-3 py-2 text-slate-300">{a.omang || "—"}</td>
                                <td className="px-3 py-2 text-slate-300">{a.phone || "—"}</td>
                                <td className="px-3 py-2">
                                  {a.gender ? <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>{isMale ? "M" : "F"}</span> : <span className="text-slate-500">—</span>}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>{arrived ? "✓ Arrived" : "Not Arrived"}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Gamalete-GoodHope Special Group ── */}
              {b1Goodhope.length > 0 && (
                <div className="mt-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-purple-300">Gamalete-GoodHope Special Group</span>
                    <span className="text-[11px] font-semibold text-slate-400">{b1Goodhope.filter(a => a.arrivalStatus === "Arrived").length} arrived / {b1Goodhope.length} total</span>
                    <span className="text-[11px] font-semibold text-pink-300">{b1Goodhope.filter(a => (a.gender || "").toLowerCase().includes("female")).length}F</span>
                    <span className="text-[11px] font-semibold text-blue-300">{b1Goodhope.filter(a => (a.gender || "").toLowerCase().includes("male") && !(a.gender || "").toLowerCase().includes("female")).length}M</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full table-fixed text-[12px]">
                        <colgroup><col className="w-[30%]" /><col className="w-[18%]" /><col className="w-[16%]" /><col className="w-[12%]" /><col className="w-[14%]" /></colgroup>
                        <thead className="sticky top-0 z-10 bg-[#1a0a2e] text-slate-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-black">Applicant</th>
                            <th className="px-3 py-2 text-left font-black">Omang</th>
                            <th className="px-3 py-2 text-left font-black">Phone</th>
                            <th className="px-3 py-2 text-left font-black">Gender</th>
                            <th className="px-3 py-2 text-left font-black">Arrival</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {b1Goodhope.map(a => {
                            const arrived = a.arrivalStatus === "Arrived";
                            const isMale = (a.gender || "").toLowerCase().includes("male") && !(a.gender || "").toLowerCase().includes("female");
                            return (
                              <tr key={a.id} className="cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(a)}>
                                <td className="px-3 py-2 font-black text-purple-300">{a.firstName} {a.lastName}</td>
                                <td className="px-3 py-2 text-slate-300">{a.omang || "—"}</td>
                                <td className="px-3 py-2 text-slate-300">{a.phone || "—"}</td>
                                <td className="px-3 py-2">
                                  {a.gender ? <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>{isMale ? "M" : "F"}</span> : <span className="text-slate-500">—</span>}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${arrived ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300"}`}>{arrived ? "✓ Arrived" : "Not Arrived"}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            WAITLIST DEDICATED SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "waitlist" && (() => {
          const pageConstRows = Object.entries(
            filteredApplications.reduce((acc, a) => { const c = a.constituency || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a);
          const pageWomen = filteredApplications.filter(a => (a.gender || "").toLowerCase() === "female").length;
          const pageMen = filteredApplications.filter(a => (a.gender || "").toLowerCase() === "male").length;
          return (
            <section className="rounded-[32px] border border-yellow-500/30 bg-[#0f0e00] p-5 shadow-[0_20px_60px_rgba(234,179,8,0.08)]">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400">Waitlist</p>
                  <h2 className="mt-1 text-xl font-black text-white">Waitlist — {totalCount.toLocaleString()} applicants</h2>
                  <p className="mt-1 text-sm text-slate-400">Remaining Eligible · not placed in this intake · may be offered a spot if one becomes available</p>
                </div>
                <button type="button" onClick={() => { setActiveSection("applications"); setSearchInput(""); setSearchTerm(""); }} className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">← Back to All</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-300">Total Waitlisted</p>
                  <p className="mt-2 text-3xl font-black text-yellow-300">{totalCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
                  <p className="mt-2 text-3xl font-black text-white">{pageConstRows.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-pink-300">Women</p>
                  <p className="mt-2 text-3xl font-black text-pink-300">{pageWomen}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Men</p>
                  <p className="mt-2 text-3xl font-black text-blue-300">{pageMen}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
                  <div className="mb-3 flex gap-2">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { setSearchTerm(searchInput.trim()); setCurrentPage(1); } }}
                      placeholder="Search by name, Omang, phone, email or constituency..."
                      className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:bg-[#0f172a]"
                    />
                    <button type="button" onClick={() => { setSearchTerm(searchInput.trim()); setCurrentPage(1); }} className="shrink-0 rounded-2xl bg-yellow-600 px-4 py-2 text-xs font-black text-white hover:bg-yellow-500">Search</button>
                    <button type="button" onClick={() => { setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10">✕</button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {tableLoading ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading...</div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">{searchTerm ? "No results for this search." : "No waitlisted applicants found."}</div>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full table-fixed text-[12px]">
                          <colgroup>
                            <col className="w-[28%]" />
                            <col className="w-[15%]" />
                            <col className="w-[14%]" />
                            <col className="w-[18%]" />
                            <col className="w-[10%]" />
                            <col className="w-[15%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                            <tr>
                              <th className="px-3 py-3 text-left font-black">Applicant</th>
                              <th className="px-3 py-3 text-left font-black">Omang</th>
                              <th className="px-3 py-3 text-left font-black">Phone</th>
                              <th className="px-3 py-3 text-left font-black">Constituency</th>
                              <th className="px-3 py-3 text-left font-black">Gender</th>
                              <th className="px-3 py-3 text-left font-black">Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredApplications.map(application => {
                              const isMale = (application.gender || "").toLowerCase() === "male";
                              const isReviewed = isLuckyOnesReviewed(application);
                              const isLucky = (application.selectionBucket || "") === "Lucky Ones";
                              return (
                                <tr key={application.id} className={`align-top cursor-pointer transition ${isReviewed ? "bg-slate-500/[0.06] hover:bg-slate-500/[0.10] opacity-70" : "hover:bg-white/[0.04]"}`} onClick={() => setSelectedApplication(application)}>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <p className={`font-black underline-offset-2 hover:underline ${isReviewed ? "text-slate-400" : "text-yellow-300"}`}>{application.firstName} {application.lastName}</p>
                                      {isLucky && (
                                        <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-black text-yellow-300">⭐</span>
                                      )}
                                      {isReviewed && (
                                        <span className="rounded-full bg-slate-500/20 px-1.5 py-0.5 text-[9px] font-black text-slate-400">Reviewed</span>
                                      )}
                                    </div>
                                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                                  <td className="px-3 py-3">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                                      {isMale ? "M" : "F"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-black text-yellow-300">
                                      {application.autoReviewScore ?? "—"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="text-xs text-slate-500">Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Previous</button>
                      <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Next</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">By Constituency · this page</p>
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {pageConstRows.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400">No data on this page.</p>
                    ) : (
                      pageConstRows.map(([constituency, count]) => (
                        <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                          <span className="text-xs font-bold text-slate-300">{constituency}</span>
                          <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-black text-yellow-300">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            LUCKY ONES SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "lucky-ones" && (
          <section className="rounded-[32px] border border-yellow-500/40 bg-[#0f0c00] p-5 shadow-[0_20px_60px_rgba(234,179,8,0.12)]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400">Internal — Admin Only</p>
                <h2 className="mt-1 text-xl font-black text-white">⭐ Lucky Ones — {luckyOnesApplications.length} people</h2>
                <p className="mt-1 text-sm text-slate-400">Waitlisted applicants flagged for a call · status unchanged · not notified</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={loadLuckyOnes} disabled={luckyOnesLoading}
                  className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50">
                  {luckyOnesLoading ? "Loading…" : "Refresh"}
                </button>
                <button type="button" onClick={() => { setActiveSection("waitlist"); setStatusFilter("Internal Remaining Eligible"); setSearchInput(""); setSearchTerm(""); setGenderFilter("All"); setCurrentPage(1); }}
                  className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">
                  ← Waitlist
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 mb-5">
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-300">Flagged</p>
                <p className="mt-2 text-3xl font-black text-yellow-300">{luckyOnesApplications.length}</p>
              </div>
              <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-pink-300">Women</p>
                <p className="mt-2 text-3xl font-black text-pink-300">{luckyOnesApplications.filter(a => (a.gender || "").toLowerCase() === "female").length}</p>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Men</p>
                <p className="mt-2 text-3xl font-black text-blue-300">{luckyOnesApplications.filter(a => (a.gender || "").toLowerCase() === "male").length}</p>
              </div>
              <button
                type="button"
                onClick={() => { const el = document.getElementById("lucky-ones-graduated"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-left hover:bg-emerald-500/10 transition"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Accepted → B2</p>
                <p className="mt-2 text-3xl font-black text-emerald-300">{luckyOnesGraduated.length}</p>
              </button>
            </div>

            {luckyOnesLoading ? (
              <div className="p-10 text-center text-sm font-semibold text-slate-400">Loading…</div>
            ) : luckyOnesApplications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
                <p className="text-2xl mb-2">⭐</p>
                <p className="text-sm font-semibold text-slate-400">No Lucky Ones yet.</p>
                <p className="mt-1 text-xs text-slate-600">Open any waitlisted applicant and click "⭐ Lucky One" to flag them.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full table-fixed text-[12px]">
                  <colgroup>
                    <col className="w-[24%]" />
                    <col className="w-[16%]" />
                    <col className="w-[15%]" />
                    <col className="w-[18%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                    <tr>
                      <th className="px-3 py-3 text-left font-black">Applicant</th>
                      <th className="px-3 py-3 text-left font-black text-yellow-400">📞 Phone</th>
                      <th className="px-3 py-3 text-left font-black">Omang</th>
                      <th className="px-3 py-3 text-left font-black">Constituency</th>
                      <th className="px-3 py-3 text-left font-black">Gender</th>
                      <th className="px-3 py-3 text-left font-black">Score</th>
                      <th className="px-3 py-3 text-left font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {luckyOnesApplications.map(application => {
                      const isMale = (application.gender || "").toLowerCase() === "male";
                      return (
                        <tr key={application.id} className="align-top transition hover:bg-yellow-500/[0.04]">
                          <td className="px-3 py-3 cursor-pointer" onClick={() => setSelectedApplication(application)}>
                            <p className="font-black text-yellow-300 hover:underline">{application.firstName} {application.lastName}</p>
                            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-black text-white">{application.phone || "—"}</span>
                          </td>
                          <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                          <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                              {isMale ? "M" : "F"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-black text-yellow-300">
                              {application.autoReviewScore ?? "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-1">
                              <button type="button" onClick={() => handlePromoteLuckyOne(application)} disabled={luckyOnesSaving}
                                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition">
                                Accept → B2
                              </button>
                              <button type="button" onClick={() => handleMarkLuckyOne(application)} disabled={luckyOnesSaving}
                                className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-black text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition">
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Graduated / Promoted list */}
            <div id="lucky-ones-graduated" className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-emerald-300 uppercase tracking-[0.12em]">✅ Accepted → Batch 2 ({luckyOnesGraduated.length})</h3>
                {luckyOnesGraduated.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ["First Name", "Last Name", "Phone", "Omang", "Email", "Gender", "Age", "Constituency", "Score"];
                      const rows = luckyOnesGraduated.map(a => [
                        a.firstName, a.lastName, a.phone, a.omang, a.email,
                        a.gender, a.age, a.constituency, a.autoReviewScore ?? "",
                      ]);
                      const csv = [headers, ...rows].map(r => r.map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url; link.download = "lucky-ones-promoted.csv"; link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    Export CSV
                  </button>
                )}
              </div>
              {luckyOnesGraduated.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
                  <p className="text-xs text-slate-500">No one has been promoted yet. Use "Accept → B2" above.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-emerald-500/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-500/20 bg-emerald-500/5">
                        <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-emerald-400">Applicant</th>
                        <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-emerald-400">📞 Phone</th>
                        <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-emerald-400">Omang</th>
                        <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-emerald-400">Constituency</th>
                        <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-emerald-400">Gender</th>
                        <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-emerald-400">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                      {luckyOnesGraduated.map((application) => {
                        const isMale = (application.gender || "").toLowerCase() === "male";
                        return (
                          <tr key={application.id} className="align-top transition cursor-pointer hover:bg-emerald-500/[0.04]" onClick={() => setSelectedApplication(application)}>
                            <td className="px-3 py-3">
                              <p className="font-black text-emerald-300 underline-offset-2 hover:underline">
                                {application.firstName} {application.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500">{application.email}</p>
                            </td>
                            <td className="px-3 py-3 font-mono text-xs text-slate-300">{application.phone || "—"}</td>
                            <td className="px-3 py-3 font-mono text-xs text-slate-400">{application.omang || "—"}</td>
                            <td className="px-3 py-3 text-xs text-slate-300">{application.constituency || "—"}</td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                                {isMale ? "M" : "F"}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-300">
                                {application.autoReviewScore ?? "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            REJECTED DEDICATED SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "rejected" && (() => {
          const pageConstRows = Object.entries(
            filteredApplications.reduce((acc, a) => { const c = a.constituency || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a);
          const pageWomen = filteredApplications.filter(a => (a.gender || "").toLowerCase() === "female").length;
          const pageMen = filteredApplications.filter(a => (a.gender || "").toLowerCase() === "male").length;
          return (
            <section className="rounded-[32px] border border-red-500/30 bg-[#0f0303] p-5 shadow-[0_20px_60px_rgba(239,68,68,0.08)]">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-400">Rejected</p>
                  <h2 className="mt-1 text-xl font-black text-white">Rejected Applications — {totalCount.toLocaleString()}</h2>
                  <p className="mt-1 text-sm text-slate-400">Did not pass review gates or were manually rejected · click any name to view full profile and rejection reason</p>
                </div>
                <button type="button" onClick={() => { setActiveSection("applications"); setSearchInput(""); setSearchTerm(""); }} className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">← Back to All</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-300">Total Rejected</p>
                  <p className="mt-2 text-3xl font-black text-red-300">{totalCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
                  <p className="mt-2 text-3xl font-black text-white">{pageConstRows.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-pink-300">Women</p>
                  <p className="mt-2 text-3xl font-black text-pink-300">{pageWomen}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Men</p>
                  <p className="mt-2 text-3xl font-black text-blue-300">{pageMen}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
                  <div className="mb-3 flex gap-2">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { setSearchTerm(searchInput.trim()); setCurrentPage(1); } }}
                      placeholder="Search by name, Omang, phone, email or constituency..."
                      className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-red-400 focus:bg-[#0f172a]"
                    />
                    <button type="button" onClick={() => { setSearchTerm(searchInput.trim()); setCurrentPage(1); }} className="shrink-0 rounded-2xl bg-red-700 px-4 py-2 text-xs font-black text-white hover:bg-red-600">Search</button>
                    <button type="button" onClick={() => { setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10">✕</button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {tableLoading ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading...</div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">{searchTerm ? "No results for this search." : "No rejected applications found."}</div>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full table-fixed text-[12px]">
                          <colgroup>
                            <col className="w-[28%]" />
                            <col className="w-[15%]" />
                            <col className="w-[14%]" />
                            <col className="w-[18%]" />
                            <col className="w-[10%]" />
                            <col className="w-[15%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                            <tr>
                              <th className="px-3 py-3 text-left font-black">Applicant</th>
                              <th className="px-3 py-3 text-left font-black">Omang</th>
                              <th className="px-3 py-3 text-left font-black">Phone</th>
                              <th className="px-3 py-3 text-left font-black">Constituency</th>
                              <th className="px-3 py-3 text-left font-black">Gender</th>
                              <th className="px-3 py-3 text-left font-black">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredApplications.map(application => {
                              const isMale = (application.gender || "").toLowerCase() === "male";
                              return (
                                <tr key={application.id} className="align-top cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(application)}>
                                  <td className="px-3 py-3">
                                    <p className="font-black text-red-300 underline-offset-2 hover:underline">{application.firstName} {application.lastName}</p>
                                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                                  <td className="px-3 py-3">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                                      {isMale ? "M" : "F"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className="line-clamp-2 text-[10px] font-semibold text-red-400/80">
                                      {application.hardRejectReason || "—"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="text-xs text-slate-500">Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Previous</button>
                      <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Next</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">By Constituency · this page</p>
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {pageConstRows.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400">No data on this page.</p>
                    ) : (
                      pageConstRows.map(([constituency, count]) => (
                        <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                          <span className="text-xs font-bold text-slate-300">{constituency}</span>
                          <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-black text-red-300">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            DEFERRED DEDICATED SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "deferred" && (() => {
          const pageConstRows = Object.entries(
            filteredApplications.reduce((acc, a) => { const c = a.constituency || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a);
          const pageWomen = filteredApplications.filter(a => (a.gender || "").toLowerCase() === "female").length;
          const pageMen = filteredApplications.filter(a => (a.gender || "").toLowerCase() === "male").length;
          return (
            <section className="rounded-[32px] border border-amber-500/30 bg-[#0f0900] p-5 shadow-[0_20px_60px_rgba(245,158,11,0.08)]">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-400">Deferred</p>
                  <h2 className="mt-1 text-xl font-black text-white">Deferred Applicants — {totalCount.toLocaleString()}</h2>
                  <p className="mt-1 text-sm text-slate-400">Deferred to a future intake · will receive priority consideration · click any name to view full profile</p>
                </div>
                <button type="button" onClick={() => { setActiveSection("applications"); setSearchInput(""); setSearchTerm(""); }} className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">← Back to All</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-300">Total Deferred</p>
                  <p className="mt-2 text-3xl font-black text-amber-300">{totalCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
                  <p className="mt-2 text-3xl font-black text-white">{pageConstRows.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-pink-300">Women</p>
                  <p className="mt-2 text-3xl font-black text-pink-300">{pageWomen}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Men</p>
                  <p className="mt-2 text-3xl font-black text-blue-300">{pageMen}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
                  <div className="mb-3 flex gap-2">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { setSearchTerm(searchInput.trim()); setCurrentPage(1); } }}
                      placeholder="Search by name, Omang, phone, email or constituency..."
                      className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:bg-[#0f172a]"
                    />
                    <button type="button" onClick={() => { setSearchTerm(searchInput.trim()); setCurrentPage(1); }} className="shrink-0 rounded-2xl bg-amber-700 px-4 py-2 text-xs font-black text-white hover:bg-amber-600">Search</button>
                    <button type="button" onClick={() => { setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10">✕</button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {tableLoading ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading...</div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">{searchTerm ? "No results for this search." : "No deferred applicants found."}</div>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full table-fixed text-[12px]">
                          <colgroup>
                            <col className="w-[28%]" />
                            <col className="w-[15%]" />
                            <col className="w-[14%]" />
                            <col className="w-[18%]" />
                            <col className="w-[10%]" />
                            <col className="w-[15%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                            <tr>
                              <th className="px-3 py-3 text-left font-black">Applicant</th>
                              <th className="px-3 py-3 text-left font-black">Omang</th>
                              <th className="px-3 py-3 text-left font-black">Phone</th>
                              <th className="px-3 py-3 text-left font-black">Constituency</th>
                              <th className="px-3 py-3 text-left font-black">Gender</th>
                              <th className="px-3 py-3 text-left font-black">Label</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredApplications.map(application => {
                              const isMale = (application.gender || "").toLowerCase() === "male";
                              return (
                                <tr key={application.id} className="align-top cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(application)}>
                                  <td className="px-3 py-3">
                                    <p className="font-black text-amber-300 underline-offset-2 hover:underline">{application.firstName} {application.lastName}</p>
                                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                                  <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                                  <td className="px-3 py-3">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${isMale ? "bg-blue-500/10 text-blue-300" : "bg-pink-500/10 text-pink-300"}`}>
                                      {isMale ? "M" : "F"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-300">Deferred</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="text-xs text-slate-500">Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Previous</button>
                      <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Next</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">By Constituency · this page</p>
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {pageConstRows.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400">No data on this page.</p>
                    ) : (
                      pageConstRows.map(([constituency, count]) => (
                        <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                          <span className="text-xs font-bold text-slate-300">{constituency}</span>
                          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-black text-amber-300">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            WOMEN DEDICATED SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "women" && (() => {
          const pageConstRows = Object.entries(
            filteredApplications.reduce((acc, a) => { const c = a.constituency || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a);
          return (
            <section className="rounded-[32px] border border-pink-500/30 bg-[#0f0308] p-5 shadow-[0_20px_60px_rgba(236,72,153,0.08)]">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-400">Female Applicants</p>
                  <h2 className="mt-1 text-xl font-black text-white">Women — {totalCount.toLocaleString()} applicants</h2>
                  <p className="mt-1 text-sm text-slate-400">All female applicants across all statuses · click any name to view full profile</p>
                </div>
                <button type="button" onClick={() => { setActiveSection("applications"); setGenderFilter("All"); setSearchInput(""); setSearchTerm(""); }} className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">← Back to All</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-pink-300">Total Women</p>
                  <p className="mt-2 text-3xl font-black text-pink-300">{totalCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
                  <p className="mt-2 text-3xl font-black text-white">{pageConstRows.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Accepted</p>
                  <p className="mt-2 text-3xl font-black text-orange-300">{filteredApplications.filter(a => a.status === "Accepted").length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Arrived</p>
                  <p className="mt-2 text-3xl font-black text-emerald-300">{filteredApplications.filter(a => a.arrivalStatus === "Arrived").length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
                  <div className="mb-3 flex gap-2">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { setSearchTerm(searchInput.trim()); setCurrentPage(1); } }}
                      placeholder="Search by name, Omang, phone, email or constituency..."
                      className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-pink-400 focus:bg-[#0f172a]"
                    />
                    <button type="button" onClick={() => { setSearchTerm(searchInput.trim()); setCurrentPage(1); }} className="shrink-0 rounded-2xl bg-pink-700 px-4 py-2 text-xs font-black text-white hover:bg-pink-600">Search</button>
                    <button type="button" onClick={() => { setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10">✕</button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {tableLoading ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading...</div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">{searchTerm ? "No results for this search." : "No female applicants found."}</div>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full table-fixed text-[12px]">
                          <colgroup>
                            <col className="w-[30%]" />
                            <col className="w-[15%]" />
                            <col className="w-[14%]" />
                            <col className="w-[20%]" />
                            <col className="w-[21%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                            <tr>
                              <th className="px-3 py-3 text-left font-black">Applicant</th>
                              <th className="px-3 py-3 text-left font-black">Omang</th>
                              <th className="px-3 py-3 text-left font-black">Phone</th>
                              <th className="px-3 py-3 text-left font-black">Constituency</th>
                              <th className="px-3 py-3 text-left font-black">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredApplications.map(application => (
                              <tr key={application.id} className="align-top cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(application)}>
                                <td className="px-3 py-3">
                                  <p className="font-black text-pink-300 underline-offset-2 hover:underline">{application.firstName} {application.lastName}</p>
                                  <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                                </td>
                                <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                                <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                                <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                                <td className="px-3 py-3">
                                  <span className="rounded-full bg-pink-500/10 px-2 py-1 text-[10px] font-black text-pink-300">
                                    {application.selectionBucket || application.status || "—"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="text-xs text-slate-500">Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Previous</button>
                      <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Next</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">By Constituency · this page</p>
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {pageConstRows.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400">No data on this page.</p>
                    ) : (
                      pageConstRows.map(([constituency, count]) => (
                        <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                          <span className="text-xs font-bold text-slate-300">{constituency}</span>
                          <span className="rounded-full bg-pink-500/10 px-2 py-1 text-xs font-black text-pink-300">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            MEN DEDICATED SECTION
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "men" && (() => {
          const pageConstRows = Object.entries(
            filteredApplications.reduce((acc, a) => { const c = a.constituency || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a);
          return (
            <section className="rounded-[32px] border border-blue-500/30 bg-[#03080f] p-5 shadow-[0_20px_60px_rgba(59,130,246,0.08)]">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-400">Male Applicants</p>
                  <h2 className="mt-1 text-xl font-black text-white">Men — {totalCount.toLocaleString()} applicants</h2>
                  <p className="mt-1 text-sm text-slate-400">All male applicants across all statuses · click any name to view full profile</p>
                </div>
                <button type="button" onClick={() => { setActiveSection("applications"); setGenderFilter("All"); setSearchInput(""); setSearchTerm(""); }} className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10">← Back to All</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-5">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Total Men</p>
                  <p className="mt-2 text-3xl font-black text-blue-300">{totalCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituencies</p>
                  <p className="mt-2 text-3xl font-black text-white">{pageConstRows.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Accepted</p>
                  <p className="mt-2 text-3xl font-black text-orange-300">{filteredApplications.filter(a => a.status === "Accepted").length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Arrived</p>
                  <p className="mt-2 text-3xl font-black text-emerald-300">{filteredApplications.filter(a => a.arrivalStatus === "Arrived").length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">this page</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-3">
                  <div className="mb-3 flex gap-2">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { setSearchTerm(searchInput.trim()); setCurrentPage(1); } }}
                      placeholder="Search by name, Omang, phone, email or constituency..."
                      className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:bg-[#0f172a]"
                    />
                    <button type="button" onClick={() => { setSearchTerm(searchInput.trim()); setCurrentPage(1); }} className="shrink-0 rounded-2xl bg-blue-700 px-4 py-2 text-xs font-black text-white hover:bg-blue-600">Search</button>
                    <button type="button" onClick={() => { setSearchInput(""); setSearchTerm(""); setCurrentPage(1); }} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10">✕</button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {tableLoading ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading...</div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="p-8 text-center text-sm font-semibold text-slate-400">{searchTerm ? "No results for this search." : "No male applicants found."}</div>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full table-fixed text-[12px]">
                          <colgroup>
                            <col className="w-[30%]" />
                            <col className="w-[15%]" />
                            <col className="w-[14%]" />
                            <col className="w-[20%]" />
                            <col className="w-[21%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 bg-[#111827] text-slate-300">
                            <tr>
                              <th className="px-3 py-3 text-left font-black">Applicant</th>
                              <th className="px-3 py-3 text-left font-black">Omang</th>
                              <th className="px-3 py-3 text-left font-black">Phone</th>
                              <th className="px-3 py-3 text-left font-black">Constituency</th>
                              <th className="px-3 py-3 text-left font-black">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredApplications.map(application => (
                              <tr key={application.id} className="align-top cursor-pointer transition hover:bg-white/[0.04]" onClick={() => setSelectedApplication(application)}>
                                <td className="px-3 py-3">
                                  <p className="font-black text-blue-300 underline-offset-2 hover:underline">{application.firstName} {application.lastName}</p>
                                  <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{application.email || "No email"}</p>
                                </td>
                                <td className="px-3 py-3 font-semibold text-slate-300">{application.omang || "—"}</td>
                                <td className="px-3 py-3 font-semibold text-slate-300">{application.phone || "—"}</td>
                                <td className="px-3 py-3 font-semibold text-slate-300">{application.constituency || "Unknown"}</td>
                                <td className="px-3 py-3">
                                  <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-black text-blue-300">
                                    {application.selectionBucket || application.status || "—"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="text-xs text-slate-500">Page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Previous</button>
                      <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || tableLoading} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white disabled:opacity-40 hover:bg-white/10">Next</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">By Constituency · this page</p>
                  <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                    {pageConstRows.length === 0 ? (
                      <p className="text-sm font-semibold text-slate-400">No data on this page.</p>
                    ) : (
                      pageConstRows.map(([constituency, count]) => (
                        <div key={constituency} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-3 py-2">
                          <span className="text-xs font-bold text-slate-300">{constituency}</span>
                          <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-black text-blue-300">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── Constituency Breakdown tab ── */}
        {activeSection === "constituency-breakdown" && (() => {
          const batch1Count = constituencyBatch1Count;
          const batch2Count = constituencyBatch2Count;
          const totals = constituencyBreakdown.reduce(
            (acc, [, s]) => { acc.total += s.total; acc.women += s.women; acc.men += s.men; acc.other += s.other; return acc; },
            { total: 0, women: 0, men: 0, other: 0 }
          );
          return (
            <section className="rounded-[32px] border border-blue-500/20 bg-[#0b1028] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-400">Accepted Applicants</p>
                  <h2 className="mt-1 text-xl font-black text-white">Constituency Breakdown</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {constituencyBreakdown.length > 0
                      ? `${totals.total} total · ${constituencyBreakdown.length} constituencies`
                      : "Batch 1 all accepted · Batch 2 arrived only"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Batch 1: all accepted &nbsp;·&nbsp; Batch 2: arrived only</p>
                </div>
                <button
                  type="button"
                  onClick={loadConstituencyBreakdown}
                  disabled={constituencyBreakdownLoading}
                  className="shrink-0 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {constituencyBreakdownLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {constituencyBreakdownLoading ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm font-semibold text-slate-400">
                  Loading constituency data…
                </div>
              ) : constituencyBreakdown.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm font-semibold text-slate-400">
                  No data yet. Click Refresh.
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Batch 1</p>
                      <p className="mt-2 text-3xl font-black text-emerald-300">{batch1Count}</p>
                      <p className="mt-1 text-[10px] text-slate-500">all accepted</p>
                    </div>
                    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Batch 2</p>
                      <p className="mt-2 text-3xl font-black text-orange-300">{batch2Count}</p>
                      <p className="mt-1 text-[10px] text-slate-500">arrived only</p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Combined</p>
                      <p className="mt-2 text-3xl font-black text-blue-300">{totals.total}</p>
                      <p className="mt-1 text-[10px] text-slate-500">in programme</p>
                    </div>
                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-300">Constituencies</p>
                      <p className="mt-2 text-3xl font-black text-violet-300">{constituencyBreakdown.length}</p>
                      <p className="mt-1 text-[10px] text-slate-500">represented</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#111827]">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Constituency</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Total</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-pink-400">Women</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-sky-400">Men</th>
                          <th className="hidden px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 sm:table-cell">Other</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Gender split</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {constituencyBreakdown.map(([name, s]) => {
                          const womenPct = s.total > 0 ? Math.round((s.women / s.total) * 100) : 0;
                          return (
                            <tr key={name} className="transition hover:bg-white/[0.03]">
                              <td className="px-4 py-3 font-semibold text-white">{name}</td>
                              <td className="px-4 py-3 text-right font-black text-white">{s.total}</td>
                              <td className="px-4 py-3 text-right font-semibold text-pink-300">{s.women}</td>
                              <td className="px-4 py-3 text-right font-semibold text-sky-300">{s.men}</td>
                              <td className="hidden px-4 py-3 text-right text-slate-500 sm:table-cell">{s.other > 0 ? s.other : "—"}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full rounded-full bg-pink-500" style={{ width: `${womenPct}%` }} />
                                  </div>
                                  <span className="text-[11px] text-slate-500">{womenPct}% F</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-white/10 bg-[#111827]">
                        <tr>
                          <td className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Total</td>
                          <td className="px-4 py-3 text-right font-black text-white">{totals.total}</td>
                          <td className="px-4 py-3 text-right font-black text-pink-300">{totals.women}</td>
                          <td className="px-4 py-3 text-right font-black text-sky-300">{totals.men}</td>
                          <td className="hidden px-4 py-3 text-right font-semibold text-slate-500 sm:table-cell">{totals.other > 0 ? totals.other : "—"}</td>
                          <td className="px-4 py-3 text-[11px] text-slate-500">
                            {totals.total > 0 ? `${Math.round((totals.women / totals.total) * 100)}% women` : ""}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </section>
          );
        })()}

        {/* ── Compliance & Dispatch tab ── */}
        {activeSection === "compliance" && (
        <>
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
                    Shortlisted + Accepted applicants against planned intake.{" "}
                    {quotaStatsLoading ? "Refreshing..." : `${quotaStats.total} selected so far.`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadQuotaStats}
                    disabled={quotaStatsLoading}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {quotaStatsLoading ? "Refreshing..." : "Refresh"}
                  </button>
                  <span className="w-fit rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
                    Target: {TOTAL_AUTO_SELECTED_INTAKE}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <QuotaTrackerCard
                  title="Youth Women"
                  value={quotaStats.youthWomen}
                  target={TOTAL_YOUTH_WOMEN}
                  helper="Shortlisted / Accepted"
                  accent="orange"
                />
                <QuotaTrackerCard
                  title="Youth Men"
                  value={quotaStats.youthMen}
                  target={TOTAL_YOUTH_MEN}
                  helper="Shortlisted / Accepted"
                  accent="blue"
                />
                <QuotaTrackerCard
                  title="Non-Youth"
                  value={quotaStats.nonYouth}
                  target={TOTAL_NON_YOUTH}
                  helper="Shortlisted / Accepted"
                  accent="slate"
                />
                <QuotaTrackerCard
                  title="Youth Total"
                  value={quotaStats.youthWomen + quotaStats.youthMen}
                  target={TOTAL_YOUTH_WOMEN + TOTAL_YOUTH_MEN}
                  helper="Shortlisted / Accepted"
                  accent="blue"
                />
                <QuotaTrackerCard
                  title="Disability"
                  value={quotaStats.disability}
                  target={DISABILITY_CAP}
                  helper="Shortlisted / Accepted"
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
        {/* ── Acceptance Letter Editor ── */}
        <section className="mt-5 rounded-[30px] border border-emerald-500/20 bg-[#0b1028] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:p-5">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                Documents
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Acceptance Letter Template
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Edit the text accepted applicants see when they download their letter. Use the placeholders below — they are replaced automatically with each applicant's details.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["{{fullName}}", "Full name"],
                  ["{{firstName}}", "First name"],
                  ["{{refNo}}", "Reference number"],
                  ["{{constituency}}", "Constituency"],
                  ["{{date}}", "Date of download"],
                ].map(([tag, desc]) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px]"
                  >
                    <code className="font-black text-emerald-300">{tag}</code>
                    <span className="text-slate-500">{desc}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={loadLetterTemplate}
                disabled={letterLoading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {letterLoading ? "Loading..." : "Reload"}
              </button>
              <button
                type="button"
                onClick={handlePreviewLetter}
                disabled={letterLoading}
                className="rounded-2xl border border-orange-400/40 bg-orange-500/20 px-4 py-2.5 text-xs font-black text-orange-300 transition hover:bg-orange-500/30 disabled:opacity-50"
              >
                Preview PDF
              </button>
              <button
                type="button"
                onClick={saveLetterTemplate}
                disabled={letterSaving || letterLoading}
                className={`rounded-2xl px-5 py-2.5 text-xs font-black text-white transition disabled:opacity-50 ${
                  letterSaved
                    ? "bg-emerald-500"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {letterSaved ? "Saved ✓" : letterSaving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>

          {letterLoading ? (
            <p className="text-sm font-semibold text-slate-400">Loading template...</p>
          ) : (
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Subject Line (bold heading in the letter)
                </label>
                <input
                  type="text"
                  value={letterSubject}
                  onChange={(e) => setLetterSubject(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                  placeholder="RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Letter Body — separate paragraphs with a blank line
                </label>
                <textarea
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  rows={18}
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                  placeholder="Write the letter body here. Use {{fullName}}, {{refNo}}, etc. for personalisation. Separate paragraphs with a blank line."
                />
              </div>
            </div>
          )}
        </section>
        </> )} {/* end compliance tab */}

        {selectedApplication && (
          <section className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <div className="bg-[#0b1028] border border-white/10 rounded-2xl text-white max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profileEditMode ? (
                      <span className="flex gap-2">
                        <input
                          className="bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-xl font-bold w-36"
                          value={profileEditDraft.firstName ?? selectedApplication.firstName}
                          onChange={(e) => setProfileEditDraft((d) => ({ ...d, firstName: e.target.value }))}
                        />
                        <input
                          className="bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-xl font-bold w-36"
                          value={profileEditDraft.lastName ?? selectedApplication.lastName}
                          onChange={(e) => setProfileEditDraft((d) => ({ ...d, lastName: e.target.value }))}
                        />
                      </span>
                    ) : (
                      <>{selectedApplication.firstName}{" "}{selectedApplication.lastName}</>
                    )}
                  </h2>
                  <p className="text-slate-400">
                    {selectedApplication.applicationId}
                  </p>
                </div>

                <div className="flex gap-2">
                  {profileEditMode ? (
                    <>
                      <button
                        onClick={() => { setProfileEditMode(false); setProfileEditDraft({}); }}
                        className="border border-white/10 bg-[#111827] text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfileEdit}
                        disabled={profileEditSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        {profileEditSaving ? "Saving…" : "Save"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setProfileEditMode(true); setProfileEditDraft({}); }}
                        className="border border-amber-500/40 bg-amber-500/10 text-amber-300 px-4 py-2 rounded-lg font-semibold hover:bg-amber-500/20"
                      >
                        Edit Profile
                      </button>
                      {(() => {
                        const isLucky = (selectedApplication.selectionBucket || "") === "Lucky Ones";
                        return (
                          <button
                            onClick={() => handleMarkLuckyOne(selectedApplication)}
                            disabled={luckyOnesSaving}
                            className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition ${isLucky ? "border border-yellow-500/40 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30" : "border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"}`}
                          >
                            {luckyOnesSaving ? "…" : isLucky ? "⭐ Lucky One ✓" : "⭐ Lucky One"}
                          </button>
                        );
                      })()}
                      <button
                        onClick={() => { setSelectedApplication(null); setProfileEditMode(false); setProfileEditDraft({}); }}
                        className="border border-white/10 bg-[#111827] text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {profileEditMode ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Email</p>
                    <input className="mt-1 w-full bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-sm" value={profileEditDraft.email ?? selectedApplication.email} onChange={(e) => setProfileEditDraft((d) => ({ ...d, email: e.target.value }))} />
                  </div>
                ) : <Detail label="Email" value={selectedApplication.email} />}
                {profileEditMode ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Phone</p>
                    <input className="mt-1 w-full bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-sm" value={profileEditDraft.phone ?? selectedApplication.phone} onChange={(e) => setProfileEditDraft((d) => ({ ...d, phone: e.target.value }))} />
                  </div>
                ) : <Detail label="Phone" value={selectedApplication.phone} />}
                {profileEditMode ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Omang</p>
                    <input className="mt-1 w-full bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-sm" value={profileEditDraft.omang ?? selectedApplication.omang} onChange={(e) => setProfileEditDraft((d) => ({ ...d, omang: e.target.value }))} />
                  </div>
                ) : <Detail label="Omang" value={selectedApplication.omang} />}
                <Detail label="Gender" value={selectedApplication.gender} />
                <Detail label="Age" value={selectedApplication.age} />
                <Detail
                  label="Citizenship"
                  value={selectedApplication.citizenship}
                />
                {profileEditMode ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">District</p>
                    <input className="mt-1 w-full bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-sm" value={profileEditDraft.district ?? (selectedApplication.district || "")} onChange={(e) => setProfileEditDraft((d) => ({ ...d, district: e.target.value }))} />
                  </div>
                ) : <Detail label="District" value={selectedApplication.district} />}
                {profileEditMode ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Constituency</p>
                    <select className="mt-1 w-full bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-sm" value={profileEditDraft.constituency ?? selectedApplication.constituency} onChange={(e) => setProfileEditDraft((d) => ({ ...d, constituency: e.target.value }))}>
                      {constituencies.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ) : <Detail label="Constituency" value={selectedApplication.constituency} />}
                {profileEditMode ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Town / Village</p>
                    <input className="mt-1 w-full bg-[#111827] border border-white/20 rounded px-2 py-1 text-white text-sm" value={profileEditDraft.townVillage ?? (selectedApplication.townVillage || "")} onChange={(e) => setProfileEditDraft((d) => ({ ...d, townVillage: e.target.value }))} />
                  </div>
                ) : <Detail label="Town / Village" value={selectedApplication.townVillage} />}
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

              {/* Next of Kin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Next of Kin</p>
                  <p className="mt-1 text-sm text-white font-semibold">{selectedApplication.emergencyContactName || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Phone</p>
                  <p className="mt-1 text-sm text-white">{selectedApplication.emergencyContactNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Relationship</p>
                  <p className="mt-1 text-sm text-white">{selectedApplication.emergencyContactRelationship || "—"}</p>
                </div>
              </div>

              {/* Medical / Dietary */}
              {(selectedApplication.knownMedicalConditions || selectedApplication.currentMedication || selectedApplication.hasDietaryRestrictions || selectedApplication.dietaryRestrictionsDetails) ? (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-red-400">⚕ Medical &amp; Dietary</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Conditions / Allergies</p>
                      <p className="mt-1 text-sm text-white font-semibold">{selectedApplication.knownMedicalConditions || "None declared"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Current Medication</p>
                      <p className="mt-1 text-sm text-white font-semibold">{selectedApplication.currentMedication || "None declared"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Dietary Restrictions</p>
                      <p className="mt-1 text-sm text-white font-semibold">{selectedApplication.hasDietaryRestrictions ? "Yes" : "No"}</p>
                    </div>
                    {selectedApplication.hasDietaryRestrictions && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Dietary Details</p>
                        <p className="mt-1 text-sm text-white font-semibold">{selectedApplication.dietaryRestrictionsDetails || "—"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">⚕ Medical &amp; Dietary</p>
                  <p className="mt-1 text-sm text-slate-500">No conditions, allergies or dietary restrictions declared.</p>
                </div>
              )}

              {/* Arrival Status */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 rounded-xl border p-4 ${selectedApplication.arrivalStatus === "Arrived" ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]"}`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Arrival Status</p>
                  <p className={`mt-1 text-base font-black ${selectedApplication.arrivalStatus === "Arrived" ? "text-emerald-400" : "text-slate-400"}`}>
                    {selectedApplication.arrivalStatus || "Not Arrived"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Arrived At</p>
                  <p className="mt-1 text-sm text-white">
                    {selectedApplication.arrivedAt ? new Date(selectedApplication.arrivedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Confirmed By</p>
                  <p className="mt-1 text-sm text-white">{selectedApplication.arrivalConfirmedBy || "—"}</p>
                </div>
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

                <button
                  onClick={() => handleDeferApplication(selectedApplication)}
                  disabled={savingId === selectedApplication.id}
                  className="bg-amber-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50"
                >
                  Defer — Next Intake
                </button>

                <button
                  onClick={() => handleMoveToBatch2Deferred(selectedApplication)}
                  disabled={savingId === selectedApplication.id}
                  className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-violet-700 transition disabled:opacity-50"
                >
                  Move to Batch 2 Deferred
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

function StatCard({
  title,
  value,
  accent = "slate",
  onClick,
}: {
  title: string;
  value: number;
  accent?: "orange" | "emerald" | "yellow" | "red" | "amber" | "slate" | "pink";
  onClick?: () => void;
}) {
  const dot: Record<string, string> = {
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
    yellow: "bg-yellow-400",
    red: "bg-red-500",
    amber: "bg-amber-400",
    slate: "bg-slate-500",
    pink: "bg-pink-500",
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group w-full rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-5 text-left transition hover:border-white/[0.12] hover:bg-white/[0.05] ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
        <div className={`h-2 w-2 shrink-0 rounded-full ${dot[accent]}`} />
      </div>
      <p className="mt-4 text-[2.25rem] font-black leading-none tracking-tight text-white">
        {value.toLocaleString()}
      </p>
      {onClick && (
        <p className="mt-2 text-[10px] font-semibold text-slate-600 opacity-0 transition group-hover:opacity-100">
          View list →
        </p>
      )}
    </Tag>
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
