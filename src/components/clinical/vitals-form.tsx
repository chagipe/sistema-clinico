"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VitalsFormProps {
  form: UseFormReturn<any>;
}

export function VitalsForm({ form }: VitalsFormProps) {
  const weight = form.watch("vitals.weightKg");
  const height = form.watch("vitals.heightCm");

  React.useEffect(() => {
    if (weight && height) {
      const heightM = Number(height) / 100;
      const bmi = (Number(weight) / (heightM * heightM)).toFixed(1);
      form.setValue("vitals.bmi", parseFloat(bmi));
    }
  }, [weight, height, form]);

  const fields = [
    { id: "bloodPressure", label: "Presion Arterial", placeholder: "120/80", type: "text" },
    { id: "heartRate", label: "FC (lpm)", placeholder: "72", type: "number" },
    { id: "respiratoryRate", label: "FR (rpm)", placeholder: "16", type: "number" },
    { id: "oxygenSaturation", label: "SatO2 (%)", placeholder: "98", type: "number" },
    { id: "weightKg", label: "Peso (kg)", placeholder: "70.5", type: "number" },
    { id: "heightCm", label: "Talla (cm)", placeholder: "165", type: "number" },
    { id: "bmi", label: "IMC", placeholder: "Auto", type: "number", readOnly: true },
    { id: "temperature", label: "Temp (C)", placeholder: "36.5", type: "number" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">
            {field.label}
          </Label>
          <Input
            type={field.type}
            step={field.type === "number" ? "0.1" : undefined}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            className={
              field.readOnly
                ? "clay-inset h-10 text-sm font-bold text-[#3d3530]"
                : "clay-input h-10 text-sm text-[#3d3530] placeholder:text-[#7a6b5d]/50"
            }
            {...form.register(
              `vitals.${field.id}` as any,
              field.type === "number" && !field.readOnly ? { valueAsNumber: true } : {}
            )}
          />
        </div>
      ))}
    </div>
  );
}
