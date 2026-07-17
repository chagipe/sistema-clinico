"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface Cie10Code {
  id: string;
  code: string;
  description: string;
  category: string | null;
}

interface Cie10SearchProps {
  onSelect: (code: Cie10Code) => void;
  selectedCodes?: Array<{ cie10Code: string; description: string; type: "PRESUNTIVO" | "DEFINITIVO" }>;
  onRemove?: (code: string) => void;
}

export function Cie10Search({ onSelect, selectedCodes = [], onRemove }: Cie10SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cie10Code[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchCie10 = async () => {
      if (query.length < 2) { setResults([]); setIsOpen(false); return; }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cie10?q=${encodeURIComponent(query)}`);
        if (!response.ok) return;
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
        updateDropdownPos();
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching CIE-10:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const debounceTimer = setTimeout(searchCie10, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateDropdownPos = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }
  }, []);

  const handleSelect = (code: Cie10Code) => {
    onSelect(code);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const dropdown =
    isOpen ? (
      <div
        className="fixed z-[9999] bg-white rounded-xl border border-slate-200 shadow-lg max-h-72 overflow-auto p-1"
        style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
      >
        {results.map((code) => (
          <button
            key={code.id}
            type="button"
            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between rounded-lg transition-colors"
            onClick={() => handleSelect(code)}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg">
                {code.code}
              </span>
              <span className="text-sm text-slate-900">{code.description}</span>
            </div>
            {code.category && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                {code.category}
              </span>
            )}
          </button>
        ))}
      </div>
    ) : null;

  const emptyState =
    isOpen && query.length >= 2 && results.length === 0 && !isLoading ? (
      <div
        className="fixed z-[9999] bg-white rounded-xl border border-slate-200 shadow-lg p-6 text-center"
        style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
      >
        <p className="text-sm text-slate-500">No se encontraron resultados para &quot;{query}&quot;</p>
      </div>
    ) : null;

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="relative">
        <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Diagnostico CIE-10</Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            onFocus={() => {
              if (query.length >= 2 && results.length > 0) {
                updateDropdownPos();
                setIsOpen(true);
              }
            }}
            placeholder="Escriba el nombre de la enfermedad..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
      {createPortal(dropdown, document.body)}
      {createPortal(emptyState, document.body)}
    </div>
  );
}
