import { createClient } from "@supabase/supabase-js";

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A";

const admin = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await admin
  .from("applications")
  .select("id, selection_bucket, status")
  .ilike("selection_bucket", "Internal Hold - Do Not Notify / Rejected -%");

if (error) { console.error(error.message); process.exit(1); }
console.log(`Found ${data.length} Internal Hold Rejected records to publish`);

let updated = 0;
for (const row of data) {
  const newBucket = row.selection_bucket.replace(
    "Internal Hold - Do Not Notify",
    "Published - Applicant Visible"
  );
  const { error: upErr } = await admin
    .from("applications")
    .update({ status: "Rejected", selection_bucket: newBucket })
    .eq("id", row.id);
  if (upErr) console.error(`  ID ${row.id} failed:`, upErr.message);
  else updated++;
}

console.log(`\n✓ Published ${updated} / ${data.length} rejected applicants.`);
