import { readFileSync, writeFileSync } from "fs";

let c = readFileSync("app/dashboard/page.tsx", "utf8");
const CRLF = c.includes("\r\n");
const NL = CRLF ? "\r\n" : "\n";

// Find and replace the defaultSubject + defaultBody + fetch block
// We'll replace from the "// Fetch template" comment through the defaultBody assignment
const OLD_FETCH_BLOCK = [
  `      // Fetch template from admin_settings`,
  `      const { data: settingsData } = await supabase`,
  `        .from("admin_settings")`,
  `        .select("key, value")`,
  `        .in("key", ["acceptance_letter_subject", "acceptance_letter_body"]);`,
  ``,
  `      const defaultSubject = "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026";`,
  `      const defaultBody = [`,
  `        "We are pleased to inform you that your application to the Botswana Youth in the World of Commerce (BYWC) Oil & Gas Training Programme has been reviewed and you have been successfully selected for participation in the programme.",`,
  `        "Your acceptance is confirmed under the following details:\\n \\u2022  Full Name: {{fullName}}\\n \\u2022  Constituency: {{constituency}}\\n \\u2022  Letter Reference: {{refNo}}\\n \\u2022  Programme: BYWC Oil & Gas Training",`,
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
].join(NL);

const NEW_FETCH_BLOCK = [
  `      // Fetch template from admin_settings (falls back to built-in defaults if table missing)`,
  `      const defaultSubject = "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026 \\u2014 BATCH 2";`,
  `      const defaultBody = \`Congratulations, {{fullName}}!`,
  ``,
  `We are delighted to inform you that you have been selected for the Second Batch of the Botswana Youth, Women and Citizen (BYWC) Oil and Gas Training Programme 2026. This is a significant achievement and we commend you for your application and commitment to advancing Botswana's energy sector.`,
  ``,
  `This letter serves as your official confirmation of acceptance. Please retain it as you will be required to present it upon registration at the training venue.`,
  ``,
  `Your acceptance details are as follows:`,
  ` \\u2022  Full Name: {{fullName}}`,
  ` \\u2022  Constituency: {{constituency}}`,
  ` \\u2022  Letter Reference: {{refNo}}`,
  ` \\u2022  Programme: BYWC Oil & Gas Training Programme 2026 \\u2014 Batch 2`,
  ``,
  `PROGRAMME OVERVIEW`,
  ``,
  `The training is a structured 10-day programme covering the following areas:`,
  ``,
  ` \\u2022  Introduction to the Oil and Gas Industry in Botswana and Africa`,
  ` \\u2022  Health, Safety and Environment (HSE) Standards and Practices`,
  ` \\u2022  Petroleum Exploration and Production Fundamentals`,
  ` \\u2022  Pipeline Operations and Infrastructure`,
  ` \\u2022  Oil and Gas Business, Contracts and Supply Chain`,
  ` \\u2022  Entrepreneurship and Business Development in the Energy Sector`,
  ` \\u2022  Community Development and Corporate Social Responsibility`,
  ` \\u2022  Career Pathways and Professional Development in Oil and Gas`,
  ``,
  `REPORTING AND ORIENTATION`,
  ``,
  `Participants are required to report to the training venue on Sunday. Please arrive between 14:00 and 17:00 to complete registration and receive your programme materials. Formal orientation takes place on Monday morning beginning at 08:00.`,
  ``,
  `Full venue address, detailed programme schedule, and daily timings will be communicated through your applicant profile and inbox on the BYWC portal at bywcprogram.org. Please log in regularly to check for updates.`,
  ``,
  `WHAT TO BRING`,
  ``,
  `Please ensure you bring the following on registration day:`,
  ``,
  ` \\u2022  This acceptance letter (printed or on your phone)`,
  ` \\u2022  Your valid national identity document (Omang) \\u2014 this is mandatory`,
  ` \\u2022  A pen and notebook for orientation`,
  ` \\u2022  Any prescribed medication or personal items required for the duration of the programme`,
  ``,
  `Accommodation and meals will be provided for the full 10 days of training.`,
  ``,
  `IMPORTANT NOTICE`,
  ``,
  `Attendance from Day 1 is compulsory. Failure to report on the designated Sunday without prior written communication to programme administration may result in forfeiture of your placement. If you are unable to attend, please notify us immediately through your portal inbox so that your space may be reallocated.`,
  ``,
  `We look forward to welcoming you to the programme. This is an important step toward building a skilled, diverse and capable workforce for Botswana's growing energy sector.\`;`,
  ``,
  `      let rawSubject = defaultSubject;`,
  `      let rawBody = defaultBody;`,
  `      try {`,
  `        const { data: settingsData } = await supabase`,
  `          .from("admin_settings")`,
  `          .select("key, value")`,
  `          .in("key", ["acceptance_letter_subject", "acceptance_letter_body"]);`,
  `        if (settingsData && settingsData.length > 0) {`,
  `          const s = settingsData.find((r) => r.key === "acceptance_letter_subject")?.value;`,
  `          const b = settingsData.find((r) => r.key === "acceptance_letter_body")?.value;`,
  `          if (s) rawSubject = s;`,
  `          if (b) rawBody = b;`,
  `        }`,
  `      } catch {`,
  `        // admin_settings table not yet created — use built-in defaults`,
  `      }`,
].join(NL);

if (c.includes(OLD_FETCH_BLOCK)) {
  c = c.replace(OLD_FETCH_BLOCK, NEW_FETCH_BLOCK);
  console.log("✓ Replaced fetch block with full letter defaults");
} else {
  // Try LF
  const OLD_LF = OLD_FETCH_BLOCK.replace(/\r\n/g, "\n");
  if (c.includes(OLD_LF)) {
    c = c.replace(OLD_LF, NEW_FETCH_BLOCK.replace(/\r\n/g, "\n"));
    console.log("✓ Replaced fetch block (LF variant)");
  } else {
    console.error("✗ Could not find fetch block. Showing raw content near position:");
    const idx = c.indexOf("// Fetch template from admin_settings");
    if (idx !== -1) {
      console.log(JSON.stringify(c.substring(idx, idx + 800)));
    } else {
      console.error("Marker not found at all");
    }
    process.exit(1);
  }
}

writeFileSync("app/dashboard/page.tsx", c, "utf8");
console.log("✓ dashboard/page.tsx patched with full acceptance letter.");
