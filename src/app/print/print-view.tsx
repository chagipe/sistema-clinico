"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, HeartPulse } from "lucide-react";
import { calculateAge, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";

interface ConsultationData {
  id: string;
  type: string;
  status: string;
  hasAccidentsOps: boolean;
  consultationReason?: string;
  diseaseHistory?: string;
  antecedentes?: string;
  allergies?: string;
  physicalExam?: string;
  labExamsRequested?: string;
  treatmentDurationApprox?: string;
  improvementEstimate?: string;
  doctorComments?: string;
  destination?: string;
  painScale?: number;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    gender: string;
  };
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    temperature?: number;
  };
  diagnoses: Array<{ cie10Code: string; description: string; type: string; }>;
  alternativeTreatments: Array<{ treatmentName: string; bodyZone?: string; frequency?: string; sessionsCount?: number; }>;
  prescriptions: Array<{ medication: string; days?: number; dosage?: string; instructions?: string; }>;
  recommendationsChecklist?: {
    noCitrus: boolean; noVitaminC: boolean; noPhysicalEffort: boolean;
    noAlcohol: boolean; noAvocado: boolean; noRedMeat: boolean;
    cryotherapy: boolean; thermotherapy: boolean; stretchingExercises: boolean;
    useFajaDorsoLumbar: boolean; useRodillera: boolean; useOrthopedicInsoles: boolean;
  };
}

interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  data: string;
  label?: string | null;
}

