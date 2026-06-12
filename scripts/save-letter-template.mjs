import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const subject = "RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026 — BATCH 2";

const body = `Congratulations, {{fullName}}!

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

const { error } = await admin.from("admin_settings").upsert([
  { key: "acceptance_letter_subject", value: subject, updated_at: new Date().toISOString() },
  { key: "acceptance_letter_body", value: body, updated_at: new Date().toISOString() },
]);

if (error) { console.error("FAILED:", error.message); }
else {
  console.log("Letter template saved successfully.");
  console.log("\nSUBJECT:", subject);
  console.log("\nBODY PREVIEW (first 300 chars):", body.substring(0, 300));
}
