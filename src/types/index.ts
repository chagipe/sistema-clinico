export interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: string;
  phone?: string | null;
  occupation?: string | null;
  maritalStatus?: string | null;
  address?: string | null;
  familyHistoryDiabetes?: boolean;
  familyHistoryHypertension?: boolean;
  familyHistoryCancer?: boolean;
  familyHistoryHeartDisease?: boolean;
  familyHistoryKidneyDisease?: boolean;
  familyHistoryOther?: string | null;
  personalAllergies?: string | null;
  personalSurgeries?: string | null;
  personalHospitalizations?: string | null;
  personalTransfusions?: string | null;
  personalTrauma?: string | null;
  smoking?: boolean;
  alcohol?: boolean;
  bloodType?: string | null;
  habits?: string | null;
  createdAt: Date;
}

export interface Vitals {
  id: string;
  consultationId: string;
  bloodPressure?: string | null;
  heartRate?: number | null;
  respiratoryRate?: number | null;
  oxygenSaturation?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  temperature?: number | null;
}

export interface Diagnosis {
  id: string;
  consultationId: string;
  cie10Code: string;
  description: string;
  type: "PRESUNTIVO" | "DEFINITIVO";
}

export interface AlternativeTreatment {
  id: string;
  consultationId: string;
  treatmentName: string;
  bodyZone?: string | null;
  frequency?: string | null;
  sessionsCount?: number | null;
  packagePrice?: number | null;
  sessionPrice?: number | null;
}

export interface Prescription {
  id: string;
  consultationId: string;
  medication: string;
  days?: number | null;
  dosage?: string | null;
  instructions?: string | null;
}

export interface RecommendationsChecklist {
  id: string;
  consultationId: string;
  noCitrus: boolean;
  noVitaminC: boolean;
  noPhysicalEffort: boolean;
  noAlcohol: boolean;
  noAvocado: boolean;
  noRedMeat: boolean;
  cryotherapy: boolean;
  thermotherapy: boolean;
  stretchingExercises: boolean;
  useFajaDorsoLumbar: boolean;
  useRodillera: boolean;
  useOrthopedicInsoles: boolean;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId?: string | null;
  type: "NUEVA" | "RECONSULTA" | "TRATAMIENTO";
  status: "EN_ESPERA" | "EN_ATENCION" | "FINALIZADO";
  hasAccidentsOps: boolean;
  consultationReason?: string | null;
  diseaseHistory?: string | null;
  antecedentes?: string | null;
  allergies?: string | null;
  physicalExam?: string | null;
  labExamsRequested?: string | null;
  treatmentDurationApprox?: string | null;
  improvementEstimate?: string | null;
  painScale?: number | null;
  destination?: string | null;
  doctorComments?: string | null;
  createdAt: Date;
  patient: Patient;
  vitals?: Vitals | null;
  diagnoses: Diagnosis[];
  alternativeTreatments: AlternativeTreatment[];
  prescriptions: Prescription[];
  recommendationsChecklist?: RecommendationsChecklist | null;
}

export interface Cie10Code {
  id: string;
  code: string;
  description: string;
  category?: string | null;
}