export default function PrintView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const consultationId = searchParams.get("id");
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!consultationId) {
      setIsLoading(false);
      setError("No se proporciono un ID de consulta.");
      return;
    }
    fetchConsultation(consultationId);
  }, [consultationId]);

  const fetchConsultation = async (id: string) => {
    try {
      const response = await fetch(`/api/consultations?id=${id}`);
      if (response.status === 404) {
        setError("Consulta no encontrada");
        setIsLoading(false);
        return;
      }
      if (!response.ok) {
        setError("Error al cargar la consulta.");
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      setConsultation(data);
      if (data.media && Array.isArray(data.media)) {
        setMedia(data.media);
      }
    } catch (err) {
      console.error("Error fetching consultation:", err);
      setError("Error de conexion al cargar la consulta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Cargando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Cargando ficha clinica...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Consulta no encontrada" />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 text-center">
            <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <Printer className="h-8 w-8 text-slate-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Consulta no encontrada</h2>
            <p className="text-sm text-slate-500 mb-4">
              {error === "Consulta no encontrada"
                ? "No se encontro la consulta solicitada. Verifique que el enlace sea correcto."
                : error || "No se encontro la consulta solicitada."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/pacientes">
                <button className="clay-button px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Ver Pacientes
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
                  Ir al Inicio
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const patient = consultation.patient;
  const vitals = consultation.vitals;

  const hasAnyRecommendation = consultation.recommendationsChecklist && (
    consultation.recommendationsChecklist.noCitrus ||
    consultation.recommendationsChecklist.noVitaminC ||
    consultation.recommendationsChecklist.noPhysicalEffort ||
    consultation.recommendationsChecklist.noAlcohol ||
    consultation.recommendationsChecklist.noAvocado ||
    consultation.recommendationsChecklist.noRedMeat ||
    consultation.recommendationsChecklist.cryotherapy ||
    consultation.recommendationsChecklist.thermotherapy ||
    consultation.recommendationsChecklist.stretchingExercises ||
    consultation.recommendationsChecklist.useFajaDorsoLumbar ||
    consultation.recommendationsChecklist.useRodillera ||
    consultation.recommendationsChecklist.useOrthopedicInsoles
  );

  const dieteticRestrictions = consultation.recommendationsChecklist ? [
    { k: "noCitrus", l: "No citricos (limon, naranja, fresa, pina, mandarina)" },
    { k: "noVitaminC", l: "No suplementar Vitamina C" },
    { k: "noAvocado", l: "No consumir palta (evitar antioxidantes altos)" },
    { k: "noRedMeat", l: "No consumir carnes rojas (res, cerdo, cordero)" },
    { k: "noAlcohol", l: "No consumir bebidas alcoholicas" },
  ].filter(r => consultation.recommendationsChecklist![r.k as keyof typeof consultation.recommendationsChecklist]) : [];

  const physicalRecommendations = consultation.recommendationsChecklist ? [
    { k: "noPhysicalEffort", l: "Reposo deportivo / Evitar esfuerzo fisico pesado" },
    { k: "cryotherapy", l: "Crioterapia (Hielo local 15 min por sesion)" },
    { k: "thermotherapy", l: "Termoterapia (Calor local en zona muscular)" },
    { k: "stretchingExercises", l: "Pauta de ejercicios de estiramiento / Pausas activas" },
  ].filter(r => consultation.recommendationsChecklist![r.k as keyof typeof consultation.recommendationsChecklist]) : [];

  const orthopedicSupports = consultation.recommendationsChecklist ? [
    { k: "useFajaDorsoLumbar", l: "Uso de Faja Dorso-Lumbar" },
    { k: "useRodillera", l: "Uso de Rodillera durante actividad fisica" },
    { k: "useOrthopedicInsoles", l: "Plantillas / Calzado Ortopedico" },
  ].filter(r => consultation.recommendationsChecklist![r.k as keyof typeof consultation.recommendationsChecklist]) : [];

  const hasVitals = vitals && (
    vitals.bloodPressure || vitals.heartRate || vitals.respiratoryRate ||
    vitals.oxygenSaturation || vitals.weightKg || vitals.heightCm ||
    vitals.temperature || consultation.painScale != null
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Ficha Clinica"
        subtitle={`Consulta Nro: ${consultation.id.slice(0, 8).toUpperCase()}`}
        actions={
          <button onClick={handlePrint} className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 print:hidden">
            <Printer className="h-4 w-4" /> Imprimir Ficha
          </button>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto print:p-0">
        <div className="max-w-[210mm] mx-auto clay-card overflow-hidden print:shadow-none print:rounded-none print:max-w-none">

          {/* ===== HEADER ===== */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 text-white print:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg print:bg-cyan-600">
                  <HeartPulse className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">EJES TERAPEUTICOS</h1>
                  <p className="text-xs text-white/60 mt-0.5">Doctores en Terapia del Dolor</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Av. Espana 663, Cercado de Lima &middot; Tel/WhatsApp: 960 937 796</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-white/10 text-white/80 text-xs font-bold px-3 py-1 rounded-lg">HISTORIA CLINICA</div>
                <p className="text-[10px] text-white/40 mt-2">Nro: {consultation.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-[10px] text-white/40">{formatDateTime(new Date(consultation.createdAt))}</p>
              </div>
            </div>
          </div>

          {/* ===== CONTENT ===== */}
          <div className="px-8 py-5 space-y-4">

            {/* === 1. DATOS DEL PACIENTE Y TRIAJE === */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Datos del Paciente y Triaje</h3>
              </div>
              <div className="clay-inset p-3">
                <div className="grid grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Paciente</span>
                    <p className="font-bold text-slate-900 mt-0.5">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">DNI</span>
                    <p className="font-bold text-slate-900 mt-0.5">{patient.dni}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Edad</span>
                    <p className="font-bold text-slate-900 mt-0.5">{calculateAge(new Date(patient.birthDate))} anios</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Genero</span>
                    <p className="font-bold text-slate-900 mt-0.5">{patient.gender}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tipo</span>
                    <p className="font-bold text-slate-900 mt-0.5">{consultation.type}</p>
                  </div>
                </div>
                {consultation.hasAccidentsOps && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                      <span className="h-1 w-1 rounded-full bg-red-500" />
                      Historia de accidentes y/o operaciones
                    </span>
                  </div>
                )}
                {consultation.allergies && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Alergias: </span>
                    <span className="text-xs font-medium text-amber-700">{consultation.allergies}</span>
                  </div>
                )}
              </div>

              {/* Vitals */}
              {hasVitals && (
                <div className="mt-2">
                  <div className="grid grid-cols-5 gap-1.5 text-[10px]">
                    {[
                      { l: "PA", v: vitals?.bloodPressure, u: "" },
                      { l: "FC", v: vitals?.heartRate, u: "lpm" },
                      { l: "FR", v: vitals?.respiratoryRate, u: "rpm" },
                      { l: "SatO2", v: vitals?.oxygenSaturation, u: "%" },
                      { l: "Peso", v: vitals?.weightKg, u: "kg" },
                      { l: "Talla", v: vitals?.heightCm, u: "cm" },
                      { l: "IMC", v: vitals?.bmi, u: "" },
                      { l: "Temp", v: vitals?.temperature, u: "\u00b0C" },
                      ...(consultation.painScale != null ? [{ l: "EVA", v: `${consultation.painScale}/10`, u: "" }] : []),
                    ].filter(item => item.v != null && item.v !== "").map((item) => (
                      <div key={item.l} className="clay-inset px-2 py-1.5">
                        <span className="font-bold text-slate-500">{item.l}:</span>{" "}
                        <span className="font-semibold text-slate-900">{item.v}{item.v ? ` ${item.u}` : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* === 2. EVALUACION CLINICA === */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Evaluacion Clinica</h3>
              </div>
              <div className="space-y-1.5">
                {consultation.consultationReason && (
                  <div className="clay-inset p-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Motivo de Consulta</span>
                    <p className="text-xs text-slate-900 mt-0.5">{consultation.consultationReason}</p>
                  </div>
                )}
                {consultation.diseaseHistory && (
                  <div className="clay-inset p-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Historia de la Enfermedad Actual</span>
                    <p className="text-xs text-slate-900 mt-0.5">{consultation.diseaseHistory}</p>
                  </div>
                )}
                {consultation.antecedentes && (
                  <div className="clay-inset p-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Antecedentes (APP / APF)</span>
                    <p className="text-xs text-slate-900 mt-0.5">{consultation.antecedentes}</p>
                  </div>
                )}
                {consultation.physicalExam && (
                  <div className="clay-inset p-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Examen Fisico</span>
                    <p className="text-xs text-slate-900 mt-0.5">{consultation.physicalExam}</p>
                  </div>
                )}
                {!consultation.consultationReason && !consultation.diseaseHistory && !consultation.antecedentes && !consultation.physicalExam && (
                  <div className="clay-inset p-2.5">
                    <p className="text-xs text-slate-400 italic">Sin registros de evaluacion clinica</p>
                  </div>
                )}
              </div>
            </div>

            {/* === 3. DIAGNOSTICO === */}
            {consultation.diagnoses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Diagnostico</h3>
                </div>
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Codigo</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Nombre / Descripcion</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.diagnoses.map((d, i) => (
                      <tr key={i}>
                        <td className="border-b border-slate-200 px-2.5 py-1.5 font-mono font-bold text-cyan-600">{d.cie10Code}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5">{d.description}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${d.type === "DEFINITIVO" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{d.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* === 4. TRATAMIENTO RECOMENDADO (PROCEDIMIENTOS) === */}
            {consultation.alternativeTreatments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Tratamiento Recomendado (Procedimientos)</h3>
                </div>
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr>
                      <th className="clay-inset px-2.5 py-1.5 text-center font-bold text-slate-500 w-8">#</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Tratamiento</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Zona Especifica</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Frecuencia</th>
                      <th className="clay-inset px-2.5 py-1.5 text-center font-bold text-slate-500">Sesiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.alternativeTreatments.map((t, i) => (
                      <tr key={i}>
                        <td className="border-b border-slate-200 px-2.5 py-1.5 text-center font-bold text-violet-600">{i + 1}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5 font-medium">{t.treatmentName}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5">{t.bodyZone || "-"}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5">{t.frequency || "-"}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5 text-center">{t.sessionsCount || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* === 5. EXAMENES REQUERIDOS / LABORATORIO E IMAGINOLOGIA === */}
            {consultation.labExamsRequested && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Examenes Requeridos / Laboratorio e Imaginologia</h3>
                </div>
                <div className="clay-inset p-2.5">
                  <p className="text-xs text-slate-900">{consultation.labExamsRequested}</p>
                </div>
              </div>
            )}

            {/* === 6. RECETA MEDICA === */}
            {consultation.prescriptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">6. Receta Medica</h3>
                </div>
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Medicamento</th>
                      <th className="clay-inset px-2.5 py-1.5 text-center font-bold text-slate-500">Dias</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Dosis</th>
                      <th className="clay-inset px-2.5 py-1.5 text-left font-bold text-slate-500">Indicaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.prescriptions.map((rx, i) => (
                      <tr key={i}>
                        <td className="border-b border-slate-200 px-2.5 py-1.5 font-bold">{rx.medication}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5 text-center">{rx.days || "-"}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5">{rx.dosage || "-"}</td>
                        <td className="border-b border-slate-200 px-2.5 py-1.5">{rx.instructions || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* === 7. TIEMPO Y PORCENTAJE DE MEJORA === */}
            {(consultation.treatmentDurationApprox || consultation.improvementEstimate) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Tiempo y Porcentaje de Mejora</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {consultation.treatmentDurationApprox && (
                    <div className="clay-inset px-2.5 py-2">
                      <span className="font-bold text-cyan-600">Tiempo aproximado de tratamiento: </span>
                      <span className="text-slate-900">{consultation.treatmentDurationApprox}</span>
                    </div>
                  )}
                  {consultation.improvementEstimate && (
                    <div className="clay-inset px-2.5 py-2">
                      <span className="font-bold text-emerald-600">Tiempo estimado de mejoria / Pronostico: </span>
                      <span className="text-slate-900">{consultation.improvementEstimate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === 8. RECOMENDACIONES Y RESTRICCIONES === */}
            {hasAnyRecommendation && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">8. Recomendaciones y Restricciones</h3>
                </div>

                {dieteticRestrictions.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Restricciones Dieteticas (Ozonoterapia)</p>
                    <div className="grid grid-cols-1 gap-0.5 text-[10px]">
                      {dieteticRestrictions.map((r) => (
                        <div key={r.k} className="clay-inset px-2.5 py-1 text-red-700">
                          <span className="font-bold">X</span> {r.l}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {physicalRecommendations.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[9px] font-bold text-cyan-600 uppercase tracking-wider mb-1">Indicaciones Fisicas y Rehabilitacion</p>
                    <div className="grid grid-cols-1 gap-0.5 text-[10px]">
                      {physicalRecommendations.map((r) => (
                        <div key={r.k} className="clay-inset px-2.5 py-1 text-cyan-700">
                          <span className="font-bold">X</span> {r.l}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orthopedicSupports.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[9px] font-bold text-violet-600 uppercase tracking-wider mb-1">Soportes Ortopedicos</p>
                    <div className="grid grid-cols-1 gap-0.5 text-[10px]">
                      {orthopedicSupports.map((r) => (
                        <div key={r.k} className="clay-inset px-2.5 py-1 text-violet-700">
                          <span className="font-bold">X</span> {r.l}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === 9. DESTINO Y COMENTARIOS DEL DOCTOR (EVOLUCION) === */}
            {(consultation.destination || consultation.doctorComments) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">9. Destino y Comentarios del Doctor (Evolucion)</h3>
                </div>
                <div className="space-y-1.5">
                  {consultation.destination && (
                    <div className="clay-inset px-2.5 py-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Destino: </span>
                      <span className="text-xs font-bold text-slate-900">
                        {consultation.destination === "TRATAMIENTO" ? "Tratamiento" : consultation.destination === "RECONSULTA" ? "Reconsulta" : consultation.destination}
                      </span>
                    </div>
                  )}
                  {consultation.doctorComments && (
                    <div className="clay-inset px-2.5 py-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Comentario de Evolucion: </span>
                      <p className="text-xs text-slate-900 mt-0.5">{consultation.doctorComments}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === 10. FIRMA / SELLO DEL MEDICO Y PIE DE PAGINA === */}
            <div className="mt-6 pt-4 border-t-2 border-slate-200 flex justify-between items-end">
              <div className="max-w-md">
                {/* Intentionally left blank for doctor's notes or stamp */}
              </div>
              <div className="text-center w-56">
                <div className="border-t-2 border-slate-900 pt-3">
                  <p className="text-[10px] font-bold text-slate-900">Firma y Sello del Medico</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-bold text-slate-900">Dr. Admin</p>
                    <p className="text-[10px] text-slate-500">CMP: 12345</p>
                    <p className="text-[9px] text-slate-500">Terapia del Dolor y Medicina Regenerativa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="clay-inset mx-6 mb-5 px-6 py-2 rounded-xl print:mx-0 print:mb-0 print:rounded-none">
            <div className="flex items-center justify-between text-[9px] text-slate-500">
              <span>Ejes Terapeuticos - Doctores en Terapia del Dolor</span>
              <span>Documento generado electronicamente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
