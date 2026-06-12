import { createClient } from "@supabase/supabase-js";

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ5.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWhjYmNleXpzdmFkdXJ5dXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzMzQwNywiZXhwIjoyMDkyODA5NDA3fQ.r4_brAfiCF2K8z5EdrHN-aK1kSYpPb5dZW7cHOA_l-A";

const admin = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAIL = "foragampoi@gmail.com";

// Search specifically for Seibofeng
const { data: byFirst } = await admin
  .from("applications")
  .select("id, first_name, last_name, email, omang, status, selection_bucket")
  .ilike("first_name", "%seibofeng%");

console.log("By first name 'seibofeng':", JSON.stringify(byFirst, null, 2));

// Also show Batch 2 Internal Hold records with no email
const { data: noEmail } = await admin
  .from("applications")
  .select("id, first_name, last_name, email, omang, selection_bucket")
  .ilike("selection_bucket", "%Batch 2%")
  .or("email.is.null,email.eq.");

console.log("\nBatch 2 with no email:", JSON.stringify(noEmail, null, 2));
