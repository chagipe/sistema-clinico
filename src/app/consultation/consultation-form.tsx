"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VitalsForm } from "@/components/clinical/vitals-form";
import { Cie10Search } from "@/components/clinical/cie10-search";
import { TreatmentTable } from "@/components/clinical/treatment-table";
import { PrescriptionTable } from "@/components/clinical/prescription-table";
import { RecommendationsChecklist } from "@/components/clinical/recommendations-checklist";
import { ImageUpload } from "@/components/clinical/image-upload";
import { EvaPainScale } from "@/components/clinical/eva-pain-scale";
import { TopBar } from "@/components/layout/top-bar";
import {
  ArrowLeft,
  Save,
  Printer,
  AlertTriangle,
  FileText,
  Stethoscope,
  Heart,
  ClipboardList,
  Pill,
  Activity,
  Syringe,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Calendar,
} from "lucide-react";
import { calculateAge, cn } from "@/lib/utils";
import Link from "next/link";

const consultationSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(["NUEVA", "RECONSULTA", "TRATAMIENTO"]),
  hasAccidentsOps: z.boolean(),
  consultationReason: z.string().optional(),
  diseaseHistory: z.string().optional(),
  antecedentes: z.string().optional(),
  allergies: z.string().optional(),
  physicalExam: z.string().optional(),
  labExamsRequested: z.string().optional(),
  treatmentDurationApprox: z.string().optional(),
  improvementEstimate: z.string().optional(),
  painScale: z.number().min(0).max(10).optional(),
  destination: z.string().optional(),
  doctorComments: z.string().optional(),
  vitals: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weightKg: z.number().optional(),
    heightCm: z.number().optional(),
    bmi: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
  diagnoses: z.array(z.object({
    cie10Code: z.string(),
    description: z.string(),
    type: z.enum(["PRESUNTIVO", "DEFINITIVO"]),
  })).optional(),
  alternativeTreatments: z.array(z.object({
    treatmentName: z.string(),
    bodyZone: z.string().optional(),
    frequency: z.string().optional(),
    sessionsCount: z.number().optional(),
    packagePrice: z.number().optional(),
    sessionPrice: z.number().optional(),
  })).optional(),
  prescriptions: z.array(z.object({
    medication: z.string(),
    days: z.number().optional(),
    dosage: z.string().optional(),
    instructions: z.string().optional(),
  })).optional(),
  recommendationsChecklist: z.object({
    noCitrus: z.boolean().optional(),
    noVitaminC: z.boolean().optional(),
    noPhysicalEffort: z.boolean().optional(),
    noAlcohol: z.boolean().optional(),
    noAvocado: z.boolean().optional(),
    noRedMeat: z.boolean().optional(),
    cryotherapy: z.boolean().optional(),
    thermotherapy: z.boolean().optional(),
    stretchingExercises: z.boolean().optional(),
    useFajaDorsoLumbar: z.boolean().optional(),
    useRodillera: z.boolean().optional(),
    useOrthopedicInsoles: z.boolean().optional(),
  }).optional(),
});

type FormData = z.infer<typeof consultationSchema>;

interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone?: string | null;
  occupation?: string | null;
  maritalStatus?: string | null;
  address?: string | null;
  // Antecedentes Heredofamiliares
  familyHistoryDiabetes?: boolean;
  familyHistoryHypertension?: boolean;
  familyHistoryCancer?: boolean;
  familyHistoryHeartDisease?: boolean;
  familyHistoryKidneyDisease?: boolean;
  familyHistoryOther?: string | null;
  // Antecedentes Personales Patologicos
  personalAllergies?: string | null;
  personalSurgeries?: string | null;
  personalHospitalizations?: string | null;
  personalTransfusions?: string | null;
  personalTrauma?: string | null;
  // Antecedentes No Patologicos
  smoking?: boolean;
  alcohol?: boolean;
  bloodType?: string | null;
  habits?: string | null;
}

interface SectionPanelProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

