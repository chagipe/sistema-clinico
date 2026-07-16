"use client";

import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface PrescriptionTableProps {
  form: UseFormReturn<any>;
}

const DOSAGE_OPTIONS = [
  { value: "CADA 24 HORAS", label: "Cada 24 horas" },
  { value: "CADA 12 HORAS", label: "Cada 12 horas" },
  { value: "CADA 8 HORAS", label: "Cada 8 horas" },
  { value: "CADA 6 HORAS", label: "Cada 6 horas" },
  { value: "DIARIO", label: "Diario" },
  { value: "QUINCENAL", label: "Quincenal" },
  { value: "MENSUAL", label: "Mensual" },
  { value: "SEMANAL", label: "Semanal" },
  { value: "UNICA DOSIS", label: "Unica dosis" },
];

export function PrescriptionTable({ form }: PrescriptionTableProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="clay-inset p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-[#c9b88b]/30 text-[#7a6a3a] flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <h4 className="font-semibold text-[#3d3530]">Medicamento</h4>
            </div>
            <button type="button" onClick={() => remove(index)} className="p-1.5 rounded-lg text-[#7a6b5d] hover:text-[#c4625a] hover:bg-[#c98b8b]/20 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Medicamento</Label>
              <Input placeholder="Nombre del medicamento" className="clay-input h-10 text-[#3d3530]" {...form.register(`prescriptions.${index}.medication`)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Dias</Label>
              <Input type="number" min="1" placeholder="90" className="clay-input h-10 text-[#3d3530]" {...form.register(`prescriptions.${index}.days`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Frecuencia</Label>
              <Select onValueChange={(value) => form.setValue(`prescriptions.${index}.dosage`, value)} value={form.watch(`prescriptions.${index}.dosage`) || ""}>
                <SelectTrigger className="clay-input h-10 text-[#3d3530]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {DOSAGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Indicaciones</Label>
              <Textarea placeholder="1 sobre diario despues de almuerzo" className="clay-input min-h-[40px] text-sm text-[#3d3530] resize-none" {...form.register(`prescriptions.${index}.instructions`)} />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ medication: "", days: 0, dosage: "", instructions: "" })}
        className="w-full clay-button py-4 text-sm font-semibold text-[#7a6b5d] flex items-center justify-center gap-2 border-2 border-dashed border-[#c9b9a8]"
      >
        <Plus className="h-5 w-5" />
        Agregar Medicamento
      </button>
    </div>
  );
}
