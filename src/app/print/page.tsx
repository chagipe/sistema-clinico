"use client";

import React, { Suspense } from "react";
import PrintView from "./print-view";

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      }
    >
      <PrintView />
    </Suspense>
  );
}
