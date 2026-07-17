"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface EvaPainScaleProps {
  value?: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

const PAIN_LEVELS = [
  { value: 0, label: "Sin dolor", color: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-100" },
  { value: 1, label: "Minimal", color: "bg-emerald-400", textColor: "text-emerald-700", bgColor: "bg-emerald-100" },
  { value: 2, label: "Leve", color: "bg-lime-500", textColor: "text-lime-700", bgColor: "bg-lime-100" },
  { value: 3, label: "Leve+", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-100" },
  { value: 4, label: "Moderado-", color: "bg-yellow-400", textColor: "text-yellow-700", bgColor: "bg-yellow-100" },
  { value: 5, label: "Moderado", color: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-100" },
  { value: 6, label: "Moderado+", color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-100" },
  { value: 7, label: "Intenso-", color: "bg-orange-600", textColor: "text-orange-700", bgColor: "bg-orange-100" },
  { value: 8, label: "Intenso", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-100" },
  { value: 9, label: "Severo", color: "bg-red-600", textColor: "text-red-700", bgColor: "bg-red-100" },
  { value: 10, label: "Maximo", color: "bg-red-700", textColor: "text-red-800", bgColor: "bg-red-100" },
];

export function EvaPainScale({ value, onChange, readonly = false, size = "md" }: EvaPainScaleProps) {
  const selected = value != null ? PAIN_LEVELS.find((p) => p.value === value) : null;

  if (readonly && value != null) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center justify-center rounded-lg font-bold text-white",
          selected?.color,
          size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
        )}>
          {value}
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500">EVA</span>
          <p className={cn("text-sm font-semibold", selected?.textColor)}>{selected?.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-cyan-600" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escala de Dolor (EVA)</span>
        {selected && (
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg", selected.bgColor, selected.textColor)}>
            {value}/10 - {selected.label}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {PAIN_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(level.value)}
            className={cn(
              "flex-1 h-10 rounded-lg text-xs font-bold transition-all duration-150 relative",
              value === level.value
                ? cn(level.color, "text-white shadow-md scale-110 z-10")
                : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              readonly && "cursor-default"
            )}
          >
            {level.value}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 px-1">
        <span>Sin dolor</span>
        <span>Dolor maximo</span>
      </div>
    </div>
  );
}
