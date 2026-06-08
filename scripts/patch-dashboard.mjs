import { readFileSync, writeFileSync } from "fs";

const file = "app/dashboard/page.tsx";
let content = readFileSync(file, "utf8");

// Use unique code strings as markers (no special characters)
const START_MARKER = `const subject = "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME";`;
const END_MARKER = `doc.save(\`BYWC-Acceptance-Letter-\${fullName.replace(/\\s+/g, "-")}.pdf\`);`;

const startIdx = content.indexOf(START_MARKER);
const endIdx = content.indexOf(END_MARKER) + END_MARKER.length;

if (startIdx === -1 || endIdx < END_MARKER.length) {
  console.error("Markers not found. start:", startIdx, "end:", endIdx);
  process.exit(1);
}

console.log("Replacing block from", startIdx, "to", endIdx);

// Build new block (using String.raw-style to avoid escape confusion)
const newBlock = [
  `// Fetch editable template from admin_settings`,
  `      const { data: settingsData } = await supabase`,
  `        .from("admin_settings")`,
  `        .select("key, value")`,
  `        .in("key", ["acceptance_letter_subject", "acceptance_letter_body"]);`,
  ``,
  `      const defaultSubject =`,
  `        "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME";`,
  `      const defaultBody = [`,
  `        "We are pleased to inform you that your application to the Botswana Youth in the World of Commerce (BYWC) Oil & Gas Training Programme has been reviewed and you have been successfully selected for participation in the programme.",`,
  `        "Your acceptance is confirmed under the following details:\\n \\u2022  Full Name: {{fullName}}\\n \\u2022  Constituency: {{constituency}}\\n \\u2022  Reference Number: {{refNo}}\\n \\u2022  Programme: BYWC Oil & Gas Training",`,
  `        "This letter serves as your official confirmation of acceptance and must be presented upon registration at the training venue together with your valid national identity document (Omang).",`,
  `        "Further details regarding the reporting date, venue address, programme schedule, and items to bring will be communicated through your registered account profile and inbox on the BYWC applicant portal at bywcprogram.org.",`,
  `        "We look forward to welcoming you and wish you every success in your training.",`,
  `      ].join("\\n\\n");`,
  ``,
  `      const rawSubject =`,
  `        settingsData?.find((r) => r.key === "acceptance_letter_subject")?.value ??`,
  `        defaultSubject;`,
  `      const rawBody =`,
  `        settingsData?.find((r) => r.key === "acceptance_letter_body")?.value ??`,
  `        defaultBody;`,
  ``,
  `      const fill = (text: string) =>`,
  `        text`,
  `          .replace(/\\{\\{fullName\\}\\}/g, fullName)`,
  `          .replace(/\\{\\{firstName\\}\\}/g, latestApplication.firstName ?? "")`,
  `          .replace(/\\{\\{refNo\\}\\}/g, refNo)`,
  `          .replace(/\\{\\{constituency\\}\\}/g, constituency)`,
  `          .replace(/\\{\\{date\\}\\}/g, today);`,
  ``,
  `      const subject = fill(rawSubject);`,
  `      const paragraphs = fill(rawBody)`,
  `        .split(/\\n\\n+/)`,
  `        .map((p) => p.trim())`,
  `        .filter(Boolean);`,
  ``,
  `      const subjectLines = doc.splitTextToSize(subject, 180);`,
  `      doc.text(subjectLines, 15, 66);`,
  ``,
  `      doc.setFont("helvetica", "normal");`,
  `      doc.setFontSize(11);`,
  ``,
  `      const lineH = 6;`,
  `      let y = 66 + subjectLines.length * lineH + 6;`,
  ``,
  `      for (const para of paragraphs) {`,
  `        const lines = doc.splitTextToSize(para, 180);`,
  `        doc.text(lines, 15, y);`,
  `        y += lines.length * lineH + 5;`,
  `      }`,
  ``,
  `      doc.save(\`BYWC-Acceptance-Letter-\${fullName.replace(/\\s+/g, "-")}.pdf\`);`,
].join("\n");

content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
writeFileSync(file, content, "utf8");
console.log("Done.");
