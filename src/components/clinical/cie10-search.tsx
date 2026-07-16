"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
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

  const handleSelect = (code: Cie10Code) => {
    onSelect(code);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="relative">
        <Label className="text-[10px] font-semibold text-[#7a6b5d] uppercase tracking-wider">Buscar Codigo CIE-10</Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a6b5d]" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
            placeholder="Buscar por codigo o descripcion (ej: M17, Gonartrosis...)"
            className="clay-input h-11 pl-10 text-[#3d3530] placeholder:text-[#7a6b5d]/50"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-[#c9b9a8] border-t-[#8b6f5c] rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 clay-card max-h-72 overflow-auto p-1">
            {results.map((code) => (
              <button
                key={code.id}
                className="w-full px-4 py-3 text-left hover:bg-white/50 flex items-center justify-between rounded-xl transition-colors"
                onClick={() => handleSelect(code)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#8b6f5c] clay-inset px-2 py-1 rounded-lg">
                    {code.code}
                  </span>
                  <span className="text-sm text-[#3d3530]">{code.description}</span>
                </div>
                {code.category && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#c9b9a8]/30 text-[#7a6b5d]">
                    {code.category}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute z-50 w-full mt-2 clay-card p-6 text-center">
            <p className="text-sm text-[#7a6b5d]">No se encontraron resultados para "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
