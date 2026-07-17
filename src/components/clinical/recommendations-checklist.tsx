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
  Bandage,
  type LucideIcon,
} from "lucide-react";

interface RecommendationsChecklistProps {
  form: UseFormReturn<any>;
}

const RECOMMENDATIONS: {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  bgActive: string;
  borderActive: string;
}[] = [
  {
    id: "noCitrus",
    label: "No citricos",
    description: "Limon, naranja, fresa, pina, mandarina",
    icon: Ban,
    bgActive: "bg-amber-100",
    borderActive: "border-amber-400",
  },
  {
    id: "noVitaminC",
    label: "No Vitamina C",
    description: "Suplementos de Vitamina C",
    icon: Pill,
    bgActive: "bg-yellow-100",
    borderActive: "border-yellow-400",
  },
  {
    id: "noPhysicalEffort",
    label: "No esfuerzo fisico",
    description: "Actividades de alto impacto",
    icon: Dumbbell,
    bgActive: "bg-red-100",
    borderActive: "border-red-400",
  },
  {
    id: "noAlcohol",
    label: "No alcohol",
    description: "Bebidas alcoholicas",
    icon: Wine,
    bgActive: "bg-violet-100",
    borderActive: "border-violet-400",
  },
  {
    id: "noAvocado",
    label: "No palta",
    description: "Aguacate",
    icon: Leaf,
    bgActive: "bg-emerald-100",
    borderActive: "border-emerald-400",
  },
  {
    id: "noRedMeat",
    label: "No carne roja",
    description: "Chancho, res, cordero",
    icon: UtensilsCrossed,
    bgActive: "bg-pink-100",
    borderActive: "border-pink-400",
  },
  {
    id: "useOrthopedicSupport",
    label: "Uso de faja/ortopedico",
    description: "Faja dorso lumbar, rodillera o colchon ortopedico",
    icon: Bandage,
    bgActive: "bg-teal-100",
    borderActive: "border-teal-400",
  },
];

export function RecommendationsChecklist({ form }: RecommendationsChecklistProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {RECOMMENDATIONS.map((rec) => {
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
  );
}
