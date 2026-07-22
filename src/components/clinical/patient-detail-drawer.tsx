"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  FileText,
  Calendar,
  Phone,
  Printer,
  Plus,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  ChevronRight,
  Stethoscope,
  Activity,
  User,
  Syringe,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { calculateAge, formatDateTime, cn } from "@/lib/utils";
import { EvaPainScale } from "@/components/clinical/eva-pain-scale";
import { PainEvolutionChart } from "@/components/clinical/pain-evolution-chart";

interface PatientData {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone?: string | null;
  consultations: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
    painScale?: number | null;
    diagnoses: Array<{ cie10Code: string; description: string }>;
  }>;
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

interface PatientDetailDrawerProps {
  patient: PatientData;
  open: boolean;
  onClose: () => void;
}

type TabId = "historial" | "sesiones" | "documentos";

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "historial", label: "Historial", icon: FileText },
  { id: "sesiones", label: "Sesiones", icon: ClipboardCheck },
  { id: "documentos", label: "Documentos", icon: ShieldCheck },
];

export function PatientDetailDrawer({ patient, open, onClose }: PatientDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("historial");

  if (!open) return null;

  const lastConsultation = patient.consultations[0];
  const activePackages = patient.treatmentPackages.filter((p) => p.status === "ACTIVO");
  const lastPainScale = lastConsultation?.painScale;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 print:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col print:hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      DNI: {patient.dni}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {calculateAge(new Date(patient.birthDate))} anios
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {patient.gender}
                    </span>
                    {patient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Quick Info Bar */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Consultas:</span>
                <span className="font-bold text-slate-900">{patient.consultations.length}</span>
              </div>
              {lastPainScale != null && (
                <EvaPainScale value={lastPainScale} readonly size="sm" />
              )}
              {activePackages.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-700">
                    <Syringe className="h-3 w-3" />
                    {activePackages.length} activo{activePackages.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 pb-4 flex items-center gap-2">
            <Link href={`/consultas/nueva?patientId=${patient.id}`}>
              <button className="clay-button-primary px-3 py-2 text-xs font-semibold flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Nueva Consulta
              </button>
            </Link>
            <Link href={`/consentimiento?patientId=${patient.id}`}>
              <button className="clay-button px-3 py-2 text-xs font-semibold flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Consentimiento
              </button>
            </Link>
            <Link href={`/sesiones?patientId=${patient.id}`}>
              <button className="clay-button px-3 py-2 text-xs font-semibold flex items-center gap-1.5 text-slate-700">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Registrar Sesion
              </button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="px-6 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
                  activeTab === tab.id
                    ? "border-cyan-600 text-cyan-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "historial" && (
            <HistorialTab consultations={patient.consultations} />
          )}
          {activeTab === "sesiones" && (
            <SesionesTab packages={patient.treatmentPackages} patientId={patient.id} />
          )}
          {activeTab === "documentos" && (
            <DocumentosTab patientId={patient.id} consultations={patient.consultations} />
          )}
        </div>
      </div>
    </>
  );
}

function HistorialTab({ consultations }: { consultations: PatientData["consultations"] }) {
  return (
    <div className="space-y-4">
      {/* Pain Evolution */}
      <div className="clay-card p-4">
        <PainEvolutionChart consultations={consultations} />
      </div>

      {/* Consultation List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultas Recientes</h4>
        {consultations.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No hay consultas registradas</p>
          </div>
        ) : (
          consultations.map((c) => (
            <Link key={c.id} href={`/print?id=${c.id}`}>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold",
                    c.type === "NUEVA" ? "bg-emerald-500" :
                    c.type === "RECONSULTA" ? "bg-cyan-500" : "bg-amber-500"
                  )}>
                    {c.type.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{c.type}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        c.status === "FINALIZADO" ? "bg-emerald-100 text-emerald-700" :
                        c.status === "EN_ATENCION" ? "bg-cyan-100 text-cyan-700" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(new Date(c.createdAt))}
                    </div>
                    {c.diagnoses.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dx: {c.diagnoses.map((d) => d.cie10Code).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.painScale != null && (
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg",
                      c.painScale <= 3 ? "bg-emerald-100 text-emerald-700" :
                      c.painScale <= 6 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      EVA: {c.painScale}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function SesionesTab({ packages, patientId }: { packages: PatientData["treatmentPackages"]; patientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paquetes de Tratamiento</h4>
        <Link href={`/sesiones?patientId=${patientId}`}>
          <button className="clay-button px-2 py-1.5 text-xs font-semibold flex items-center gap-1 text-slate-700">
            <Plus className="h-3 w-3" />
            Nuevo Paquete
          </button>
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No hay paquetes de tratamiento</p>
          <p className="text-xs text-slate-400 mt-1">Crea un paquete para begin tracking sesiones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const sessionsCompleted = pkg.sessions.length;
            const progress = Math.round((sessionsCompleted / pkg.totalSessions) * 100);
            const isActive = pkg.status === "ACTIVO";

            return (
              <div key={pkg.id} className={cn(
                "p-4 rounded-xl border",
                isActive ? "border-cyan-200 bg-cyan-50/50" : "border-slate-200 bg-slate-50/50"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Syringe className={cn("h-4 w-4", isActive ? "text-cyan-600" : "text-slate-400")} />
                    <span className="text-sm font-bold text-slate-900">{pkg.treatmentName}</span>
                    {pkg.bodyZone && (
                      <span className="text-xs text-slate-500">- {pkg.bodyZone}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md",
                    isActive ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {pkg.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{sessionsCompleted} de {pkg.totalSessions} sesiones</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isActive ? "bg-cyan-500" : "bg-slate-400")}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {pkg.sessions.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Ultima sesion: {formatDateTime(new Date(pkg.sessions[pkg.sessions.length - 1].sessionDate))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentosTab({ patientId, consultations }: { patientId: string; consultations: PatientData["consultations"] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documentos</h4>

      {/* Consent Form */}
      <Link href={`/consentimiento?patientId=${patientId}`}>
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Consentimiento Informado</p>
              <p className="text-xs text-slate-500">Imprimir documento de consentimiento</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-all" />
        </div>
      </Link>

      {/* Consultation Printouts */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fichas Clinicas</p>
        {consultations.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No hay fichas clinicas</p>
        ) : (
          consultations.map((c) => (
            <Link key={c.id} href={`/print?id=${c.id}`}>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Ficha #{c.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(new Date(c.createdAt))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
