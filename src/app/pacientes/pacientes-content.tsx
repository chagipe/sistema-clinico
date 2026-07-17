"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Trash2,
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

export default function PacientesContent() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
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
        className="m-auto backdrop:bg-black/50 backdrop-blur-sm rounded-2xl p-0 border-0 max-w-[500px] w-full"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Nuevo Paciente</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">DNI</Label>
                <Input
                  value={newPatient.dni}
                  onChange={(e) => setNewPatient({ ...newPatient, dni: e.target.value })}
                  placeholder="Numero de documento"
                  className="clay-input h-11 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Genero</Label>
                <Select onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                  <SelectTrigger className="clay-input h-11 text-slate-900">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-lg">
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Nombres</Label>
                <Input
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                  placeholder="Nombres completos"
                  className="clay-input h-11 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Apellidos</Label>
                <Input
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                  placeholder="Apellidos completos"
                  className="clay-input h-11 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={newPatient.birthDate}
                  onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                  className="clay-input h-11 text-slate-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Telefono</Label>
                <Input
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="(01) 234-5678"
                  className="clay-input h-11 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="clay-button px-4 py-2.5 text-sm font-medium text-slate-700" onClick={() => dialogRef.current?.close()}>
                Cancelar
              </button>
              <button type="submit" className="clay-button-primary px-4 py-2.5 text-sm font-semibold">
                Crear Paciente
              </button>
            </div>
          </form>
        </div>
      </dialog>

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
        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, apellido o DNI..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Lista de Pacientes</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredPatients.length} de {patients.length} pacientes
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="h-10 w-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500">Cargando pacientes...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 flex items-center justify-center mx-auto mb-4 bg-slate-100 rounded-xl">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium">
                  {searchQuery ? "No se encontraron pacientes" : "No hay pacientes registrados"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {searchQuery ? "Intenta con otro termino de busqueda" : "Comienza creando un nuevo paciente"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => {
                  const lastType = getLastConsultationType(patient.consultations);
                  return (
                    <div key={patient.id} className="flex items-center justify-between p-4 rounded-xl transition-all duration-150 group hover:bg-slate-50 border border-transparent hover:border-slate-200">
                      <Link href={`/consultation?patientId=${patient.id}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
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
                      </Link>
                      <div className="flex items-center gap-3 shrink-0">
                        {lastType && (
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                            lastType === "NUEVA"
                              ? "bg-emerald-100 text-emerald-700"
                              : lastType === "RECONSULTA"
                              ? "bg-cyan-100 text-cyan-700"
                              : "bg-amber-100 text-amber-700"
                          )}>
                            {lastType}
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
