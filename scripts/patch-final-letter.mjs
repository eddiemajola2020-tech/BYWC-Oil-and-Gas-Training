import { readFileSync, writeFileSync } from "fs";

const BT = String.fromCharCode(96);

// Shorter body — programme description removed, closing merged with enquiries
const NEW_BODY =
  "Congratulations, {{fullName}}!\n" +
  "\n" +
  "You have been selected for Batch 2 of the BYWC Oil and Gas Training Programme 2026. This letter is your official confirmation of acceptance.\n" +
  "\n" +
  "Acceptance Details:\n" +
  " •  Full Name: {{fullName}}\n" +
  " •  Constituency: {{constituency}}\n" +
  " •  Letter Reference: {{refNo}}\n" +
  " •  Programme: BYWC Oil & Gas Training Programme 2026 Batch 2\n" +
  "\n" +
  "REPORTING & ORIENTATION\n" +
  "Venue: University of Botswana, in front of the Student Centre. Report on Sunday between 13:00 and 15:00 (1-3 pm). Formal orientation begins Monday at 08:00. Accommodation and meals are provided for all 10 days.\n" +
  "\n" +
  "WHAT TO BRING\n" +
  " •  This acceptance letter (printed or on your phone)\n" +
  " •  Valid national identity document (Omang) — MANDATORY\n" +
  " •  Pen and notebook\n" +
  "\n" +
  "IMPORTANT NOTICE\n" +
  "Attendance from Day 1 is compulsory. If you are unable to attend, notify us immediately via your portal inbox.\n" +
  "\n" +
  "We look forward to welcoming you. For enquiries call 355 2838 or WhatsApp 74781608.";

for (const filePath of ["app/dashboard/page.tsx", "app/admin/page.tsx"]) {
  let c = readFileSync(filePath, "utf8");
  const CRLF = c.includes("\r\n");
  const NL = CRLF ? "\r\n" : "\n";

  const marker = filePath.includes("admin") ? "const DEFAULT_LETTER_BODY = " + BT : "const defaultBody = " + BT;
  const openIdx = c.indexOf(marker);
  if (openIdx === -1) { console.error(`Cannot find body marker in ${filePath}`); process.exit(1); }
  const bodyStart = openIdx + marker.length;
  const closeIdx = c.indexOf(BT + ";", bodyStart);
  if (closeIdx === -1) { console.error(`Cannot find closing backtick in ${filePath}`); process.exit(1); }

  c = c.substring(0, bodyStart) + NEW_BODY.replace(/\n/g, NL) + c.substring(closeIdx);
  writeFileSync(filePath, c, "utf8");
  console.log(`✓ ${filePath} updated`);
}
console.log("Done.");
