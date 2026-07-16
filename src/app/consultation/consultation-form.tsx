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
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { calculateAge, cn } from "@/lib/utils";
import Link from "next/link";

const consultationSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(["NUEVA", "RECONSULTA", "TRATAMIENTO"]),
  hasAccidentsOps: z.boolean(),
  consultationReason: z.string().optional(),
  diseaseHistory: z.string().optional(),
  allergies: z.string().optional(),
  physicalExam: z.string().optional(),
  labExamsRequested: z.string().optional(),
  treatmentDurationApprox: z.string().optional(),
  improvementEstimate: z.string().optional(),
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
    useOrthopedicSupport: z.boolean().optional(),
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
            <h3 className="font-bold text-[#3d3530]">{title}</h3>
            {subtitle && <p className="text-xs text-[#7a6b5d]">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#c9b9a8]/40 text-[#7a6b5d]">
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#7a6b5d]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#7a6b5d]" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-[#c9b9a8]/30">
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

  const form = useForm<FormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      patientId: patientId || "",
      type: "NUEVA",
      hasAccidentsOps: false,
      diagnoses: [],
      alternativeTreatments: [],
      prescriptions: [],
      recommendationsChecklist: {
        noCitrus: false, noVitaminC: false, noPhysicalEffort: false,
        noAlcohol: false, noAvocado: false, noRedMeat: false, useOrthopedicSupport: false,
      },
    },
  });

  useEffect(() => {
    if (patientId) fetchPatient(patientId);
  }, [patientId]);

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
    setIsSaving(true);
    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, diagnoses }),
      });
      if (response.ok) {
        const result = await response.json();
        router.push(`/print?id=${result.id}`);
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
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
            <div className="h-10 w-10 border-4 border-[#c9b9a8] border-t-[#8b6f5c] rounded-full animate-spin" />
            <p className="text-sm text-[#7a6b5d]">Cargando datos del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Paciente no encontrado" />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 text-center">
            <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-[#c4625a]" />
            </div>
            <h2 className="text-lg font-bold text-[#3d3530] mb-2">Paciente no encontrado</h2>
            <p className="text-sm text-[#7a6b5d] mb-4">No se encontro el paciente solicitado</p>
            <Link href="/dashboard">
              <button className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
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
              className="clay-button px-4 py-2.5 text-sm font-semibold text-[#3d3530] flex items-center gap-2"
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-5xl mx-auto">
          {/* Patient Header */}
          <div className="clay-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#c4a882] to-[#8b6f5c] flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#3d3530]">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[#7a6b5d] text-sm">DNI: {patient.dni}</span>
                    <span className="text-[#c9b9a8]">|</span>
                    <span className="text-[#7a6b5d] text-sm">{calculateAge(new Date(patient.birthDate))} anios</span>
                    <span className="text-[#c9b9a8]">|</span>
                    <span className="text-[#7a6b5d] text-sm">{patient.gender}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {form.watch("hasAccidentsOps") && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#c98b8b]/30 text-[#7a4a4a]">
                    <AlertTriangle className="h-3 w-3" />
                    Accidente/Operacion
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#c9b9a8]/30">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Tipo de Consulta</Label>
                <Select
                  onValueChange={(value) => form.setValue("type", value as "NUEVA" | "RECONSULTA" | "TRATAMIENTO")}
                  defaultValue="NUEVA"
                >
                  <SelectTrigger className="clay-input h-11 text-[#3d3530]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="clay-card border-0">
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
                  className="border-2 border-[#c9b9a8] data-[state=checked]:bg-[#8b6f5c] data-[state=checked]:border-[#8b6f5c]"
                />
                <Label htmlFor="hasAccidentsOps" className="cursor-pointer text-sm font-medium text-[#3d3530]">
                  Accidentes y/o operacion
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Alergias</Label>
                <Input
                  placeholder="Describe alergias..."
                  {...form.register("allergies")}
                  className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Vitals */}
          <SectionPanel title="Triaje y Funciones Vitales" subtitle="Presion arterial, frecuencias, peso y talla" icon={Heart} iconBg="bg-[#c98b8b]" badge="Vitales">
            <VitalsForm form={form} />
          </SectionPanel>

          {/* Section 2: Clinical Evaluation */}
          <SectionPanel title="Evaluacion Clinica" subtitle="Motivo, historia y examen fisico" icon={FileText} iconBg="bg-[#8bb5c9]" badge="Eval">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Motivo de Consulta</Label>
                <Textarea placeholder="Describa el motivo principal de la consulta..." className="clay-input min-h-[100px] text-[#3d3530] placeholder:text-[#7a6b5d]/50 resize-none" {...form.register("consultationReason")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Historia de la Enfermedad Actual</Label>
                <Textarea placeholder="Describa la evolucion y sintomatologia..." className="clay-input min-h-[120px] text-[#3d3530] placeholder:text-[#7a6b5d]/50 resize-none" {...form.register("diseaseHistory")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Examen Fisico / Exploracion</Label>
                <Textarea placeholder="Detalle hallazgos del examen fisico..." className="clay-input min-h-[120px] text-[#3d3530] placeholder:text-[#7a6b5d]/50 resize-none" {...form.register("physicalExam")} />
              </div>
            </div>
          </SectionPanel>

          {/* Section 3: Diagnosis */}
          <SectionPanel title="Diagnostico CIE-10" subtitle="Busqueda y seleccion de codigos" icon={Stethoscope} iconBg="bg-[#8bc99a]" badge={diagnoses.length > 0 ? `${diagnoses.length} Dx` : "CIE-10"}>
            <div className="space-y-4">
              <Cie10Search onSelect={handleAddDiagnosis} selectedCodes={diagnoses} onRemove={handleRemoveDiagnosis} />
              {diagnoses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Diagnosticos Seleccionados</Label>
                  <div className="space-y-2">
                    {diagnoses.map((diag) => (
                      <div key={diag.cie10Code} className="flex items-center justify-between p-3 rounded-xl clay-inset">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                            diag.type === "DEFINITIVO" ? "bg-[#8bc99a]/30 text-[#4a7a55]" : "bg-[#c9b88b]/30 text-[#7a6a3a]"
                          )}>
                            {diag.type}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#3d3530]">{diag.cie10Code}</span>
                          <span className="text-sm text-[#7a6b5d]">{diag.description}</span>
                        </div>
                        <button type="button" onClick={() => handleToggleDiagnosisType(diag.cie10Code)} className="text-xs text-[#7a6b5d] hover:text-[#8b6f5c] font-medium">
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
          <SectionPanel title="Tratamiento Alternativo" subtitle="Ozonoterapia, Plasma, Viscosuplementacion" icon={Syringe} iconBg="bg-[#b88bc9]" badge="Procedimientos">
            <TreatmentTable form={form} />
          </SectionPanel>

          {/* Section 5: Prescription */}
          <SectionPanel title="Receta Medica" subtitle="Medicamentos, dosis e indicaciones" icon={Pill} iconBg="bg-[#c9b88b]" badge="Rx">
            <PrescriptionTable form={form} />
          </SectionPanel>

          {/* Section 6: Recommendations */}
          <SectionPanel title="Recomendaciones y Restricciones" subtitle="Checklist predefinido" icon={ClipboardList} iconBg="bg-[#c9a88b]">
            <RecommendationsChecklist form={form} />
          </SectionPanel>

          {/* Section 7: Exams & Prognosis */}
          <SectionPanel title="Examenes y Pronostico" subtitle="Examenes requeridos y tiempo estimado" icon={Activity} iconBg="bg-[#8bc9c9]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Examenes Requeridos</Label>
                <Textarea placeholder="Ej: Rayos X de rodilla, Resonancia Magnetica de columna lumbar..." className="clay-input min-h-[100px] text-[#3d3530] placeholder:text-[#7a6b5d]/50 resize-none" {...form.register("labExamsRequested")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Tiempo Aproximado de Tratamiento</Label>
                  <Input placeholder="Ej: Aproximadamente 2 meses" {...form.register("treatmentDurationApprox")} className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Tiempo Estimado de Mejora</Label>
                  <Input placeholder="Ej: A partir de 4ta semana entre 30% a 70%" {...form.register("improvementEstimate")} className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">Comentarios del Doctor</Label>
                <Textarea placeholder="Observaciones adicionales..." className="clay-input min-h-[100px] text-[#3d3530] placeholder:text-[#7a6b5d]/50 resize-none" {...form.register("doctorComments")} />
              </div>
            </div>
          </SectionPanel>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8 pt-2">
            <button type="button" onClick={() => router.push("/dashboard")} className="clay-button px-5 py-2.5 text-sm font-semibold text-[#3d3530]">
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
