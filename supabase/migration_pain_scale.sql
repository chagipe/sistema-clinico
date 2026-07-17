ALTER TABLE consultations ADD COLUMN pain_scale INTEGER;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'consultations' AND column_name = 'pain_scale';
