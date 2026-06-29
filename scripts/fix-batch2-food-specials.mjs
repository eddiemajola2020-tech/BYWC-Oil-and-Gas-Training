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

const now = () => new Date().toISOString();
const BERA = "Published - Applicant Visible / Batch 2 - BERA Special";
const CHOMELENG = "Published - Applicant Visible / Batch 2 - Chomeleng Special";
const SEROWE = "Published - Applicant Visible / Batch 2 - Serowe Special";

function words(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts.at(-1) };
}

function internalEmail(fullName, group) {
  return `noemail.${slug(fullName).replace(/-/g, ".")}.${slug(group)}@bywc.internal`;
}

function specialPayload(person, bucket) {
  const names = splitName(person.name);
  return {
    ...names,
    email: person.email || internalEmail(person.name, bucket.includes("BERA") ? "bera" : bucket.includes("Serowe") ? "serowe" : "chomeleng"),
    phone: person.phone || null,
    omang: person.omang || null,
    gender: person.gender || null,
    age: person.age ?? null,
    constituency: person.constituency ?? null,
    town_village: null,
    disability_status: "No",
    citizenship: "Citizen",
    employment_status: "",
    highest_qualification: "",
    bgcse_points: null,
    status: "Accepted",
    selection_bucket: bucket,
    arrival_status: "Arrived",
    arrived_at: now(),
    arrival_confirmed_by: "codex-maintenance",
    submitted_at: now(),
    auto_review_result: "Accepted - special group",
    auto_review_notes: `Batch 2 special group member added/updated from admin food/register instruction.`,
  };
}

async function findCandidate(person) {
  if (person.omang) {
    const { data, error } = await supabase
      .from("applications")
      .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
      .eq("omang", person.omang)
      .limit(1);
    if (error) throw new Error(error.message);
    if (data?.length) return data[0];
  }
  if (person.email) {
    const { data, error } = await supabase
      .from("applications")
      .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
      .ilike("email", person.email)
      .limit(1);
    if (error) throw new Error(error.message);
    if (data?.length) return data[0];
  }
  const { first_name, last_name } = splitName(person.name);
  if (first_name && last_name) {
    const { data, error } = await supabase
      .from("applications")
      .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
      .ilike("first_name", first_name)
      .ilike("last_name", last_name)
      .limit(1);
    if (error) throw new Error(error.message);
    if (data?.length) return data[0];
  }
  return null;
}

async function addOrUpdateSpecial(person, bucket) {
  const existing = await findCandidate(person);
  const payload = specialPayload(person, bucket);
  if (existing) {
    if (!person.phone) delete payload.phone;
    if (!person.omang) delete payload.omang;
    if (!person.gender) delete payload.gender;
    if (person.age === undefined) delete payload.age;
    if (person.constituency === undefined) delete payload.constituency;
    const { data, error } = await supabase
      .from("applications")
      .update(payload)
      .eq("id", existing.id)
      .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
      .single();
    if (error) throw new Error(error.message);
    await audit(data.application_id, "profile_edit", {
      repair: `Moved/updated ${person.name} into ${bucket}.`,
      previous: existing,
    });
    return { action: "updated", data };
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      application_id: `BYWC-2026-${bucket.includes("BERA") ? "BERA" : bucket.includes("Serowe") ? "SEROWE" : "CHOMELENG"}-${Date.now()}-${slug(person.name)}`,
      ...payload,
    })
    .select("id,application_id,first_name,last_name,email,phone,omang,status,selection_bucket,arrival_status")
    .single();
  if (error) throw new Error(error.message);
  await audit(data.application_id, "manual_profile_created_arrived", {
    repair: `Created ${person.name} in ${bucket}.`,
  });
  return { action: "inserted", data };
}

async function audit(application_id, action, details) {
  await supabase.from("admin_audit_logs").insert({
    admin_email: "codex-maintenance",
    action,
    application_id,
    details,
    created_at: now(),
  });
}

