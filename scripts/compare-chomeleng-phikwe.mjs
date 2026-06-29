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

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function personName(row) {
  return `${row.first_name || ""} ${row.last_name || ""}`.trim();
}

function rowSummary(row) {
  return {
    id: row.id,
    name: personName(row),
    omang: row.omang,
    phone: row.phone,
    email: row.email,
    bucket: row.selection_bucket,
  };
}

const { data, error } = await supabase
  .from("applications")
  .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
  .or("selection_bucket.ilike.%Chomeleng%,selection_bucket.ilike.%Phikwe%")
  .order("selection_bucket", { ascending: true })
  .order("first_name", { ascending: true });

if (error) throw new Error(error.message);

const chomeleng = data.filter((row) => (row.selection_bucket || "").toLowerCase().includes("chomeleng"));
const phikwe = data.filter((row) => (row.selection_bucket || "").toLowerCase().includes("phikwe"));

const overlaps = [];
for (const c of chomeleng) {
  for (const p of phikwe) {
    const reasons = [];
    if (norm(c.omang) && norm(c.omang) === norm(p.omang)) reasons.push("omang");
    if (norm(c.phone) && norm(c.phone) === norm(p.phone)) reasons.push("phone");
    if (norm(c.email) && norm(c.email) === norm(p.email)) reasons.push("email");
    if (norm(personName(c)) && norm(personName(c)) === norm(personName(p))) reasons.push("exact_name");

    const cName = norm(personName(c));
    const pName = norm(personName(p));
    if (!reasons.length && cName && pName && (cName.includes(pName) || pName.includes(cName))) {
      reasons.push("similar_name");
    }

    if (reasons.length) {
      overlaps.push({ reasons, chomeleng: rowSummary(c), phikwe: rowSummary(p) });
    }
  }
}

function repeatedWithin(rows, label) {
  const maps = {
    name: new Map(),
    omang: new Map(),
    phone: new Map(),
    email: new Map(),
  };

  for (const row of rows) {
    const values = {
      name: norm(personName(row)),
      omang: norm(row.omang),
      phone: norm(row.phone),
      email: norm(row.email),
    };
    for (const [field, value] of Object.entries(values)) {
      if (!value) continue;
      if (!maps[field].has(value)) maps[field].set(value, []);
      maps[field].get(value).push(row);
    }
  }

  const repeats = [];
  for (const [field, map] of Object.entries(maps)) {
    for (const [key, rowsForKey] of map.entries()) {
      if (rowsForKey.length > 1) {
        repeats.push({
          list: label,
          field,
          key,
          people: rowsForKey.map(rowSummary),
        });
      }
    }
  }
  return repeats;
}

const repeats = [
  ...repeatedWithin(chomeleng, "Chomeleng"),
  ...repeatedWithin(phikwe, "Phikwe"),
];

const output = {
  counts: { chomeleng: chomeleng.length, phikwe: phikwe.length },
  overlapCount: overlaps.length,
  overlaps,
  repeatCount: repeats.length,
  repeats,
};

fs.writeFileSync("reports/chomeleng-vs-phikwe-duplicates.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
