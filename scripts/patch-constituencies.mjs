import { readFileSync, writeFileSync } from "fs";

const file = "app/admin/page.tsx";
let content = readFileSync(file, "utf8");

// Map old strings → new canonical strings (exact file text → replacement)
const replacements = [
  // constituencies array entries
  ['"Gabane/ Mankgodi"', '"Gabane-Mmankgodi"'],
  ['"Goodhope - Mmathethe"', '"Goodhope-Mmathethe"'],
  ['"Jwaneng – Mabutsane"', '"Jwaneng-Mabutsane"'],   // en dash
  ['"Lentsweletau - Lephepe"', '"Lentsweletau-Lephepe"'],
  ['"Mmopane - Metsimotlhabe"', '"Mmopane-Metsimotlhabe"'],
  ['"Moshupa - Manyana"', '"Moshupa-Manyana"'],
  ['"Nata – Gweta"', '"Nata-Gweta"'],                  // en dash
  ['"Thamaga - Kumakwane"', '"Thamaga-Kumakwane"'],
];

let changes = 0;
for (const [from, to] of replacements) {
  const count = (content.split(from).length - 1);
  if (count === 0) {
    console.warn(`WARNING: pattern not found: ${from}`);
    continue;
  }
  content = content.split(from).join(to);
  console.log(`  [${count}x] ${from} → ${to}`);
  changes += count;
}

writeFileSync(file, content, "utf8");
console.log(`\nDone. ${changes} replacements made.`);
