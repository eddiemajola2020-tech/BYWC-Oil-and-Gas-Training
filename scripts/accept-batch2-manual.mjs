import { createClient } from "@supabase/supabase-js";

const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A";
const admin = createClient("https://ivihcbceyzsvaduryuqv.supabase.co", SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const names = [
  { first: "Rejoice", last: "Kaelo" },
  { first: "Rachiel", last: "Khan" },
  { first: "Warona", last: "Setuke" },
];

for (const { first, last } of names) {
  const { data } = await admin
    .from("applications")
    .select("id, first_name, last_name, email, status, selection_bucket")
    .ilike("first_name", `%${first}%`)
    .ilike("last_name", `%${last}%`);

  if (!data?.length) {
    console.log(`NOT FOUND: ${first} ${last}`);
    continue;
  }

  for (const r of data) {
    console.log(`Found: ${r.first_name} ${r.last_name} | ID ${r.id} | ${r.email} | ${r.status}`);
    const { error } = await admin
      .from("applications")
      .update({
        status: "Accepted",
        selection_bucket: "Published - Applicant Visible / Batch 2 - Priority Override / Accepted Manually",
      })
      .eq("id", r.id);
    if (error) console.log(`  ERROR: ${error.message}`);
    else console.log(`  ✓ Updated to Accepted (Batch 2)`);
  }
}

const { count } = await admin.from("applications").select("id", { count: "exact", head: true }).eq("status", "Accepted");
console.log(`\nTotal Accepted now: ${count}`);
