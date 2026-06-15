import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A"
);

const PHIKWE_BUCKET = "Published - Applicant Visible / Batch 1 - Phikwe Special";
const GOODHOPE_BUCKET = "Published - Applicant Visible / Batch 1 - Gamalete-GoodHope Special";

const phikwePeople = [
  { first_name: "Chisola Katlego D", last_name: "Ramosamo" },
  { first_name: "Thuto Maatla",      last_name: "Osekiseng" },
  { first_name: "Thabang",           last_name: "Mooketse" },
  { first_name: "Theo",              last_name: "Maesi" },
  { first_name: "Olerato",           last_name: "Nthompe" },
  { first_name: "Pearl",             last_name: "Muzila" },
  { first_name: "Duncan",            last_name: "Kebaitse" },
  { first_name: "Kevin",             last_name: "Mapunya" },
  { first_name: "Duncan",            last_name: "Khunong" },
  { first_name: "Leonard",           last_name: "Sebudubudu" },
  { first_name: "Loveness",          last_name: "Madome" },
  { first_name: "Morongwa",          last_name: "Masitha" },
  { first_name: "Gomolemo",          last_name: "Bowena" },
  { first_name: "Omphemetse",        last_name: "Makoba" },
  { first_name: "Poloko",            last_name: "Mabifihe" },
  { first_name: "Kerswell",          last_name: "Makhura" },
  { first_name: "Fikile",            last_name: "Masilo" },
  { first_name: "Nozipho",           last_name: "Kebadile" },
  { first_name: "Rose",              last_name: "Kegomoditswe" },
  { first_name: "Olebogeng",         last_name: "Thapelo" },
];

const goodhopePeople = [
  { first_name: "Refilwe Sphiwe", last_name: "Molefe",       omang: "857025724",  age: 28, gender: "Female", phone: null,         town_village: null },
  { first_name: "Ramatlabama Kaone", last_name: "Mashiakgomo", omang: "216926328", age: 30, gender: "Female", phone: "72325827",   town_village: "Pitsane" },
  { first_name: "Puseletso",       last_name: "Makgetha",      omang: "105622727", age: 34, gender: "Female", phone: "72337404",   town_village: null },
  { first_name: "Tlhareseleele Tsaone", last_name: "Magashula", omang: "121529818", age: 34, gender: "Female", phone: "77902780",  town_village: null },
  { first_name: "Cwaagare Thabang Moagi", last_name: "Dikoloti", omang: "464514519", age: 34, gender: "Male", phone: "75188463",  town_village: "Lorwana" },
  { first_name: "Boago",           last_name: "Mogotsi",       omang: "336115929", age: 26, gender: "Male",   phone: "72833361",   town_village: "Digawana" },
  { first_name: "Samuel",          last_name: "Mokopakgosi",   omang: "254216319", age: 29, gender: "Male",   phone: "72703826",   town_village: "Gatampa" },
  { first_name: "Dithapelo Elias", last_name: "Moyo",          omang: null,        age: null, gender: null,   phone: "72662929",   town_village: null, disability_status: "PLWD" },
];

function makeRecord(person, bucket, constituency, index, prefix) {
  const slug = `${person.first_name.toLowerCase().replace(/\s+/g, "")}.${person.last_name.toLowerCase()}`;
  return {
    application_id: `BYWC-2026-${prefix}-${String(index + 1).padStart(3, "0")}`,
    first_name: person.first_name,
    last_name: person.last_name,
    email: `noemail.${slug}.${prefix.toLowerCase()}@bywc.internal`,
    phone: person.phone ?? null,
    omang: person.omang ?? null,
    gender: person.gender ?? null,
    age: person.age ?? null,
    constituency,
    town_village: person.town_village ?? null,
    disability_status: person.disability_status ?? "No",
    citizenship: "Citizen",
    employment_status: "",
    interest_area: "",
    highest_qualification: "",
    bgcse_points: null,
    preferred_language: "",
    status: "Accepted",
    selection_bucket: bucket,
    submitted_at: new Date().toISOString(),
  };
}

const phikweRecords = phikwePeople.map((p, i) =>
  makeRecord(p, PHIKWE_BUCKET, "Selibe Phikwe East", i, "PHIKWE")
);

const goodhopeRecords = goodhopePeople.map((p, i) =>
  makeRecord(p, GOODHOPE_BUCKET, "Goodhope - Mmathethe", i, "GOODHOPE")
);

const allRecords = [...phikweRecords, ...goodhopeRecords];

const { data, error } = await supabase
  .from("applications")
  .insert(allRecords)
  .select("id, application_id, first_name, last_name, selection_bucket");

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log(`Inserted ${data.length} records:`);
let lastBucket = "";
for (const r of data) {
  if (r.selection_bucket !== lastBucket) {
    console.log(`\n── ${r.selection_bucket} ──`);
    lastBucket = r.selection_bucket;
  }
  console.log(`  [${r.id}] ${r.first_name} ${r.last_name}`);
}
