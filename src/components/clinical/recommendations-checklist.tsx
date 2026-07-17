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
    bgActive: "bg-[#c9a88b]/40",
    borderActive: "border-[#c9a88b]",
  },
  {
    id: "noVitaminC",
    label: "No Vitamina C",
    description: "Suplementos de Vitamina C",
    icon: Pill,
    bgActive: "bg-[#c9c48b]/40",
    borderActive: "border-[#c9c48b]",
  },
  {
    id: "noPhysicalEffort",
    label: "No esfuerzo fisico",
    description: "Actividades de alto impacto",
    icon: Dumbbell,
    bgActive: "bg-[#c98b8b]/40",
    borderActive: "border-[#c98b8b]",
  },
  {
    id: "noAlcohol",
    label: "No alcohol",
    description: "Bebidas alcoholicas",
    icon: Wine,
    bgActive: "bg-[#b88bc9]/40",
    borderActive: "border-[#b88bc9]",
  },
  {
    id: "noAvocado",
    label: "No palta",
    description: "Aguacate",
    icon: Leaf,
    bgActive: "bg-[#8bc99a]/40",
    borderActive: "border-[#8bc99a]",
  },
  {
    id: "noRedMeat",
    label: "No carne roja",
    description: "Chancho, res, cordero",
    icon: UtensilsCrossed,
    bgActive: "bg-[#c98b9a]/40",
    borderActive: "border-[#c98b9a]",
  },
  {
    id: "useOrthopedicSupport",
    label: "Uso de faja/ortopedico",
    description: "Faja dorso lumbar, rodillera o colchon ortopedico",
    icon: Bandage,
    bgActive: "bg-[#8bc9c9]/40",
    borderActive: "border-[#8bc9c9]",
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
                isChecked ? "bg-[#8b6f5c] border-[#8b6f5c]" : "border-[#c9b9a8]"
              )}
            />
            <Icon className="h-5 w-5 text-[#7a6b5d] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3d3530]">{rec.label}</p>
              <p className="text-xs text-[#7a6b5d] truncate">{rec.description}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