function SectionPanel({ title, subtitle, icon: Icon, iconBg, children, defaultOpen = true, badge }: SectionPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="clay-card overflow-hidden">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm", iconBg)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ConsultationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [diagnoses, setDiagnoses] = useState<
    Array<{ cie10Code: string; description: string; type: "PRESUNTIVO" | "DEFINITIVO" }>
  >([]);
  const [images, setImages] = useState<
    Array<{ id?: string; filename: string; mimeType: string; data: string; label?: string | null }>
  >([]);

  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      patientId: patientId || "",
      type: "NUEVA",
      hasAccidentsOps: false,
      painScale: undefined,
      diagnoses: [],
      alternativeTreatments: [],
      prescriptions: [],
      recommendationsChecklist: {
        noCitrus: false, noVitaminC: false, noPhysicalEffort: false,
        noAlcohol: false, noAvocado: false, noRedMeat: false,
        cryotherapy: false, thermotherapy: false, stretchingExercises: false,
        useFajaDorsoLumbar: false, useRodillera: false, useOrthopedicInsoles: false,
      },
    },
  });

  useEffect(() => {
    if (patientId) {
      fetchPatient(patientId);
    } else {
      fetchAllPatients();
    }
  }, [patientId]);

  const fetchAllPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const response = await fetch("/api/patients");
      if (!response.ok) { setIsLoadingPatients(false); return; }
      const data = await response.json();
      setAllPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoadingPatients(false);
      setIsLoading(false);
    }
  };

  const filteredPatients = allPatients.filter((p) => {
    const q = patientSearchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.dni.includes(q)
    );
  });

  const handleSelectPatient = (selectedPatient: Patient) => {
    setPatient(selectedPatient);
    form.setValue("patientId", selectedPatient.id);
    setPatientSearchQuery("");
  };

  const fetchPatient = async (id: string) => {
    try {
      const response = await fetch(`/api/patients`);
      if (!response.ok) { setIsLoading(false); return; }
      const patients = await response.json();
      const found = Array.isArray(patients) ? patients.find((p: Patient) => p.id === id) : null;
      if (found) { setPatient(found); form.setValue("patientId", found.id); }
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDiagnosis = (code: { code: string; description: string }) => {
    setDiagnoses([...diagnoses, { cie10Code: code.code, description: code.description, type: "PRESUNTIVO" }]);
  };

  const handleRemoveDiagnosis = (code: string) => {
    setDiagnoses(diagnoses.filter((d) => d.cie10Code !== code));
  };

  const handleToggleDiagnosisType = (code: string) => {
    setDiagnoses(diagnoses.map((d) =>
      d.cie10Code === code ? { ...d, type: d.type === "PRESUNTIVO" ? "DEFINITIVO" : "PRESUNTIVO" } : d
    ));
  };

  const onSubmit = async (data: FormData) => {
    if (!data.patientId) {
      alert("Error: No se ha seleccionado un paciente.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        consultationReason: data.consultationReason ?? "",
        diseaseHistory: data.diseaseHistory ?? "",
        antecedentes: data.antecedentes ?? "",
        allergies: data.allergies ?? "",
        physicalExam: data.physicalExam ?? "",
        labExamsRequested: data.labExamsRequested ?? "",
        treatmentDurationApprox: data.treatmentDurationApprox ?? "",
        improvementEstimate: data.improvementEstimate ?? "",
        destination: data.destination ?? "",
        doctorComments: data.doctorComments ?? "",
        diagnoses,
      };
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", response.status, errorData);
        alert("Error al guardar la consulta: " + (errorData.error || "Error desconocido"));
        return;
      }
      const result = await response.json();

      for (const image of images) {
        if (!image.id) {
          await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              consultationId: result.id,
              filename: image.filename,
              mimeType: image.mimeType,
              data: image.data,
              label: image.label,
            }),
          });
        }
      }

      alert("Historia clinica registrada correctamente");
      router.push(`/pacientes/${patientId}`);
    } catch (error) {
      console.error("Error saving consultation:", error);
      alert("Error de conexion al guardar la consulta.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Cargando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Cargando datos del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Seleccionar Paciente" subtitle="Busca y selecciona un paciente para crear una historia clinica" />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Seleccionar Paciente</h2>
                  <p className="text-sm text-slate-500">Selecciona un paciente existente para continuar</p>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
              </div>

              {isLoadingPatients ? (
                <div className="py-8 text-center">
                  <div className="h-8 w-8 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Cargando pacientes...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500">
                    {patientSearchQuery ? "No se encontraron pacientes" : "No hay pacientes registrados"}
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPatient(p)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all text-left"
                    >
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                        {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {p.firstName} {p.lastName}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            DNI: {p.dni}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {calculateAge(new Date(p.birthDate))} anios
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-cyan-600">Seleccionar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pacientes">
              <button type="button" className="clay-button px-4 py-2.5 text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Pacientes
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Historia Clinica"
        subtitle={`${patient.firstName} ${patient.lastName} - DNI: ${patient.dni}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSaving}
              className="clay-button px-4 py-2.5 text-sm font-semibold text-slate-900 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
            <button
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSaving}
              className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Guardar e Imprimir
            </button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== "submit") e.preventDefault(); }} className="space-y-5 max-w-5xl mx-auto">
          {/* Patient Summary - Read Only */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-cyan-800 uppercase tracking-wider">Resumen del Paciente</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Alergias</span>
                <p className="text-slate-900 font-medium mt-0.5">
                  {patient.personalAllergies || "Ninguna registrada"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Cirugias/Operaciones</span>
                <p className="text-slate-900 font-medium mt-0.5">
                  {patient.personalSurgeries || "Ninguna registrada"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Tipo de Sangre</span>
                <p className="text-slate-900 font-medium mt-0.5">
                  {patient.bloodType || "No especificado"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Habitos</span>
                <p className="text-slate-900 font-medium mt-0.5">
                  {[
                    patient.smoking ? "Tabaquismo" : "",
                    patient.alcohol ? "Alcoholismo" : "",
                    patient.habits || ""
                  ].filter(Boolean).join(", ") || "No especificado"}
                </p>
              </div>
            </div>
            {(patient.familyHistoryDiabetes || patient.familyHistoryHypertension || patient.familyHistoryCancer || patient.familyHistoryHeartDisease || patient.familyHistoryKidneyDisease || patient.familyHistoryOther) && (
              <div className="mt-3 pt-3 border-t border-cyan-200">
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Antecedentes Familiares: </span>
                <span className="text-sm text-slate-900">
                  {[
                    patient.familyHistoryDiabetes ? "Diabetes" : "",
                    patient.familyHistoryHypertension ? "Hipertension" : "",
                    patient.familyHistoryCancer ? "Cancer" : "",
                    patient.familyHistoryHeartDisease ? "Cardiopatias" : "",
                    patient.familyHistoryKidneyDisease ? "Nefropatias" : "",
                    patient.familyHistoryOther || ""
                  ].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Patient Header */}
          <div className="clay-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-500 text-sm">DNI: {patient.dni}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 text-sm">{calculateAge(new Date(patient.birthDate))} anios</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 text-sm">{patient.gender}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {form.watch("hasAccidentsOps") && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-100 text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    Accidente/Operacion
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-200">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Consulta</Label>
                <Select
                  onValueChange={(value) => form.setValue("type", value as "NUEVA" | "RECONSULTA" | "TRATAMIENTO")}
                  defaultValue="NUEVA"
                >
                  <SelectTrigger className="clay-input h-11 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="clay-card border-0 z-[9999]">
                    <SelectItem value="NUEVA">Nueva Consulta</SelectItem>
                    <SelectItem value="RECONSULTA">Reconsulta</SelectItem>
                    <SelectItem value="TRATAMIENTO">Tratamiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Checkbox
                  id="hasAccidentsOps"
                  checked={form.watch("hasAccidentsOps")}
                  onCheckedChange={(checked) => form.setValue("hasAccidentsOps", !!checked)}
                  className="border-2 border-slate-200 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                />
                <Label htmlFor="hasAccidentsOps" className="cursor-pointer text-sm font-medium text-slate-900">
                  Accidentes y/o operacion
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alergias</Label>
                <Input
                  placeholder="Describe alergias..."
                  {...form.register("allergies")}
                  className="clay-input h-11 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Vitals */}
          <SectionPanel title="Triaje y Funciones Vitales" subtitle="Presion arterial, frecuencias, peso y talla" icon={Heart} iconBg="bg-red-500" badge="Vitales">
            <div className="space-y-5">
              <VitalsForm form={form} />
              <div className="pt-4 border-t border-slate-200">
                <EvaPainScale
                  value={form.watch("painScale")}
                  onChange={(val) => form.setValue("painScale", val)}
                />
              </div>
            </div>
          </SectionPanel>

          {/* Section 2: Clinical Evaluation */}
          <SectionPanel title="Evaluacion Clinica" subtitle="Motivo, historia, antecedentes y examen fisico" icon={FileText} iconBg="bg-cyan-500" badge="Eval">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo de Consulta</Label>
                <Textarea placeholder="Describa el motivo principal de la consulta..." className="clay-input min-h-[100px] text-slate-900 placeholder:text-slate-400 resize-none" {...form.register("consultationReason")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historia de la Enfermedad Actual</Label>
                <Textarea placeholder="Describa la evolucion y sintomatologia..." className="clay-input min-h-[120px] text-slate-900 placeholder:text-slate-400 resize-none" {...form.register("diseaseHistory")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Antecedentes (APP / APF)</Label>
                <Textarea placeholder="Antecedentes Personales Patologicos y Antecedentes Patologicos Familiares relevantes..." className="clay-input min-h-[100px] text-slate-900 placeholder:text-slate-400 resize-none" {...form.register("antecedentes")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Examen Fisico / Exploracion</Label>
                <Textarea placeholder="Detalle hallazgos del examen fisico..." className="clay-input min-h-[120px] text-slate-900 placeholder:text-slate-400 resize-none" {...form.register("physicalExam")} />
              </div>
            </div>
          </SectionPanel>

          {/* Section 3: Diagnosis */}
          <SectionPanel title="Diagnostico CIE-10" subtitle="Busqueda y seleccion de codigos" icon={Stethoscope} iconBg="bg-emerald-500" badge={diagnoses.length > 0 ? `${diagnoses.length} Dx` : "CIE-10"}>
            <div className="space-y-4">
              <Cie10Search onSelect={handleAddDiagnosis} selectedCodes={diagnoses} onRemove={handleRemoveDiagnosis} />
              {diagnoses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnosticos Seleccionados</Label>
                  <div className="space-y-2">
                    {diagnoses.map((diag) => (
                      <div key={diag.cie10Code} className="flex items-center justify-between p-3 rounded-xl clay-inset">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                            diag.type === "DEFINITIVO" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {diag.type}
                          </span>
                          <span className="font-mono text-sm font-bold text-slate-900">{diag.cie10Code}</span>
                          <span className="text-sm text-slate-500">{diag.description}</span>
                        </div>
                        <button type="button" onClick={() => handleToggleDiagnosisType(diag.cie10Code)} className="text-xs text-slate-500 hover:text-cyan-600 font-medium">
                          Cambiar a {diag.type === "PRESUNTIVO" ? "Definitivo" : "Presuntivo"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* Section 4: Treatment */}
          <SectionPanel title="Tratamiento Recomendado (Procedimientos)" subtitle="Ozonoterapia, Plasma, Viscosuplementacion" icon={Syringe} iconBg="bg-violet-500" badge="Procedimientos">
            <TreatmentTable form={form} />
          </SectionPanel>

          {/* Section 5: Prescription */}
          <SectionPanel title="Receta Medica" subtitle="Medicamentos, dosis e indicaciones" icon={Pill} iconBg="bg-amber-500" badge="Rx">
            <PrescriptionTable form={form} />
          </SectionPanel>

          {/* Section 6: Recommendations */}
          <SectionPanel title="Recomendaciones y Restricciones" subtitle="Checklist predefinido" icon={ClipboardList} iconBg="bg-amber-500">
            <RecommendationsChecklist form={form} />
          </SectionPanel>

          {/* Section 7: Image Attachments */}
          <SectionPanel title="Imagenes Adjuntas" subtitle="Fotos, radiografias, estudios" icon={Paperclip} iconBg="bg-indigo-500" defaultOpen={false} badge={`${images.length} archivo${images.length !== 1 ? 's' : ''}`}>
            <ImageUpload consultationId="new" images={images} onImagesChange={setImages} />
          </SectionPanel>

          {/* Section 8: Exams & Prognosis */}
          <SectionPanel title="Exámenes, Pronóstico y Destino" subtitle="Examenes requeridos, tiempo estimado y destino" icon={Activity} iconBg="bg-teal-500">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Examenes Requeridos / Laboratorio e Imaginologia</Label>
                <Textarea placeholder="Ej: Rayos X de Columna Lumbar / Rodilla AP-FL, Resonancia Magnetica..." className="clay-input min-h-[100px] text-slate-900 placeholder:text-slate-400 resize-none" {...form.register("labExamsRequested")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiempo Aproximado de Tratamiento</Label>
                  <Input placeholder="Ej: 2 meses" {...form.register("treatmentDurationApprox")} className="clay-input h-11 text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiempo Estimado de Mejoria / Pronostico</Label>
                  <Input placeholder="Ej: A partir de 4ta semana entre 30% a 60%" {...form.register("improvementEstimate")} className="clay-input h-11 text-slate-900 placeholder:text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Destino</Label>
                <Select
                  onValueChange={(value) => form.setValue("destination", value)}
                  value={form.watch("destination") || ""}
                >
                  <SelectTrigger className="clay-input h-11 text-slate-900">
                    <SelectValue placeholder="Seleccionar destino" />
                  </SelectTrigger>
                  <SelectContent className="clay-card border-0 z-[9999]">
                    <SelectItem value="TRATAMIENTO">Tratamiento</SelectItem>
                    <SelectItem value="RECONSULTA">Reconsulta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comentario de Evolucion</Label>
                <Textarea placeholder="Observaciones adicionales del doctor (ej: Paciente en espera de Rayos X para reconsulta)..." className="clay-input min-h-[100px] text-slate-900 placeholder:text-slate-400 resize-none" {...form.register("doctorComments")} />
              </div>
            </div>
          </SectionPanel>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8 pt-2">
            <button type="button" onClick={() => patientId ? router.push(`/pacientes/${patientId}`) : router.push("/dashboard")} className="clay-button px-5 py-2.5 text-sm font-semibold text-slate-900">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="clay-button-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Historia Clinica
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
