"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Ban,
  Pill,
  Dumbbell,
  Wine,
  Leaf,
  UtensilsCrossed,
  Snowflake,
  Flame,
  StretchHorizontal,
  Shield,
  Footprints,
  type LucideIcon,
} from "lucide-react";

interface RecommendationsChecklistProps {
  form: UseFormReturn<any>;
}

interface RecommendationItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  bgActive: string;
  borderActive: string;
}

interface RecommendationCategory {
  title: string;
  subtitle: string;
  color: string;
  items: RecommendationItem[];
}

const CATEGORIES: RecommendationCategory[] = [
  {
    title: "Restricciones Dieteticas",
    subtitle: "Especial Ozonoterapia",
    color: "amber",
    items: [
      {
        id: "noCitrus",
        label: "No Citricos",
        description: "Limon, naranja, fresa, pina, mandarina",
        icon: Ban,
        bgActive: "bg-amber-100",
        borderActive: "border-amber-400",
      },
      {
        id: "noVitaminC",
        label: "No Suplementar Vitamina C",
        description: "Evitar suplementos de Vitamina C",
        icon: Pill,
        bgActive: "bg-yellow-100",
        borderActive: "border-yellow-400",
      },
      {
        id: "noAvocado",
        label: "No Consumir Palta",
        description: "Evitar antioxidantes altos durante el tratamiento",
        icon: Leaf,
        bgActive: "bg-emerald-100",
        borderActive: "border-emerald-400",
      },
      {
        id: "noRedMeat",
        label: "No Consumir Carnes Rojas",
        description: "Res, cerdo, cordero",
        icon: UtensilsCrossed,
        bgActive: "bg-pink-100",
        borderActive: "border-pink-400",
      },
      {
        id: "noAlcohol",
        label: "No Consumir Bebidas Alcoholicas",
        description: "Evitar alcohol durante el tratamiento",
        icon: Wine,
        bgActive: "bg-violet-100",
        borderActive: "border-violet-400",
      },
    ],
  },
  {
    title: "Indicaciones Fisicas y Rehabilitacion",
    subtitle: "Ejercicios y terapias complementarias",
    color: "cyan",
    items: [
      {
        id: "noPhysicalEffort",
        label: "Reposo Deportivo",
        description: "Evitar esfuerzo fisico pesado",
        icon: Dumbbell,
        bgActive: "bg-red-100",
        borderActive: "border-red-400",
      },
      {
        id: "cryotherapy",
        label: "Crioterapia",
        description: "Hielo local 15 min por sesion",
        icon: Snowflake,
        bgActive: "bg-blue-100",
        borderActive: "border-blue-400",
      },
      {
        id: "thermotherapy",
        label: "Termoterapia",
        description: "Calor local en zona muscular",
        icon: Flame,
        bgActive: "bg-orange-100",
        borderActive: "border-orange-400",
      },
      {
        id: "stretchingExercises",
        label: "Pauta de Ejercicios",
        description: "Estiramientos / Pausas activas",
        icon: StretchHorizontal,
        bgActive: "bg-teal-100",
        borderActive: "border-teal-400",
      },
    ],
  },
  {
    title: "Soportes Ortopedicos",
    subtitle: "Dispositivos de apoyo",
    color: "violet",
    items: [
      {
        id: "useFajaDorsoLumbar",
        label: "Uso de Faja Dorso-Lumbar",
        description: "Faja de soporte para columna",
        icon: Shield,
        bgActive: "bg-indigo-100",
        borderActive: "border-indigo-400",
      },
      {
        id: "useRodillera",
        label: "Uso de Rodillera",
        description: "Rodillera durante actividad fisica",
        icon: Shield,
        bgActive: "bg-cyan-100",
        borderActive: "border-cyan-400",
      },
      {
        id: "useOrthopedicInsoles",
        label: "Plantillas / Calzado Ortopedico",
        description: "Plantillas o calzado de soporte",
        icon: Footprints,
        bgActive: "bg-emerald-100",
        borderActive: "border-emerald-400",
      },
    ],
  },
];

export function RecommendationsChecklist({ form }: RecommendationsChecklistProps) {
  return (
    <div className="space-y-6">
      {CATEGORIES.map((category) => (
        <div key={category.title}>
          <div className="mb-3">
            <h4 className="text-sm font-bold text-slate-900">{category.title}</h4>
            <p className="text-xs text-slate-500">{category.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.items.map((rec) => {
              const isChecked = form.watch(`recommendationsChecklist.${rec.id}`);
              const Icon = rec.icon;
              return (
                <label
                  key={rec.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200",
                    isChecked
                      ? `clay-inset ${rec.bgActive} border ${rec.borderActive}`
                      : "clay-button"
                  )}
                >
                  <Checkbox
                    id={rec.id}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      form.setValue(`recommendationsChecklist.${rec.id}`, !!checked)
                    }
                    className={cn(
                      "h-5 w-5 rounded-lg border-2",
                      isChecked ? "bg-cyan-600 border-cyan-600" : "border-slate-200"
                    )}
                  />
                  <Icon className="h-5 w-5 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{rec.label}</p>
                    <p className="text-xs text-slate-500 truncate">{rec.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
