"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopBar } from "@/components/layout/top-bar";
import {
  Plus,
  Users,
  Clock,
  Activity,
  FileText,
  Stethoscope,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Timer,
  CheckCircle2,
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

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    dni: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    phone: "",
  });

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

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        setNewPatient({ dni: "", firstName: "", lastName: "", birthDate: "", gender: "", phone: "" });
        fetchPatients();
      }
    } catch (error) {
      console.error("Error creating patient:", error);
    }
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
    { label: "Total Pacientes", value: patients.length, icon: Users, iconBg: "bg-[#8bb5c9]", change: "+12%", up: true },
    { label: "En Espera", value: totalCount, icon: Timer, iconBg: "bg-[#c9b88b]", change: "-5%", up: false },
    { label: "Consultas Hoy", value: patients.length, icon: Calendar, iconBg: "bg-[#8bc99a]", change: "+8%", up: true },
    { label: "Finalizados", value: 0, icon: CheckCircle2, iconBg: "bg-[#b88bc9]", change: "0", up: true },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={`${getGreeting()}, Dr. Admin`}
        subtitle="Panel de control y gestion de consultas"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="clay-button-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
                <Plus className="h-4 w-4" />
                Nueva Atencion
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] clay-card border-0">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#3d3530]">Nueva Atencion</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#3d3530]">DNI</Label>
                    <Input
                      value={newPatient.dni}
                      onChange={(e) => setNewPatient({ ...newPatient, dni: e.target.value })}
                      placeholder="Numero de documento"
                      className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#3d3530]">Genero</Label>
                    <Select onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                      <SelectTrigger className="clay-input h-11 text-[#3d3530]">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="clay-card border-0">
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#3d3530]">Nombres</Label>
                    <Input
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                      placeholder="Nombres completos"
                      className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#3d3530]">Apellidos</Label>
                    <Input
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                      placeholder="Apellidos completos"
                      className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#3d3530]">Fecha de Nacimiento</Label>
                    <Input
                      type="date"
                      value={newPatient.birthDate}
                      onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                      className="clay-input h-11 text-[#3d3530]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#3d3530]">Telefono</Label>
                    <Input
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      placeholder="(01) 234-5678"
                      className="clay-input h-11 text-[#3d3530] placeholder:text-[#7a6b5d]/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="clay-button px-4 py-2.5 text-sm font-semibold text-[#3d3530]" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="clay-button-primary px-4 py-2.5 text-sm font-semibold">
                    Crear Paciente
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="clay-flat p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <p className="text-3xl font-bold text-[#3d3530]">{stat.value}</p>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-lg",
                      stat.up ? "bg-[#8bc99a]/30 text-[#4a7a55]" : "bg-[#c98b8b]/30 text-[#7a4a4a]"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-md", stat.iconBg)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/consultation" className="group">
            <div className="clay-card p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#8bc99a] flex items-center justify-center shadow-md">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3d3530]">Nueva Consulta</h3>
                    <p className="text-sm text-[#7a6b5d]">Iniciar historia clinica</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#7a6b5d] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          <Link href="/print" className="group">
            <div className="clay-card p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#8bb5c9] flex items-center justify-center shadow-md">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3d3530]">Historias Clinicas</h3>
                    <p className="text-sm text-[#7a6b5d]">Ver e imprimir fichas</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#7a6b5d] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          <div className="clay-card p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#b88bc9] flex items-center justify-center shadow-md">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#3d3530]">Reportes</h3>
                  <p className="text-sm text-[#7a6b5d]">Estadisticas y reportes</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#7a6b5d] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="clay-card">
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#c9b9a8]/50">
            <div>
              <h3 className="text-lg font-bold text-[#3d3530]">Pacientes Recientes</h3>
              <p className="text-sm text-[#7a6b5d] mt-0.5">{patients.length} pacientes registrados</p>
            </div>
            <Link href="/dashboard">
              <button className="clay-button px-3 py-2 text-xs font-semibold text-[#3d3530] flex items-center gap-1">
                Ver todos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="p-6">
            {patients.length === 0 ? (
              <div className="py-12 text-center">
                <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#7a6b5d]" />
                </div>
                <p className="text-[#3d3530] font-medium">No hay pacientes registrados</p>
                <p className="text-sm text-[#7a6b5d] mt-1">Comienza creando un nuevo paciente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.slice(0, 6).map((patient) => (
                  <Link key={patient.id} href={`/consultation?patientId=${patient.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer group hover:bg-white/30">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#c4a882] to-[#8b6f5c] flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#3d3530]">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          <p className="text-sm text-[#7a6b5d]">
                            DNI: {patient.dni} &middot; {calculateAge(new Date(patient.birthDate))} anios &middot; {patient.gender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {patient.consultations.length > 0 && (
                          <span className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                            patient.consultations[0].type === "NUEVA"
                              ? "bg-[#8bc99a]/30 text-[#4a7a55]"
                              : patient.consultations[0].type === "RECONSULTA"
                              ? "bg-[#8bb5c9]/30 text-[#4a6a7a]"
                              : "bg-[#c9b88b]/30 text-[#7a6a3a]"
                          )}>
                            {patient.consultations[0].type}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#c9b9a8] group-hover:text-[#8b6f5c] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
