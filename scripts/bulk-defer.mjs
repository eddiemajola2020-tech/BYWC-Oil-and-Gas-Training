import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "sb_publishable_ZIW6cmjZ-WRsUzQJvwtmsQ_t6hlzbJp",
);

const TARGETS = [
  { first: "Lorato", last: "Lekau" },
  { first: "Keitumetse", last: "Seal" },
  { first: "Unami", last: "Mudongo" },
  { first: "Rikondja", last: "Doreen" },
  { first: "Tirelo", last: "Pharithi" },
  { first: "Oreneile", last: "Cebani" },
  { first: "Kgomotso", last: "Uridi" },
  { first: "Dimpho", last: "Kololo" },
  { first: "Caroline", last: "Matsogo" },
  { first: "Lebogang", last: "Beno" },
  { first: "Megan", last: "Ngwenya" },
  { first: "Michaela", last: "Onalena" },
  { first: "Michelle", last: "Morotsi" },
  { first: "Kamogelo", last: "Black" },
  { email: "altarhlets48@gmail.com" },
  { first: "Goitsemang", last: "Phillimon" },
  { first: "Tshegofatso", last: "Bakgomogi" },
  { first: "Oabale", last: "Sennanyana" },
  { first: "Goitseone", last: "Seitei" },
  { first: "Nametso", last: "Gontlafetse" },
  { first: "Kagelelo", last: "Mankwe" },
  { first: "Maatla", last: "Kgaratsi" },
  { first: "Dolly", last: "Ramonnanyana" },
  { first: "Boikanyo", last: "Kabainaa" },
  { first: "Gofaone", last: "Ngoma" },
  { first: "Kefilwe", last: "Thapelo" },
  { first: "Neo", last: "Monyere" },
  { first: "Olorato", last: "Mokgosi" },
  { first: "Thato", last: "Lebekwe" },
  { first: "Nametsegang", last: "Motaung" },
  { first: "Gobona", last: "Badirile" },
];

async function findAndDefer(target) {
  let query = supabase.from("applications").select("application_id, first_name, last_name, email, status");

  if (target.email) {
    query = query.ilike("email", target.email);
  } else {
    query = query
      .ilike("first_name", `%${target.first}%`)
      .ilike("last_name", `%${target.last}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`  ERROR querying for ${target.first ?? target.email} ${target.last ?? ""}: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    // Try broader search — last name only, case-insensitive
    if (!target.email) {
      const { data: broad } = await supabase
        .from("applications")
        .select("application_id, first_name, last_name, email, status")
        .ilike("first_name", `%${target.first}%`);

      if (broad && broad.length > 0) {
        console.warn(`  NOT FOUND with both names. Closest matches for first name "${target.first}":`);
        broad.slice(0, 3).forEach((r) =>
          console.warn(`    → ${r.first_name} ${r.last_name} (${r.email}) status=${r.status}`),
        );
      } else {
        console.warn(`  NOT FOUND: ${target.first} ${target.last}`);
      }
    } else {
      console.warn(`  NOT FOUND: ${target.email}`);
    }
    return;
  }

  for (const row of data) {
    const label = `${row.first_name} ${row.last_name} (${row.email})`;
    if (row.status === "Deferred") {
      console.log(`  ALREADY DEFERRED: ${label}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: "Deferred", selection_bucket: "Deferred - Next Intake" })
      .eq("application_id", row.application_id);

    if (updateError) {
      console.error(`  FAILED to defer ${label}: ${updateError.message}`);
    } else {
      console.log(`  DEFERRED: ${label} (was: ${row.status})`);
    }
  }
}

console.log("Starting bulk defer...\n");
for (const target of TARGETS) {
  const label = target.email ?? `${target.first} ${target.last}`;
  console.log(`Processing: ${label}`);
  await findAndDefer(target);
}
console.log("\nDone.");
