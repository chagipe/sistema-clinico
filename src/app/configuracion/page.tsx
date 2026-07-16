"use client";

import React from "react";
import { TopBar } from "@/components/layout/top-bar";
import {
  Settings,
  User,
  Building2,
  Shield,
  Bell,
  Palette,
  Database,
  FileText,
} from "lucide-react";

export default function ConfiguracionPage() {
  const sections = [
    {
      title: "Datos del Consultorio",
      description: "Informacion general del establecimiento",
      icon: Building2,
      iconBg: "bg-[#8bb5c9]",
      fields: [
        { label: "Nombre del Consultorio", value: "MedIntegra - Clinica Integral" },
        { label: "RUC", value: "20512345678" },
        { label: "Telefono", value: "(01) 234-5678" },
        { label: "Direccion", value: "Av. Principal 123, Lima" },
      ],
    },
    {
      title: "Datos del Medico",
      description: "Informacion profesional del doctor",
      icon: User,
      iconBg: "bg-[#8bc99a]",
      fields: [
        { label: "Nombre", value: "Dr. Admin" },
        { label: "CMP", value: "12345" },
        { label: "Especialidad", value: "Medicina Integrativa" },
        { label: "Sub especialidades", value: "Ozonoterapia, PRP, Viscosuplementacion" },
      ],
    },
    {
      title: "Sistema",
      description: "Configuracion general del sistema",
      icon: Settings,
      iconBg: "bg-[#c9b88b]",
      fields: [
        { label: "Version", value: "v1.0.0" },
        { label: "Base de datos", value: "PostgreSQL" },
        { label: "Framework", value: "Next.js 16" },
        { label: "Estado", value: "Activo" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Configuracion"
        subtitle="Parametros del sistema"
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="clay-card">
            <div className="px-6 py-4 border-b border-[#c9b9a8]/50">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl ${section.iconBg} flex items-center justify-center shadow-md`}>
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#3d3530]">{section.title}</h3>
                  <p className="text-sm text-[#7a6b5d]">{section.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="clay-inset p-4">
                    <span className="text-[10px] font-bold text-[#7a6b5d] uppercase tracking-wider">{field.label}</span>
                    <p className="text-sm font-semibold text-[#3d3530] mt-1">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
