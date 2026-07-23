"use client";

import React, { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Zap } from "lucide-react";

interface TreatmentTableProps {
  form: UseFormReturn<any>;
}

const TREATMENT_OPTIONS = [
  { value: "Ozonoterapia", label: "Ozonoterapia" },
  { value: "Plasma Rico en Plaquetas (PRP)", label: "Plasma Rico en Plaquetas (PRP)" },
  { value: "Viscosuplementacion", label: "Viscosuplementacion" },
  { value: "Fisioterapia / Rehabilitacion", label: "Fisioterapia / Rehabilitacion" },
  { value: "Magnetoterapia", label: "Magnetoterapia" },
  { value: "Electroterapia", label: "Electroterapia" },
  { value: "Sesion de Terapia del Dolor", label: "Sesion de Terapia del Dolor" },
  { value: "Infiltracion", label: "Infiltracion" },
  { value: "Acupuntura", label: "Acupuntura" },
];

const BODY_ZONE_OPTIONS = [
  { value: "Columna Cervical", label: "Columna Cervical" },
  { value: "Columna Lumbar", label: "Columna Lumbar" },
  { value: "Rodilla Derecha", label: "Rodilla Derecha" },
  { value: "Rodilla Izquierda", label: "Rodilla Izquierda" },
  { value: "Ambas Rodillas", label: "Ambas Rodillas" },
  { value: "Hombro Derecho", label: "Hombro Derecho" },
  { value: "Hombro Izquierdo", label: "Hombro Izquierdo" },
  { value: "Cadera / Otras articulaciones", label: "Cadera / Otras articulaciones" },
  { value: "__custom__", label: "Otra (especificar)" },
];

const QUICK_TEMPLATES: Record<string, { zone: string; label: string }[]> = {
  "Ozonoterapia": [
    { zone: "Rodilla Derecha", label: "Rod. Der." },
    { zone: "Rodilla Izquierda", label: "Rod. Izq." },
    { zone: "Ambas Rodillas", label: "Ambas Rod." },
    { zone: "Columna Lumbar", label: "Col. Lumbar" },
    { zone: "Columna Cervical", label: "Col. Cervical" },
    { zone: "Hombro Derecho", label: "Hombro Der." },
    { zone: "Hombro Izquierdo", label: "Hombro Izq." },
    { zone: "Cadera / Otras articulaciones", label: "Cadera/Otras" },
  ],
  "Plasma Rico en Plaquetas (PRP)": [
    { zone: "Rodilla Derecha", label: "Rod. Der." },
    { zone: "Rodilla Izquierda", label: "Rod. Izq." },
    { zone: "Ambas Rodillas", label: "Ambas Rod." },
    { zone: "Columna Lumbar", label: "Col. Lumbar" },
    { zone: "Columna Cervical", label: "Col. Cervical" },
    { zone: "Hombro Derecho", label: "Hombro Der." },
    { zone: "Hombro Izquierdo", label: "Hombro Izq." },
    { zone: "Cadera / Otras articulaciones", label: "Cadera/Otras" },
  ],
  "Viscosuplementacion": [
    { zone: "Rodilla Derecha", label: "Rod. Der." },
    { zone: "Rodilla Izquierda", label: "Rod. Izq." },
    { zone: "Ambas Rodillas", label: "Ambas Rod." },
  ],
};

const FREQUENCY_OPTIONS = [
  { value: "1v-sem", label: "1 vez por semana" },
  { value: "2v-sem", label: "2 veces por semana" },
  { value: "3v-sem", label: "3 veces por semana" },
  { value: "1v-mes", label: "1 vez al mes" },
  { value: "Quincenal", label: "Quincenal" },
  { value: "Unica", label: "Unica aplicacion" },
];

