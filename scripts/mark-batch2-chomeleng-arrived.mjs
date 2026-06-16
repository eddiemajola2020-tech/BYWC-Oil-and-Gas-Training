import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A"
);

const { data, error } = await supabase
  .from("applications")
  .update({
    arrival_status: "Arrived",
    arrived_at: new Date().toISOString(),
    arrival_confirmed_by: "oil-gas.training@sethresources.com",
  })
  .eq("selection_bucket", "Published - Applicant Visible / Batch 2 - Chomeleng Special")
  .select("id, first_name, last_name, arrival_status");

if (error) { console.error("Failed:", error.message); process.exit(1); }

console.log(`Marked ${data.length} Chomeleng Special (Batch 2) members as Arrived:\n`);
data.forEach((r) => console.log(`  ✓ [${r.id}] ${r.first_name} ${r.last_name}`));
