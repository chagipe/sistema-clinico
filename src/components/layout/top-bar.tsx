"use client";

import React, { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
}

export function TopBar({ title, subtitle, actions, showSearch = true }: TopBarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/pacientes?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 bg-[#f8fafc]/80 backdrop-blur-sm border-b border-slate-200">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {showSearch && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar paciente..."
                className="w-64 pl-10 pr-16 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-400 pointer-events-none">
                /
              </kbd>
            </div>
          </form>
        )}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
