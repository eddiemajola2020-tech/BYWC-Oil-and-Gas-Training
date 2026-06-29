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

const { data: logs, error } = await supabase
  .from("admin_audit_logs")
  .select("*")
  .eq("admin_email", "codex-maintenance")
  .eq("action", "profile_edit")
  .order("created_at", { ascending: false })
  .limit(80);

if (error) throw new Error(error.message);

const repairs = [];
for (const log of logs || []) {
  const previous = log.details?.previous;
  const repair = String(log.details?.repair || "");
  if (!previous || !repair.includes("Batch 2 - Chomeleng Special")) continue;
  const patch = {};
  if (previous.phone) patch.phone = previous.phone;
  if (previous.omang) patch.omang = previous.omang;
  if (previous.gender) patch.gender = previous.gender;
  if (previous.age !== null && previous.age !== undefined) patch.age = previous.age;
  if (previous.constituency) patch.constituency = previous.constituency;
  if (Object.keys(patch).length === 0) continue;

  const { data, error: updateError } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", previous.id)
    .select("id,application_id,first_name,last_name,email,phone,omang,gender,age,constituency")
    .single();
  if (updateError) throw new Error(updateError.message);

  await supabase.from("admin_audit_logs").insert({
    admin_email: "codex-maintenance",
    action: "profile_edit",
    application_id: data.application_id,
    details: {
      repair: "Restored existing contact/identity fields after special-group update to avoid losing prior phone/Omang details.",
      restored: patch,
    },
    created_at: new Date().toISOString(),
  });

  repairs.push(data);
}

console.log(JSON.stringify({ repaired: repairs.length, repairs }, null, 2));
