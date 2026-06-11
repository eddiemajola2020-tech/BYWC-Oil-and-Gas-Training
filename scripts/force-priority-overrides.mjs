import { createClient } from "@supabase/supabase-js";

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A";

const admin = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Full list — same as STRATEGIC_COVERAGE_EMAILS in app/admin/page.tsx
const ALL_EMAILS = [
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
  "lesenyaonalenna@gmail.com",
  "pearlsithole21@gmail.com",
  "thatomakw982@gmail.com",
  "friedahherbert27@gmail.com",
  "malopemopati@gmail.com",
  "babantshomatilda@gmail.com",
  "pifelog@gmail.com",
  "bafetetelo@gmail.com",
];

console.log(`Checking ${ALL_EMAILS.length} priority override accounts...\n`);

const skipped = [];
const forced = [];
const notFound = [];
const failed = [];

for (const email of ALL_EMAILS) {
  const { data: rows, error } = await admin
    .from("applications")
    .select("id, first_name, last_name, email, status, selection_bucket, constituency, age")
    .eq("email", email)
    .limit(1);

  if (error) {
    console.error(`  ERROR fetching ${email}:`, error.message);
    failed.push(email);
    continue;
  }

  if (!rows || rows.length === 0) {
    console.log(`  NOT FOUND: ${email}`);
    notFound.push(email);
    continue;
  }

  const row = rows[0];
  const bucket = row.selection_bucket || "";

  // Already in Batch 2 (Internal Hold or Published) — skip
  if (bucket.includes("Batch 2 -")) {
    console.log(`  SKIP (already Batch 2): ${email} → ${bucket.substring(0, 80)}`);
    skipped.push(email);
    continue;
  }

  // Determine constituency label
  const constituency = row.constituency || "Strategic Coverage";
  const newBucket = `Published - Applicant Visible / Batch 2 - Priority Override / ${constituency}`;

  const { error: upErr } = await admin
    .from("applications")
    .update({
      status: "Accepted",
      selection_bucket: newBucket,
      auto_review_notes:
        "Priority override — manual inclusion authorised by programme admin. Hard gate bypassed.",
    })
    .eq("id", row.id);

  if (upErr) {
    console.error(`  FAILED to update ${email} (ID ${row.id}):`, upErr.message);
    failed.push(email);
  } else {
    console.log(`  FORCED: ${row.first_name} ${row.last_name} (${email}) → ${newBucket}`);
    forced.push({ email, name: `${row.first_name} ${row.last_name}`, bucket: newBucket });
  }
}

console.log("\n--- SUMMARY ---");
console.log(`Total checked : ${ALL_EMAILS.length}`);
console.log(`Already Batch 2 (skipped): ${skipped.length}`);
console.log(`Forced into Batch 2 NOW  : ${forced.length}`);
console.log(`Not found in DB          : ${notFound.length}`);
console.log(`Errors                   : ${failed.length}`);

if (forced.length > 0) {
  console.log("\nForced accounts:");
  for (const f of forced) {
    console.log(`  - ${f.name} <${f.email}>`);
    console.log(`    → ${f.bucket}`);
  }
}
if (notFound.length > 0) console.log("\nNot found:", notFound.join(", "));
if (failed.length > 0) console.log("\nFailed:", failed.join(", "));

// Final Batch 2 total
const { count } = await admin
  .from("applications")
  .select("id", { count: "exact", head: true })
  .or(
    "selection_bucket.ilike.Internal Hold - Do Not Notify / Batch 2 -%,selection_bucket.ilike.Published - Applicant Visible / Batch 2 -%"
  );
console.log(`\nTotal Batch 2 records in DB now: ${count}`);
