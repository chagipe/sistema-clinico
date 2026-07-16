"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopBar } from "@/components/layout/top-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Phone,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import { calculateAge, cn } from "@/lib/utils";

interface Patient {
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
  }>;
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
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
      const data = await response.json();
      if (response.ok) {
        dialogRef.current?.close();
        setNewPatient({ dni: "", firstName: "", lastName: "", birthDate: "", gender: "", phone: "" });
        fetchPatients();
      } else {
        alert("Error: " + (data.error || JSON.stringify(data)));
      }
    } catch (error: any) {
      alert("Error de conexion: " + error.message);
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

  const getLastConsultationType = (consultations: Patient["consultations"]) => {
    if (consultations.length === 0) return null;
    return consultations[0].type;
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Pacientes"
        subtitle={`${patients.length} pacientes registrados`}
        actions={
          <button
            className="clay-button-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
            onClick={() => dialogRef.current?.showModal()}
          >
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </button>
        }
      />

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/40 rounded-2xl p-0 border-0 max-w-[500px] w-full"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="clay-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#3d3530]">Nuevo Paciente</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            >
              <X className="h-4 w-4 text-[#7a6b5d]" />
            </button>
          </div>
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
              <button type="button" className="clay-button px-4 py-2.5 text-sm font-semibold text-[#3d3530]" onClick={() => dialogRef.current?.close()}>
                Cancelar
              </button>
              <button type="submit" className="clay-button-primary px-4 py-2.5 text-sm font-semibold">
                Crear Paciente
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Search */}
        <div className="clay-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a6b5d]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, apellido o DNI..."
              className="clay-input w-full pl-10 pr-4 py-3 text-sm text-[#3d3530] placeholder:text-[#7a6b5d]/50"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="clay-card">
          <div className="px-6 py-4 border-b border-[#c9b9a8]/50">
            <h3 className="text-lg font-bold text-[#3d3530]">Lista de Pacientes</h3>
            <p className="text-sm text-[#7a6b5d] mt-0.5">
              {filteredPatients.length} de {patients.length} pacientes
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="h-10 w-10 border-4 border-[#c9b9a8] border-t-[#8b6f5c] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#7a6b5d]">Cargando pacientes...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="py-12 text-center">
                <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#7a6b5d]" />
                </div>
                <p className="text-[#3d3530] font-medium">
                  {searchQuery ? "No se encontraron pacientes" : "No hay pacientes registrados"}
                </p>
                <p className="text-sm text-[#7a6b5d] mt-1">
                  {searchQuery ? "Intenta con otro termino de busqueda" : "Comienza creando un nuevo paciente"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => {
                  const lastType = getLastConsultationType(patient.consultations);
                  return (
                    <Link key={patient.id} href={`/consultation?patientId=${patient.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer group hover:bg-white/30">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#c4a882] to-[#8b6f5c] flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#3d3530]">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-[#7a6b5d]">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                DNI: {patient.dni}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {calculateAge(new Date(patient.birthDate))} anios
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
                        <div className="flex items-center gap-3">
                          {lastType && (
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                              lastType === "NUEVA"
                                ? "bg-[#8bc99a]/30 text-[#4a7a55]"
                                : lastType === "RECONSULTA"
                                ? "bg-[#8bb5c9]/30 text-[#4a6a7a]"
                                : "bg-[#c9b88b]/30 text-[#7a6a3a]"
                            )}>
                              {lastType}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-[#c9b9a8] group-hover:text-[#8b6f5c] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
