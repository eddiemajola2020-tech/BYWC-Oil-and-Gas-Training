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
const STRAGGLER = "Internal Hold - Do Not Notify / Unknown Batch - Food Straggler";
const now = () => new Date().toISOString();

const official = [
  { canonical: "Neo Nkanokang", aliases: ["Mosimanegape Nkanokang", "Neo Nkanokang"] },
  { canonical: "Metlha Mathaio" },
  { canonical: "Prince W. Mosweu", aliases: ["Prince W Mosweu", "Prince W.Mosweu"] },
  { canonical: "Maatla R. Bokhutlo", aliases: ["Maatla R. Bokhuto", "Maatla Bokhuto"] },
  { canonical: "Tshepo Ben", aliases: ["Tshepho Ben"] },
  { canonical: "Gift M. Kutoro", aliases: ["Gift Kutoro"] },
  { canonical: "Atamelang Budi" },
  { canonical: "Kealeboga Mmotlana" },
  { canonical: "Ditshegofatso R Mothobi", aliases: ["Ditsegofatsi R Mothobi", "Ditshegofatso R. Mothobi"] },
  { canonical: "Katlego P. Koloi", aliases: ["Katlego Precious Koloi"] },
  { canonical: "Oratile Kgwarana" },
  { canonical: "Dimpho Olaotse" },
  { canonical: "Mosimanegape Nkanokang" },
  { canonical: "Ontirile Rannyana" },
  { canonical: "Martin L. M Marguson", aliases: ["Martin L. M. Marguson"] },
  { canonical: "Honefar S. Dick", aliases: ["Honefar S.Dick"] },
  { canonical: "Boineelo L. Lesonya", aliases: ["Boineelo Lorraine Lesonya"] },
  { canonical: "Katlego Garekwe", aliases: ["Katlego Garekwa"] },
  { canonical: "Thato Makhiwa" },
  { canonical: "Morekolodi Gagoope" },
  { canonical: "Mikaene Diphoro" },
  { canonical: "Maduo Baitseng" },
  { canonical: "Katlego M. Moepeng", aliases: ["Katlego Mighty Moepeng"] },
  { canonical: "Koketso Molalapata" },
  { canonical: "Kagiso Ntswaneng" },
];

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return {
    first_name: parts.slice(0, -1).join(" "),
    last_name: parts.at(-1) || "",
  };
}

function fullName(row) {
  return `${row.first_name || ""} ${row.last_name || ""}`.trim();
}

function internalEmail(name) {
  return `noemail.${norm(name)}.chomeleng@bywc.internal`;
}

async function audit(applicationId, action, details) {
  await supabase.from("admin_audit_logs").insert({
    admin_email: "codex-maintenance",
    action,
    application_id: applicationId,
    details,
    created_at: now(),
  });
}

const { data: allRows, error: allError } = await supabase
  .from("applications")
  .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
  .or("selection_bucket.ilike.%Chomeleng%,first_name.ilike.%Nkanokang%,last_name.ilike.%Nkanokang%,email.ilike.%nkanokang%");

if (allError) throw new Error(allError.message);

const usedIds = new Set();
const officialResults = [];

for (const item of official) {
  const names = [item.canonical, ...(item.aliases || [])].map(norm);
  let match = allRows.find((row) => !usedIds.has(row.id) && names.includes(norm(fullName(row))));
  if (!match) {
    match = allRows.find((row) => {
      if (usedIds.has(row.id)) return false;
      const rowName = norm(fullName(row));
      return names.some((name) => rowName.includes(name) || name.includes(rowName));
    });
  }

  const canonicalParts = splitName(item.canonical);
  if (match) {
    usedIds.add(match.id);
    const { data, error } = await supabase
      .from("applications")
      .update({
        first_name: canonicalParts.first_name,
        last_name: canonicalParts.last_name,
        status: "Accepted",
        selection_bucket: CHOMELENG,
        arrival_status: "Arrived",
        arrived_at: now(),
        arrival_confirmed_by: "codex-maintenance",
        auto_review_result: "Accepted - official Chomeleng list",
        auto_review_notes: "Kept as part of the official Chomeleng food list and marked arrived.",
      })
      .eq("id", match.id)
      .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
      .single();
    if (error) throw new Error(error.message);
    await audit(data.application_id, "profile_edit", {
      repair: "Official Chomeleng list: kept active, normalized name, and marked arrived.",
      canonical: item.canonical,
      previous: match,
    });
    officialResults.push({ action: "kept", data });
  } else {
    const { data, error } = await supabase
      .from("applications")
      .insert({
        application_id: `BYWC-2026-CHOMELENG-OFFICIAL-${Date.now()}-${norm(item.canonical)}`,
        ...canonicalParts,
        email: internalEmail(item.canonical),
        phone: null,
        omang: null,
        status: "Accepted",
        selection_bucket: CHOMELENG,
        arrival_status: "Arrived",
        arrived_at: now(),
        arrival_confirmed_by: "codex-maintenance",
        submitted_at: now(),
        disability_status: "No",
        citizenship: "Citizen",
        employment_status: "",
        highest_qualification: "",
        bgcse_points: null,
        auto_review_result: "Accepted - official Chomeleng list",
        auto_review_notes: "Created from official Chomeleng food list and marked arrived.",
      })
      .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
      .single();
    if (error) throw new Error(error.message);
    usedIds.add(data.id);
    await audit(data.application_id, "manual_profile_created_arrived", {
      repair: "Official Chomeleng list: created missing member and marked arrived.",
      canonical: item.canonical,
    });
    officialResults.push({ action: "created", data });
  }
}

const { data: activeChomeleng, error: activeError } = await supabase
  .from("applications")
  .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
  .eq("selection_bucket", CHOMELENG);
if (activeError) throw new Error(activeError.message);

const stragglers = activeChomeleng.filter((row) => !usedIds.has(row.id));
const stragglerResults = [];
for (const row of stragglers) {
  const { data, error } = await supabase
    .from("applications")
    .update({
      selection_bucket: STRAGGLER,
      arrival_status: "Not Arrived",
      status: row.status === "Accepted" ? "Deferred" : row.status,
      auto_review_result: "Unknown batch - Chomeleng straggler",
      auto_review_notes: "Moved out of Chomeleng official food list. Does not count toward arrived totals.",
    })
    .eq("id", row.id)
    .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
    .single();
  if (error) throw new Error(error.message);
  await audit(data.application_id, "profile_edit", {
    repair: "Moved Chomeleng straggler to unknown batch and marked not arrived so they do not add to arrived totals.",
    previous: row,
  });
  stragglerResults.push(data);
}

const { data: finalRows, error: finalError } = await supabase
  .from("applications")
  .select("id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
  .eq("selection_bucket", CHOMELENG)
  .order("first_name", { ascending: true });
if (finalError) throw new Error(finalError.message);

const { count: stragglerCount, error: countError } = await supabase
  .from("applications")
  .select("id", { count: "exact", head: true })
  .eq("selection_bucket", STRAGGLER);
if (countError) throw new Error(countError.message);

console.log(JSON.stringify({
  officialRequested: official.length,
  officialActiveCount: finalRows.length,
  unknownStragglerMovedThisRun: stragglerResults.length,
  unknownStragglerTotal: stragglerCount,
  officialResults,
  stragglerResults,
  finalRows,
}, null, 2));
