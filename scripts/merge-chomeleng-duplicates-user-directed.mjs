import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envText = fs.readFileSync(".env.local", "utf8");
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const CHOMELENG = "Published - Applicant Visible / Batch 2 - Chomeleng Special";
const now = () => new Date().toISOString();

async function update(id, patch, note) {
  const { data, error } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", id)
    .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("admin_audit_logs").insert({
    admin_email: "codex-maintenance",
    action: "profile_edit",
    application_id: data.application_id,
    details: note,
    created_at: now(),
  });

  return data;
}

const changes = [];

// Pair 1: keep both rows counted in Chomeleng, but normalize the displayed name.
for (const id of [3684, 16877]) {
  changes.push(await update(id, {
    first_name: "Ditsegofatsi R",
    last_name: "Mothobi",
    status: "Accepted",
    selection_bucket: CHOMELENG,
    arrival_status: "Arrived",
    arrived_at: now(),
    arrival_confirmed_by: "codex-maintenance",
    duplicate_flag: true,
    duplicate_reason: "Intentional Chomeleng duplicate count retained per admin instruction; both rows represent the same attendee name and should be counted twice for the food/special list.",
  }, {
    repair: "Normalized duplicate pair 1 to Ditsegofatsi R Mothobi while keeping both Chomeleng rows accepted so the food/special count remains doubled as instructed.",
  }));
}

// Pair 3: merge Sir Morekaodi into Morekolodi; keep Morekolodi active.
changes.push(await update(1978, {
  first_name: "Morekolodi",
  last_name: "Gagoope",
  status: "Accepted",
  selection_bucket: CHOMELENG,
  arrival_status: "Arrived",
  arrived_at: now(),
  arrival_confirmed_by: "codex-maintenance",
}, {
  repair: "Merged Chomeleng duplicate pair 3 by keeping Morekolodi Gagoope as the active accepted Chomeleng profile.",
  merged_from_id: 16884,
}));

changes.push(await update(16884, {
  status: "Rejected",
  selection_bucket: "Duplicate - Merged into BYWC-2026-1778486720388",
  arrival_status: "Not Arrived",
  duplicate_flag: true,
  duplicate_reason: "Merged into Morekolodi Gagoope / BYWC-2026-1778486720388 per admin instruction.",
}, {
  repair: "Merged Chomeleng duplicate pair 3 by excluding Sir Morekaodi Gagoope from the active Chomeleng count.",
  merged_into: "BYWC-2026-1778486720388",
}));

// Pair 4: keep Ontirile active; merge/exclude Quech.
changes.push(await update(3614, {
  first_name: "Ontirile",
  last_name: "Rannyana",
  status: "Accepted",
  selection_bucket: CHOMELENG,
  arrival_status: "Arrived",
  arrived_at: now(),
  arrival_confirmed_by: "codex-maintenance",
}, {
  repair: "Merged Chomeleng duplicate pair 4 by keeping Ontirile Rannyana as the active accepted Chomeleng profile.",
  merged_from_id: 16879,
}));

changes.push(await update(16879, {
  status: "Rejected",
  selection_bucket: "Duplicate - Merged into BYWC-2026-1778966735538",
  arrival_status: "Not Arrived",
  duplicate_flag: true,
  duplicate_reason: "Quech Ontirile Rannyama excluded and merged into Ontirile Rannyana / BYWC-2026-1778966735538 per admin instruction.",
}, {
  repair: "Merged Chomeleng duplicate pair 4 and excluded Quech from the active Chomeleng count.",
  merged_into: "BYWC-2026-1778966735538",
}));

const { data: countRows, error: countError } = await supabase
  .from("applications")
  .select("id,first_name,last_name,omang,phone,email,status,selection_bucket")
  .eq("selection_bucket", CHOMELENG)
  .eq("status", "Accepted")
  .order("first_name", { ascending: true });
if (countError) throw new Error(countError.message);

console.log(JSON.stringify({
  changes,
  activeChomelengCount: countRows.length,
  activeChomelengDuplicateOmangs: countRows.reduce((acc, row) => {
    if (!row.omang) return acc;
    const key = String(row.omang).replace(/\D/g, "");
    if (!key) return acc;
    acc[key] = acc[key] || [];
    acc[key].push({ id: row.id, name: `${row.first_name || ""} ${row.last_name || ""}`.trim(), phone: row.phone, email: row.email });
    return acc;
  }, {}),
}, null, 2));
