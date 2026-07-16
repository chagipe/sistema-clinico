"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import {
  Activity,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  totalPatients: number;
  totalConsultations: number;
  consultationsByType: { type: string; count: number }[];
  consultationsByStatus: { status: string; count: number }[];
}

export default function ReportesPage() {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalConsultations: 0,
    consultationsByType: [],
    consultationsByStatus: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, consultationsRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/consultations"),
      ]);

      const patients = patientsRes.ok ? await patientsRes.json() : [];
      const consultations = consultationsRes.ok ? await consultationsRes.json() : [];

      const patientsArray = Array.isArray(patients) ? patients : [];
      const consultationsArray = Array.isArray(consultations) ? consultations : [];

      const typeMap = new Map<string, number>();
      const statusMap = new Map<string, number>();

      consultationsArray.forEach((c: any) => {
        typeMap.set(c.type, (typeMap.get(c.type) || 0) + 1);
        statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
      });

      setStats({
        totalPatients: patientsArray.length,
        totalConsultations: consultationsArray.length,
        consultationsByType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
        consultationsByStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const summaryCards = [
    { label: "Total Pacientes", value: stats.totalPatients, icon: Users, iconBg: "bg-[#8bb5c9]" },
    { label: "Total Consultas", value: stats.totalConsultations, icon: FileText, iconBg: "bg-[#8bc99a]" },
    { label: "Nuevas", value: stats.consultationsByType.find(t => t.type === "NUEVA")?.count || 0, icon: Activity, iconBg: "bg-[#b88bc9]" },
    { label: "Reconsultas", value: stats.consultationsByType.find(t => t.type === "RECONSULTA")?.count || 0, icon: TrendingUp, iconBg: "bg-[#c9b88b]" },
  ];

  const statusLabels: Record<string, string> = {
    EN_ESPERA: "En Espera",
    EN_ATENCION: "En Atencion",
    FINALIZADO: "Finalizado",
  };

  const typeLabels: Record<string, string> = {
    NUEVA: "Nueva",
    RECONSULTA: "Reconsulta",
    TRATAMIENTO: "Tratamiento",
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Reportes"
        subtitle="Estadisticas y metricas del sistema"
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="clay-card p-8 flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-4 border-[#c9b9a8] border-t-[#8b6f5c] rounded-full animate-spin" />
              <p className="text-sm text-[#7a6b5d]">Cargando estadisticas...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {summaryCards.map((stat) => (
                <div key={stat.label} className="clay-flat p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#7a6b5d] uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#3d3530] mt-1.5">{stat.value}</p>
                    </div>
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-md", stat.iconBg)}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* By Type */}
              <div className="clay-card p-6">
                <h3 className="text-lg font-bold text-[#3d3530] mb-4">Consultas por Tipo</h3>
                <div className="space-y-4">
                  {stats.consultationsByType.length === 0 ? (
                    <p className="text-sm text-[#7a6b5d] text-center py-8">No hay datos disponibles</p>
                  ) : (
                    stats.consultationsByType.map((item) => {
                      const percentage = stats.totalConsultations > 0
                        ? Math.round((item.count / stats.totalConsultations) * 100)
                        : 0;
                      return (
                        <div key={item.type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-[#3d3530]">{typeLabels[item.type] || item.type}</span>
                            <span className="text-sm font-bold text-[#8b6f5c]">{item.count} ({percentage}%)</span>
                          </div>
                          <div className="clay-inset h-3 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#8b6f5c] to-[#c4a882] rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* By Status */}
              <div className="clay-card p-6">
                <h3 className="text-lg font-bold text-[#3d3530] mb-4">Consultas por Estado</h3>
                <div className="space-y-4">
                  {stats.consultationsByStatus.length === 0 ? (
                    <p className="text-sm text-[#7a6b5d] text-center py-8">No hay datos disponibles</p>
                  ) : (
                    stats.consultationsByStatus.map((item) => {
                      const percentage = stats.totalConsultations > 0
                        ? Math.round((item.count / stats.totalConsultations) * 100)
                        : 0;
                      const colorMap: Record<string, string> = {
                        EN_ESPERA: "from-[#c9b88b] to-[#e8d8b8]",
                        EN_ATENCION: "from-[#8bb5c9] to-[#a8d0e0]",
                        FINALIZADO: "from-[#8bc99a] to-[#a8e0b8]",
                      };
                      return (
                        <div key={item.status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-[#3d3530]">{statusLabels[item.status] || item.status}</span>
                            <span className="text-sm font-bold text-[#8b6f5c]">{item.count} ({percentage}%)</span>
                          </div>
                          <div className="clay-inset h-3 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", colorMap[item.status] || "from-[#c9b9a8] to-[#e8d8c8]")}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
