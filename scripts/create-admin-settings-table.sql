-- ============================================================
-- Create admin_settings table for BYWC letter templates etc.
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow logged-in users (admin) to read/write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_settings'
    AND policyname = 'Authenticated users have full access'
  ) THEN
    CREATE POLICY "Authenticated users have full access"
      ON admin_settings FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Allow service role (scripts) to read/write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_settings'
    AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access"
      ON admin_settings FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Seed the default acceptance letter template
INSERT INTO admin_settings (key, value) VALUES
(
  'acceptance_letter_subject',
  'RE: ACCEPTANCE INTO THE BYWC OIL & GAS TRAINING PROGRAMME 2026 — BATCH 2'
),
(
  'acceptance_letter_body',
  E'Congratulations, {{fullName}}!\n\nWe are delighted to inform you that you have been selected for the Second Batch of the Botswana Youth, Women and Citizen (BYWC) Oil and Gas Training Programme 2026. This is a significant achievement and we commend you for your application and commitment to advancing Botswana''s energy sector.\n\nThis letter serves as your official confirmation of acceptance. Please retain it as you will be required to present it upon registration at the training venue.\n\nYour acceptance details are as follows:\n •  Full Name: {{fullName}}\n •  Constituency: {{constituency}}\n •  Letter Reference: {{refNo}}\n •  Programme: BYWC Oil & Gas Training Programme 2026 — Batch 2\n\nPROGRAMME OVERVIEW\n\nThe training is a structured 10-day programme covering the following areas:\n\n •  Introduction to the Oil and Gas Industry in Botswana and Africa\n •  Health, Safety and Environment (HSE) Standards and Practices\n •  Petroleum Exploration and Production Fundamentals\n •  Pipeline Operations and Infrastructure\n •  Oil and Gas Business, Contracts and Supply Chain\n •  Entrepreneurship and Business Development in the Energy Sector\n •  Community Development and Corporate Social Responsibility\n •  Career Pathways and Professional Development in Oil and Gas\n\nREPORTING AND ORIENTATION\n\nParticipants are required to report to the training venue on Sunday. Please arrive between 14:00 and 17:00 to complete registration and receive your programme materials. Formal orientation takes place on Monday morning beginning at 08:00.\n\nFull venue address, detailed programme schedule, and daily timings will be communicated through your applicant profile and inbox on the BYWC portal at bywcprogram.org. Please log in regularly to check for updates.\n\nWHAT TO BRING\n\nPlease ensure you bring the following on registration day:\n\n •  This acceptance letter (printed or on your phone)\n •  Your valid national identity document (Omang) — this is mandatory\n •  A pen and notebook for orientation\n •  Any prescribed medication or personal items required for the duration of the programme\n\nAccommodation and meals will be provided for the full 10 days of training.\n\nIMPORTANT NOTICE\n\nAttendance from Day 1 is compulsory. Failure to report on the designated Sunday without prior written communication to programme administration may result in forfeiture of your placement. If you are unable to attend, please notify us immediately through your portal inbox so that your space may be reallocated.\n\nWe look forward to welcoming you to the programme. This is an important step toward building a skilled, diverse and capable workforce for Botswana''s growing energy sector.'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
