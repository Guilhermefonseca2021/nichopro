"use client";

import {
  Grid2X2,
  Heart,
  Home,
  Layers3,
  LogOut,
  Menu,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "@/store/auth-store";
import type { DashboardSection, UserRole } from "@/lib/dashboard/types";

type DashboardShellProps = {
  user: AuthUser;
  role: UserRole;
  section: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  onSignOut: () => void;
  children: React.ReactNode;
};

const userNavigation = [
  { name: "Início", icon: Home, action: "home" as const },
  { name: "Nichos", icon: Grid2X2, action: "niches" as const },
  { name: "Meus prompts", icon: Search, action: "library" as const },
  { name: "Favoritos", icon: Heart, action: "favorites" as const },
  { name: "Minha conta", icon: UserRound, action: "account" as const },
];

const mobileNavigation = [
  { ...userNavigation[0], name: "Início" },
  { ...userNavigation[1], name: "Nichos" },
  { ...userNavigation[2], name: "Prompts" },
  { ...userNavigation[3], name: "Favoritos" },
  { ...userNavigation[4], name: "Conta" },
];

const sectionLabels: Record<DashboardSection, string> = {
  home: "Início",
  niches: "Explorar nichos",
  library: "Biblioteca de prompts",
  favorites: "Favoritos",
  account: "Minha conta",
  users: "Administração",
};

export function DashboardShell({
  user,
  role,
  section,
  onSectionChange,
  onSignOut,
  children,
}: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(nextSection: DashboardSection) {
    onSectionChange(nextSection);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f5fa] lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#1a1025] text-white lg:flex">
        <div className="flex h-[78px] items-center gap-3 border-b border-white/10 px-6">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#a66aff] to-[#6722c7]">
            <Layers3 size={22} />
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight">NichoPro</span>
            <span className="block text-[10px] text-white/55">Prompts · Serviços · Soluções</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {userNavigation.map(({ name, icon: Icon, action }) => (
            <button
              key={name}
              type="button"
              onClick={() => navigate(action)}
              className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition ${section === action ? "bg-gradient-to-r from-[#7832cf] to-[#5720a1] font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
          {role === "admin" && (
            <button
              type="button"
              onClick={() => navigate("users")}
              className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition ${section === "users" ? "bg-gradient-to-r from-[#7832cf] to-[#5720a1] font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Users size={18} />
              Administração
            </button>
          )}
        </nav>

        <div className="mx-3 mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span>✦</span> Acesso NichoPro
          </div>
          <p className="mt-2 text-xs leading-5 text-white/60">
            Prompts e ideias para destacar o seu negócio.
          </p>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#8d4ed1] text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{user.name}</span>
            <span className="block text-[11px] text-white/55">
              {role === "admin" ? "Administrador" : "Membro"}
            </span>
          </span>
          <button
            type="button"
            aria-label="Sair da conta"
            onClick={onSignOut}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[248px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#ebe6ef] bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl p-2 text-[#4c4057] hover:bg-[#f1edf5] lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden text-sm font-semibold text-[#81788a] sm:block">
            {sectionLabels[section]}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[220px] truncate text-sm text-[#81788a] md:block">
              {user.email}
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-[#eee2fb] font-bold text-[#7235b2]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 top-[68px] z-30 bg-[#1a1025] px-4 py-5 text-white lg:hidden">
            <nav className="space-y-2">
              {userNavigation.map(({ name, icon: Icon, action }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => navigate(action)}
                  className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${section === action ? "bg-[#7533c1]" : "text-white/75 hover:bg-white/10"}`}
                >
                  <Icon size={18} />
                  {name}
                </button>
              ))}
              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => navigate("users")}
                  className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${section === "users" ? "bg-[#7533c1]" : "text-white/75 hover:bg-white/10"}`}
                >
                  <Users size={18} /> Administração
                </button>
              )}
              <button
                type="button"
                onClick={onSignOut}
                className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm text-white/75 hover:bg-white/10"
              >
                <LogOut size={18} /> Sair
              </button>
            </nav>
          </div>
        )}

        <main className="mx-auto max-w-[1500px] px-4 py-6 pb-24 sm:px-7 sm:py-8 lg:px-9 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-[#e9e3ed] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {mobileNavigation.map(({ name, icon: Icon, action }) => (
          <button
            key={name}
            type="button"
            onClick={() => navigate(action)}
            className={`flex flex-col items-center gap-1 py-1 text-[10px] ${section === action ? "text-[#7533c1]" : "text-[#746b7d]"}`}
          >
            <Icon size={19} />
            <span className="max-w-full truncate">{name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
