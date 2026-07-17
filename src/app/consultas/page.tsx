"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Filter,
  Search,
  ChevronRight,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";

interface Consultation {
  id: string;
  type: string;
  status: string;
  hasAccidentsOps: boolean;
  consultationReason?: string;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
  };
  diagnoses: Array<{
    cie10Code: string;
    description: string;
    type: string;
  }>;
}

export default function ConsultasPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    const matchesSearch =
      c.patient.firstName.toLowerCase().includes(q) ||
      c.patient.lastName.toLowerCase().includes(q) ||
      c.patient.dni.includes(q) ||
      c.id.slice(0, 8).toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    EN_ESPERA: { bg: "bg-amber-100", text: "text-amber-700" },
    EN_ATENCION: { bg: "bg-cyan-100", text: "text-cyan-700" },
    FINALIZADO: { bg: "bg-emerald-100", text: "text-emerald-700" },
  };

  const typeColors: Record<string, { bg: string; text: string }> = {
    NUEVA: { bg: "bg-violet-100", text: "text-violet-700" },
    RECONSULTA: { bg: "bg-cyan-100", text: "text-cyan-700" },
    TRATAMIENTO: { bg: "bg-amber-100", text: "text-amber-700" },
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Consultas"
        subtitle={`${consultations.length} consultas registradas`}
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Filters */}
        <div className="clay-card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por paciente, DNI o Nro consulta..."
                className="clay-input w-full pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              {["all", "EN_ESPERA", "EN_ATENCION", "FINALIZADO"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "clay-button px-3 py-2 text-xs font-semibold transition-all",
                    statusFilter === status
                      ? "bg-cyan-600 text-white"
                      : "text-slate-900"
                  )}
                >
                  {status === "all" ? "Todos" : status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Consultation List */}
        <div className="clay-card">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Lista de Consultas</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredConsultations.length} de {consultations.length} consultas
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="h-10 w-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500">Cargando consultas...</p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="clay-inset h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-slate-900 font-medium">
                  {searchQuery || statusFilter !== "all" ? "No se encontraron consultas" : "No hay consultas registradas"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Las consultas apareceran aqui cuando se registren
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConsultations.map((consultation) => (
                  <Link key={consultation.id} href={`/print?id=${consultation.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer group hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">
                              {consultation.patient.firstName} {consultation.patient.lastName}
                            </h4>
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
                            <p className="text-xs text-slate-500 mt-1 truncate max-w-md">
                              Dx: {consultation.diagnoses.map((d) => d.description).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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
                        <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
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
