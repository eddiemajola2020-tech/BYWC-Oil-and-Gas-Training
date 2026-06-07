import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "sb_publishable_ZIW6cmjZ-WRsUzQJvwtmsQ_t6hlzbJp",
);

// Rikondja Doreen — DB stores as "Rikondja Doreen Muzeu", middle name was given as last
// Defer by email found in the broad search
const fixes = [
  { email: "kkaombokoednah@outlook.com", name: "Rikondja Doreen Muzeu" },
];

for (const fix of fixes) {
  const { data, error } = await supabase
    .from("applications")
    .select("application_id, first_name, last_name, email, status")
    .ilike("email", fix.email);

  if (error || !data || data.length === 0) {
    console.warn(`NOT FOUND: ${fix.name} (${fix.email})`);
    continue;
  }

  for (const row of data) {
    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: "Deferred", selection_bucket: "Deferred - Next Intake" })
      .eq("application_id", row.application_id);

    if (updateError) {
      console.error(`FAILED: ${row.first_name} ${row.last_name} — ${updateError.message}`);
    } else {
      console.log(`DEFERRED: ${row.first_name} ${row.last_name} (${row.email}) was: ${row.status}`);
    }
  }
}

console.log("Done.");