const matildaMotivation = "Katso Matilda Babantsho wants to take part in the BYWC Oil and Gas programme because she is serious about learning how the industry works and how ordinary citizens can participate in it through practical business opportunities. Her interest is especially around starting and growing an oil and gas related business, and she needs structured training that can help her understand safety, customer service, supply, compliance, and the discipline required to operate responsibly. The programme will give her a clearer foundation, stronger confidence, and exposure to people who understand the sector.";
const matildaPostPlan = "After completing the programme, Katso Matilda Babantsho plans to use the knowledge gained to prepare a realistic business pathway in oil and gas distribution or related services. She will focus on understanding licensing requirements, safe handling, customer needs, and the partnerships needed to operate properly. Her goal is to turn the training into a practical plan that can support income generation, long-term learning, and responsible participation in Botswana's energy sector.";

const { data: matilda, error: matildaError } = await supabase
  .from("applications")
  .update({
    first_name: "Katso Matilda",
    last_name: "Babantsho",
    motivation: matildaMotivation,
    motivation_word_count: words(matildaMotivation),
    motivational_word_count: words(matildaMotivation),
    post_program_plan: matildaPostPlan,
    post_program_word_count: words(matildaPostPlan),
  })
  .eq("id", 9021)
  .select("id,application_id,first_name,last_name,motivation_word_count,motivational_word_count,post_program_word_count")
  .single();
if (matildaError) throw new Error(matildaError.message);
await audit(matilda.application_id, "profile_edit", {
  repair: "Corrected Matilda Babantsho name to Katso Matilda Babantsho and expanded motivation/post-program plan counts.",
});

const explicitSpecials = [
  { person: { name: "Ontiretse Galekhutle" }, bucket: BERA },
  { person: { name: "Mookamedi Kediseng" }, bucket: SEROWE },
  { person: { name: "Kutlwano Reetsang", omang: "398415416", phone: "78757464" }, bucket: CHOMELENG },
  { person: { name: "Kagiso Ntswaneng", omang: "575310510", phone: "72751294", email: "kntswaneng@yahoo.com" }, bucket: CHOMELENG },
];

const chomelengScreenshots = [
  { name: "Koketso Molalapata", email: "molalapatajuliet@gmail.com" },
  { name: "Tshepo Ben", email: "Tshepoben@gmail.com" },
  { name: "Gift Kutoro", email: "giftshurn@gmail.com" },
  { name: "Kealeboga Mmotlana", email: "Pavobwkealeboga@gmail.com" },
  { name: "Ontirile Rannyana", email: "collinrannyana@gmail.com" },
  { name: "Oratile Kgwarana", email: "oratilekgwarana05@gmail.com" },
  { name: "Mosimanegape Nkanokang", email: "mosimanegape091@gmail.com" },
  { name: "Honefar S.Dick", email: "dickhonefar@gmail.com" },
  { name: "Katlego Precious Koloi", email: "Koloiprecious94@gmail.com" },
  { name: "Ditshegofatso R. Mothobi", email: "mothobiresego@gmail.com" },
  { name: "Mikaene Diphoro", email: "motsumimikaene@gmail.com" },
  { name: "Prince W. Mosweu", email: "Princemosweu950@gmail.com" },
  { name: "Boineelo Lorraine Lesonya", email: "boineelolesonya5@gmail.com" },
  { name: "Maduo Baitseng", email: "Duduace@gmail.com" },
  { name: "Katlego Garekwa", email: "Garekwekatlego4@gmail.com" },
  { name: "Thato Makhiwa", email: "makhiwathato91@gmail.com" },
  { name: "Maatla R. Bokhuto", email: "bsletsweletse195@gmail.com" },
  { name: "Metlha Mathaio", email: "matthewsmetlha@gmail.com" },
  { name: "Katlego Mighty Moepeng", email: "kmmoepeng23@gmail.com" },
  { name: "Atamelang Budi", email: "Bakaeseoneodaiel22@gmail.com" },
  { name: "Martin L. M. Marguson", email: "margusonmartin214@gmail.com" },
  { name: "Morekolodi Gagoope", email: "morekolodigagoope@gmail.com" },
];

const changes = [];
changes.push({ action: "updated", data: matilda });
for (const item of explicitSpecials) {
  changes.push(await addOrUpdateSpecial(item.person, item.bucket));
}
for (const person of chomelengScreenshots) {
  changes.push(await addOrUpdateSpecial(person, CHOMELENG));
}

console.log(JSON.stringify({
  updatedMatilda: matilda,
  inserted: changes.filter((c) => c.action === "inserted").length,
  updated: changes.filter((c) => c.action === "updated").length,
  changes,
}, null, 2));
