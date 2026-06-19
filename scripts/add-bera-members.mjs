import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A"
);

const BUCKET = "Published - Applicant Visible / Batch 2 - BERA Special";

const members = [
  {
    application_id: "BYWC-2026-BERA-001",
    first_name: "Metlha",
    last_name: "Rabana",
    phone: "75447435",
    omang: null,
    email: null,
    gender: null,
    age: null,
    constituency: null,
  },
  {
    application_id: "BYWC-2026-BERA-002",
    first_name: "Lesego",
    last_name: "Mabiletsa",
    phone: "72912786",
    omang: "978511606",
    email: null,
    gender: null,
    age: null,
    constituency: null,
  },
];

const records = members.map((p) => ({
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

const { data: inserted, error } = await supabase
  .from("applications")
  .insert(records)
  .select("id, first_name, last_name");

if (error) { console.error("Insert failed:", error.message); process.exit(1); }
console.log(`Inserted ${inserted.length} BERA members:`);
inserted.forEach((r) => console.log(`  ✓ [${r.id}] ${r.first_name} ${r.last_name}`));
