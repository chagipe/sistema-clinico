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
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2.5 rounded-xl clay-button">
          <Menu className="h-5 w-5 text-[#3d3530]" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-[#3d3530]">{title}</h2>
          {subtitle && (
            <p className="text-xs text-[#7a6b5d]">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 clay-inset text-sm text-[#7a6b5d] w-64">
          <Search className="h-4 w-4" />
          <span>Buscar paciente...</span>
          <kbd className="ml-auto text-[10px] bg-[#efe8e0] px-1.5 py-0.5 rounded-lg border border-[#c9b9a8] font-mono text-[#7a6b5d]">
            /
          </kbd>
        </div>
        <button className="relative p-2.5 rounded-xl clay-button">
          <Bell className="h-5 w-5 text-[#7a6b5d]" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#c4625a] ring-2 ring-[#e8e0d8]" />
        </button>
      </div>
    </header>
  );
}
