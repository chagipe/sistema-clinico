"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import {
  Search,
  Printer,
  FileText,
  User,
  Calendar,
  ChevronRight,
  Eye,
  Plus,
} from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";

interface Consultation {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    gender: string;
  };
  diagnoses: Array<{
    cie10Code: string;
    description: string;
  }>;
}

export default function HistoriasPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchConsultations(); }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch("/api/consultations");
      if (!response.ok) { setConsultations([]); return; }
      const data = await response.json();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      setConsultations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.patient.firstName.toLowerCase().includes(q) ||
      c.patient.lastName.toLowerCase().includes(q) ||
      c.patient.dni.includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Historias Clinicas"
        subtitle="Fichas clinicas para ver e imprimir"
        showSearch={false}
        actions={
          <Link href="/consultas/nueva">
            <button className="clay-button-primary px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Historia Clinica
            </button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por paciente o DNI..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
          </div>
        </div>

        {/* Historias List */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Historias Clinicas</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredConsultations.length} de {consultations.length} historias
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="h-10 w-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500">Cargando historias...</p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-slate-900 font-medium">
                  {searchQuery ? "No se encontraron historias" : "No hay historias clinicas registradas"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Las historias apareceran aqui cuando se registren consultas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {consultation.patient.firstName.charAt(0)}{consultation.patient.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/pacientes/${consultation.patient.id}`} className="hover:underline">
                            <h4 className="font-semibold text-slate-900">
                              {consultation.patient.firstName} {consultation.patient.lastName}
                            </h4>
                          </Link>
                          <span className="text-[10px] font-bold text-slate-500">
                            #{consultation.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            DNI: {consultation.patient.dni}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(new Date(consultation.createdAt))}
                          </span>
                        </div>
                        {consultation.diagnoses.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            Dx: {consultation.diagnoses.map((d) => `${d.cie10Code} - ${d.description}`).join(" | ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/print?id=${consultation.id}`}>
                        <button className="clay-button px-3 py-2 text-xs font-semibold text-slate-900 flex items-center gap-1.5 hover:bg-slate-50">
                          <Eye className="h-3.5 w-3.5" />
                          Ver Ficha
                        </button>
                      </Link>
                      <Link href={`/print?id=${consultation.id}`}>
                        <button className="clay-button-primary px-3 py-2 text-xs font-semibold flex items-center gap-1.5">
                          <Printer className="h-3.5 w-3.5" />
                          Imprimir
                        </button>
                      </Link>
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