export function TreatmentTable({ form }: TreatmentTableProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "alternativeTreatments",
  });

  const [activeQuickTemplates] = useState<Record<number, string>>({});

  const calculateTotal = (index: number) => {
    const sessions = form.watch(`alternativeTreatments.${index}.sessionsCount`);
    const sessionPrice = form.watch(`alternativeTreatments.${index}.sessionPrice`);
    if (sessions && sessionPrice) {
      return (Number(sessions) * Number(sessionPrice)).toFixed(2);
    }
    return "0.00";
  };

  const handleQuickAdd = (treatmentName: string, bodyZone: string) => {
    append({
      treatmentName,
      bodyZone,
      frequency: "1v-sem",
      sessionsCount: 10,
      sessionPrice: 0,
      packagePrice: 0,
    });
  };

  const getAvailableQuickTemplates = (index: number) => {
    const treatmentName = form.watch(`alternativeTreatments.${index}.treatmentName`);
    return QUICK_TEMPLATES[treatmentName] || [];
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Section */}
      <div className="clay-inset p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-bold text-slate-900">Agregar Rapido</h4>
        </div>
        <div className="space-y-3">
          {Object.entries(QUICK_TEMPLATES).map(([treatment, zones]) => (
            <div key={treatment}>
              <p className="text-xs font-semibold text-slate-500 mb-2">{treatment}</p>
              <div className="flex flex-wrap gap-2">
                {zones.map((zone) => (
                  <button
                    key={zone.zone}
                    type="button"
                    onClick={() => handleQuickAdd(treatment, zone.zone)}
                    className="clay-button px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-cyan-600 hover:border-cyan-300 transition-colors"
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Rows */}
      {fields.map((field, index) => (
        <div key={field.id} className="clay-inset p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <h4 className="font-semibold text-slate-900">Procedimiento</h4>
            </div>
            <button type="button" onClick={() => remove(index)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tratamiento</Label>
              <Select onValueChange={(value) => form.setValue(`alternativeTreatments.${index}.treatmentName`, value)} value={form.watch(`alternativeTreatments.${index}.treatmentName`) || ""}>
                <SelectTrigger className="clay-input h-10 text-slate-900">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {TREATMENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Zona Especifica</Label>
              <Select
                onValueChange={(value) => {
                  if (value === "__custom__") {
                    form.setValue(`alternativeTreatments.${index}.bodyZone`, "");
                  } else {
                    form.setValue(`alternativeTreatments.${index}.bodyZone`, value);
                  }
                }}
                value={
                  BODY_ZONE_OPTIONS.some(o => o.value === form.watch(`alternativeTreatments.${index}.bodyZone`))
                    ? form.watch(`alternativeTreatments.${index}.bodyZone`)
                    : "__custom__"
                }
              >
                <SelectTrigger className="clay-input h-10 text-slate-900">
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {BODY_ZONE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!BODY_ZONE_OPTIONS.some(o => o.value === form.watch(`alternativeTreatments.${index}.bodyZone`)) ||
                form.watch(`alternativeTreatments.${index}.bodyZone`) === "") && (
                <Input
                  placeholder="Especifique la zona..."
                  className="clay-input h-10 text-slate-900 placeholder:text-slate-400"
                  value={
                    BODY_ZONE_OPTIONS.some(o => o.value === form.watch(`alternativeTreatments.${index}.bodyZone`))
                      ? ""
                      : form.watch(`alternativeTreatments.${index}.bodyZone`) || ""
                  }
                  onChange={(e) => form.setValue(`alternativeTreatments.${index}.bodyZone`, e.target.value)}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Frecuencia</Label>
              <Select onValueChange={(value) => form.setValue(`alternativeTreatments.${index}.frequency`, value)} value={form.watch(`alternativeTreatments.${index}.frequency`) || ""}>
                <SelectTrigger className="clay-input h-10 text-slate-900">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {FREQUENCY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nro. Sesiones</Label>
              <Input type="number" min="1" placeholder="0" className="clay-input h-10 text-slate-900" {...form.register(`alternativeTreatments.${index}.sessionsCount`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Costo Sesion (S/)</Label>
              <Input type="number" step="0.01" placeholder="0.00" className="clay-input h-10 text-slate-900" {...form.register(`alternativeTreatments.${index}.sessionPrice`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Costo Paquete (S/)</Label>
              <Input type="number" step="0.01" placeholder="0.00" className="clay-input h-10 text-slate-900" {...form.register(`alternativeTreatments.${index}.packagePrice`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Estimado</Label>
              <div className="clay-inset h-10 px-3 flex items-center">
                <span className="font-bold text-cyan-600">S/ {calculateTotal(index)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ treatmentName: "", bodyZone: "", frequency: "", sessionsCount: 0, sessionPrice: 0, packagePrice: 0 })}
        className="w-full clay-button py-4 text-sm font-semibold text-slate-500 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200"
      >
        <Plus className="h-5 w-5" />
        Agregar Procedimiento
      </button>
    </div>
  );
}
