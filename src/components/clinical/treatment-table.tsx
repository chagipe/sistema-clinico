"use client";

import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface TreatmentTableProps {
  form: UseFormReturn<any>;
}

const TREATMENT_OPTIONS = [
  { value: "Ozonoterapia", label: "Ozonoterapia" },
  { value: "Plasma Rico en Plaquetas", label: "Plasma Rico en Plaquetas" },
  { value: "Viscosuplementacion", label: "Viscosuplementacion" },
  { value: "Infiltracion", label: "Infiltracion" },
  { value: "Acupuntura", label: "Acupuntura" },
  { value: "Fisioterapia", label: "Fisioterapia" },
];

const BODY_ZONE_OPTIONS = [
  { value: "Rodilla Izquierda", label: "Rodilla Izquierda" },
  { value: "Rodilla Derecha", label: "Rodilla Derecha" },
  { value: "Columna Cervical", label: "Columna Cervical" },
  { value: "Columna Lumbar", label: "Columna Lumbar" },
  { value: "Columna Dorsal", label: "Columna Dorsal" },
  { value: "Hombro Izquierdo", label: "Hombro Izquierdo" },
  { value: "Hombro Derecho", label: "Hombro Derecho" },
  { value: "Codo Izquierdo", label: "Codo Izquierdo" },
  { value: "Codo Derecho", label: "Codo Derecho" },
  { value: "Tobillo Izquierdo", label: "Tobillo Izquierdo" },
  { value: "Tobillo Derecho", label: "Tobillo Derecho" },
  { value: "Muñeca Izquierda", label: "Muñeca Izquierda" },
  { value: "Muñeca Derecha", label: "Muñeca Derecha" },
  { value: "Cadera", label: "Cadera" },
];

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

  const calculateTotal = (index: number) => {
    const sessions = form.watch(`alternativeTreatments.${index}.sessionsCount`);
    const sessionPrice = form.watch(`alternativeTreatments.${index}.sessionPrice`);
    if (sessions && sessionPrice) {
      return (Number(sessions) * Number(sessionPrice)).toFixed(2);
    }
    return "0.00";
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="clay-inset p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-[#b88bc9]/30 text-[#7a4a8a] flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <h4 className="font-semibold text-[#3d3530]">Procedimiento</h4>
            </div>
            <button type="button" onClick={() => remove(index)} className="p-1.5 rounded-lg text-[#7a6b5d] hover:text-[#c4625a] hover:bg-[#c98b8b]/20 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Tratamiento</Label>
              <Select onValueChange={(value) => form.setValue(`alternativeTreatments.${index}.treatmentName`, value)} value={form.watch(`alternativeTreatments.${index}.treatmentName`) || ""}>
                <SelectTrigger className="clay-input h-10 text-[#3d3530]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {TREATMENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Zona Corporal</Label>
              <Select onValueChange={(value) => form.setValue(`alternativeTreatments.${index}.bodyZone`, value)} value={form.watch(`alternativeTreatments.${index}.bodyZone`) || ""}>
                <SelectTrigger className="clay-input h-10 text-[#3d3530]">
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {BODY_ZONE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Frecuencia</Label>
              <Select onValueChange={(value) => form.setValue(`alternativeTreatments.${index}.frequency`, value)} value={form.watch(`alternativeTreatments.${index}.frequency`) || ""}>
                <SelectTrigger className="clay-input h-10 text-[#3d3530]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {FREQUENCY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Nro. Sesiones</Label>
              <Input type="number" min="1" placeholder="0" className="clay-input h-10 text-[#3d3530]" {...form.register(`alternativeTreatments.${index}.sessionsCount`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Costo Sesion (S/)</Label>
              <Input type="number" step="0.01" placeholder="0.00" className="clay-input h-10 text-[#3d3530]" {...form.register(`alternativeTreatments.${index}.sessionPrice`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Costo Paquete (S/)</Label>
              <Input type="number" step="0.01" placeholder="0.00" className="clay-input h-10 text-[#3d3530]" {...form.register(`alternativeTreatments.${index}.packagePrice`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Total Estimado</Label>
              <div className="clay-inset h-10 px-3 flex items-center">
                <span className="font-bold text-[#8b6f5c]">S/ {calculateTotal(index)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ treatmentName: "", bodyZone: "", frequency: "", sessionsCount: 0, sessionPrice: 0, packagePrice: 0 })}
        className="w-full clay-button py-4 text-sm font-semibold text-[#7a6b5d] flex items-center justify-center gap-2 border-2 border-dashed border-[#c9b9a8]"
      >
        <Plus className="h-5 w-5" />
        Agregar Procedimiento
      </button>
    </div>
  );
}
