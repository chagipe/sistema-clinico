"use client";

import React, { useState, useRef, useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Search } from "lucide-react";
import { createPortal } from "react-dom";

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

const PRODUCT_CATALOG = [
  { name: "Reforflex", description: "Suplemento de colageno hidrolizado" },
  { name: "D3 Max", description: "Vitamina D3 de alta potencia" },
  { name: "Osteoban 150mg", description: "Calcio + Vitamina D + Magnesio" },
  { name: "Colageno", description: "Colageno hidrolizado tipos I y III" },
  { name: "Acetaminofen 500mg", description: "Analgesico / Antipiretico" },
  { name: "Ibuprofeno 400mg", description: "Antiinflamatorio no esteroideo" },
  { name: "Naproxeno 250mg", description: "Antiinflamatorio no esteroideo" },
  { name: "Diclofenaco 50mg", description: "Antiinflamatorio no esteroideo" },
  { name: "Pregabalina 75mg", description: "Neuromodulador / Analgesico" },
  { name: "Tramadol 50mg", description: "Analgesico opioide" },
  { name: "Meloxicam 15mg", description: "Antiinflamatorio no esteroideo" },
  { name: "Complejo B", description: "Vitaminas del grupo B" },
  { name: "Magnesio", description: "Suplemento de magnesio" },
  { name: "Omega 3", description: "Acidos grasos esenciales" },
  { name: "Glucosamina", description: "Suplemento para cartilago articular" },
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
              <span className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <h4 className="font-semibold text-slate-900">Medicamento</h4>
            </div>
            <button type="button" onClick={() => remove(index)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Medicamento / Insumo</Label>
              <MedicamentAutocomplete
                value={form.watch(`prescriptions.${index}.medication`) || ""}
                onChange={(val) => form.setValue(`prescriptions.${index}.medication`, val)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Dias</Label>
              <Input type="number" min="1" placeholder="90" className="clay-input h-10 text-slate-900" {...form.register(`prescriptions.${index}.days`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Frecuencia</Label>
              <Select onValueChange={(value) => form.setValue(`prescriptions.${index}.dosage`, value)} value={form.watch(`prescriptions.${index}.dosage`) || ""}>
                <SelectTrigger className="clay-input h-10 text-slate-900">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="clay-card border-0">
                  {DOSAGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Indicaciones</Label>
              <Textarea placeholder="Ej: 1 sobre diario despues de almuerzo" className="clay-input min-h-[40px] text-sm text-slate-900 resize-none" {...form.register(`prescriptions.${index}.instructions`)} />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ medication: "", days: 0, dosage: "", instructions: "" })}
        className="w-full clay-button py-4 text-sm font-semibold text-slate-500 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200"
      >
        <Plus className="h-5 w-5" />
        Agregar Medicamento
      </button>
    </div>
  );
}

function MedicamentAutocomplete({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.length > 0
    ? PRODUCT_CATALOG.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : PRODUCT_CATALOG;

  const handleSelect = (name: string) => {
    onChange(name);
    setQuery(name);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      onChange(query.trim());
      setIsOpen(false);
    }
  };

  const updatePos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }
  };

  const dropdown = isOpen && filtered.length > 0 ? (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-auto p-1"
      style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
    >
      {filtered.map((product) => (
        <button
          key={product.name}
          type="button"
          className="w-full px-4 py-2.5 text-left hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => handleSelect(product.name)}
        >
          <p className="text-sm font-medium text-slate-900">{product.name}</p>
          <p className="text-xs text-slate-500">{product.description}</p>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => { updatePos(); setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="Buscar medicamento..."
        className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
      />
      {createPortal(dropdown, document.body)}
    </div>
  );
}
