"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import {
  Plus,
  Users,
  Activity,
  FileText,
  Stethoscope,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Timer,
  CheckCircle2,
  X,
  Trash2,
  Search,
} from "lucide-react";
import { getGreeting, calculateAge, cn } from "@/lib/utils";

interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  consultations: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardContent() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (!response.ok) { setPatients([]); return; }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      const response = await fetch(`/api/patients?id=${patientToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        deleteDialogRef.current?.close();
        setPatientToDelete(null);
        fetchPatients();
      } else {
        const data = await response.json();
        alert("Error: " + (data.error || "No se pudo eliminar"));
      }
    } catch (error: any) {
      alert("Error de conexion: " + error.message);
    }
  };

  const filteredPatientsForDialog = patients.filter((p) => {
    const q = patientSearchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.dni.includes(q)
    );
  });

  const handleStartConsultation = (patientId: string) => {
    dialogRef.current?.close();
    setPatientSearchQuery("");
    router.push(`/consultation?patientId=${patientId}`);
  };

  const getConsultationsByType = (type: string) => {
    return patients.flatMap((p) =>
      p.consultations.filter((c) => c.type === type).map((c) => ({ ...c, patient: p }))
    );
  };

  const nuevaCount = getConsultationsByType("NUEVA").length;
  const reconsultaCount = getConsultationsByType("RECONSULTA").length;
  const tratamientoCount = getConsultationsByType("TRATAMIENTO").length;
  const totalCount = nuevaCount + reconsultaCount + tratamientoCount;

  const stats = [
    { label: "Total Pacientes", value: patients.length, icon: Users, iconBg: "bg-cyan-500", change: "+12%", up: true },
    { label: "En Espera", value: totalCount, icon: Timer, iconBg: "bg-amber-500", change: "-5%", up: false },
    { label: "Consultas Hoy", value: patients.length, icon: Calendar, iconBg: "bg-emerald-500", change: "+8%", up: true },
    { label: "Finalizados", value: 0, icon: CheckCircle2, iconBg: "bg-violet-500", change: "0", up: true },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={`${getGreeting()}, Dr. Admin`}
        subtitle="Panel de control y gestion de consultas"
        actions={
          <button
            className="clay-button-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
            onClick={() => dialogRef.current?.showModal()}
          >
            <Plus className="h-4 w-4" />
            Nueva Atencion
          </button>
        }
      />

      {/* Dialog: Select Patient for Consultation */}
      <dialog
        ref={dialogRef}
        className="m-auto backdrop:bg-black/50 backdrop-blur-sm rounded-2xl p-0 border-0 max-w-[500px] w-full"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Nueva Atencion</h2>
              <p className="text-sm text-slate-500 mt-0.5">Selecciona un paciente para iniciar consulta</p>
            </div>
            <button
              type="button"
              onClick={() => { dialogRef.current?.close(); setPatientSearchQuery(""); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
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

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredPatientsForDialog.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  {patientSearchQuery ? "No se encontraron pacientes" : "No hay pacientes registrados"}
                </p>
                {!patientSearchQuery && (
                  <Link href="/pacientes" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium mt-1 inline-block">
                    Crear paciente
                  </Link>
                )}
              </div>
            ) : (
              filteredPatientsForDialog.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleStartConsultation(patient.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      DNI: {patient.dni} &middot; {calculateAge(new Date(patient.birthDate))} anios
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </dialog>

      {/* Dialog: Confirm Delete */}
      <dialog
        ref={deleteDialogRef}
        className="m-auto backdrop:bg-black/50 backdrop-blur-sm rounded-2xl p-0 border-0 max-w-[400px] w-full"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Eliminar Paciente</h2>
            <button
              type="button"
              onClick={() => { deleteDialogRef.current?.close(); setPatientToDelete(null); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Estas seguro que queres eliminar a <strong className="text-slate-900">{patientToDelete?.firstName} {patientToDelete?.lastName}</strong>?
            Esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="clay-button px-4 py-2.5 text-sm font-medium text-slate-700"
              onClick={() => { deleteDialogRef.current?.close(); setPatientToDelete(null); }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              onClick={handleDeletePatient}
            >
              Eliminar
            </button>
          </div>
        </div>
      </dialog>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <span className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                      stat.up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.iconBg)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/consultation" className="group">
            <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer transition-all duration-150 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nueva Consulta</h3>
                    <p className="text-sm text-slate-500">Iniciar historia clinica</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          <Link href="/historias" className="group">
            <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer transition-all duration-150 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-cyan-500 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Historias Clinicas</h3>
                    <p className="text-sm text-slate-500">Ver e imprimir fichas</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          <Link href="/reportes" className="group">
            <div className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer transition-all duration-150 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Reportes</h3>
                    <p className="text-sm text-slate-500">Estadisticas y reportes</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Pacientes Recientes</h3>
              <p className="text-sm text-slate-500 mt-0.5">{patients.length} pacientes registrados</p>
            </div>
            <Link href="/pacientes">
              <button className="clay-button px-3 py-2 text-xs font-medium text-slate-600 flex items-center gap-1">
                Ver todos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="p-6">
            {patients.length === 0 ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 flex items-center justify-center mx-auto mb-4 bg-slate-100 rounded-xl">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium">No hay pacientes registrados</p>
                <p className="text-sm text-slate-500 mt-1">Comienza creando un nuevo paciente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.slice(0, 6).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 rounded-xl transition-all duration-150 group hover:bg-slate-50 border border-transparent hover:border-slate-200">
                    <Link href={`/consultation?patientId=${patient.id}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <p className="text-sm text-slate-500">
                          DNI: {patient.dni} &middot; {calculateAge(new Date(patient.birthDate))} anios &middot; {patient.gender}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3 shrink-0">
                      {patient.consultations.length > 0 && (
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                          patient.consultations[0].type === "NUEVA"
                            ? "bg-emerald-100 text-emerald-700"
                            : patient.consultations[0].type === "RECONSULTA"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {patient.consultations[0].type}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPatientToDelete(patient);
                          deleteDialogRef.current?.showModal();
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar paciente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
