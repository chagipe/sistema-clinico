"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
}

interface TreatmentPackage {
  id: string;
  treatmentName: string;
  bodyZone: string;
  totalSessions: number;
  packagePrice: number | null;
  sessionPrice: number | null;
  status: string;
  createdAt: string;
  sessions: SessionRecord[];
}

interface SessionRecord {
  id: string;
  sessionNumber: number;
  treatedZone: string | null;
  sessionDate: string;
  sessionTime: string | null;
  notes: string | null;
}

export default function SessionTrackingPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [showNewPackageForm, setShowNewPackageForm] = useState(false);
  const [newPackage, setNewPackage] = useState({
    treatmentName: "",
    bodyZone: "",
    totalSessions: 10,
    packagePrice: 0,
    sessionPrice: 0,
  });
  const [sessionForm, setSessionForm] = useState<Record<string, { date: string; time: string; zone: string; notes: string }>>({});

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

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.dni.includes(q)
    );
  });

  const handleCreatePackage = async () => {
    if (!selectedPatient || !newPackage.treatmentName) return;
    try {
      const response = await fetch("/api/session-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          ...newPackage,
        }),
      });
      if (response.ok) {
        setShowNewPackageForm(false);
        setNewPackage({ treatmentName: "", bodyZone: "", totalSessions: 10, packagePrice: 0, sessionPrice: 0 });
        fetchPatientPackages(selectedPatient.id);
      }
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };

  const fetchPatientPackages = async (patientId: string) => {
    try {
      const response = await fetch(`/api/session-packages?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const handleMarkSession = async (packageId: string) => {
    const form = sessionForm[packageId];
    if (!form || !form.date) return;
    try {
      const pkg = packages.find(p => p.id === packageId);
      const nextSession = (pkg?.sessions.length || 0) + 1;
      const response = await fetch("/api/session-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          sessionNumber: nextSession,
          treatedZone: form.zone,
          sessionDate: form.date,
          sessionTime: form.time,
          notes: form.notes,
        }),
      });
      if (response.ok) {
        setSessionForm(prev => ({ ...prev, [packageId]: { date: "", time: "", zone: "", notes: "" } }));
        if (selectedPatient) fetchPatientPackages(selectedPatient.id);
      }
    } catch (error) {
      console.error("Error marking session:", error);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      await fetch(`/api/session-packages?id=${packageId}`, { method: "DELETE" });
      if (selectedPatient) fetchPatientPackages(selectedPatient.id);
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Control de Sesiones"
        subtitle="Tarjeta digital de seguimiento de paquetes"
        showSearch={false}
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Patient Selection */}
        <div className="clay-card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Seleccionar Paciente</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); }}
              placeholder="Buscar por nombre, apellido o DNI..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => { setSelectedPatient(patient); fetchPatientPackages(patient.id); setSearchQuery(""); }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  selectedPatient?.id === patient.id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-slate-500">DNI: {patient.dni}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Packages Section */}
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Paquetes de {selectedPatient.firstName} {selectedPatient.lastName}
              </h3>
              <button
                onClick={() => setShowNewPackageForm(!showNewPackageForm)}
                className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Paquete
              </button>
            </div>

            {/* New Package Form */}
            {showNewPackageForm && (
              <div className="clay-card p-6 space-y-4">
                <h4 className="font-bold text-slate-900">Crear Nuevo Paquete</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tratamiento</Label>
                    <Select onValueChange={(v) => setNewPackage(prev => ({ ...prev, treatmentName: v }))} value={newPackage.treatmentName}>
                      <SelectTrigger className="clay-input h-10 text-slate-900">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="clay-card border-0">
                        <SelectItem value="Ozonoterapia">Ozonoterapia</SelectItem>
                        <SelectItem value="Plasma Rico en Plaquetas (PRP)">PRP</SelectItem>
                        <SelectItem value="Viscosuplementacion">Viscosuplementacion</SelectItem>
                        <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                        <SelectItem value="Magnetoterapia">Magnetoterapia</SelectItem>
                        <SelectItem value="Electroterapia">Electroterapia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zona</Label>
                    <Input
                      placeholder="Ej: ROD I, COL LUMBAR"
                      value={newPackage.bodyZone}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, bodyZone: e.target.value }))}
                      className="clay-input h-10 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sesiones</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newPackage.totalSessions}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, totalSessions: parseInt(e.target.value) || 1 }))}
                      className="clay-input h-10 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Paquete (S/)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newPackage.packagePrice}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, packagePrice: parseFloat(e.target.value) || 0 }))}
                      className="clay-input h-10 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Sesion (S/)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newPackage.sessionPrice}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, sessionPrice: parseFloat(e.target.value) || 0 }))}
                      className="clay-input h-10 text-slate-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreatePackage}
                      disabled={!newPackage.treatmentName}
                      className="clay-button-primary px-6 py-2.5 text-sm font-semibold w-full"
                    >
                      Crear Paquete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Packages List */}
            {packages.length === 0 ? (
              <div className="clay-card p-12 text-center">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-900 font-medium">No hay paquetes registrados</p>
                <p className="text-sm text-slate-500 mt-1">Cree un nuevo paquete para comenzar el seguimiento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => {
                  const completedSessions = pkg.sessions.length;
                  const progress = pkg.totalSessions > 0 ? (completedSessions / pkg.totalSessions) * 100 : 0;
                  const isComplete = completedSessions >= pkg.totalSessions;

                  return (
                    <div key={pkg.id} className="clay-card overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center",
                              isComplete ? "bg-emerald-500" : "bg-violet-500"
                            )}>
                              {isComplete ? <CheckCircle2 className="h-5 w-5 text-white" /> : <Activity className="h-5 w-5 text-white" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{pkg.treatmentName}</h4>
                              <p className="text-xs text-slate-500">Zona: {pkg.bodyZone || "No especificada"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                              isComplete ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
                            )}>
                              {isComplete ? "COMPLETADO" : "EN PROCESO"}
                            </span>
                            <button
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">Progreso</span>
                            <span className="text-xs font-bold text-slate-900">{completedSessions} de {pkg.totalSessions} sesiones</span>
                          </div>
                          <div className="clay-inset h-2.5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isComplete ? "bg-emerald-500" : "bg-violet-500"
                              )}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Session History */}
                        {pkg.sessions.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-500 mb-2">Historial de Sesiones</p>
                            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                              {pkg.sessions.sort((a, b) => a.sessionNumber - b.sessionNumber).map((session) => (
                                <div key={session.id} className="clay-inset px-3 py-2 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-violet-600">S{session.sessionNumber}</span>
                                    <span className="text-slate-900">{new Date(session.sessionDate).toLocaleDateString("es-PE")}</span>
                                    {session.sessionTime && <span className="text-slate-500">{session.sessionTime}</span>}
                                    {session.treatedZone && <span className="text-slate-500">{session.treatedZone}</span>}
                                  </div>
                                  {session.notes && <span className="text-slate-400 truncate max-w-[200px]">{session.notes}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mark Session Form */}
                        {!isComplete && (
                          <div className="clay-inset p-4 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Registrar Sesion {completedSessions + 1} de {pkg.totalSessions}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500">Fecha</Label>
                                <input
                                  type="date"
                                  value={sessionForm[pkg.id]?.date || ""}
                                  onChange={(e) => setSessionForm(prev => ({
                                    ...prev,
                                    [pkg.id]: { ...prev[pkg.id], date: e.target.value, time: prev[pkg.id]?.time || "", zone: prev[pkg.id]?.zone || "", notes: prev[pkg.id]?.notes || "" }
                                  }))}
                                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500">Hora</Label>
                                <input
                                  type="time"
                                  value={sessionForm[pkg.id]?.time || ""}
                                  onChange={(e) => setSessionForm(prev => ({
                                    ...prev,
                                    [pkg.id]: { ...prev[pkg.id], time: e.target.value, date: prev[pkg.id]?.date || "", zone: prev[pkg.id]?.zone || "", notes: prev[pkg.id]?.notes || "" }
                                  }))}
                                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500">Zona Tratada</Label>
                                <Input
                                  placeholder="Ej: ROD I"
                                  value={sessionForm[pkg.id]?.zone || ""}
                                  onChange={(e) => setSessionForm(prev => ({
                                    ...prev,
                                    [pkg.id]: { ...prev[pkg.id], zone: e.target.value, date: prev[pkg.id]?.date || "", time: prev[pkg.id]?.time || "", notes: prev[pkg.id]?.notes || "" }
                                  }))}
                                  className="clay-input h-9 text-xs text-slate-900"
                                />
                              </div>
                              <div className="space-y-1 flex items-end">
                                <button
                                  onClick={() => handleMarkSession(pkg.id)}
                                  disabled={!sessionForm[pkg.id]?.date}
                                  className="clay-button-primary px-4 h-9 text-xs font-semibold w-full flex items-center justify-center gap-1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Registrar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
