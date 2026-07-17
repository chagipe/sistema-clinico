-- Migration: Add session tracking and expand recommendations
-- Run this against your Supabase database

-- 1. Add new recommendation columns to recommendations_checklist
ALTER TABLE "recommendations_checklist"
  ADD COLUMN "cryotherapy" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "thermotherapy" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stretching_exercises" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "use_faja_dorso_lumbar" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "use_rodillera" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "use_orthopedic_insoles" BOOLEAN NOT NULL DEFAULT false;

-- 2. Create treatment_packages table
CREATE TABLE "treatment_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "consultation_id" UUID,
    "treatment_name" VARCHAR(100) NOT NULL,
    "body_zone" VARCHAR(100),
    "total_sessions" INTEGER NOT NULL,
    "package_price" DECIMAL(10,2),
    "session_price" DECIMAL(10,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treatment_packages_pkey" PRIMARY KEY ("id")
);

-- 3. Create session_records table
CREATE TABLE "session_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "session_number" INTEGER NOT NULL,
    "treated_zone" VARCHAR(100),
    "session_date" TIMESTAMP(3) NOT NULL,
    "session_time" VARCHAR(10),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_records_pkey" PRIMARY KEY ("id")
);

-- 4. Add foreign keys
ALTER TABLE "treatment_packages" ADD CONSTRAINT "treatment_packages_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treatment_packages" ADD CONSTRAINT "treatment_packages_consultation_id_fkey"
  FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "session_records" ADD CONSTRAINT "session_records_package_id_fkey"
  FOREIGN KEY ("package_id") REFERENCES "treatment_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
