"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import {
  ArrowLeft,
  Printer,
  Eye,
  User,
  Calendar,
  Phone,
  FileText,
  Stethoscope,
  Clock,
  Plus,
  Activity,
  ClipboardCheck,
  ShieldCheck,
  ChevronRight,
  Save,
  Edit2,
  Heart,
  Droplet,
  Cigarette,
  Wine,
  Home,
  Briefcase,
  Users as UsersIcon,
} from "lucide-react";
import { calculateAge, formatDateTime, cn } from "@/lib/utils";

interface Vitals {
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  temperature?: number;
}

interface Consultation {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  painScale?: number | null;
  allergies?: string | null;
  consultationReason?: string | null;
  diseaseHistory?: string | null;
  physicalExam?: string | null;
  doctorComments?: string | null;
  diagnoses: Array<{ cie10Code: string; description: string; type: string }>;
  vitals?: Vitals | null;
  prescriptions: Array<{ medication: string; days?: number; dosage?: string; instructions?: string }>;
  alternativeTreatments: Array<{ treatmentName: string; bodyZone?: string; frequency?: string; sessionsCount?: number; packagePrice?: number; sessionPrice?: number }>;
  recommendationsChecklist?: Record<string, boolean> | null;
}

interface PatientData {
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
  consultations: Consultation[];
  treatmentPackages: Array<{
    id: string;
    treatmentName: string;
    bodyZone?: string | null;
    totalSessions: number;
    status: string;
    createdAt: string;
    sessions: Array<{ id: string; sessionNumber: number; sessionDate: string }>;
  }>;
}

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ficha" | "consultas">("consultas");
  const [isEditingFicha, setIsEditingFicha] = useState(false);
  const [isSavingFicha, setIsSavingFicha] = useState(false);
  const [fichaData, setFichaData] = useState<Partial<PatientData>>({});

  useEffect(() => {
    if (patientId) fetchPatient(patientId);
  }, [patientId]);

  useEffect(() => {
    if (patient) {
      setFichaData({
        occupation: patient.occupation || "",
        maritalStatus: patient.maritalStatus || "",
        address: patient.address || "",
        familyHistoryDiabetes: patient.familyHistoryDiabetes || false,
        familyHistoryHypertension: patient.familyHistoryHypertension || false,
        familyHistoryCancer: patient.familyHistoryCancer || false,
        familyHistoryHeartDisease: patient.familyHistoryHeartDisease || false,
        familyHistoryKidneyDisease: patient.familyHistoryKidneyDisease || false,
        familyHistoryOther: patient.familyHistoryOther || "",
        personalAllergies: patient.personalAllergies || "",
        personalSurgeries: patient.personalSurgeries || "",
        personalHospitalizations: patient.personalHospitalizations || "",
        personalTransfusions: patient.personalTransfusions || "",
        personalTrauma: patient.personalTrauma || "",
        smoking: patient.smoking || false,
        alcohol: patient.alcohol || false,
        bloodType: patient.bloodType || "",
        habits: patient.habits || "",
      });
    }
  }, [patient]);

  const fetchPatient = async (id: string) => {
    try {
      const response = await fetch(`/api/patients?id=${id}`);
      if (response.status === 404) {
        setError("Paciente no encontrado.");
        setIsLoading(false);
        return;
      }
      if (!response.ok) {
        setError("Error al cargar los datos del paciente.");
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      setPatient(data);
    } catch (err) {
      console.error("Error fetching patient:", err);
      setError("Error de conexion al cargar el paciente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFicha = async () => {
    setIsSavingFicha(true);
    try {
      const response = await fetch(`/api/patients?id=${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fichaData),
      });
      const responseText = await response.text();
      if (response.ok) {
        const updatedPatient = JSON.parse(responseText);
        setPatient(updatedPatient);
        setIsEditingFicha(false);
      } else {
        console.error("PUT error - status:", response.status, "body:", responseText);
        let errorMsg = "Error desconocido";
        try {
          const parsed = JSON.parse(responseText);
          errorMsg = parsed.error || JSON.stringify(parsed);
        } catch {
          errorMsg = responseText || `HTTP ${response.status}`;
        }
        alert("Error al guardar la ficha: " + errorMsg);
      }
    } catch (error) {
      console.error("Error saving ficha:", error);
      alert("Error de conexion al guardar");
    } finally {
      setIsSavingFicha(false);
    }
  };

  const toggleConsultation = (id: string) => {
    setExpandedConsultation(expandedConsultation === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Cargando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Cargando historia clinica...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Paciente no encontrado" />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-card p-8 text-center">
            <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-slate-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Paciente no encontrado</h2>
            <p className="text-sm text-slate-500 mb-4">{error || "No se encontro el paciente solicitado."}</p>
            <Link href="/pacientes">
              <button className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 mx-auto">
                <ArrowLeft className="h-4 w-4" /> Volver a Pacientes
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    EN_ESPERA: { bg: "bg-amber-100", text: "text-amber-700" },
    EN_ATENCION: { bg: "bg-cyan-100", text: "text-cyan-700" },
    FINALIZADO: { bg: "bg-emerald-100", text: "text-emerald-700" },
  };

  const typeColors: Record<string, { bg: string; text: string }> = {
    NUEVA: { bg: "bg-emerald-100", text: "text-emerald-700" },
    RECONSULTA: { bg: "bg-cyan-100", text: "text-cyan-700" },
    TRATAMIENTO: { bg: "bg-amber-100", text: "text-amber-700" },
  };

  const activePackages = (patient.treatmentPackages ?? []).filter((p) => p.status === "ACTIVO");

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Historia Clinica"
        subtitle={`${patient.firstName} ${patient.lastName} - DNI: ${patient.dni}`}
        actions={
          <Link href={`/consultas/nueva?patientId=${patient.id}`}>
            <button className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Patient Info Card */}
        <div className="clay-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {patient.firstName} {patient.lastName}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-500 text-sm flex items-center gap-1">
                    <FileText className="h-3 w-3" /> DNI: {patient.dni}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {calculateAge(new Date(patient.birthDate))} anios
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 text-sm">{patient.gender}</span>
                  {patient.phone && (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {patient.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activePackages.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-700">
                  <Activity className="h-3 w-3" />
                  {activePackages.length} paquete{activePackages.length > 1 ? "s" : ""} activo{activePackages.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/sesiones" className="group">
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                    <ClipboardCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">Control de Sesiones</h4>
                    <p className="text-sm text-slate-500">Paquetes y sesiones de tratamiento</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
              </div>
            </div>
          </Link>
          <Link href="/consentimiento" className="group">
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">Consentimiento Informado</h4>
                    <p className="text-sm text-slate-500">Autorizaciones y consentimientos</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
              </div>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("ficha")}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-semibold transition-colors",
                activeTab === "ficha"
                  ? "text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                Ficha de Filiacion y Antecedentes
              </div>
            </button>
            <button
              onClick={() => setActiveTab("consultas")}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-semibold transition-colors",
                activeTab === "consultas"
                  ? "text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Historial de Consultas
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                  {patient.consultations?.length ?? 0}
                </span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Tab: Ficha de Filiacion */}
            {activeTab === "ficha" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Ficha de Filiacion</h3>
                  <button
                    onClick={() => isEditingFicha ? handleSaveFicha() : setIsEditingFicha(true)}
                    disabled={isSavingFicha}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold flex items-center gap-2 rounded-lg",
                      isEditingFicha 
                        ? "clay-button-primary" 
                        : "clay-button"
                    )}
                  >
                    {isSavingFicha ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isEditingFicha ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                    {isEditingFicha ? "Guardar" : "Editar"}
                  </button>
                </div>

                {/* Datos Personales */}
                <div className="clay-inset p-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Datos Personales
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Ocupacion</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <input
                            type="text"
                            value={fichaData.occupation || ""}
                            onChange={(e) => setFichaData({ ...fichaData, occupation: e.target.value })}
                            className="clay-input h-8 text-sm w-full"
                            placeholder="Ej: Ingeniero"
                          />
                        ) : (
                          patient.occupation || "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Estado Civil</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <select
                            value={fichaData.maritalStatus || ""}
                            onChange={(e) => setFichaData({ ...fichaData, maritalStatus: e.target.value })}
                            className="clay-input h-8 text-sm w-full"
                          >
                            <option value="">Seleccionar</option>
                            <option value="Soltero">Soltero(a)</option>
                            <option value="Casado">Casado(a)</option>
                            <option value="Divorciado">Divorciado(a)</option>
                            <option value="Viudo">Viudo(a)</option>
                            <option value="Conviviente">Conviviente</option>
                          </select>
                        ) : (
                          patient.maritalStatus || "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Sangre</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <select
                            value={fichaData.bloodType || ""}
                            onChange={(e) => setFichaData({ ...fichaData, bloodType: e.target.value })}
                            className="clay-input h-8 text-sm w-full"
                          >
                            <option value="">Seleccionar</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        ) : (
                          patient.bloodType || "-"
                        )}
                      </p>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Direccion</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <input
                            type="text"
                            value={fichaData.address || ""}
                            onChange={(e) => setFichaData({ ...fichaData, address: e.target.value })}
                            className="clay-input h-8 text-sm w-full"
                            placeholder="Direccion completa"
                          />
                        ) : (
                          patient.address || "-"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Habitos */}
                <div className="clay-inset p-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Cigarette className="h-4 w-4" />
                    Habitos
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {isEditingFicha ? (
                        <input
                          type="checkbox"
                          checked={fichaData.smoking || false}
                          onChange={(e) => setFichaData({ ...fichaData, smoking: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      ) : (
                        <div className={cn("h-3 w-3 rounded-full", patient.smoking ? "bg-red-500" : "bg-slate-300")} />
                      )}
                      <span className="text-sm text-slate-700">Tabaquismo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditingFicha ? (
                        <input
                          type="checkbox"
                          checked={fichaData.alcohol || false}
                          onChange={(e) => setFichaData({ ...fichaData, alcohol: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      ) : (
                        <div className={cn("h-3 w-3 rounded-full", patient.alcohol ? "bg-red-500" : "bg-slate-300")} />
                      )}
                      <span className="text-sm text-slate-700">Alcoholismo</span>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Otros Habitos</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <input
                            type="text"
                            value={fichaData.habits || ""}
                            onChange={(e) => setFichaData({ ...fichaData, habits: e.target.value })}
                            className="clay-input h-8 text-sm w-full"
                            placeholder="Ej: Ejercicio regular, dieta balanceada..."
                          />
                        ) : (
                          patient.habits || "-"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Antecedentes Heredofamiliares */}
                <div className="clay-inset p-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Antecedentes Heredofamiliares
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: "familyHistoryDiabetes", label: "Diabetes" },
                      { key: "familyHistoryHypertension", label: "Hipertension" },
                      { key: "familyHistoryCancer", label: "Cancer" },
                      { key: "familyHistoryHeartDisease", label: "Cardiopatias" },
                      { key: "familyHistoryKidneyDisease", label: "Nefropatias" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        {isEditingFicha ? (
                          <input
                            type="checkbox"
                            checked={fichaData[item.key as keyof PatientData] as boolean || false}
                            onChange={(e) => setFichaData({ ...fichaData, [item.key]: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                        ) : (
                          <div className={cn("h-3 w-3 rounded-full", patient[item.key as keyof PatientData] ? "bg-red-500" : "bg-slate-300")} />
                        )}
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </div>
                    ))}
                    <div className="col-span-2 md:col-span-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Otros Antecedentes Familiares</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <input
                            type="text"
                            value={fichaData.familyHistoryOther || ""}
                            onChange={(e) => setFichaData({ ...fichaData, familyHistoryOther: e.target.value })}
                            className="clay-input h-8 text-sm w-full"
                            placeholder="Especificar otros..."
                          />
                        ) : (
                          patient.familyHistoryOther || "-"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Antecedentes Personales Patologicos */}
                <div className="clay-inset p-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Antecedentes Personales Patologicos
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Alergias</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <textarea
                            value={fichaData.personalAllergies || ""}
                            onChange={(e) => setFichaData({ ...fichaData, personalAllergies: e.target.value })}
                            className="clay-input h-16 text-sm w-full resize-none"
                            placeholder="Especificar alergias..."
                          />
                        ) : (
                          patient.personalAllergies || "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Cirugias / Accidentes / Operaciones</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <textarea
                            value={fichaData.personalSurgeries || ""}
                            onChange={(e) => setFichaData({ ...fichaData, personalSurgeries: e.target.value })}
                            className="clay-input h-16 text-sm w-full resize-none"
                            placeholder="Detalle cirugias previas..."
                          />
                        ) : (
                          patient.personalSurgeries || "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Hospitalizaciones Previas</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <textarea
                            value={fichaData.personalHospitalizations || ""}
                            onChange={(e) => setFichaData({ ...fichaData, personalHospitalizations: e.target.value })}
                            className="clay-input h-16 text-sm w-full resize-none"
                            placeholder="Detalle hospitalizaciones..."
                          />
                        ) : (
                          patient.personalHospitalizations || "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Transfusiones</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <textarea
                            value={fichaData.personalTransfusions || ""}
                            onChange={(e) => setFichaData({ ...fichaData, personalTransfusions: e.target.value })}
                            className="clay-input h-16 text-sm w-full resize-none"
                            placeholder="Detalle transfusiones..."
                          />
                        ) : (
                          patient.personalTransfusions || "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Fracturas / Traumatismos</span>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {isEditingFicha ? (
                          <textarea
                            value={fichaData.personalTrauma || ""}
                            onChange={(e) => setFichaData({ ...fichaData, personalTrauma: e.target.value })}
                            className="clay-input h-16 text-sm w-full resize-none"
                            placeholder="Detalle fracturas o traumatismos..."
                          />
                        ) : (
                          patient.personalTrauma || "-"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditingFicha && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsEditingFicha(false)}
                      className="clay-button px-4 py-2 text-sm font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveFicha}
                      disabled={isSavingFicha}
                      className="clay-button-primary px-4 py-2 text-sm font-semibold flex items-center gap-2"
                    >
                      {isSavingFicha ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Historial de Consultas */}
            {activeTab === "consultas" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Consultas</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {patient.consultations?.length ?? 0} consulta{(patient.consultations?.length ?? 0) !== 1 ? "s" : ""} registrada{(patient.consultations?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href={`/consultas/nueva?patientId=${patient.id}`}>
                    <button className="clay-button px-3 py-2 text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Nueva
                    </button>
                  </Link>
                </div>

                {(patient.consultations?.length ?? 0) === 0 ? (
                  <div className="py-12 text-center">
                    <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-medium">El paciente aun no registra consultas medicas</p>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Comienza creando una nueva consulta para este paciente</p>
                    <Link href={`/consultas/nueva?patientId=${patient.id}`}>
                      <button className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 mx-auto">
                        <Plus className="h-4 w-4" />
                        + Nueva Consulta
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(patient.consultations ?? []).map((consultation) => (
                      <div
                        key={consultation.id}
                        className="rounded-xl border border-slate-200 overflow-hidden transition-all duration-150 hover:border-slate-300"
                      >
                        <div
                          onClick={() => toggleConsultation(consultation.id)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">
                                  {consultation.type}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                  #{consultation.id.slice(0, 8).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDateTime(new Date(consultation.createdAt))}
                                </span>
                                {consultation.painScale != null && (
                                  <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                    consultation.painScale <= 3 ? "bg-emerald-100 text-emerald-700" :
                                    consultation.painScale <= 6 ? "bg-amber-100 text-amber-700" :
                                    "bg-red-100 text-red-700"
                                  )}>
                                    EVA: {consultation.painScale}
                                  </span>
                                )}
                              </div>
                              {consultation.diagnoses.length > 0 && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Dx: {consultation.diagnoses.map((d) => `${d.cie10Code} - ${d.description}`).join(" | ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                              statusColors[consultation.status]?.bg,
                              statusColors[consultation.status]?.text
                            )}>
                              {consultation.status.replace("_", " ")}
                            </span>
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                              typeColors[consultation.type]?.bg,
                              typeColors[consultation.type]?.text
                            )}>
                              {consultation.type}
                            </span>
                            <div className="flex items-center gap-1 ml-2">
                              <Link
                                href={`/print?id=${consultation.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="clay-button px-2.5 py-1.5 text-xs font-semibold text-slate-900 flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> Ver
                              </Link>
                              <Link
                                href={`/print?id=${consultation.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="clay-button-primary px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
                              >
                                <Printer className="h-3 w-3" /> Imprimir
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Detail */}
                        {expandedConsultation === consultation.id && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-sm">
                            {consultation.consultationReason && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo</span>
                                <p className="text-slate-900 mt-0.5">{consultation.consultationReason}</p>
                              </div>
                            )}
                            {consultation.diseaseHistory && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Historia de la Enfermedad</span>
                                <p className="text-slate-900 mt-0.5">{consultation.diseaseHistory}</p>
                              </div>
                            )}
                            {consultation.vitals && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vitales</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {consultation.vitals.bloodPressure && <span className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">PA: {consultation.vitals.bloodPressure}</span>}
                                  {consultation.vitals.heartRate && <span className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">FC: {consultation.vitals.heartRate} lpm</span>}
                                  {consultation.vitals.weightKg && <span className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">Peso: {consultation.vitals.weightKg} kg</span>}
                                  {consultation.vitals.heightCm && <span className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">Talla: {consultation.vitals.heightCm} cm</span>}
                                  {consultation.vitals.temperature && <span className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">Temp: {consultation.vitals.temperature} C</span>}
                                </div>
                              </div>
                            )}
                            {consultation.prescriptions.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Receta</span>
                                <div className="mt-1 space-y-1">
                                  {consultation.prescriptions.map((rx, i) => (
                                    <p key={i} className="text-xs text-slate-700">
                                      <strong>{rx.medication}</strong> {rx.dosage ? `- ${rx.dosage}` : ""} {rx.days ? `(${rx.days} dias)` : ""}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
