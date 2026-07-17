"use client";

import React from "react";
import { Search, Bell, Menu } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
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
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 text-sm text-slate-500 w-64 rounded-lg border border-slate-200">
          <Search className="h-4 w-4" />
          <span>Buscar paciente...</span>
          <kbd className="ml-auto text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-400">
            /
          </kbd>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
