import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(url, serviceKey);

const OLD_BUCKET = "Internal Hold - Do Not Notify / Unknown Batch - Chomeleng Straggler";
const NEW_BUCKET = "Internal Hold - Do Not Notify / Unknown Batch - Food Straggler";

const { data: rows, error: fetchError } = await supabase
  .from("applications")
  .select("id,first_name,last_name,selection_bucket,arrival_status,status")
  .eq("selection_bucket", OLD_BUCKET);

if (fetchError) throw fetchError;

if (!rows?.length) {
  console.log(JSON.stringify({ updated: 0, message: "No rows found in old bucket" }, null, 2));
  process.exit(0);
}

const ids = rows.map((row) => row.id);
const { error: updateError } = await supabase
  .from("applications")
  .update({
    selection_bucket: NEW_BUCKET,
    arrival_status: "Not Arrived",
    status: "Deferred",
  })
  .in("id", ids);

if (updateError) throw updateError;

console.log(JSON.stringify({
  updated: ids.length,
  ids,
  names: rows.map((row) => `${row.first_name || ""} ${row.last_name || ""}`.replace(/\s+/g, " ").trim()),
}, null, 2));
