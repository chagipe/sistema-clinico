"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  FileText,
  Printer,
  User,
  ArrowLeft,
} from "lucide-react";
import { cn, calculateAge } from "@/lib/utils";
import Link from "next/link";

interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
}

export default function ConsentimientoPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [procedure, setProcedure] = useState("Ozonoterapia");
  const [diagnosis, setDiagnosis] = useState("");
  const [bodyZone, setBodyZone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (!response.ok) { setPatients([]); return; }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.dni.includes(q)
    );
  });

  const handlePrint = () => window.print();

  const today = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Consentimiento Informado"
        subtitle="Generar documento de consentimiento"
        showSearch={false}
        actions={
          selectedPatient ? (
            <button onClick={handlePrint} className="clay-button-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 print:hidden">
              <Printer className="h-4 w-4" /> Imprimir
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Patient Selection */}
          {!selectedPatient && (
            <div className="clay-card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Seleccionar Paciente</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate text-sm">{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-slate-500">DNI: {patient.dni}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Form */}
          {selectedPatient && (
            <>
              <div className="clay-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 text-slate-500" />
                    </button>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Consentimiento para: {selectedPatient.firstName} {selectedPatient.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">DNI: {selectedPatient.dni} | Edad: {calculateAge(new Date(selectedPatient.birthDate))} anios</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Procedimiento</Label>
                    <Select onValueChange={setProcedure} value={procedure}>
                      <SelectTrigger className="clay-input h-10 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="clay-card border-0">
                        <SelectItem value="Ozonoterapia">Ozonoterapia</SelectItem>
                        <SelectItem value="Plasma Rico en Plaquetas (PRP)">Plasma Rico en Plaquetas (PRP)</SelectItem>
                        <SelectItem value="Viscosuplementacion">Viscosuplementacion</SelectItem>
                        <SelectItem value="Infiltracion">Infiltracion</SelectItem>
                        <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnostico</Label>
                    <Input
                      placeholder="Ej: Gonartrosis bilateral"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="clay-input h-10 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zona a Tratar</Label>
                    <Input
                      placeholder="Ej: Rodilla Derecha"
                      value={bodyZone}
                      onChange={(e) => setBodyZone(e.target.value)}
                      className="clay-input h-10 text-slate-900"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Observaciones Adicionales</Label>
                  <Textarea
                    placeholder="Notas adicionales para el consentimiento..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="clay-input min-h-[80px] text-slate-900 resize-none"
                  />
                </div>
              </div>

              {/* Consent Document Preview */}
              <div className="clay-card overflow-hidden print:shadow-none print:rounded-none print:max-w-none">
                {/* Document Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 text-white print:bg-slate-900">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold tracking-tight">CONSENTIMIENTO INFORMADO</h1>
                      <p className="text-sm text-white/60">Ejes Terapeuticos - Doctores en Terapia del Dolor</p>
                    </div>
                  </div>
                </div>

                {/* Document Body */}
                <div className="px-8 py-6 space-y-5 text-sm text-slate-700 leading-relaxed">
                  {/* Patient Data */}
                  <div className="clay-inset p-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paciente</span>
                        <p className="font-bold text-slate-900 mt-0.5">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DNI</span>
                        <p className="font-bold text-slate-900 mt-0.5">{selectedPatient.dni}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Edad</span>
                        <p className="font-bold text-slate-900 mt-0.5">{calculateAge(new Date(selectedPatient.birthDate))} anios</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</span>
                        <p className="font-bold text-slate-900 mt-0.5">{today}</p>
                      </div>
                    </div>
                  </div>

                  {/* Procedure Info */}
                  <div className="clay-inset p-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Procedimiento</span>
                        <p className="font-bold text-cyan-600 mt-0.5">{procedure}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diagnostico</span>
                        <p className="font-bold text-slate-900 mt-0.5">{diagnosis || "No especificado"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Zona a Tratar</span>
                        <p className="font-bold text-slate-900 mt-0.5">{bodyZone || "No especificada"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Consent Text */}
                  <div className="space-y-4">
                    <p>
                      Yo, <strong className="text-slate-900">{selectedPatient.firstName} {selectedPatient.lastName}</strong>, con DNI N. <strong className="text-slate-900">{selectedPatient.dni}</strong>, mayor de edad, en mi pleno uso de facultades mentales, declaro que:
                    </p>

                    <p>
                      <strong>1.</strong> He sido informado(a) por el Dr. Admin, CMP 12345, sobre el procedimiento de <strong className="text-cyan-600">{procedure}</strong> que se me realizara en la zona de <strong className="text-slate-900">{bodyZone || "a determinar"}</strong>, asi como sus beneficios esperados, riesgos, complicaciones posibles y alternativas de tratamiento.
                    </p>

                    <p>
                      <strong>2.</strong> Comprendo que este procedimiento es voluntario y que tengo el derecho de rechazarlo o retirar mi consentimiento en cualquier momento, sin que ello afecte la atencion medica que recibo.
                    </p>

                    <p>
                      <strong>3.</strong> Declaro haber expuesto de manera veraz mis antecedentes clinicos, alergias, medicamentos que consumo y cualquier otra informacion relevante para la realizacion segura del procedimiento.
                    </p>

                    <p>
                      <strong>4.</strong> Acepto las recomendaciones post-procedimiento que incluyen, pero no se limitan a: restricciones dieteticas, cuidados de la zona tratada, uso de soportes ortopedicos y seguimiento clinico.
                    </p>

                    {procedure === "Ozonoterapia" && (
                      <p>
                        <strong>5.</strong> Especficamente para la <strong className="text-cyan-600">Ozonoterapia</strong>, comprendo que debo evitar el consumo de citricos, suplementos de Vitamina C, palta, carnes rojas y bebidas alcoholicas durante el periodo de tratamiento, segun las indicaciones medicas.
                      </p>
                    )}

                    {procedure === "Plasma Rico en Plaquetas (PRP)" && (
                      <p>
                        <strong>5.</strong> Especificamente para el <strong className="text-cyan-600">Plasma Rico en Plaquetas (PRP)</strong>, comprendo que se me extraera sangre venosa para su procesamiento y posterior infiltracion en la zona afectada, y que los resultados pueden variar segun la condicion individual.
                      </p>
                    )}

                    {additionalNotes && (
                      <div className="clay-inset p-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observaciones Adicionales</span>
                        <p className="text-sm text-slate-700 mt-1">{additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Signature Blocks */}
                  <div className="mt-8 pt-6 border-t-2 border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Firmas y Huellas</p>
                    <div className="grid grid-cols-3 gap-8">
                      {/* Patient Signature */}
                      <div className="text-center">
                        <div className="border-t-2 border-slate-900 pt-3 mb-2">
                          <p className="text-xs font-bold text-slate-900">Paciente</p>
                          <p className="text-xs text-slate-500">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                          <p className="text-xs text-slate-500">DNI: {selectedPatient.dni}</p>
                        </div>
                        <div className="mt-8">
                          <div className="w-20 h-20 mx-auto border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] text-slate-400">Huella</span>
                          </div>
                        </div>
                      </div>

                      {/* Witness Signature */}
                      <div className="text-center">
                        <div className="border-t-2 border-slate-900 pt-3 mb-2">
                          <p className="text-xs font-bold text-slate-900">Testigo</p>
                        </div>
                        <div className="mt-8">
                          <div className="w-20 h-20 mx-auto border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] text-slate-400">Huella</span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Signature */}
                      <div className="text-center">
                        <div className="border-t-2 border-slate-900 pt-3 mb-2">
                          <p className="text-xs font-bold text-slate-900">Medico Responsable</p>
                          <p className="text-xs text-slate-500">Dr. Admin</p>
                          <p className="text-xs text-slate-500">CMP: 12345</p>
                        </div>
                        <div className="mt-8">
                          <div className="w-20 h-20 mx-auto border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] text-slate-400">Sello</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="clay-inset mx-6 mb-6 px-6 py-3 rounded-xl print:mx-0 print:mb-0 print:rounded-none">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Ejes Terapeuticos - Doctores en Terapia del Dolor</span>
                    <span>Documento generado el {today}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
