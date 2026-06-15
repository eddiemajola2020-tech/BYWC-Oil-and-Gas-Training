import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A"
);

const { data, error } = await supabase
  .from("applications")
  .update({ constituency: "Serowe West" })
  .eq("constituency", "Serowe East")
  .select("application_id, first_name, last_name, constituency");

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

console.log(`Updated ${data.length} record(s):`);
data.forEach((r) =>
  console.log(`  ${r.first_name} ${r.last_name} (${r.application_id}) → ${r.constituency}`)
);
