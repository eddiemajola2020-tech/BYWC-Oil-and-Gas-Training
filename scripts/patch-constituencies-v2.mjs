/**
 * Patch 1: Update constituencies array in admin/page.tsx to use the
 *           official names provided by the user.
 * Patch 2: Fix DB entries that were incorrectly normalized in the previous
 *           pass (they were given no-space hyphen names; now re-map them to
 *           the correct spaced canonical names).
 */

import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ── 1. Patch the code file ────────────────────────────────────────────────────

const file = "app/admin/page.tsx";
let content = readFileSync(file, "utf8");

// wrong (my previous patch) → correct (user's official list)
const codeReplacements = [
  ['"Gabane-Mmankgodi"',       '"Gabane / Mankgodi"'],
  ['"Goodhope-Mmathethe"',     '"Goodhope - Mmathethe"'],
  ['"Jwaneng-Mabutsane"',      '"Jwaneng - Mabutsane"'],
  ['"Lentsweletau-Lephepe"',   '"Lentsweletau - Lephepe"'],
  ['"Mmopane-Metsimotlhabe"',  '"Mmopane - Metsimotlhabe"'],
  ['"Moshupa-Manyana"',        '"Moshupa - Manyana"'],
  ['"Nata-Gweta"',             '"Nata - Gweta"'],
  ['"Thamaga-Kumakwane"',      '"Thamaga - Kumakwane"'],
];

let codeChanges = 0;
for (const [from, to] of codeReplacements) {
  const count = content.split(from).length - 1;
  if (count === 0) { console.warn(`WARNING: not found in code: ${from}`); continue; }
  content = content.split(from).join(to);
  console.log(`  code [${count}x] ${from} → ${to}`);
  codeChanges += count;
}

writeFileSync(file, content, "utf8");
console.log(`\nCode: ${codeChanges} replacements written.\n`);

// ── 2. Fix DB entries ─────────────────────────────────────────────────────────

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "sb_publishable_ZIW6cmjZ-WRsUzQJvwtmsQ_t6hlzbJp",
);

// wrong DB value (my previous pass set these) → correct canonical
const dbFixes = [
  ["Gabane-Mmankgodi",      "Gabane / Mankgodi"],
  ["Goodhope-Mmathethe",    "Goodhope - Mmathethe"],
  ["Jwaneng-Mabutsane",     "Jwaneng - Mabutsane"],
  ["Lentsweletau-Lephepe",  "Lentsweletau - Lephepe"],
  ["Mmopane-Metsimotlhabe", "Mmopane - Metsimotlhabe"],
  ["Moshupa-Manyana",       "Moshupa - Manyana"],
  ["Nata-Gweta",            "Nata - Gweta"],
  ["Thamaga-Kumakwane",     "Thamaga - Kumakwane"],
];

let dbTotal = 0;
let dbErrors = 0;

for (const [oldVal, newVal] of dbFixes) {
  const { error, count } = await supabase
    .from("applications")
    .update({ constituency: newVal })
    .eq("constituency", oldVal);

  if (error) {
    console.error(`  DB ERROR "${oldVal}": ${error.message}`);
    dbErrors++;
  } else {
    console.log(`  DB ✓ "${oldVal}" → "${newVal}"`);
    dbTotal++;
  }
}

console.log(`\nDB: ${dbTotal} values updated, ${dbErrors} errors.`);
