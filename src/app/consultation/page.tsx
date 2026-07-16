"use client";

import React, { Suspense } from "react";
import ConsultationForm from "./consultation-form";

export default function ConsultationPage() {
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
