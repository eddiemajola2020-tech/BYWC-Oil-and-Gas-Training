import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(url, serviceKey);

const CHOMELENG = "Published - Applicant Visible / Batch 2 - Chomeleng Special";
const STRAGGLER = "Internal Hold - Do Not Notify / Unknown Batch - Food Straggler";

const expected = [
  "Neo Nkanokang",
  "Metlha Mathaio",
  "Prince W. Mosweu",
  "Maatla R. Bokhutlo",
  "Tshepo Ben",
  "Gift M. Kutoro",
  "Atamelang Budi",
  "Kealeboga Mmotlana",
  "Ditshegofatso R Mothobi",
  "Katlego P. Koloi",
  "Oratile Kgwarana",
  "Dimpho Olaotse",
  "Mosimanegape Nkanokang",
  "Ontirile Rannyana",
  "Martin L. M Marguson",
  "Honefar S. Dick",
  "Boineelo L. Lesonya",
  "Katlego Garekwe",
  "Thato Makhiwa",
  "Morekolodi Gagoope",
  "Mikaene Diphoro",
  "Maduo Baitseng",
  "Katlego M. Moepeng",
  "Koketso Molalapata",
  "Kagiso Ntswaneng",
];

function fullName(row) {
  return `${row.first_name || ""} ${row.last_name || ""}`.replace(/\s+/g, " ").trim();
}

function norm(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function listBucket(bucket) {
  const { data, error } = await supabase
    .from("applications")
    .select("id,first_name,last_name,omang,phone,email,status,selection_bucket,arrival_status")
    .eq("selection_bucket", bucket)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) throw error;
  return data || [];
}

const officialRows = await listBucket(CHOMELENG);
const stragglerRows = await listBucket(STRAGGLER);
const officialNames = officialRows.map(fullName);
const officialSet = new Set(officialNames.map(norm));
const missing = expected.filter((name) => !officialSet.has(norm(name)));
const extra = officialNames.filter((name) => !expected.some((wanted) => norm(wanted) === norm(name)));
const notArrivedOfficial = officialRows.filter((row) => row.arrival_status !== "Arrived");
const arrivedStragglers = stragglerRows.filter((row) => row.arrival_status === "Arrived");

const duplicateKeys = new Map();
for (const row of officialRows) {
  const key = row.omang || row.phone || row.email || norm(fullName(row));
  if (!key) continue;
  const rows = duplicateKeys.get(key) || [];
  rows.push(row);
  duplicateKeys.set(key, rows);
}

const repeatedOfficialIdentifiers = [...duplicateKeys.values()]
  .filter((rows) => rows.length > 1)
  .map((rows) => rows.map((row) => `${row.id}:${fullName(row)}:${row.omang || row.phone || row.email || ""}`));

console.log(JSON.stringify({
  officialCount: officialRows.length,
  expectedCount: expected.length,
  missing,
  extra,
  notArrivedOfficial: notArrivedOfficial.map((row) => `${row.id}:${fullName(row)}`),
  stragglerCount: stragglerRows.length,
  arrivedStragglers: arrivedStragglers.map((row) => `${row.id}:${fullName(row)}`),
  repeatedOfficialIdentifiers,
  officialNames,
  stragglerNames: stragglerRows.map((row) => `${fullName(row)} (${row.status}, ${row.arrival_status})`),
}, null, 2));
