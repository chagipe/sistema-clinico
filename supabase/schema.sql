-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('NUEVA', 'RECONSULTA', 'TRATAMIENTO');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('EN_ESPERA', 'EN_ATENCION', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "DiagnosisType" AS ENUM ('PRESUNTIVO', 'DEFINITIVO');

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID,
    "type" "ConsultationType" NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'EN_ESPERA',
    "has_accidents_ops" BOOLEAN NOT NULL DEFAULT false,
    "consultation_reason" TEXT,
    "disease_history" TEXT,
    "allergies" TEXT,
    "physical_exam" TEXT,
    "lab_exams_requested" TEXT,
    "treatment_duration_approx" VARCHAR(200),
    "improvement_estimate" VARCHAR(200),
    "doctor_comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "blood_pressure" VARCHAR(10),
    "heart_rate" INTEGER,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "height_cm" DECIMAL(5,2),
    "bmi" DECIMAL(5,2),
    "temperature" DECIMAL(4,1),

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "cie10_code" VARCHAR(10) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "type" "DiagnosisType" NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternative_treatments" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "treatment_name" VARCHAR(100) NOT NULL,
    "body_zone" VARCHAR(100),
    "frequency" VARCHAR(50),
    "sessions_count" INTEGER,
    "package_price" DECIMAL(10,2),
    "session_price" DECIMAL(10,2),

    CONSTRAINT "alternative_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "medication" VARCHAR(200) NOT NULL,
    "days" INTEGER,
    "dosage" VARCHAR(100),
    "instructions" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations_checklist" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "no_citrus" BOOLEAN NOT NULL DEFAULT false,
    "no_vitamin_c" BOOLEAN NOT NULL DEFAULT false,
    "no_physical_effort" BOOLEAN NOT NULL DEFAULT false,
    "no_alcohol" BOOLEAN NOT NULL DEFAULT false,
    "no_avocado" BOOLEAN NOT NULL DEFAULT false,
    "no_red_meat" BOOLEAN NOT NULL DEFAULT false,
    "use_orthopedic_support" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "recommendations_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cie10_codes" (
    "id" UUID NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "category" VARCHAR(200),

    CONSTRAINT "cie10_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_dni_key" ON "patients"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "vitals_consultation_id_key" ON "vitals"("consultation_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_checklist_consultation_id_key" ON "recommendations_checklist"("consultation_id");

-- CreateIndex
CREATE UNIQUE INDEX "cie10_codes_code_key" ON "cie10_codes"("code");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternative_treatments" ADD CONSTRAINT "alternative_treatments_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations_checklist" ADD CONSTRAINT "recommendations_checklist_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
