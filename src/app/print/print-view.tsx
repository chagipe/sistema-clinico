"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, HeartPulse, Image as ImageIcon } from "lucide-react";
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
  allergies?: string;
  physicalExam?: string;
  labExamsRequested?: string;
  treatmentDurationApprox?: string;
  improvementEstimate?: string;
  doctorComments?: string;
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
  alternativeTreatments: Array<{ treatmentName: string; bodyZone?: string; frequency?: string; sessionsCount?: number; packagePrice?: number; sessionPrice?: number; }>;
  prescriptions: Array<{ medication: string; days?: number; dosage?: string; instructions?: string; }>;
  recommendationsChecklist?: {
    noCitrus: boolean; noVitaminC: boolean; noPhysicalEffort: boolean;
    noAlcohol: boolean; noAvocado: boolean; noRedMeat: boolean; useOrthopedicSupport: boolean;
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
  const consultationId = searchParams.get("id");
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (consultationId) {
      fetchConsultation(consultationId);
      fetchMedia(consultationId);
    }
  }, [consultationId]);

  const fetchConsultation = async (id: string) => {
    try {
      const response = await fetch(`/api/consultations?id=${id}`);
      if (!response.ok) { setIsLoading(false); return; }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) setConsultation(data[0]);
    } catch (error) {
      console.error("Error fetching consultation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedia = async (consultationId: string) => {
    try {
      const response = await fetch(`/api/media?consultationId=${consultationId}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Cargando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-[#c9b9a8] border-t-[#8b6f5c] rounded-full animate-spin" />
            <p className="text-sm text-[#7a6b5d]">Cargando ficha clinica...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Consulta no encontrada" />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 text-center">
            <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <Printer className="h-8 w-8 text-[#7a6b5d]" />
            </div>
            <h2 className="text-lg font-bold text-[#3d3530] mb-2">Consulta no encontrada</h2>
            <p className="text-sm text-[#7a6b5d] mb-4">No se encontro la consulta solicitada</p>
            <Link href="/dashboard">
              <button className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 mx-auto">
                <ArrowLeft className="h-4 w-4" /> Volver
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const patient = consultation.patient;
  const vitals = consultation.vitals;

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
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3d3530] to-[#4a3f36] px-8 py-6 text-white print:bg-[#3d3530]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#c4a882] to-[#8b6f5c] flex items-center justify-center shadow-lg print:bg-[#8b6f5c]">
                  <HeartPulse className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">CONSULTORIO DE MEDICINA INTEGRATIVA</h1>
                  <p className="text-sm text-white/60 mt-0.5">Ozonoterapia &middot; Plasma Rico en Plaquetas &middot; Viscosuplementacion</p>
                  <p className="text-xs text-white/40 mt-0.5">RUC: 20512345678 &middot; Fono: (01) 234-5678</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-white/10 text-white/80 text-xs font-bold px-3 py-1 rounded-lg">HISTORIA CLINICA</div>
                <p className="text-xs text-white/40 mt-2">Nro: {consultation.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-white/40">{formatDateTime(new Date(consultation.createdAt))}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-5">
            {/* Patient Info */}
            <div className="clay-inset p-4">
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Paciente</span>
                  <p className="font-bold text-[#3d3530] mt-0.5">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">DNI</span>
                  <p className="font-bold text-[#3d3530] mt-0.5">{patient.dni}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Edad</span>
                  <p className="font-bold text-[#3d3530] mt-0.5">{calculateAge(new Date(patient.birthDate))} anios</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Genero</span>
                  <p className="font-bold text-[#3d3530] mt-0.5">{patient.gender}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Tipo</span>
                  <p className="font-bold text-[#3d3530] mt-0.5">{consultation.type}</p>
                </div>
              </div>
              {consultation.hasAccidentsOps && (
                <div className="mt-3 pt-3 border-t border-[#c9b9a8]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7a4a4a] bg-[#c98b8b]/20 px-2.5 py-1 rounded-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c4625a]" />
                    Historia de accidentes y/o operaciones
                  </span>
                </div>
              )}
              {consultation.allergies && (
                <div className="mt-2 pt-2 border-t border-[#c9b9a8]">
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Alergias: </span>
                  <span className="text-sm font-medium text-[#7a6a3a]">{consultation.allergies}</span>
                </div>
              )}
            </div>

            {/* Vitals */}
            {vitals && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#c98b8b]" />
                  <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">1. Triaje y Funciones Vitales</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { l: "PA", v: vitals.bloodPressure, u: "" },
                    { l: "FC", v: vitals.heartRate, u: "lpm" },
                    { l: "FR", v: vitals.respiratoryRate, u: "rpm" },
                    { l: "SatO2", v: vitals.oxygenSaturation, u: "%" },
                    { l: "Peso", v: vitals.weightKg, u: "kg" },
                    { l: "Talla", v: vitals.heightCm, u: "cm" },
                    { l: "IMC", v: vitals.bmi, u: "" },
                    { l: "Temp", v: vitals.temperature, u: "C" },
                  ].map((item) => (
                    <div key={item.l} className="clay-inset px-3 py-2">
                      <span className="font-bold text-[#7a6b5d]">{item.l}:</span>{" "}
                      <span className="font-semibold text-[#3d3530]">{item.v || "-"}{item.v ? ` ${item.u}` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8bb5c9]" />
                <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">2. Evaluacion Clinica</h3>
              </div>
              <div className="space-y-2">
                <div className="clay-inset p-3">
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Motivo de Consulta</span>
                  <p className="text-sm text-[#3d3530] mt-1 min-h-[24px]">{consultation.consultationReason || "-"}</p>
                </div>
                <div className="clay-inset p-3">
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Historia de la Enfermedad</span>
                  <p className="text-sm text-[#3d3530] mt-1 min-h-[40px]">{consultation.diseaseHistory || "-"}</p>
                </div>
                <div className="clay-inset p-3">
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Examen Fisico</span>
                  <p className="text-sm text-[#3d3530] mt-1 min-h-[40px]">{consultation.physicalExam || "-"}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            {consultation.diagnoses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8bc99a]" />
                  <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">3. Diagnostico</h3>
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="clay-inset px-3 py-2 text-left font-bold text-[#7a6b5d]">Codigo</th>
                      <th className="clay-inset px-3 py-2 text-left font-bold text-[#7a6b5d]">Descripcion</th>
                      <th className="clay-inset px-3 py-2 text-left font-bold text-[#7a6b5d]">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.diagnoses.map((d, i) => (
                      <tr key={i}>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 font-mono font-bold text-[#8b6f5c]">{d.cie10Code}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2">{d.description}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${d.type === "DEFINITIVO" ? "bg-[#8bc99a]/30 text-[#4a7a55]" : "bg-[#c9b88b]/30 text-[#7a6a3a]"}`}>{d.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Treatment */}
            {consultation.alternativeTreatments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b88bc9]" />
                  <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">4. Tratamiento Recomendado</h3>
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      {["Tratamiento", "Zona", "Frecuencia", "Sesiones", "Costo Sesion", "Costo Paquete"].map((h) => (
                        <th key={h} className="clay-inset px-3 py-2 text-left font-bold text-[#7a6b5d]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.alternativeTreatments.map((t, i) => (
                      <tr key={i}>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 font-medium">{t.treatmentName}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2">{t.bodyZone || "-"}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2">{t.frequency || "-"}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 text-center">{t.sessionsCount || "-"}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 text-right">{t.sessionPrice ? `S/ ${t.sessionPrice}` : "-"}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 text-right font-semibold">{t.packagePrice ? `S/ ${t.packagePrice}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Prescription */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#c9b88b]" />
                <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">5. Examenes y Receta Medica</h3>
              </div>
              {consultation.labExamsRequested && (
                <div className="clay-inset p-3 mb-2">
                  <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">Examenes Requeridos</span>
                  <p className="text-sm text-[#3d3530] mt-1">{consultation.labExamsRequested}</p>
                </div>
              )}
              {consultation.prescriptions.length > 0 && (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      {["Medicamento", "Dias", "Frecuencia", "Indicaciones"].map((h) => (
                        <th key={h} className="clay-inset px-3 py-2 text-left font-bold text-[#7a6b5d]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.prescriptions.map((rx, i) => (
                      <tr key={i}>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 font-bold">{rx.medication}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2 text-center">{rx.days || "-"}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2">{rx.dosage || "-"}</td>
                        <td className="border-b border-[#c9b9a8]/30 px-3 py-2">{rx.instructions || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recommendations */}
            {consultation.recommendationsChecklist && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#c9a88b]" />
                  <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">6. Recomendaciones y Restricciones</h3>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { k: "noCitrus", l: "No citricos", a: consultation.recommendationsChecklist.noCitrus },
                    { k: "noVitaminC", l: "No Vitamina C", a: consultation.recommendationsChecklist.noVitaminC },
                    { k: "noPhysicalEffort", l: "No esfuerzo fisico", a: consultation.recommendationsChecklist.noPhysicalEffort },
                    { k: "noAlcohol", l: "No alcohol", a: consultation.recommendationsChecklist.noAlcohol },
                    { k: "noAvocado", l: "No palta", a: consultation.recommendationsChecklist.noAvocado },
                    { k: "noRedMeat", l: "No carne roja", a: consultation.recommendationsChecklist.noRedMeat },
                    { k: "useOrthopedicSupport", l: "Uso de faja/ortopedico", a: consultation.recommendationsChecklist.useOrthopedicSupport },
                  ].filter(r => r.a).map((r) => (
                    <div key={r.k} className={`clay-inset px-3 py-2 rounded-xl text-[#7a4a4a]`}>
                      <span className="font-bold">X</span> {r.l}
                    </div>
                  ))}
                </div>
                {(consultation.treatmentDurationApprox || consultation.improvementEstimate) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {consultation.treatmentDurationApprox && (
                      <div className="clay-inset px-3 py-2">
                        <span className="font-bold text-[#8b6f5c]">Duracion: </span>
                        <span className="text-[#3d3530]">{consultation.treatmentDurationApprox}</span>
                      </div>
                    )}
                    {consultation.improvementEstimate && (
                      <div className="clay-inset px-3 py-2">
                        <span className="font-bold text-[#4a7a55]">Mejora: </span>
                        <span className="text-[#3d3530]">{consultation.improvementEstimate}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Attached Images */}
            {media.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8b8bc9]" />
                  <h3 className="text-xs font-bold text-[#3d3530] uppercase tracking-wider">7. Imagenes Adjuntas</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {media.map((item) => (
                    <div key={item.id} className="clay-inset p-2 rounded-xl">
                      <div className="aspect-square rounded-lg overflow-hidden bg-[#e8e0d8] flex items-center justify-center">
                        <img src={item.data} alt={item.filename} className="w-full h-full object-contain" />
                      </div>
                      {item.label && <p className="text-[10px] text-[#7a6b5d] mt-1 font-medium">{item.label}</p>}
                      <p className="text-[10px] text-[#7a6b5d] truncate">{item.filename}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature */}
            <div className="mt-8 pt-6 border-t-2 border-[#c9b9a8] flex justify-between items-end">
              <div className="max-w-md">
                <p className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider mb-1">Comentarios del Doctor</p>
                <p className="text-sm text-[#7a6b5d] italic">{consultation.doctorComments || "Sin comentarios adicionales"}</p>
              </div>
              <div className="text-center w-56">
                <div className="border-t-2 border-[#3d3530] pt-3">
                  <p className="text-xs font-bold text-[#3d3530]">Firma y Sello del Medico</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-bold text-[#3d3530]">Dr. Admin</p>
                    <p className="text-xs text-[#7a6b5d]">CMP: 12345</p>
                    <p className="text-[10px] text-[#7a6b5d]">Medicina Integrativa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="clay-inset mx-6 mb-6 px-6 py-3 rounded-xl print:mx-0 print:mb-0 print:rounded-none">
            <div className="flex items-center justify-between text-[10px] text-[#7a6b5d]">
              <span>MedIntegra - Sistema Clinico v1.0</span>
              <span>Documento generado electronicamente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
