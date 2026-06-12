import { createClient } from "@supabase/supabase-js";

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A";

const admin = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAIL = "foragampoi@gmail.com";
const REDIRECT_URL = "https://bywcprogram.org/create-new-password";

// 1. Check for duplicate
const { data: existing } = await admin
  .from("applications")
  .select("id, first_name, last_name, email, omang")
  .or(`email.ilike.${EMAIL},omang.eq.045529719`);

if (existing && existing.length > 0) {
  console.log("Record already exists:");
  console.log(JSON.stringify(existing, null, 2));
  process.exit(0);
}

// 2. Insert
const { data: inserted, error: insertErr } = await admin
  .from("applications")
  .insert({
    first_name: "Seibofeng",
    last_name: "Foraga",
    email: EMAIL,
    omang: "045529719",
    gender: "Female",
    date_of_birth: "1986-10-30",
    citizenship: "Citizen",
    district: "Central",
    town_village: "Serowe",
    constituency: "Serowe East",
    address: "Serowe, Central District",

    highest_qualification: "BGCSE",
    bgcse_level: "BGCSE",
    bgcse_points: 21,
    completed_bgcse_igcse: "Yes",
    examination_type: "BGCSE",
    examination_body: "Botswana Examinations Council",

    disability_status: "No",
    ovc_status: "No",
    preferred_language: "English",
    english_comfort: "Comfortable",

    eligibility_score: 75,
    eligibility_result: "Eligible",
    auto_review_score: 75,
    auto_review_result: "Eligible",
    priority_group: "Woman",

    status: "Submitted",
    selection_bucket: "Internal Hold - Do Not Notify / Batch 2 - Central",

    arrival_status: "Not Arrived",
    arrival_disclaimer_accepted: false,
    registration_status: "Pending",
    privacy_consent_given: false,
    has_dietary_restrictions: false,
    tertiary_education: "No",
  })
  .select("id, first_name, last_name, email, omang, selection_bucket")
  .single();

if (insertErr) {
  console.error("Insert error:", insertErr.message);
  process.exit(1);
}

console.log("✓ Inserted:", inserted);

// 3. Create auth account
const { error: authErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  email_confirm: true,
});
if (authErr && !authErr.message.toLowerCase().includes("already")) {
  console.error("Auth error:", authErr.message);
} else {
  console.log("✓ Auth account ready");
}

// 4. Generate login link
const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
  type: "recovery",
  email: EMAIL,
  options: { redirectTo: REDIRECT_URL },
});
if (linkErr) {
  console.error("Link error:", linkErr.message);
} else {
  console.log("\n✓ Login link for Seibofeng Foraga (share with applicant):");
  console.log(link?.properties?.action_link);
}
