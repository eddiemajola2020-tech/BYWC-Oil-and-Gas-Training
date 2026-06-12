import { readFileSync, writeFileSync } from "fs";

const DEFAULT_SUBJECT = `RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026 — BATCH 2`;

const DEFAULT_BODY = `Congratulations, {{fullName}}!

We are delighted to inform you that you have been selected for the Second Batch of the Botswana Youth, Women and Citizen (BYWC) Oil and Gas Training Programme 2026. This is a significant achievement and we commend you for your application and commitment to advancing Botswana's energy sector.

This letter serves as your official confirmation of acceptance. Please retain it as you will be required to present it upon registration at the training venue.

Your acceptance details are as follows:
 •  Full Name: {{fullName}}
 •  Constituency: {{constituency}}
 •  Letter Reference: {{refNo}}
 •  Programme: BYWC Oil & Gas Training Programme 2026 — Batch 2

PROGRAMME OVERVIEW

The training is a structured 10-day programme covering the following areas:

 •  Introduction to the Oil and Gas Industry in Botswana and Africa
 •  Health, Safety and Environment (HSE) Standards and Practices
 •  Petroleum Exploration and Production Fundamentals
 •  Pipeline Operations and Infrastructure
 •  Oil and Gas Business, Contracts and Supply Chain
 •  Entrepreneurship and Business Development in the Energy Sector
 •  Community Development and Corporate Social Responsibility
 •  Career Pathways and Professional Development in Oil and Gas

REPORTING AND ORIENTATION

Participants are required to report to the training venue on Sunday. Please arrive between 14:00 and 17:00 to complete registration and receive your programme materials. Formal orientation takes place on Monday morning beginning at 08:00.

Full venue address, detailed programme schedule, and daily timings will be communicated through your applicant profile and inbox on the BYWC portal at bywcprogram.org. Please log in regularly to check for updates.

WHAT TO BRING

Please ensure you bring the following on registration day:

 •  This acceptance letter (printed or on your phone)
 •  Your valid national identity document (Omang) — this is mandatory
 •  A pen and notebook for orientation
 •  Any prescribed medication or personal items required for the duration of the programme

Accommodation and meals will be provided for the full 10 days of training.

IMPORTANT NOTICE

Attendance from Day 1 is compulsory. Failure to report on the designated Sunday without prior written communication to programme administration may result in forfeiture of your placement. If you are unable to attend, please notify us immediately through your portal inbox so that your space may be reallocated.

We look forward to welcoming you to the programme. This is an important step toward building a skilled, diverse and capable workforce for Botswana's growing energy sector.`;

// ─── Patch admin/page.tsx ────────────────────────────────────────────────────
let adminFile = readFileSync("app/admin/page.tsx", "utf8");
// Detect line ending
const CRLF = adminFile.includes("\r\n");
const NL = CRLF ? "\r\n" : "\n";

// 1. Add constants near top of file (after "use client" and imports)
const CONST_BLOCK = `${NL}const DEFAULT_LETTER_SUBJECT = \`${DEFAULT_SUBJECT}\`;${NL}${NL}const DEFAULT_LETTER_BODY = \`${DEFAULT_BODY.replace(/`/g, "\\`")}\`;${NL}`;

// Insert after the last import line - find ADMIN_EMAILS
const ADMIN_EMAILS_MARKER = `const ADMIN_EMAILS = [`;
if (!adminFile.includes("DEFAULT_LETTER_SUBJECT")) {
  adminFile = adminFile.replace(ADMIN_EMAILS_MARKER, CONST_BLOCK + ADMIN_EMAILS_MARKER);
  console.log("✓ Inserted DEFAULT_LETTER_SUBJECT and DEFAULT_LETTER_BODY constants");
} else {
  console.log("⚠ Constants already present, skipping insert");
}

// 2. Update useState defaults
const OLD_STATES = `  const [letterSubject, setLetterSubject] = useState("");${NL}  const [letterBody, setLetterBody] = useState("");`;
const NEW_STATES = `  const [letterSubject, setLetterSubject] = useState(DEFAULT_LETTER_SUBJECT);${NL}  const [letterBody, setLetterBody] = useState(DEFAULT_LETTER_BODY);`;

if (adminFile.includes(OLD_STATES)) {
  adminFile = adminFile.replace(OLD_STATES, NEW_STATES);
  console.log("✓ Updated useState defaults to full letter");
} else if (adminFile.includes(OLD_STATES.replace(/\r\n/g, "\n"))) {
  adminFile = adminFile.replace(OLD_STATES.replace(/\r\n/g, "\n"), NEW_STATES);
  console.log("✓ Updated useState defaults (LF variant)");
} else {
  console.warn("⚠ Could not find useState pattern to update");
}

// 3. Update loadLetterTemplate to fall back to defaults
const OLD_LOAD = `  async function loadLetterTemplate() {
    setLetterLoading(true);
    const { data } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["acceptance_letter_subject", "acceptance_letter_body"]);
    if (data) {
      setLetterSubject(
        data.find((r) => r.key === "acceptance_letter_subject")?.value ?? "",
      );
      setLetterBody(
        data.find((r) => r.key === "acceptance_letter_body")?.value ?? "",
      );
    }
    setLetterLoading(false);
  }`.replace(/\n/g, NL);

const NEW_LOAD = `  async function loadLetterTemplate() {
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
  }`.replace(/\n/g, NL);

if (adminFile.includes(OLD_LOAD)) {
  adminFile = adminFile.replace(OLD_LOAD, NEW_LOAD);
  console.log("✓ Updated loadLetterTemplate with fallback");
} else {
  // Try with \n
  const OLD_LOAD_LF = OLD_LOAD.replace(/\r\n/g, "\n");
  if (adminFile.includes(OLD_LOAD_LF)) {
    adminFile = adminFile.replace(OLD_LOAD_LF, NEW_LOAD.replace(/\r\n/g, "\n"));
    console.log("✓ Updated loadLetterTemplate with fallback (LF variant)");
  } else {
    console.warn("⚠ Could not find loadLetterTemplate to update — showing partial match context");
    const idx = adminFile.indexOf("async function loadLetterTemplate");
    if (idx !== -1) {
      console.log("Found at char", idx, ":", adminFile.substring(idx, idx + 200));
    }
  }
}

writeFileSync("app/admin/page.tsx", adminFile, "utf8");
console.log("\n✓ admin/page.tsx patched.");

// ─── Patch dashboard/page.tsx ────────────────────────────────────────────────
let dashFile = readFileSync("app/dashboard/page.tsx", "utf8");
const DCRLF = dashFile.includes("\r\n");
const DNL = DCRLF ? "\r\n" : "\n";

// Find the loadLetterTemplate equivalent in dashboard
const DASH_FETCH_OLD = `      // Fetch template from admin_settings`;
if (dashFile.includes(DASH_FETCH_OLD)) {
  // Find the full block and update it to use a fallback
  const blockStart = dashFile.indexOf(DASH_FETCH_OLD);
  const lineEnd = dashFile.indexOf(DNL, blockStart + DASH_FETCH_OLD.length + 100);
  // Find the surrounding try/catch or variable assignment
  console.log("Dashboard fetch block found at char:", blockStart);
  console.log("Context:", dashFile.substring(blockStart - 50, blockStart + 400));
}
console.log("\n✓ Done.");
