"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  HeartPulse,
  Stethoscope,
  Activity,
  ClipboardCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";

const navigation = [
  {
    name: "Principal",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Pacientes", href: "/pacientes", icon: Users },
      { name: "Consultas", href: "/consultas", icon: Stethoscope },
      { name: "Historias", href: "/historias", icon: FileText },
    ],
  },
  {
    name: "Clinica",
    items: [
      { name: "Control Sesiones", href: "/sesiones", icon: ClipboardCheck },
      { name: "Consentimiento", href: "/consentimiento", icon: ShieldCheck },
    ],
  },
  {
    name: "Sistema",
    items: [
      { name: "Reportes", href: "/reportes", icon: Activity },
      { name: "Configuracion", href: "/configuracion", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 h-full flex-shrink-0 clay-sidebar text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 mx-4 mt-4 rounded-xl bg-white/5">
        <div className="h-10 w-10 rounded-lg bg-[#0891b2] flex items-center justify-center">
          <HeartPulse className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">Ejes Terapeuticos</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            Terapia del Dolor
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navigation.map((group) => (
          <div key={group.name}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {group.name}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "clay-sidebar-item-active text-white"
                        : "clay-sidebar-item text-slate-300 hover:text-white"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="mx-4 mb-4 p-3 rounded-xl bg-white/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#0891b2] flex items-center justify-center text-xs font-bold text-white">
            DA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Dr. Admin</p>
            <p className="text-[11px] text-slate-400 truncate">Terapia del Dolor</p>
          </div>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
