import { readFileSync, writeFileSync } from "fs";

const BT = String.fromCharCode(96); // backtick — avoids template-literal confusion

const SHORT_BODY =
  "Congratulations, {{fullName}}!\n" +
  "\n" +
  "You have been selected for Batch 2 of the Botswana Youth, Women and Citizen (BYWC) Oil and Gas Training Programme 2026. This letter is your official confirmation of acceptance and must be presented upon registration at the training venue.\n" +
  "\n" +
  "Acceptance Details:\n" +
  " •  Full Name: {{fullName}}\n" +
  " •  Constituency: {{constituency}}\n" +
  " •  Letter Reference: {{refNo}}\n" +
  " •  Programme: BYWC Oil & Gas Training Programme 2026 — Batch 2\n" +
  "\n" +
  "The programme is a structured 10-day training covering the oil and gas industry, HSE standards, petroleum fundamentals, pipeline operations, energy sector business and entrepreneurship, and career development. Accommodation and meals are provided for all 10 days.\n" +
  "\n" +
  "REPORTING & ORIENTATION\n" +
  "Report to the venue on Sunday between 14:00 and 17:00. Orientation begins Monday at 08:00. Full venue address and programme schedule will be shared on your portal at bywcprogram.org.\n" +
  "\n" +
  "WHAT TO BRING\n" +
  " •  This acceptance letter (printed or on your phone)\n" +
  " •  Valid national identity document (Omang) — mandatory\n" +
  " •  Pen and notebook\n" +
  "\n" +
  "IMPORTANT NOTICE\n" +
  "Attendance from Day 1 is compulsory. If you are unable to attend, notify us immediately via your portal inbox to avoid forfeiture of your placement.\n" +
  "\n" +
  "We look forward to welcoming you to the programme.";

// ─── Patch dashboard/page.tsx ────────────────────────────────────────────────
{
  let c = readFileSync("app/dashboard/page.tsx", "utf8");
  const CRLF = c.includes("\r\n");
  const NL = CRLF ? "\r\n" : "\n";

  // Find opening: `const defaultBody = ` followed by backtick
  const OPEN_MARKER = "const defaultBody = " + BT;
  const openIdx = c.indexOf(OPEN_MARKER);
  if (openIdx === -1) {
    console.error("dashboard: cannot find defaultBody declaration");
    process.exit(1);
  }
  // Body content starts after the backtick
  const bodyStart = openIdx + OPEN_MARKER.length;

  // Find closing backtick-semicolon after the body content
  // The body is a template literal with no embedded backticks, so next BT closes it
  const closeIdx = c.indexOf(BT + ";", bodyStart);
  if (closeIdx === -1) {
    console.error("dashboard: cannot find closing backtick-semicolon");
    process.exit(1);
  }

  // Replace only the body content (between the opening and closing backtick)
  const newBody = SHORT_BODY.replace(/\n/g, NL);
  c = c.substring(0, bodyStart) + newBody + c.substring(closeIdx);
  writeFileSync("app/dashboard/page.tsx", c, "utf8");
  console.log("✓ dashboard/page.tsx: letter body condensed");
}

// ─── Patch admin/page.tsx ────────────────────────────────────────────────────
{
  let c = readFileSync("app/admin/page.tsx", "utf8");
  const CRLF = c.includes("\r\n");
  const NL = CRLF ? "\r\n" : "\n";

  // The admin file has: const DEFAULT_LETTER_BODY = `...`;
  const OPEN_MARKER = "const DEFAULT_LETTER_BODY = " + BT;
  const openIdx = c.indexOf(OPEN_MARKER);
  if (openIdx === -1) {
    console.error("admin: cannot find DEFAULT_LETTER_BODY declaration");
    process.exit(1);
  }
  const bodyStart = openIdx + OPEN_MARKER.length;
  const closeIdx = c.indexOf(BT + ";", bodyStart);
  if (closeIdx === -1) {
    console.error("admin: cannot find closing backtick-semicolon");
    process.exit(1);
  }

  const newBody = SHORT_BODY.replace(/\n/g, NL);
  c = c.substring(0, bodyStart) + newBody + c.substring(closeIdx);
  writeFileSync("app/admin/page.tsx", c, "utf8");
  console.log("✓ admin/page.tsx: letter body condensed");
}

console.log("\nDone — letter condensed to single-page version.");
