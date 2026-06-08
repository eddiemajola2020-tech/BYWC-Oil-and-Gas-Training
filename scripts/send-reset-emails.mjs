import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "sb_publishable_ZIW6cmjZ-WRsUzQJvwtmsQ_t6hlzbJp",
);

const targets = [
  { name: "Neo", email: "nunatlhalefo93@yahoo.com" },
  { name: "Jansen", email: "waynejensen161@gmail.com" },
];

for (const target of targets) {
  console.log(`Sending reset email to ${target.name} <${target.email}>...`);

  const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
    redirectTo: "https://bywcprogram.org/create-new-password",
  });

  if (error) {
    console.error(`  FAILED for ${target.name}: ${error.message}`);
  } else {
    console.log(`  SENT — ${target.name} will receive a link to set their password.`);
  }
}

console.log("\nDone.");
