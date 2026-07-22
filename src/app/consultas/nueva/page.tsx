"use client";

import React, { Suspense } from "react";
import ConsultationForm from "@/app/consultation/consultation-form";

export default function NuevaConsultaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      }
    >
      <ConsultationForm />
    </Suspense>
  );
}
