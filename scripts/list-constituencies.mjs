import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "sb_publishable_ZIW6cmjZ-WRsUzQJvwtmsQ_t6hlzbJp",
);

const { data, error } = await supabase
  .from("applications")
  .select("constituency")
  .not("constituency", "is", null)
  .neq("constituency", "");

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

const counts = {};
for (const row of data) {
  const c = (row.constituency || "").trim();
  if (!c) continue;
  counts[c] = (counts[c] || 0) + 1;
}

const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
console.log(`\nTotal unique values: ${sorted.length}\n`);
for (const [name, count] of sorted) {
  console.log(`  ${count.toString().padStart(5)}  ${name}`);
}
