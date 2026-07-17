"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface PainEvolutionChartProps {
  consultations: Array<{
    id: string;
    createdAt: string;
    painScale?: number | null;
  }>;
}

function getEvaColor(value: number): string {
  if (value <= 2) return "bg-emerald-500";
  if (value <= 4) return "bg-yellow-500";
  if (value <= 6) return "bg-amber-500";
  if (value <= 8) return "bg-orange-500";
  return "bg-red-600";
}

function getEvaTextColor(value: number): string {
  if (value <= 2) return "text-emerald-700";
  if (value <= 4) return "text-yellow-700";
  if (value <= 6) return "text-amber-700";
  if (value <= 8) return "text-orange-700";
  return "text-red-700";
}

export function PainEvolutionChart({ consultations }: PainEvolutionChartProps) {
  const withPain = consultations
    .filter((c) => c.painScale != null)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (withPain.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-slate-400">Sin datos de escala de dolor</p>
      </div>
    );
  }

  const first = withPain[0].painScale!;
  const last = withPain[withPain.length - 1].painScale!;
  const trend = last < first ? "improving" : last > first ? "worsening" : "stable";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evolucion del Dolor (EVA)</span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg",
          trend === "improving" ? "bg-emerald-100 text-emerald-700" :
          trend === "worsening" ? "bg-red-100 text-red-700" :
          "bg-slate-100 text-slate-600"
        )}>
          {trend === "improving" ? <TrendingDown className="h-3 w-3" /> :
           trend === "worsening" ? <TrendingUp className="h-3 w-3" /> :
           <Minus className="h-3 w-3" />}
          {trend === "improving" ? "Mejoria" : trend === "worsening" ? "Empeora" : "Estable"}
        </div>
      </div>

      <div className="flex items-end gap-1 h-24">
        {withPain.map((c, i) => {
          const height = ((c.painScale ?? 0) / 10) * 100;
          return (
            <div key={c.id} className="flex-1 flex flex-col items-center gap-1">
              <span className={cn("text-[10px] font-bold", getEvaTextColor(c.painScale!))}>
                {c.painScale}
              </span>
              <div
                className={cn("w-full rounded-t-sm transition-all duration-300", getEvaColor(c.painScale!))}
                style={{ height: `${Math.max(height, 8)}%` }}
              />
              <span className="text-[9px] text-slate-400">
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Primera consulta</span>
        <span>Ultima consulta</span>
      </div>
    </div>
  );
}
