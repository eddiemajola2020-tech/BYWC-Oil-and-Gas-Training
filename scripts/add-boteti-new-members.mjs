import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A"
);

const BUCKET = "Published - Applicant Visible / Batch 2 - Boteti Special";

// Step 1: Update Engelina Katholo (already in DB as [16805]) with full details
const { data: updated, error: updateErr } = await supabase
  .from("applications")
  .update({
    first_name: "Engelinah Goabaone",
    last_name: "Katholo",
    omang: "246728713",
    phone: "72857160",
    email: "engelinahkatholo@gmail.com",
    gender: "Female",
    arrival_status: "Arrived",
    arrived_at: new Date().toISOString(),
    arrival_confirmed_by: "oil-gas.training@sethresources.com",
  })
  .eq("id", 16805)
  .select("id, first_name, last_name");

if (updateErr) { console.error("Update failed:", updateErr.message); process.exit(1); }
console.log(`Updated: [${updated[0]?.id}] ${updated[0]?.first_name} ${updated[0]?.last_name}`);

// Step 2: Insert 3 new Boteti members
const newMembers = [
  {
    application_id: "BYWC-2026-BOTETI-016",
    first_name: "Thabo",
    last_name: "Ntsosa",
    email: "thabontsosa9@gmail.com",
    phone: "71278797",
    omang: "386410116",
    gender: "Male",
    age: null,
    constituency: null,
  },
  {
    application_id: "BYWC-2026-BOTETI-017",
    first_name: "Angel-Faith T.T.",
    last_name: "Kapele",
    email: "angelkapele06@gmail.com",
    phone: "75002073",
    omang: "588021715",
    gender: "Female",
    age: 20,
    constituency: null,
  },
  {
    application_id: "BYWC-2026-BOTETI-018",
    first_name: "Shadreck",
    last_name: "Teseletso",
    email: "honteseletso@gmail.com",
    phone: "71731192",
    omang: "408913717",
    gender: "Male",
    age: null,
    constituency: null,
  },
];

const records = newMembers.map((p) => ({
  ...p,
  town_village: null,
  disability_status: "No",
  citizenship: "Citizen",
  employment_status: "",
  interest_area: "",
  highest_qualification: "",
  bgcse_points: null,
  preferred_language: "",
  status: "Accepted",
  selection_bucket: BUCKET,
  arrival_status: "Arrived",
  arrived_at: new Date().toISOString(),
  arrival_confirmed_by: "oil-gas.training@sethresources.com",
  submitted_at: new Date().toISOString(),
}));

const { data: inserted, error: insertErr } = await supabase
  .from("applications")
  .insert(records)
  .select("id, first_name, last_name");

if (insertErr) { console.error("Insert failed:", insertErr.message); process.exit(1); }
console.log(`\nInserted ${inserted.length} new Boteti members:`);
inserted.forEach((r) => console.log(`  ✓ [${r.id}] ${r.first_name} ${r.last_name}`));
